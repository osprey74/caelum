# HANDOFF: caelum（Liber Caeli）

**作成日**: 2026-03-09  
**ステータス**: 実装開始待ち  
**引き継ぎ先**: Claude Code

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| リポジトリ名 | `caelum` |
| アプリ表示名 | **Liber Caeli**（リベル・カエリ）|
| 意味 | ラテン語「天空の書」 |
| 用途 | 個人利用デスクトップ占星術アプリ |
| オーナー | Sohshi（Polaris Solutions Inc.） |

---

## ゴール（Phase 1 MVP）

以下が動作する状態を目標とする：

1. 名前・生年月日時・出生地（都市名）を入力フォームに入力する
2. 「チャートを作成」ボタンを押すとネイタルチャートの円盤がSVGで表示される
3. 「解釈を生成」ボタンを押すとClaude APIが日本語解釈テキストをストリーミング表示する

---

## 技術スタック（確定）

### フロントエンド
- **Tauri v2**（デスクトップシェル）
- **React 18** + **TypeScript 5**（UI）
- **Tailwind CSS 3**（スタイリング）
- **D3.js v7**（チャートSVG描画）
- **Material Symbols Rounded**（アイコン）

### バックエンド（Pythonサイドカー）
- **Python 3.10+**
- **FastAPI** + **uvicorn**（HTTP サーバー、ポート `8765` 固定）
- **kerykeion**（天体計算エンジン、Swiss Ephemeris内包）
- **anthropic SDK**（Claude API呼び出し）
- **PyInstaller**（リリース時のシングルバイナリ化）

### AI
- **claude-sonnet-4-6**（解釈テキスト生成）

### 占星術設定（確定）
- 黄道：熱帯（Tropical）
- ハウス：プラシダス（Placidus）
- 天体：10天体 + ASC/MC
- アスペクト：主要5種 + セミスクエア・クインカンクス
- 解釈軸：モダン西洋（性格・傾向）

---

## ディレクトリ構造（作成すること）

```
caelum/
├── src/
│   ├── components/
│   │   ├── ChartWheel.tsx          # D3.js チャート円盤
│   │   ├── PlanetTable.tsx         # 天体配置一覧表
│   │   ├── InterpretationPanel.tsx # AI解釈テキスト表示
│   │   ├── BirthDataForm.tsx       # 入力フォーム
│   │   └── ui/                     # 共通UIコンポーネント
│   ├── hooks/
│   │   ├── useChart.ts             # チャートデータ取得
│   │   └── useInterpretation.ts    # AI解釈SSE受信
│   ├── types/
│   │   └── astrology.ts            # 型定義
│   ├── lib/
│   │   └── api.ts                  # サイドカーAPIクライアント
│   ├── App.tsx
│   └── main.tsx
│
├── sidecar/
│   ├── main.py                     # FastAPI エントリポイント
│   ├── routers/
│   │   ├── chart.py                # POST /chart
│   │   └── interpret.py            # POST /interpret (SSE)
│   ├── services/
│   │   ├── kerykeion_service.py    # kerykeion ラッパー
│   │   └── claude_service.py       # Claude API ラッパー
│   ├── models/
│   │   └── schemas.py              # Pydantic スキーマ
│   ├── prompts/
│   │   └── interpretation.py       # プロンプトテンプレート
│   ├── data/
│   │   └── cities.py               # 主要都市辞書
│   └── requirements.txt
│
├── src-tauri/
│   ├── src/
│   │   └── main.rs                 # サイドカー自動起動
│   ├── binaries/                   # PyInstallerバイナリ配置先（gitignore）
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── docs/
│   └── DESIGN_caelum.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── CLAUDE.md
├── HANDOFF_caelum.md               # 本ファイル
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 実装手順（Phase 1）

### Step 1: プロジェクトスキャフォールド

```bash
# Tauri + React + TypeScript プロジェクト作成
npm create tauri-app@latest caelum -- --template react-ts
cd caelum

# 依存パッケージ追加
npm install d3
npm install -D @types/d3 tailwindcss postcss autoprefixer

# Tailwind初期化
npx tailwindcss init -p
```

### Step 2: Pythonサイドカー環境構築

```bash
mkdir sidecar && cd sidecar
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

pip install kerykeion fastapi "uvicorn[standard]" anthropic pydantic python-dotenv
pip freeze > requirements.txt
```

### Step 3: サイドカー骨格実装

**sidecar/main.py**（最初に動作確認できる最小構成）

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chart, interpret

app = FastAPI(title="Liber Caeli Sidecar")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chart.router)
app.include_router(interpret.router)

@app.get("/health")
async def health():
    return {"status": "ok"}
```

### Step 4: 都市辞書実装

**sidecar/data/cities.py**

```python
from typing import TypedDict

class CityData(TypedDict):
    lat: float
    lng: float
    tz: str

CITIES: dict[str, CityData] = {
    # 日本
    "札幌":    {"lat": 43.0642, "lng": 141.3469, "tz": "Asia/Tokyo"},
    "仙台":    {"lat": 38.2688, "lng": 140.8721, "tz": "Asia/Tokyo"},
    "東京":    {"lat": 35.6762, "lng": 139.6503, "tz": "Asia/Tokyo"},
    "横浜":    {"lat": 35.4437, "lng": 139.6380, "tz": "Asia/Tokyo"},
    "さいたま": {"lat": 35.8617, "lng": 139.6455, "tz": "Asia/Tokyo"},
    "千葉":    {"lat": 35.6074, "lng": 140.1065, "tz": "Asia/Tokyo"},
    "名古屋":  {"lat": 35.1815, "lng": 136.9066, "tz": "Asia/Tokyo"},
    "京都":    {"lat": 35.0116, "lng": 135.7681, "tz": "Asia/Tokyo"},
    "大阪":    {"lat": 34.6937, "lng": 135.5023, "tz": "Asia/Tokyo"},
    "神戸":    {"lat": 34.6901, "lng": 135.1956, "tz": "Asia/Tokyo"},
    "広島":    {"lat": 34.3853, "lng": 132.4553, "tz": "Asia/Tokyo"},
    "福岡":    {"lat": 33.5904, "lng": 130.4017, "tz": "Asia/Tokyo"},
    "熊本":    {"lat": 32.8031, "lng": 130.7079, "tz": "Asia/Tokyo"},
    "鹿児島":  {"lat": 31.5966, "lng": 130.5571, "tz": "Asia/Tokyo"},
    "那覇":    {"lat": 26.2124, "lng": 127.6809, "tz": "Asia/Tokyo"},
    # 海外主要都市
    "ニューヨーク":  {"lat": 40.7128,  "lng": -74.0060,  "tz": "America/New_York"},
    "ロサンゼルス":  {"lat": 34.0522,  "lng": -118.2437, "tz": "America/Los_Angeles"},
    "ロンドン":      {"lat": 51.5074,  "lng": -0.1278,   "tz": "Europe/London"},
    "パリ":          {"lat": 48.8566,  "lng": 2.3522,    "tz": "Europe/Paris"},
    "ベルリン":      {"lat": 52.5200,  "lng": 13.4050,   "tz": "Europe/Berlin"},
    "北京":          {"lat": 39.9042,  "lng": 116.4074,  "tz": "Asia/Shanghai"},
    "上海":          {"lat": 31.2304,  "lng": 121.4737,  "tz": "Asia/Shanghai"},
    "ソウル":        {"lat": 37.5665,  "lng": 126.9780,  "tz": "Asia/Seoul"},
    "シドニー":      {"lat": -33.8688, "lng": 151.2093,  "tz": "Australia/Sydney"},
    "ムンバイ":      {"lat": 19.0760,  "lng": 72.8777,   "tz": "Asia/Kolkata"},
}

def get_city(name: str) -> CityData | None:
    return CITIES.get(name)

def get_city_names() -> list[str]:
    return sorted(CITIES.keys())
```

### Step 5: スキーマ定義

**sidecar/models/schemas.py**

```python
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
```

### Step 6: チャート計算エンドポイント

**sidecar/routers/chart.py**

```python
from fastapi import APIRouter, HTTPException
from kerykeion import AstrologicalSubjectFactory, ChartDataFactory
from models.schemas import BirthData
from data.cities import get_city, get_city_names

router = APIRouter()

@router.post("/chart")
async def calculate_chart(data: BirthData):
    city_data = get_city(data.city)

    if city_data:
        subject = AstrologicalSubjectFactory.from_birth_data(
            data.name,
            data.year, data.month, data.day,
            data.hour, data.minute,
            lat=city_data["lat"],
            lng=city_data["lng"],
            tz_str=city_data["tz"],
            online=False,
        )
    elif data.lat and data.lng and data.timezone:
        subject = AstrologicalSubjectFactory.from_birth_data(
            data.name,
            data.year, data.month, data.day,
            data.hour, data.minute,
            lat=data.lat,
            lng=data.lng,
            tz_str=data.timezone,
            online=False,
        )
    else:
        raise HTTPException(
            status_code=400,
            detail=f"都市 '{data.city}' は辞書に存在しません。lat/lng/timezone を指定してください。"
        )

    natal = ChartDataFactory.get_natal_chart(subject)
    return natal.model_dump()

@router.get("/cities")
async def list_cities():
    """都市辞書のキー一覧を返す（フロントのオートコンプリート用）"""
    return {"cities": get_city_names()}
```

### Step 7: 解釈エンドポイント（SSE）

**sidecar/prompts/interpretation.py**

```python
SYSTEM_PROMPT = """
あなたは西洋占星術の解説者です。
モダン西洋占星術（熱帯・プラシダス）に基づき、
占星術の初心者にも理解できるよう、平易な日本語で解釈してください。

## 解釈の方針
- 運命の断言はしない。「〜の傾向があります」「〜を大切にするとよいでしょう」という表現を使う
- 自己理解・自己受容を促す前向きなトーンを保つ
- 専門用語を使う場合は必ず平易な説明を添える

## 出力構成（必ずこの順序で出力すること）
1. **全体の概観**（3〜4文）
2. **太陽サイン**：本質・アイデンティティ
3. **月サイン**：感情・内面の欲求
4. **アセンダント**：外から見た印象・人生への向き合い方
5. **目立つアスペクト**：特徴的な天体間の関係（2〜3個）
6. **まとめ**（2〜3文）

各項目は200〜300字程度を目安にしてください。
""".strip()
```

**sidecar/routers/interpret.py**

```python
import os
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import anthropic
from kerykeion import AstrologicalSubjectFactory, to_context
from models.schemas import BirthData
from data.cities import get_city
from prompts.interpretation import SYSTEM_PROMPT

router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

@router.post("/interpret")
async def interpret_chart(data: BirthData):
    city_data = get_city(data.city)

    subject = AstrologicalSubjectFactory.from_birth_data(
        data.name,
        data.year, data.month, data.day,
        data.hour, data.minute,
        lat=city_data["lat"] if city_data else data.lat,
        lng=city_data["lng"] if city_data else data.lng,
        tz_str=city_data["tz"] if city_data else data.timezone,
        online=False,
    )

    xml_context = to_context(subject)

    async def generate():
        with client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": xml_context}]
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )
```

### Step 8: Tauri サイドカー起動設定

**src-tauri/tauri.conf.json**（抜粋・修正箇所）

```json
{
  "app": {
    "windows": [{
      "title": "Liber Caeli",
      "width": 1200,
      "height": 800,
      "resizable": true
    }]
  },
  "bundle": {
    "identifier": "com.sohshi.liber-caeli",
    "externalBin": ["binaries/sidecar"]
  }
}
```

**src-tauri/src/main.rs**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_shell::ShellExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let sidecar_command = app.shell().sidecar("sidecar").unwrap();
            let (_rx, _child) = sidecar_command
                .spawn()
                .expect("Failed to spawn sidecar");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Step 9: フロントエンド APIクライアント

**src/lib/api.ts**

```typescript
const SIDECAR_URL = "http://localhost:8765";

export interface BirthData {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  lat?: number;
  lng?: number;
  timezone?: string;
}

export async function fetchChart(data: BirthData) {
  const res = await fetch(`${SIDECAR_URL}/chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchCities(): Promise<string[]> {
  const res = await fetch(`${SIDECAR_URL}/cities`);
  const data = await res.json();
  return data.cities;
}

export function streamInterpretation(
  data: BirthData,
  onText: (text: string) => void,
  onDone: () => void
): () => void {
  const controller = new AbortController();

  fetch(`${SIDECAR_URL}/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: controller.signal,
  }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const payload = line.slice(6);
          if (payload === "[DONE]") { onDone(); return; }
          try {
            const { text } = JSON.parse(payload);
            onText(text);
          } catch {}
        }
      }
    }
  });

  return () => controller.abort();
}
```

### Step 10: サイドカー起動待機フック

**src/hooks/useChart.ts**（ヘルスチェック込み）

```typescript
import { useState, useEffect } from "react";
import { fetchChart, BirthData } from "../lib/api";

export function useSidecarReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const poll = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8765/health");
        if (res.ok) {
          setReady(true);
          clearInterval(poll);
        }
      } catch {
        attempts++;
        if (attempts > 30) clearInterval(poll); // 15秒でタイムアウト
      }
    }, 500);
    return () => clearInterval(poll);
  }, []);

  return ready;
}
```

---

## 環境変数

**`.env`**（gitignore対象）
```
ANTHROPIC_API_KEY=sk-ant-...
```

**`.env.example`**（コミット対象）
```
ANTHROPIC_API_KEY=your_api_key_here
```

サイドカーは起動時に `python-dotenv` で `.env` を読み込む：

```python
# sidecar/main.py の先頭に追加
from dotenv import load_dotenv
load_dotenv()
```

---

## .gitignore（追加すべき項目）

```
# 環境変数
.env

# Python
sidecar/__pycache__/
sidecar/**/__pycache__/
sidecar/*.pyc
sidecar/.venv/
sidecar/dist/

# Tauri
src-tauri/target/
src-tauri/binaries/

# Node
node_modules/
dist/
```

---

## CLAUDE.md（プロジェクトルートに配置）

```markdown
# caelum — Liber Caeli

西洋占星術ネイタルチャートアプリ（個人利用）。
ラテン語で「天空の書」。

## 技術スタック
- フロントエンド: Tauri v2, React 18, TypeScript, Tailwind CSS, D3.js
- バックエンド: Python 3.10+, FastAPI, kerykeion（online=False）, uvicorn
- AI: Anthropic Claude API (claude-sonnet-4-6)
- 位置情報: 内蔵都市辞書（GeoNames不使用）

## ディレクトリ
- src/         React フロントエンド
- sidecar/     Python サイドカー（FastAPI, ポート8765固定）
- src-tauri/   Tauri設定・Rustコード

## 開発コマンド
\`\`\`bash
# フロントエンド + Tauri起動
npm run tauri dev

# サイドカー単体起動（デバッグ用）
cd sidecar && source .venv/bin/activate
uvicorn main:app --port 8765 --reload

# Pythonパッケージインストール
cd sidecar && pip install -r requirements.txt
\`\`\`

## 占星術設定（変更禁止）
- 黄道: 熱帯（Tropical）
- ハウス: プラシダス（Placidus）
- online: False（GeoNames不使用）
- ポート: 8765固定

## コーディング規約
- TypeScript: strict mode、型定義は src/types/ に集約
- Python: PEP8準拠、型ヒント必須（mypy対応）
- コミット: Conventional Commits（feat/fix/docs/refactor/chore）
- ブランチ: main / develop / feature/xxx / fix/xxx

## 注意事項
- ANTHROPIC_API_KEY は .env に記載（コミット厳禁）
- kerykeionの呼び出しは必ず sidecar/services/kerykeion_service.py 経由
- online=False を必ず指定すること
```

---

## Phase 1 完了チェックリスト

```
[ ] caelum/ ディレクトリ構造の作成
[ ] npm create tauri-app でスキャフォールド
[ ] sidecar/ の骨格実装（main.py + /health エンドポイント）
[ ] sidecar 起動確認（uvicorn main:app --port 8765）
[ ] Tauri から sidecar を externalBin として起動確認
[ ] cities.py の都市辞書実装
[ ] POST /chart エンドポイント実装・動作確認
[ ] POST /interpret エンドポイント実装（SSE）
[ ] GET /cities エンドポイント実装
[ ] BirthDataForm.tsx：入力フォーム + 都市オートコンプリート
[ ] ChartWheel.tsx：D3.js チャート円盤（最小版）
[ ] InterpretationPanel.tsx：SSEストリーミングテキスト表示
[ ] useSidecarReady フック（ヘルスチェックポーリング）
[ ] .env / .env.example / .gitignore 配置
[ ] CLAUDE.md 配置
[ ] README.md 作成
[ ] GitHub リポジトリ caelum 作成・初回プッシュ
```

---

## 既知リスク・注意事項

| リスク | 内容 | 対策 |
|---|---|---|
| kerykeionのAGPL | kerykeionのライセンスはAGPL v3 | 個人利用のみのため問題なし |
| サイドカー起動タイミング | React描画前に未起動の可能性 | `useSidecarReady` でポーリング |
| PyInstaller + kerykeion | Swiss Ephemerisのネイティブバイナリが含まれる | `--add-binary` で明示的に同梱 |
| Tauriバイナリ命名規則 | `sidecar-{target_triple}` の形式が必要 | `tauri info` でtarget tripleを確認 |
| Claude APIキーの管理 | `.env` をコミットしないこと | `.gitignore` で確実に除外 |

---

## 参考リンク

- kerykeion ドキュメント: https://www.kerykeion.net/
- kerykeion GitHub: https://github.com/g-battaglia/kerykeion
- Tauri v2 サイドカーガイド: https://v2.tauri.app/develop/sidecar/
- Tauri v2 Shell Plugin: https://v2.tauri.app/plugin/shell/
- 設計書: `docs/DESIGN_caelum.md`
