import os
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import anthropic
from kerykeion import AstrologicalSubjectFactory, to_context

from models.schemas import BirthData
from data.cities import get_city
from prompts.interpretation import SYSTEM_PROMPT

router = APIRouter()


@router.post("/interpret")
async def interpret_chart(data: BirthData):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY が設定されていません。")

    city_data = get_city(data.city)

    if city_data:
        lat = city_data["lat"]
        lng = city_data["lng"]
        tz_str = city_data["tz"]
    elif data.lat is not None and data.lng is not None and data.timezone is not None:
        lat = data.lat
        lng = data.lng
        tz_str = data.timezone
    else:
        raise HTTPException(
            status_code=400,
            detail=f"都市 '{data.city}' は辞書に存在しません。lat/lng/timezone を指定してください。",
        )

    subject = AstrologicalSubjectFactory.from_birth_data(
        data.name,
        data.year, data.month, data.day,
        data.hour, data.minute,
        lat=lat, lng=lng, tz_str=tz_str,
        online=False,
    )

    xml_context = to_context(subject)
    client = anthropic.Anthropic(api_key=api_key)

    async def generate():
        with client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": xml_context}],
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'text': text}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
