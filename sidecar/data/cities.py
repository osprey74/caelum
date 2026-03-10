from typing import TypedDict


class CityData(TypedDict):
    lat: float
    lng: float
    tz: str


class CityGroup(TypedDict):
    label: str
    cities: list[str]


# --- 都市辞書（フラット） ---

CITIES: dict[str, CityData] = {
    # 北海道
    "札幌": {"lat": 43.0642, "lng": 141.3469, "tz": "Asia/Tokyo"},
    "旭川": {"lat": 43.7709, "lng": 142.3650, "tz": "Asia/Tokyo"},
    "函館": {"lat": 41.7687, "lng": 140.7288, "tz": "Asia/Tokyo"},
    "室蘭": {"lat": 42.3152, "lng": 140.9739, "tz": "Asia/Tokyo"},
    "釧路": {"lat": 42.9849, "lng": 144.3820, "tz": "Asia/Tokyo"},
    "帯広": {"lat": 42.9236, "lng": 143.1966, "tz": "Asia/Tokyo"},
    "稚内": {"lat": 45.4155, "lng": 141.6729, "tz": "Asia/Tokyo"},
    "北見": {"lat": 43.8030, "lng": 143.8957, "tz": "Asia/Tokyo"},
    "網走": {"lat": 44.0206, "lng": 144.2734, "tz": "Asia/Tokyo"},
    "根室": {"lat": 43.3301, "lng": 145.5827, "tz": "Asia/Tokyo"},
    # 東北
    "青森": {"lat": 40.8246, "lng": 140.7400, "tz": "Asia/Tokyo"},
    "盛岡": {"lat": 39.7036, "lng": 141.1527, "tz": "Asia/Tokyo"},
    "仙台": {"lat": 38.2688, "lng": 140.8721, "tz": "Asia/Tokyo"},
    "秋田": {"lat": 39.7200, "lng": 140.1025, "tz": "Asia/Tokyo"},
    "山形": {"lat": 38.2405, "lng": 140.3634, "tz": "Asia/Tokyo"},
    "福島": {"lat": 37.7608, "lng": 140.4748, "tz": "Asia/Tokyo"},
    # 関東
    "東京": {"lat": 35.6762, "lng": 139.6503, "tz": "Asia/Tokyo"},
    "横浜": {"lat": 35.4437, "lng": 139.6380, "tz": "Asia/Tokyo"},
    "さいたま": {"lat": 35.8617, "lng": 139.6455, "tz": "Asia/Tokyo"},
    "千葉": {"lat": 35.6074, "lng": 140.1065, "tz": "Asia/Tokyo"},
    "水戸": {"lat": 36.3418, "lng": 140.4468, "tz": "Asia/Tokyo"},
    "宇都宮": {"lat": 36.5551, "lng": 139.8836, "tz": "Asia/Tokyo"},
    "前橋": {"lat": 36.3911, "lng": 139.0608, "tz": "Asia/Tokyo"},
    # 中部
    "新潟": {"lat": 37.9026, "lng": 139.0236, "tz": "Asia/Tokyo"},
    "富山": {"lat": 36.6953, "lng": 137.2113, "tz": "Asia/Tokyo"},
    "金沢": {"lat": 36.5613, "lng": 136.6562, "tz": "Asia/Tokyo"},
    "福井": {"lat": 36.0652, "lng": 136.2219, "tz": "Asia/Tokyo"},
    "甲府": {"lat": 35.6642, "lng": 138.5684, "tz": "Asia/Tokyo"},
    "長野": {"lat": 36.2378, "lng": 138.1813, "tz": "Asia/Tokyo"},
    "岐阜": {"lat": 35.3912, "lng": 136.7223, "tz": "Asia/Tokyo"},
    "静岡": {"lat": 34.9756, "lng": 138.3828, "tz": "Asia/Tokyo"},
    "名古屋": {"lat": 35.1815, "lng": 136.9066, "tz": "Asia/Tokyo"},
    # 近畿
    "津": {"lat": 34.7303, "lng": 136.5086, "tz": "Asia/Tokyo"},
    "大津": {"lat": 35.0045, "lng": 135.8686, "tz": "Asia/Tokyo"},
    "京都": {"lat": 35.0116, "lng": 135.7681, "tz": "Asia/Tokyo"},
    "大阪": {"lat": 34.6937, "lng": 135.5023, "tz": "Asia/Tokyo"},
    "神戸": {"lat": 34.6901, "lng": 135.1956, "tz": "Asia/Tokyo"},
    "奈良": {"lat": 34.6851, "lng": 135.8049, "tz": "Asia/Tokyo"},
    "和歌山": {"lat": 34.2260, "lng": 135.1675, "tz": "Asia/Tokyo"},
    # 中国
    "鳥取": {"lat": 35.5011, "lng": 134.2351, "tz": "Asia/Tokyo"},
    "松江": {"lat": 35.4723, "lng": 133.0505, "tz": "Asia/Tokyo"},
    "岡山": {"lat": 34.6617, "lng": 133.9350, "tz": "Asia/Tokyo"},
    "広島": {"lat": 34.3853, "lng": 132.4553, "tz": "Asia/Tokyo"},
    "山口": {"lat": 34.1861, "lng": 131.4706, "tz": "Asia/Tokyo"},
    # 四国
    "徳島": {"lat": 34.0658, "lng": 134.5593, "tz": "Asia/Tokyo"},
    "高松": {"lat": 34.3401, "lng": 134.0434, "tz": "Asia/Tokyo"},
    "松山": {"lat": 33.8395, "lng": 132.7657, "tz": "Asia/Tokyo"},
    "高知": {"lat": 33.5597, "lng": 133.5311, "tz": "Asia/Tokyo"},
    # 九州・沖縄
    "福岡": {"lat": 33.5904, "lng": 130.4017, "tz": "Asia/Tokyo"},
    "佐賀": {"lat": 33.2494, "lng": 130.2988, "tz": "Asia/Tokyo"},
    "長崎": {"lat": 32.7503, "lng": 129.8779, "tz": "Asia/Tokyo"},
    "熊本": {"lat": 32.8031, "lng": 130.7079, "tz": "Asia/Tokyo"},
    "大分": {"lat": 33.2382, "lng": 131.6126, "tz": "Asia/Tokyo"},
    "宮崎": {"lat": 31.9111, "lng": 131.4239, "tz": "Asia/Tokyo"},
    "鹿児島": {"lat": 31.5966, "lng": 130.5571, "tz": "Asia/Tokyo"},
    "那覇": {"lat": 26.2124, "lng": 127.6809, "tz": "Asia/Tokyo"},
    # 海外主要都市
    "ニューヨーク": {"lat": 40.7128, "lng": -74.0060, "tz": "America/New_York"},
    "ロサンゼルス": {"lat": 34.0522, "lng": -118.2437, "tz": "America/Los_Angeles"},
    "シカゴ": {"lat": 41.8781, "lng": -87.6298, "tz": "America/Chicago"},
    "ロンドン": {"lat": 51.5074, "lng": -0.1278, "tz": "Europe/London"},
    "パリ": {"lat": 48.8566, "lng": 2.3522, "tz": "Europe/Paris"},
    "ベルリン": {"lat": 52.5200, "lng": 13.4050, "tz": "Europe/Berlin"},
    "ローマ": {"lat": 41.9028, "lng": 12.4964, "tz": "Europe/Rome"},
    "北京": {"lat": 39.9042, "lng": 116.4074, "tz": "Asia/Shanghai"},
    "上海": {"lat": 31.2304, "lng": 121.4737, "tz": "Asia/Shanghai"},
    "台北": {"lat": 25.0330, "lng": 121.5654, "tz": "Asia/Taipei"},
    "ソウル": {"lat": 37.5665, "lng": 126.9780, "tz": "Asia/Seoul"},
    "バンコク": {"lat": 13.7563, "lng": 100.5018, "tz": "Asia/Bangkok"},
    "シンガポール": {"lat": 1.3521, "lng": 103.8198, "tz": "Asia/Singapore"},
    "シドニー": {"lat": -33.8688, "lng": 151.2093, "tz": "Australia/Sydney"},
    "ムンバイ": {"lat": 19.0760, "lng": 72.8777, "tz": "Asia/Kolkata"},
    "ドバイ": {"lat": 25.2048, "lng": 55.2708, "tz": "Asia/Dubai"},
    "サンパウロ": {"lat": -23.5505, "lng": -46.6333, "tz": "America/Sao_Paulo"},
}


def get_city(name: str) -> CityData | None:
    return CITIES.get(name)


# --- 地方グループ定義（UIの optgroup 用） ---

_JAPAN_GROUPS: list[CityGroup] = [
    {"label": "北海道", "cities": ["稚内", "旭川", "北見", "網走", "根室", "釧路", "帯広", "札幌", "室蘭", "函館"]},
    {"label": "東北", "cities": ["青森", "盛岡", "仙台", "秋田", "山形", "福島"]},
    {"label": "関東", "cities": ["東京", "横浜", "さいたま", "千葉", "水戸", "宇都宮", "前橋"]},
    {"label": "中部", "cities": ["新潟", "富山", "金沢", "福井", "甲府", "長野", "岐阜", "静岡", "名古屋"]},
    {"label": "近畿", "cities": ["津", "大津", "京都", "大阪", "神戸", "奈良", "和歌山"]},
    {"label": "中国", "cities": ["鳥取", "松江", "岡山", "広島", "山口"]},
    {"label": "四国", "cities": ["徳島", "高松", "松山", "高知"]},
    {"label": "九州・沖縄", "cities": ["福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "那覇"]},
]

_JAPAN_TZ = "Asia/Tokyo"


def get_grouped_cities() -> list[CityGroup]:
    """地方グループ付きの都市一覧を返す。"""
    overseas = sorted(
        [name for name, data in CITIES.items() if data["tz"] != _JAPAN_TZ],
    )
    groups: list[CityGroup] = list(_JAPAN_GROUPS)
    groups.append({"label": "海外", "cities": overseas})
    return groups


def get_city_names() -> list[str]:
    """後方互換: フラットな都市名リスト。"""
    result: list[str] = []
    for group in get_grouped_cities():
        result.extend(group["cities"])
    return result
