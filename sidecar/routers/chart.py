from fastapi import APIRouter, HTTPException
from kerykeion import AstrologicalSubjectFactory, ChartDataFactory

from models.schemas import BirthData
from data.cities import get_city, get_city_names, get_grouped_cities

router = APIRouter()


@router.post("/chart")
async def calculate_chart(data: BirthData):
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

    natal = ChartDataFactory.create_natal_chart_data(subject)
    return natal.model_dump()


@router.get("/cities")
async def list_cities():
    """都市辞書のキー一覧を返す。"""
    return {"cities": get_city_names(), "groups": get_grouped_cities()}
