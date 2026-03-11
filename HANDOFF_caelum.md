# HANDOFF: caelum（Liber Caeli）

**作成日**: 2026-03-09
**最終更新**: 2026-03-11
**ステータス**: Phase 3 進行中
**引き継ぎ先**: Claude Code

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| リポジトリ名 | `caelum` |
| アプリ表示名 | **Liber Caeli**（リベル・カエリ）|
| 意味 | ラテン語「天空の書」 |
| 用途 | 個人利用デスクトップ占星術アプリ |
| オーナー | osprey74 |

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
    "identifier": "com.osprey74.caelum",
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

## Phase 2：日常使いを支えるコア強化（優先度：高）

### 2-1. チャートプロファイル保存機能

- 複数人の出生データをローカルDBに保存（SQLite via Tauri SQL Plugin）
- サイドバーにプロファイル一覧・切り替えUI
- プロファイルの追加・編集・削除
- **参考:** https://v2.tauri.app/plugin/sql/

### 2-2. チャートエクスポート

- SVG / PNG 形式での出力（`html-to-image` または D3 export）
- AI解釈テキストを含む PDF レポート生成
- SNS 共有・印刷ニーズへの対応

### 2-3. 都市辞書の拡充 + ジオコーディング

- 任意の地名を OpenStreetMap Nominatim API で検索・緯度経度取得
- 現在の固定都市辞書をフォールバックとして維持
- **参考:** https://nominatim.openstreetmap.org/

### 2-4. UI ブラッシュアップ

- ダークモード対応（Tailwind `dark:` クラス活用）
- チャートホイールのホバーツールチップ（天体名・サイン・度数）
- 解釈テキストのセクション折りたたみ

---

## Phase 3：占星術の深度を上げる（優先度：中）

### 3-1. トランジットチャート ⭐ 最注力推奨

- 現在の天体配置をネイタルチャートに重ねて表示（二重円）
- 「今どんな影響を受けているか」の AI 解釈を生成
- kerykeion 実装イメージ：`BirthData` に加え「現在日時」を引数に transit subject 生成
- リピート利用の起点となる最重要機能

### 3-2. シナストリーチャート（2人の相性）

- 2人の出生データを入力し、天体間のアスペクトを重ねて表示
- AI 解釈「2人の関係性の傾向と可能性」
- カップル・家族・友人などへの用途拡大

### 3-3. 追加天体・小惑星

- キロン（傷と癒し）、リリス（本能・影）
- フォルテュナ（アラビック・パーツ）
- kerykeion が対応済みのため実装コスト低め

### 3-4. ハウスシステム選択

- プラシダス（現在）に加え、ホールサイン・コッホ・等分ハウスを選択可能に
- 設定画面で切り替え（`CLAUDE.md` の「占星術設定（変更禁止）」を設定可能項目として更新）

---

## Phase 4：情報・学習・コミュニティ価値（優先度：低・将来検討）

### 4-1. 学習モード

- チャート上の各要素クリックで解説パネルを表示（天体・サイン・ハウスの意味）
- 初心者オンボーディングとして有効

### 4-2. 月間トランジットカレンダー

- 翌月の重要トランジット（新月・満月・逆行）をカレンダー表示
- AI による「今月のフォーカスポイント」生成

### 4-3. 多言語対応

- 英語 UI 対応（海外ユーザー獲得）
- 解釈言語の選択（日本語 / 英語）

---

## フェーズ優先順位サマリー

| フェーズ | 内容 | 優先度 |
|---------|------|--------|
| Phase 2 | プロファイル保存 / エクスポート / 都市拡充 / UI改善 | ★★★ 即着手 |
| Phase 3 | トランジット / シナストリー / 追加天体 / ハウス選択 | ★★☆ 次ステップ |
| Phase 4 | 学習モード / カレンダー / 多言語 | ★☆☆ 将来構想 |

> **次の着手推奨:** Phase 2-1（プロファイル保存）→ Phase 3-1（トランジットチャート）


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
[x] caelum/ ディレクトリ構造の作成                          ← Step 1（手動完了）
[x] npm create tauri-app でスキャフォールド                  ← Step 1（手動完了）
[x] Python仮想環境 + 依存パッケージインストール              ← Step 2（手動完了）
[x] sidecar/ の骨格実装（main.py + /health エンドポイント）  ← Step 3（2026-03-09）
[x] sidecar 起動確認（uvicorn main:app --port 8765）        ← Step 3（2026-03-09）
[x] cities.py の都市辞書実装                                ← Step 4（2026-03-09）
[x] スキーマ定義（models/schemas.py）                       ← Step 5（2026-03-10）
[x] POST /chart エンドポイント実装・動作確認                 ← Step 6（2026-03-10）
[x] GET /cities エンドポイント実装                           ← Step 6（2026-03-10）
[x] POST /interpret エンドポイント実装（SSE）                ← Step 7（2026-03-10）
[x] Tauri から sidecar を externalBin として起動確認         ← Step 8（2026-03-10）
[x] フロントエンド APIクライアント（src/lib/api.ts）          ← Step 9（2026-03-10）
[x] useSidecarReady フック（ヘルスチェックポーリング）        ← Step 10（2026-03-10）
[x] BirthDataForm.tsx：入力フォーム + 都市オートコンプリート  ← 2026-03-10
[x] ChartWheel.tsx：D3.js チャート円盤（最小版）              ← 2026-03-10
[x] InterpretationPanel.tsx：SSEストリーミングテキスト表示    ← 2026-03-10
[x] .env.example / .gitignore 配置                          ← 2026-03-10
[x] CLAUDE.md 配置                                          ← 2026-03-10
[x] README.md 作成                                          ← 2026-03-10
[x] GitHub リポジトリ caelum 作成・初回プッシュ               ← 2026-03-10
```

---

## Phase 2 完了チェックリスト

```
[x] 2-4: チャートホイールのホバーツールチップ（天体・アスペクト）        ← 2026-03-11
[x] 2-4: 解釈テキストのセクション折りたたみ（アコーディオン）           ← 2026-03-11
[x] 2-4: App.css テンプレート残骸クリーンアップ                        ← 2026-03-11
[x] 2-1: バックエンド Profile CRUD（スキーマ・サービス・ルーター）       ← 2026-03-11
[x] 2-1: フロントエンド ProfileList コンポーネント                      ← 2026-03-11
[x] 2-1: BirthDataForm にプロファイル自動入力（initialData prop）       ← 2026-03-11
[x] 2-1: App.tsx に ProfileList 統合                                   ← 2026-03-11
[x] 2-3: バックエンド Nominatim API 検索エンドポイント                    ← 2026-03-11
[x] 2-3: フロントエンド 都市検索UI（テキスト入力 + 検索結果候補）          ← 2026-03-11
[x] 2-3: 既存都市辞書をフォールバックとして維持                            ← 2026-03-11
[x] 2-2: SVG エクスポート機能                                              ← 2026-03-11
[x] 2-2: PNG エクスポート機能                                              ← 2026-03-11
[x] 2-2: PDF レポート生成（チャート + 解釈テキスト）                        ← 2026-03-11
```

---

## Phase 3 完了チェックリスト

```
[x] 3-1: バックエンド POST /transit エンドポイント（kerykeion transit）      ← 2026-03-11
[x] 3-1: フロントエンド トランジット日付ピッカー                            ← 2026-03-11
[x] 3-1: ChartWheel 二重円描画（ネイタル内円 + トランジット外円）            ← 2026-03-11
[x] 3-1: POST /interpret-transit トランジット解釈エンドポイント              ← 2026-03-11
[x] 3-2: バックエンド POST /synastry エンドポイント                          ← 2026-03-11
[x] 3-2: フロントエンド 2人分入力フォーム + シナストリーUI                    ← 2026-03-11
[x] 3-2: ChartWheel シナストリー二重円描画                                    ← 2026-03-11
[x] 3-2: POST /interpret-synastry シナストリー解釈エンドポイント              ← 2026-03-11
[ ] 3-3: キロン・リリス等の追加天体表示（型定義・ChartWheel・PlanetTable）
[ ] 3-4: ハウスシステム選択UI（設定画面）
[ ] 3-4: バックエンド houses_system パラメータ対応
```

---

## Phase 4 完了チェックリスト

```
[ ] 4-1: 用語辞書データ作成（天体・サイン・ハウス・アスペクト）
[ ] 4-1: チャート要素クリックで解説モーダル表示
[ ] 4-2: バックエンド 月間トランジット一括計算エンドポイント
[ ] 4-2: フロントエンド カレンダーUI
[ ] 4-2: AI による月間フォーカスポイント生成
[ ] 4-3: i18next 導入 + UI文字列の外部化（ja.json / en.json）
[ ] 4-3: 解釈言語切替（プロンプト言語パラメータ）
```

---

## 進捗ログ

### 2026-03-09（初回セッション）

**完了した作業:**
- **Step 3**: サイドカー骨格実装
  - `sidecar/main.py` — FastAPIエントリポイント（CORS、dotenv、`/health`）
  - `sidecar/routers/chart.py`, `interpret.py` — ルータースタブ
  - 各パッケージの `__init__.py` 作成（routers, services, models, prompts, data）
  - `uvicorn main:app --port 8765` で起動し `/health` が `{"status":"ok"}` を返すことを確認済み
- **Step 4**: 都市辞書実装
  - `sidecar/data/cities.py` — 日本15都市＋海外10都市（計25都市）
  - `get_city()`, `get_city_names()` の動作確認済み

**次回の作業:**
- Step 5（スキーマ定義）から再開


### 2026-03-10（第2セッション）

**完了した作業:**
- **Step 5**: スキーマ定義
  - `sidecar/models/schemas.py` — `BirthData` Pydanticモデル
- **Step 6**: チャート計算エンドポイント
  - `sidecar/routers/chart.py` — `POST /chart`（kerykeion 5.11.1 API対応: `create_natal_chart_data`）
  - `GET /cities` エンドポイント追加
  - 動作確認済み: 天体18点、アスペクト63個返却
- **Step 7**: 解釈エンドポイント（SSE）
  - `sidecar/prompts/interpretation.py` — システムプロンプト
  - `sidecar/routers/interpret.py` — `POST /interpret` SSEストリーミング（Claude API）
  - APIキー未設定時の500エラー確認済み
- **Step 8**: Tauri サイドカー起動設定
  - `tauri-plugin-shell` 追加、`externalBin` 設定
  - `lib.rs` にサイドカー起動コード（起動失敗時は手動起動を案内）
  - ターゲットトリプル: `x86_64-pc-windows-msvc`
  - `.gitignore` にPython/Tauri/環境変数の除外ルール追加
  - `cargo check` コンパイル確認済み
- **Step 9**: フロントエンド APIクライアント
  - `src/lib/api.ts` — `fetchChart`, `fetchCities`, `streamInterpretation`
- **Step 10**: サイドカー起動待機フック
  - `src/hooks/useChart.ts` — `useSidecarReady`（500ms間隔ポーリング、15秒タイムアウト）
- ドキュメント: CLAUDE.md、README.md、.env.example 配置

**kerykeion API差異メモ（HANDOFF記載 → 実際）:**
- `ChartDataFactory.get_natal_chart()` → `ChartDataFactory.create_natal_chart_data()`
- `to_context()` はXML形式文字列を返す（正常動作）

**UIコンポーネント実装（同セッション後半）:**
- `BirthDataForm.tsx` — 入力フォーム＋都市オートコンプリート（キーボード操作対応）
- `ChartWheel.tsx` — D3.js SVGチャート円盤（サインリング、ハウス線、天体シンボル、アスペクト線）
- `PlanetTable.tsx` — 天体配置一覧表（サイン/度数/ハウス/逆行）
- `InterpretationPanel.tsx` — SSEストリーミングテキスト表示（生成/中止ボタン）
- `astrology.ts` — 型定義＋シンボル定数
- `App.tsx` — 3カラムレイアウトで全コンポーネント接続
- `npx tsc --noEmit` + `npx vite build` 通過確認済み

**Phase 1 全チェックリスト完了。次ステップは実動作確認。**

### 2026-03-10（第2セッション後半 — AI解釈テスト＆UI改善）

**完了した作業:**
- **AI解釈テスト・修正**
  - `interpret.py`: `async def generate()` → `def generate()`（同期ジェネレーター修正で500エラー解消）
  - `interpret.py`: `max_tokens` 2000 → 8192（解釈テキスト途切れ対策）
  - `interpretation.py`: プロンプトに文字数制限追加（全体2000字以内厳守）
- **UI改善**
  - `BirthDataForm.tsx`: 都市選択をオートコンプリートからドロップダウン `<select>` に変更
  - `cities.py`: 都市の並び順を「日本（緯度高い順）→ 海外（名前順）」に変更
  - `InterpretationPanel.tsx`: `react-markdown` によるMarkdownレンダリング対応（見出し・太字・引用・区切り線）

**動作確認結果:**
- チャート生成: 正常動作
- AI解釈: ストリーミング正常、途切れなし、Markdown装飾表示OK

### 2026-03-11（第3セッション — Phase 2-4 UI改善）

**完了した作業:**
- **Phase 2-4: UI ブラッシュアップ**
  - `ChartWheel.tsx`: 天体シンボルにホバーツールチップ追加（天体名・サイン・度数・ハウス・逆行）
  - `ChartWheel.tsx`: アスペクト線にもツールチップ追加（天体ペア・アスペクト種別・オーブ）
  - `ChartWheel.tsx`: 天体名の日本語辞書 `PLANET_NAMES_JA` を追加
  - `InterpretationPanel.tsx`: Markdownの見出し単位でセクション折りたたみ（アコーディオン）機能を実装
  - `InterpretationPanel.tsx`: `splitSections()` でテキストを見出し単位に分割、クリックで開閉
  - `App.css`: Tauriテンプレートの不要スタイル除去（ライトモード用input/buttonスタイル等）
  - `tsc --noEmit` + `vite build` 通過確認済み

- **Phase 2-1: チャートプロファイル保存機能**
  - バックエンド:
    - `sidecar/models/schemas.py`: `ProfileCreate`, `ProfileUpdate` Pydanticスキーマ追加
    - `sidecar/services/profiles.py`: JSON永続化（settings.pyと同パターン、アプリデータディレクトリに `profiles.json`）
    - `sidecar/routers/profiles.py`: CRUD エンドポイント（`GET/POST /profiles`, `GET/PUT/DELETE /profiles/{id}`）
    - `sidecar/main.py`: profiles ルーター登録
  - フロントエンド:
    - `src/types/astrology.ts`: `Profile` インターフェース追加
    - `src/lib/api.ts`: `fetchProfiles`, `createProfile`, `updateProfile`, `deleteProfile` 関数追加
    - `src/components/ProfileList.tsx`: プロファイル選択ドロップダウン + 保存/削除ボタン
    - `src/components/BirthDataForm.tsx`: `initialData` prop追加（プロファイル選択時にフォーム自動入力）
    - `src/App.tsx`: ProfileList統合、データフロー接続
  - `tsc --noEmit` + `vite build` 通過確認済み

### 2026-03-11（第4セッション — Phase 2-3 都市辞書拡充 + ジオコーディング）

**完了した作業:**
- **Phase 2-3: Nominatim API ジオコーディング**
  - バックエンド:
    - `sidecar/routers/geocode.py`: `GET /geocode?q=` エンドポイント新規作成
    - ローカル都市辞書の部分一致検索 + Nominatim API の並列結果を返却
    - `timezonefinder` で緯度経度からタイムゾーンを自動推定
    - Nominatim API 失敗時もローカル結果をフォールバックとして返却
    - `sidecar/main.py`: geocode ルーター登録
    - `requirements.txt`: `timezonefinder` + 依存パッケージ追加
  - フロントエンド:
    - `src/lib/api.ts`: `searchCity()` 関数 + `GeocodingResult` 型追加
    - `src/components/BirthDataForm.tsx`: 都市選択UIを「一覧から選択」/「都市名で検索」の2モード切替に刷新
    - 検索モード: テキスト入力 + 検索ボタン → 候補リスト表示 → 選択で lat/lng/tz 自動設定
    - 辞書モード: 従来のドロップダウン + 手動緯度経度入力をそのまま維持
  - `tsc --noEmit` 通過確認済み、Python geocode ルーター import 確認済み

- **Phase 2-2: エクスポート機能（SVG / PNG / PDF）**
  - `src/lib/export.ts`: エクスポートユーティリティ新規作成
    - `exportSvg()`: SVGシリアライズ → ファイルダウンロード
    - `exportPng()`: SVG → Canvas → PNG 変換（2倍解像度）
    - `exportPdf()`: jsPDF でA4レポート生成（チャート画像 + 解釈テキスト）
  - `src/components/ExportButtons.tsx`: SVG/PNG/PDFボタンコンポーネント
  - `src/components/ChartWheel.tsx`: `forwardRef` + `useImperativeHandle` で SVG要素を外部公開
  - `src/components/InterpretationPanel.tsx`: `onTextChange` コールバック追加（PDF用テキスト連携）
  - `src/App.tsx`: ChartWheel ref + ExportButtons + InterpretationPanel テキスト連携を統合
  - `package.json`: `jspdf` 依存追加
  - `tsc --noEmit` + `vite build` 通過確認済み

- **Phase 3-1: トランジットチャート（二重円）**
  - バックエンド:
    - `sidecar/models/schemas.py`: `TransitRequest`, `SynastryRequest` スキーマ追加
    - `sidecar/routers/chart.py`: `POST /transit`, `POST /synastry` エンドポイント追加、共通ヘルパー `_resolve_coords` / `_make_subject` にリファクタ
    - `sidecar/routers/interpret.py`: `POST /interpret-transit` トランジット解釈SSEエンドポイント追加、共通ヘルパーにリファクタ
    - `sidecar/prompts/transit.py`: トランジット解釈用システムプロンプト新規作成
  - フロントエンド:
    - `src/types/astrology.ts`: `DualChartResponse`, `TransitRequest` 型追加
    - `src/lib/api.ts`: `fetchTransit()`, `streamTransitInterpretation()` 関数追加
    - `src/components/TransitPanel.tsx`: 日付ピッカー + トランジット計算 + AI解釈パネル新規作成
    - `src/components/ChartWheel.tsx`: `transitData` prop追加、二重円描画対応（外円にトランジット天体をアンバー色で表示）
    - `src/App.tsx`: 右サイドバーをタブ切替（ネイタル解釈 / トランジット）に変更
  - `tsc --noEmit` 通過確認済み

- **バグ修正: アコーディオン折りたたみ**
  - `src/components/InterpretationPanel.tsx`: `splitSections()` の正規表現を `#{1,3}` → `#{1,2}` に変更
  - `src/components/TransitPanel.tsx`: 同上（TransitPanel内の独立コピーも修正）
  - h3見出し（サブセクション）が親h2の中に留まるようになり、「目立つアスペクト」等が1つのセクションとして折りたたまれる

- **バグ修正: トランジット日付の空括弧「()」**
  - `src/components/TransitPanel.tsx`: date入力に `lang="en"` 属性と `[&::-webkit-datetime-edit-day-of-week-field]:hidden` CSSクラスを追加
  - Windows WebView2 の日本語ロケールで曜日が空の括弧として表示される問題を解消

- **バグ修正: PDFエクスポート日本語文字化け**
  - `public/fonts/NotoSansJP-Regular.ttf`: Noto Sans JP フォント（5MB TTF）をバンドル
  - `src/lib/export.ts`: PDF生成時にフォントを fetch → base64変換 → jsPDF に登録（初回読み込み後キャッシュ）
  - タイトルも日本語化（`ネイタルチャートレポート — {名前}`）

### 2026-03-11（第5セッション — Phase 3-2 シナストリーチャート）

**完了した作業:**
- **Phase 3-2: シナストリーチャート（2人の相性）**
  - バックエンド:
    - `sidecar/prompts/synastry.py`: シナストリー解釈用システムプロンプト新規作成（関係性概観・太陽月・金星火星・コミュニケーション・注目アスペクト・まとめ）
    - `sidecar/routers/interpret.py`: `POST /interpret-synastry` SSEエンドポイント追加（2人分のコンテキスト生成）
  - フロントエンド:
    - `src/types/astrology.ts`: `SynastryRequest` インターフェース追加
    - `src/lib/api.ts`: `fetchSynastry()`, `streamSynastryInterpretation()` 関数追加
    - `src/components/SynastryPanel.tsx`: 新規コンポーネント（プロファイル選択で2人目を指定、計算・解釈・アコーディオン折りたたみ、ピンク系アクセントカラー）
    - `src/App.tsx`: 右サイドバーに「シナストリー」タブ追加（3タブ構成: ネイタル解釈/トランジット/シナストリー）、タブ切替でChartWheelの二重円データを切り替え
  - ChartWheelは既存の二重円描画ロジック（`transitData` prop）をそのまま活用
  - `tsc --noEmit` + `vite build` 通過確認済み
  - 動作確認済み: シナストリー計算（二重円表示）、AI解釈ストリーミング共に正常動作

- **バグ修正: トランジット/シナストリーのPDFエクスポートに解釈テキストが含まれない**
  - 原因: `App.tsx` の `interpretationText` がネイタル解釈のみを保持しており、トランジット/シナストリーのテキストが未連携
  - 修正:
    - `src/App.tsx`: 単一 `interpretationText` → `natalInterpText` / `transitInterpText` / `synastryInterpText` の3状態に分離、`activeInterpText` をタブに応じて切替
    - `src/components/TransitPanel.tsx`: `onTextChange` prop + useEffect でテキスト変更を親に通知
    - `src/components/SynastryPanel.tsx`: 同上
    - `ExportButtons` に渡すテキストを `activeInterpText` に変更

- **UX改善: エクスポート完了通知トースト**
  - `src/components/ExportButtons.tsx`: SVG/PNG/PDFエクスポート完了時に緑色のトースト通知を表示（2.5秒で自動消去、フェードイン/アウトアニメーション付き）
  - `tailwind.config.js`: `fade-in-out` カスタムアニメーション追加

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
