import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import anthropic
from kerykeion import AstrologicalSubjectFactory, to_context

from models.schemas import BirthData
from data.cities import get_city
from prompts.interpretation import SYSTEM_PROMPT
from services.settings import get_api_key

router = APIRouter()


def _resolve_location(data: BirthData) -> tuple[float, float, str]:
    """都市辞書 or リクエストから緯度経度タイムゾーンを解決。"""
    city_data = get_city(data.city)
    if city_data:
        return city_data["lat"], city_data["lng"], city_data["tz"]
    if data.lat is not None and data.lng is not None and data.timezone is not None:
        return data.lat, data.lng, data.timezone
    raise HTTPException(
        status_code=400,
        detail=f"都市 '{data.city}' は辞書に存在しません。lat/lng/timezone を指定してください。",
    )


def _build_subject(data: BirthData, lat: float, lng: float, tz_str: str):
    return AstrologicalSubjectFactory.from_birth_data(
        data.name,
        data.year, data.month, data.day,
        data.hour, data.minute,
        lat=lat, lng=lng, tz_str=tz_str,
        online=False,
    )


@router.post("/interpret")
async def interpret_chart(data: BirthData):
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=400, detail="APIキーが設定されていません。")

    lat, lng, tz_str = _resolve_location(data)
    subject = _build_subject(data, lat, lng, tz_str)
    xml_context = to_context(subject)
    client = anthropic.Anthropic(api_key=api_key)

    def generate():
        try:
            with client.messages.stream(
                model="claude-sonnet-4-6",
                max_tokens=8192,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": xml_context}],
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


@router.post("/generate-prompt")
async def generate_prompt(data: BirthData):
    """APIキー不要。チャートデータからプロンプトテキストを生成して返す。"""
    lat, lng, tz_str = _resolve_location(data)
    subject = _build_subject(data, lat, lng, tz_str)
    xml_context = to_context(subject)

    prompt_text = f"""以下のシステムプロンプトとチャートデータをお使いのAIに貼り付けてください。

---

## システムプロンプト

{SYSTEM_PROMPT}

---

## チャートデータ

{xml_context}"""

    return {"prompt": prompt_text}
