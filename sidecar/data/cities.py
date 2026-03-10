from typing import TypedDict


class CityData(TypedDict):
    lat: float
    lng: float
    tz: str


CITIES: dict[str, CityData] = {
    # 日本
    "札幌": {"lat": 43.0642, "lng": 141.3469, "tz": "Asia/Tokyo"},
    "仙台": {"lat": 38.2688, "lng": 140.8721, "tz": "Asia/Tokyo"},
    "東京": {"lat": 35.6762, "lng": 139.6503, "tz": "Asia/Tokyo"},
    "横浜": {"lat": 35.4437, "lng": 139.6380, "tz": "Asia/Tokyo"},
    "さいたま": {"lat": 35.8617, "lng": 139.6455, "tz": "Asia/Tokyo"},
    "千葉": {"lat": 35.6074, "lng": 140.1065, "tz": "Asia/Tokyo"},
    "名古屋": {"lat": 35.1815, "lng": 136.9066, "tz": "Asia/Tokyo"},
    "京都": {"lat": 35.0116, "lng": 135.7681, "tz": "Asia/Tokyo"},
    "大阪": {"lat": 34.6937, "lng": 135.5023, "tz": "Asia/Tokyo"},
    "神戸": {"lat": 34.6901, "lng": 135.1956, "tz": "Asia/Tokyo"},
    "広島": {"lat": 34.3853, "lng": 132.4553, "tz": "Asia/Tokyo"},
    "福岡": {"lat": 33.5904, "lng": 130.4017, "tz": "Asia/Tokyo"},
    "熊本": {"lat": 32.8031, "lng": 130.7079, "tz": "Asia/Tokyo"},
    "鹿児島": {"lat": 31.5966, "lng": 130.5571, "tz": "Asia/Tokyo"},
    "那覇": {"lat": 26.2124, "lng": 127.6809, "tz": "Asia/Tokyo"},
    # 海外主要都市
    "ニューヨーク": {"lat": 40.7128, "lng": -74.0060, "tz": "America/New_York"},
    "ロサンゼルス": {"lat": 34.0522, "lng": -118.2437, "tz": "America/Los_Angeles"},
    "ロンドン": {"lat": 51.5074, "lng": -0.1278, "tz": "Europe/London"},
    "パリ": {"lat": 48.8566, "lng": 2.3522, "tz": "Europe/Paris"},
    "ベルリン": {"lat": 52.5200, "lng": 13.4050, "tz": "Europe/Berlin"},
    "北京": {"lat": 39.9042, "lng": 116.4074, "tz": "Asia/Shanghai"},
    "上海": {"lat": 31.2304, "lng": 121.4737, "tz": "Asia/Shanghai"},
    "ソウル": {"lat": 37.5665, "lng": 126.9780, "tz": "Asia/Seoul"},
    "シドニー": {"lat": -33.8688, "lng": 151.2093, "tz": "Australia/Sydney"},
    "ムンバイ": {"lat": 19.0760, "lng": 72.8777, "tz": "Asia/Kolkata"},
}


def get_city(name: str) -> CityData | None:
    return CITIES.get(name)


_JAPAN_TZ = "Asia/Tokyo"


def get_city_names() -> list[str]:
    """日本の都市を緯度が高い順、その後海外の都市名順で返す。"""
    japan = [
        (name, data) for name, data in CITIES.items() if data["tz"] == _JAPAN_TZ
    ]
    overseas = [
        (name, data) for name, data in CITIES.items() if data["tz"] != _JAPAN_TZ
    ]
    japan.sort(key=lambda x: x[1]["lat"], reverse=True)
    overseas.sort(key=lambda x: x[0])
    return [name for name, _ in japan] + [name for name, _ in overseas]
