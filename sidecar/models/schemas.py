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
