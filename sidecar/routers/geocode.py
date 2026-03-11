from fastapi import APIRouter, HTTPException, Query
import httpx
from timezonefinder import TimezoneFinder

from data.cities import CITIES

router = APIRouter()

_NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
_USER_AGENT = "LiberCaeli/1.0 (desktop astrology app)"
_tf = TimezoneFinder()


def _timezone_from_coords(lat: float, lng: float) -> str:
    """緯度経度からタイムゾーンを推定する。"""
    tz = _tf.timezone_at(lat=lat, lng=lng)
    return tz or "UTC"


def _search_local(query: str) -> list[dict]:
    """既存都市辞書からの部分一致検索。"""
    q = query.lower()
    results = []
    for name, data in CITIES.items():
        if q in name.lower():
            results.append({
                "display_name": name,
                "lat": data["lat"],
                "lng": data["lng"],
                "timezone": data["tz"],
                "source": "local",
            })
    return results


@router.get("/geocode")
async def geocode(
    q: str = Query(..., min_length=1, description="検索クエリ"),
    lang: str = Query("ja", description="言語 (ja/en)"),
):
    """都市名でジオコーディング検索。ローカル辞書 + Nominatim API。"""
    # ローカル辞書を先に検索
    local_results = _search_local(q)

    # Nominatim API 検索
    accept_lang = "en,ja" if lang == "en" else "ja,en"
    nominatim_results: list[dict] = []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                _NOMINATIM_URL,
                params={
                    "q": q,
                    "format": "json",
                    "limit": 5,
                    "addressdetails": 1,
                    "accept-language": accept_lang,
                },
                headers={"User-Agent": _USER_AGENT},
                timeout=10.0,
            )
            resp.raise_for_status()
            data = resp.json()

        for item in data:
            lat = float(item["lat"])
            lng = float(item["lon"])
            tz = _timezone_from_coords(lat, lng)
            nominatim_results.append({
                "display_name": item.get("display_name", ""),
                "lat": lat,
                "lng": lng,
                "timezone": tz,
                "source": "nominatim",
            })
    except Exception:
        # Nominatim API が失敗してもローカル結果は返す
        pass

    return {"results": local_results + nominatim_results}
