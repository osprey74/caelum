import os
import sys

# PyInstaller バンドル時にkerykeionのSwiss Ephemerisデータパスを設定
if getattr(sys, "frozen", False):
    _bundle_dir = sys._MEIPASS  # type: ignore[attr-defined]
    _sweph_path = os.path.join(_bundle_dir, "kerykeion", "sweph")
    if os.path.isdir(_sweph_path):
        os.environ["SE_EPHE_PATH"] = _sweph_path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chart, geocode, interpret, profiles, settings

app = FastAPI(title="Liber Caeli Sidecar")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chart.router)
app.include_router(geocode.router)
app.include_router(interpret.router)
app.include_router(profiles.router)
app.include_router(settings.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/shutdown")
async def shutdown():
    """アプリ終了時にフロントエンドから呼ばれるシャットダウンエンドポイント。"""
    import asyncio
    asyncio.get_event_loop().call_later(0.5, lambda: os._exit(0))
    return {"status": "shutting_down"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8765)
