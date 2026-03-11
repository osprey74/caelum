from pydantic import BaseModel


class BirthData(BaseModel):
    name: str
    year: int
    month: int       # 1-12
    day: int
    hour: int        # 0-23
    minute: int
    city: str        # 都市辞書キー（例: "東京"）
    # 辞書にない場合のフォールバック
    lat: float | None = None
    lng: float | None = None
    timezone: str | None = None
    house_system: str = "P"  # P=Placidus, W=Whole Sign, A=Equal


class TransitRequest(BaseModel):
    """トランジットチャートリクエスト。"""
    # ネイタル出生データ
    name: str
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str
    lat: float | None = None
    lng: float | None = None
    timezone: str | None = None
    house_system: str = "P"  # P=Placidus, W=Whole Sign, A=Equal
    # トランジット日時
    transit_year: int
    transit_month: int
    transit_day: int
    transit_hour: int = 12
    transit_minute: int = 0


class SynastryRequest(BaseModel):
    """シナストリーチャートリクエスト。"""
    # 1人目
    name1: str
    year1: int
    month1: int
    day1: int
    hour1: int
    minute1: int
    city1: str
    lat1: float | None = None
    lng1: float | None = None
    timezone1: str | None = None
    # 2人目
    name2: str
    year2: int
    month2: int
    day2: int
    hour2: int
    minute2: int
    city2: str
    lat2: float | None = None
    lng2: float | None = None
    timezone2: str | None = None
    house_system: str = "P"  # P=Placidus, W=Whole Sign, A=Equal


class ProfileCreate(BaseModel):
    """プロファイル作成リクエスト。"""
    name: str
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str
    lat: float | None = None
    lng: float | None = None
    timezone: str | None = None


class ProfileUpdate(BaseModel):
    """プロファイル更新リクエスト。全フィールド任意。"""
    name: str | None = None
    year: int | None = None
    month: int | None = None
    day: int | None = None
    hour: int | None = None
    minute: int | None = None
    city: str | None = None
    lat: float | None = None
    lng: float | None = None
    timezone: str | None = None
