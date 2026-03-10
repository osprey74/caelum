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
