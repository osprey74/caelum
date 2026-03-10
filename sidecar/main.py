from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chart, interpret, settings

app = FastAPI(title="Liber Caeli Sidecar")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chart.router)
app.include_router(interpret.router)
app.include_router(settings.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
