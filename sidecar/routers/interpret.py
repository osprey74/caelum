import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import anthropic
from kerykeion import AstrologicalSubjectFactory, to_context

from models.schemas import BirthData, TransitRequest, SynastryRequest
from data.cities import get_city
from prompts.interpretation import SYSTEM_PROMPT
from prompts.transit import TRANSIT_SYSTEM_PROMPT
from prompts.synastry import SYNASTRY_SYSTEM_PROMPT
from services.settings import get_api_key

router = APIRouter()


def _resolve_location(city: str, lat: float | None, lng: float | None,
                      timezone: str | None) -> tuple[float, float, str]:
    """都市辞書 or リクエストから緯度経度タイムゾーンを解決。"""
    city_data = get_city(city)
    if city_data:
        return city_data["lat"], city_data["lng"], city_data["tz"]
    if lat is not None and lng is not None and timezone is not None:
        return lat, lng, timezone
    raise HTTPException(
        status_code=400,
        detail=f"都市 '{city}' は辞書に存在しません。lat/lng/timezone を指定してください。",
    )


def _build_subject(name: str, year: int, month: int, day: int,
                   hour: int, minute: int, lat: float, lng: float, tz_str: str):
    return AstrologicalSubjectFactory.from_birth_data(
        name, year, month, day, hour, minute,
        lat=lat, lng=lng, tz_str=tz_str, online=False,
    )


def _stream_response(system_prompt: str, user_content: str, api_key: str):
    """Claude SSEストリーミングレスポンス生成。"""
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


@router.post("/interpret")
async def interpret_chart(data: BirthData):
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=400, detail="APIキーが設定されていません。")

    lat, lng, tz_str = _resolve_location(data.city, data.lat, data.lng, data.timezone)
    subject = _build_subject(data.name, data.year, data.month, data.day,
                             data.hour, data.minute, lat, lng, tz_str)
    xml_context = to_context(subject)
    return _stream_response(SYSTEM_PROMPT, xml_context, api_key)


@router.post("/interpret-transit")
async def interpret_transit(data: TransitRequest):
    """トランジット解釈（ネイタル + トランジット天体のコンテキストを送信）。"""
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=400, detail="APIキーが設定されていません。")

    lat, lng, tz_str = _resolve_location(data.city, data.lat, data.lng, data.timezone)
    natal_subject = _build_subject(data.name, data.year, data.month, data.day,
                                   data.hour, data.minute, lat, lng, tz_str)
    transit_subject = _build_subject(
        "Transit", data.transit_year, data.transit_month, data.transit_day,
        data.transit_hour, data.transit_minute, lat, lng, tz_str,
    )

    natal_context = to_context(natal_subject)
    transit_context = to_context(transit_subject)

    user_content = f"""## ネイタルチャート（出生図）
{natal_context}

## トランジット天体（{data.transit_year}年{data.transit_month}月{data.transit_day}日）
{transit_context}"""

    return _stream_response(TRANSIT_SYSTEM_PROMPT, user_content, api_key)


@router.post("/interpret-synastry")
async def interpret_synastry(data: SynastryRequest):
    """シナストリー解釈（2人のネイタルチャートのコンテキストを送信）。"""
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=400, detail="APIキーが設定されていません。")

    lat1, lng1, tz1 = _resolve_location(data.city1, data.lat1, data.lng1, data.timezone1)
    lat2, lng2, tz2 = _resolve_location(data.city2, data.lat2, data.lng2, data.timezone2)

    subject1 = _build_subject(data.name1, data.year1, data.month1, data.day1,
                              data.hour1, data.minute1, lat1, lng1, tz1)
    subject2 = _build_subject(data.name2, data.year2, data.month2, data.day2,
                              data.hour2, data.minute2, lat2, lng2, tz2)

    context1 = to_context(subject1)
    context2 = to_context(subject2)

    user_content = f"""## {data.name1}のネイタルチャート（出生図）
{context1}

## {data.name2}のネイタルチャート（出生図）
{context2}"""

    return _stream_response(SYNASTRY_SYSTEM_PROMPT, user_content, api_key)


@router.post("/generate-prompt")
async def generate_prompt(data: BirthData):
    """APIキー不要。チャートデータからプロンプトテキストを生成して返す。"""
    lat, lng, tz_str = _resolve_location(data.city, data.lat, data.lng, data.timezone)
    subject = _build_subject(data.name, data.year, data.month, data.day,
                             data.hour, data.minute, lat, lng, tz_str)
    xml_context = to_context(subject)

    prompt_text = f"""以下のシステムプロンプトとチャートデータをお使いのAIに貼り付けてください。

---

## システムプロンプト

{SYSTEM_PROMPT}

---

## チャートデータ

{xml_context}"""

    return {"prompt": prompt_text}
