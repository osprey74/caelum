import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import anthropic
from kerykeion import AstrologicalSubjectFactory, to_context

from models.schemas import BirthData, TransitRequest, SynastryRequest, MonthlyCalendarRequest
from data.cities import get_city
from prompts.interpretation import get_system_prompt
from prompts.transit import get_transit_prompt
from prompts.synastry import get_synastry_prompt
from prompts.monthly import get_monthly_prompt
from services.settings import get_api_key
from services.calendar import compute_monthly_calendar

router = APIRouter()


# --- i18n helpers ---

_LABELS = {
    "ja": {
        "natal_chart": "ネイタルチャート（出生図）",
        "transit_planets": "トランジット天体",
        "transit_events": "のトランジットイベント",
        "no_events": "（特筆すべきイベントなし）",
        "paste_instruction": "以下のシステムプロンプトとチャートデータをお使いのAIに貼り付けてください。",
        "system_prompt_label": "システムプロンプト",
        "chart_data_label": "チャートデータ",
        "date_fmt": lambda y, m, d: f"{y}年{m}月{d}日",
        "month_fmt": lambda y, m: f"{y}年{m}月",
        "event_fmt": lambda m, d, desc: f"- {m}月{d}日: {desc}",
    },
    "en": {
        "natal_chart": "Natal Chart (Birth Chart)",
        "transit_planets": "Transit Planets",
        "transit_events": " Transit Events",
        "no_events": "(No notable events)",
        "paste_instruction": "Paste the following system prompt and chart data into your preferred AI.",
        "system_prompt_label": "System Prompt",
        "chart_data_label": "Chart Data",
        "date_fmt": lambda y, m, d: f"{y}-{m:02d}-{d:02d}",
        "month_fmt": lambda y, m: f"{y}-{m:02d}",
        "event_fmt": lambda m, d, desc: f"- {m}/{d}: {desc}",
    },
}


def _l(lang: str) -> dict:
    return _LABELS.get(lang, _LABELS["ja"])


# --- common helpers ---

def _resolve_location(city: str, lat: float | None, lng: float | None,
                      timezone: str | None) -> tuple[float, float, str]:
    city_data = get_city(city)
    if city_data:
        return city_data["lat"], city_data["lng"], city_data["tz"]
    if lat is not None and lng is not None and timezone is not None:
        return lat, lng, timezone
    raise HTTPException(
        status_code=400,
        detail=f"City '{city}' not found. Please provide lat/lng/timezone.",
    )


def _build_subject(name: str, year: int, month: int, day: int,
                   hour: int, minute: int, lat: float, lng: float, tz_str: str,
                   house_system: str = "P"):
    return AstrologicalSubjectFactory.from_birth_data(
        name, year, month, day, hour, minute,
        lat=lat, lng=lng, tz_str=tz_str, online=False,
        houses_system_identifier=house_system,
    )


def _stream_response(system_prompt: str, user_content: str, api_key: str):
    client = anthropic.Anthropic(api_key=api_key)

    def generate():
        try:
            with client.messages.stream(
                model="claude-sonnet-4-6",
                max_tokens=8192,
                system=system_prompt,
                messages=[{"role": "user", "content": user_content}],
            ) as stream:
                for text in stream.text_stream:
                    yield f"data: {json.dumps({'text': text}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# --- Natal ---

@router.post("/interpret")
async def interpret_chart(data: BirthData):
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=400, detail="API key not configured.")

    lat, lng, tz_str = _resolve_location(data.city, data.lat, data.lng, data.timezone)
    subject = _build_subject(data.name, data.year, data.month, data.day,
                             data.hour, data.minute, lat, lng, tz_str, data.house_system)
    xml_context = to_context(subject)
    return _stream_response(get_system_prompt(data.lang), xml_context, api_key)


@router.post("/generate-prompt")
async def generate_prompt(data: BirthData):
    lat, lng, tz_str = _resolve_location(data.city, data.lat, data.lng, data.timezone)
    subject = _build_subject(data.name, data.year, data.month, data.day,
                             data.hour, data.minute, lat, lng, tz_str, data.house_system)
    xml_context = to_context(subject)
    l = _l(data.lang)
    sys_prompt = get_system_prompt(data.lang)

    prompt_text = f"""{l["paste_instruction"]}

---

## {l["system_prompt_label"]}

{sys_prompt}

---

## {l["chart_data_label"]}

{xml_context}"""

    return {"prompt": prompt_text}


# --- Transit ---

def _build_transit_content(data: TransitRequest) -> str:
    lat, lng, tz_str = _resolve_location(data.city, data.lat, data.lng, data.timezone)
    natal_subject = _build_subject(data.name, data.year, data.month, data.day,
                                   data.hour, data.minute, lat, lng, tz_str, data.house_system)
    transit_subject = _build_subject(
        "Transit", data.transit_year, data.transit_month, data.transit_day,
        data.transit_hour, data.transit_minute, lat, lng, tz_str, data.house_system,
    )
    l = _l(data.lang)
    natal_context = to_context(natal_subject)
    transit_context = to_context(transit_subject)
    date_str = l["date_fmt"](data.transit_year, data.transit_month, data.transit_day)

    return f"""## {l["natal_chart"]}
{natal_context}

## {l["transit_planets"]}（{date_str}）
{transit_context}"""


@router.post("/interpret-transit")
async def interpret_transit(data: TransitRequest):
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=400, detail="API key not configured.")

    user_content = _build_transit_content(data)
    return _stream_response(get_transit_prompt(data.lang), user_content, api_key)


@router.post("/generate-prompt-transit")
async def generate_prompt_transit(data: TransitRequest):
    user_content = _build_transit_content(data)
    l = _l(data.lang)
    sys_prompt = get_transit_prompt(data.lang)

    prompt_text = f"""{l["paste_instruction"]}

---

## {l["system_prompt_label"]}

{sys_prompt}

---

{user_content}"""

    return {"prompt": prompt_text}


# --- Synastry ---

def _build_synastry_content(data: SynastryRequest) -> str:
    lat1, lng1, tz1 = _resolve_location(data.city1, data.lat1, data.lng1, data.timezone1)
    lat2, lng2, tz2 = _resolve_location(data.city2, data.lat2, data.lng2, data.timezone2)

    subject1 = _build_subject(data.name1, data.year1, data.month1, data.day1,
                              data.hour1, data.minute1, lat1, lng1, tz1, data.house_system)
    subject2 = _build_subject(data.name2, data.year2, data.month2, data.day2,
                              data.hour2, data.minute2, lat2, lng2, tz2, data.house_system)
    l = _l(data.lang)
    context1 = to_context(subject1)
    context2 = to_context(subject2)

    return f"""## {data.name1} — {l["natal_chart"]}
{context1}

## {data.name2} — {l["natal_chart"]}
{context2}"""


@router.post("/interpret-synastry")
async def interpret_synastry(data: SynastryRequest):
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=400, detail="API key not configured.")

    user_content = _build_synastry_content(data)
    return _stream_response(get_synastry_prompt(data.lang), user_content, api_key)


@router.post("/generate-prompt-synastry")
async def generate_prompt_synastry(data: SynastryRequest):
    user_content = _build_synastry_content(data)
    l = _l(data.lang)
    sys_prompt = get_synastry_prompt(data.lang)

    prompt_text = f"""{l["paste_instruction"]}

---

## {l["system_prompt_label"]}

{sys_prompt}

---

{user_content}"""

    return {"prompt": prompt_text}


# --- Monthly ---

def _build_monthly_context(data: MonthlyCalendarRequest) -> str:
    lat, lng, tz_str = _resolve_location(data.city, data.lat, data.lng, data.timezone)
    natal_subject = _build_subject(data.name, data.year, data.month, data.day,
                                   data.hour, data.minute, lat, lng, tz_str, data.house_system)
    natal_context = to_context(natal_subject)
    l = _l(data.lang)

    cal = compute_monthly_calendar(
        data.name, data.year, data.month, data.day, data.hour, data.minute,
        lat, lng, tz_str, data.house_system,
        data.calendar_year, data.calendar_month,
        lang=data.lang,
    )

    event_lines: list[str] = []
    for day_data in cal["days"]:
        events = day_data["events"]
        if events:
            day_num = day_data["day"]
            for ev in events:
                event_lines.append(l["event_fmt"](data.calendar_month, day_num, ev["description"]))

    events_text = "\n".join(event_lines) if event_lines else l["no_events"]
    month_str = l["month_fmt"](data.calendar_year, data.calendar_month)

    return f"""## {l["natal_chart"]}
{natal_context}

## {month_str}{l["transit_events"]}
{events_text}"""


@router.post("/interpret-monthly")
async def interpret_monthly(data: MonthlyCalendarRequest):
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=400, detail="API key not configured.")

    user_content = _build_monthly_context(data)
    return _stream_response(get_monthly_prompt(data.lang), user_content, api_key)


@router.post("/generate-prompt-monthly")
async def generate_prompt_monthly(data: MonthlyCalendarRequest):
    user_content = _build_monthly_context(data)
    l = _l(data.lang)
    sys_prompt = get_monthly_prompt(data.lang)

    prompt_text = f"""{l["paste_instruction"]}

---

## {l["system_prompt_label"]}

{sys_prompt}

---

{user_content}"""

    return {"prompt": prompt_text}
