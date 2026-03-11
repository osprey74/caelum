from fastapi import APIRouter, HTTPException
from kerykeion import AstrologicalSubjectFactory, ChartDataFactory

from models.schemas import BirthData, TransitRequest, SynastryRequest
from data.cities import get_city, get_city_names, get_grouped_cities

router = APIRouter()


def _resolve_coords(city: str, lat: float | None, lng: float | None, timezone: str | None) -> tuple[float, float, str]:
    """都市辞書 or 明示パラメータから緯度経度タイムゾーンを解決。"""
    city_data = get_city(city)
    if city_data:
        return city_data["lat"], city_data["lng"], city_data["tz"]
    if lat is not None and lng is not None and timezone is not None:
        return lat, lng, timezone
    raise HTTPException(
        status_code=400,
        detail=f"都市 '{city}' は辞書に存在しません。lat/lng/timezone を指定してください。",
    )


def _make_subject(name: str, year: int, month: int, day: int, hour: int, minute: int,
                   lat: float, lng: float, tz_str: str):
    return AstrologicalSubjectFactory.from_birth_data(
        name, year, month, day, hour, minute,
        lat=lat, lng=lng, tz_str=tz_str, online=False,
    )


@router.post("/chart")
async def calculate_chart(data: BirthData):
    lat, lng, tz_str = _resolve_coords(data.city, data.lat, data.lng, data.timezone)
    subject = _make_subject(data.name, data.year, data.month, data.day,
                            data.hour, data.minute, lat, lng, tz_str)
    natal = ChartDataFactory.create_natal_chart_data(subject)
    return natal.model_dump()


@router.post("/transit")
async def calculate_transit(data: TransitRequest):
    """トランジットチャート（二重円）: ネイタル + 指定日時のトランジット天体。"""
    lat, lng, tz_str = _resolve_coords(data.city, data.lat, data.lng, data.timezone)

    natal_subject = _make_subject(data.name, data.year, data.month, data.day,
                                  data.hour, data.minute, lat, lng, tz_str)
    transit_subject = _make_subject(
        "Transit", data.transit_year, data.transit_month, data.transit_day,
        data.transit_hour, data.transit_minute, lat, lng, tz_str,
    )

    chart = ChartDataFactory.create_transit_chart_data(natal_subject, transit_subject)
    return chart.model_dump()


@router.post("/synastry")
async def calculate_synastry(data: SynastryRequest):
    """シナストリーチャート（二重円）: 2人のネイタルチャートを重ねる。"""
    lat1, lng1, tz1 = _resolve_coords(data.city1, data.lat1, data.lng1, data.timezone1)
    lat2, lng2, tz2 = _resolve_coords(data.city2, data.lat2, data.lng2, data.timezone2)

    subject1 = _make_subject(data.name1, data.year1, data.month1, data.day1,
                             data.hour1, data.minute1, lat1, lng1, tz1)
    subject2 = _make_subject(data.name2, data.year2, data.month2, data.day2,
                             data.hour2, data.minute2, lat2, lng2, tz2)

    chart = ChartDataFactory.create_synastry_chart_data(subject1, subject2)
    return chart.model_dump()


@router.get("/cities")
async def list_cities():
    """都市辞書のキー一覧を返す。"""
    return {"cities": get_city_names(), "groups": get_grouped_cities()}
