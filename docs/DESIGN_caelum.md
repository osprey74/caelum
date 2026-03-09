# Liber Caeli 構成設計書

> 作成日: 2026-03-09  
> ステータス: 設計フェーズ（確定）  
> リポジトリ名: `caelum`  
> アプリ表示名: **Liber Caeli**（リベル・カエリ）  
> 意味: ラテン語「天空の書」

---

## 1. プロジェクト概要

### コンセプト
西洋占星術のネイタルチャートを計算・描画し、Claude APIによるAI解釈テキストを生成する個人利用デスクトップアプリ。

### 採用流派・レイヤー設定

| レイヤー | 選択 | 備考 |
|---|---|---|
| L1 黄道 | 熱帯（Tropical） | 日本語情報と一致 |
| L1 ハウス | プラシダス | astro.com標準 |
| L2 天体 | 10天体 + ASC/MC | キロン等は将来拡張 |
| L3 アスペクト | 主要5 + セミスクエア・クインカンクス | モダン準拠 |
| L4 解釈軸 | モダン西洋（性格・傾向軸） | 初心者向け自己理解フレーム |

---

## 2. 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|---|---|---|
| Tauri | v2 | デスクトップシェル |
| React | 18+ | UIフレームワーク |
| TypeScript | 5+ | 型安全 |
| Tailwind CSS | 3+ | スタイリング |
| D3.js | 7+ | チャートSVG描画 |
| Material Symbols Rounded | - | アイコン（kazahana準拠） |

### バックエンド（Python サイドカー）
| 技術 | バージョン | 用途 |
|---|---|---|
| Python | 3.10+ | サイドカー実行環境 |
| kerykeion | 最新 | 天体計算エンジン（Swiss Ephemeris内包）|
| FastAPI | 最新 | サイドカーHTTPサーバー |
| uvicorn | 最新 | ASGIサーバー（開発時） |
| PyInstaller | 最新 | サイドカーのシングルバイナリ化（リリース時） |

### 位置情報
| 方式 | 内容 |
|---|---|
| **`online=False`** | GeoNames API不使用・完全オフライン動作 |
| **都市辞書内蔵** | `sidecar/data/cities.py` に日本・海外主要都市を収録 |
| **手動入力フォールバック** | 辞書にない都市は緯度・経度・タイムゾーンを直接入力 |

### AI
| 技術 | 用途 |
|---|---|
| Claude API（claude-sonnet-4-6） | Layer 4 解釈テキスト生成 |

---

## 3. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│  Tauri Shell（Rust）                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React + TypeScript（WebView）                    │  │
│  │                                                   │  │
│  │  ┌─────────────────┐   ┌───────────────────────┐  │  │
│  │  │  ChartView       │   │  InterpretationView   │  │  │
│  │  │  D3.js SVG描画   │   │  AIテキスト表示       │  │  │
│  │  └────────┬────────┘   └──────────┬────────────┘  │  │
│  │           │                       │               │  │
│  │  ┌────────▼───────────────────────▼────────────┐  │  │
│  │  │  API Client（TypeScript）                   │  │  │
│  │  │  localhost:8765 へ fetch                    │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Python Sidecar（FastAPI + uvicorn :8765）        │  │
│  │                                                   │  │
│  │  POST /chart      kerykeion 計算 → JSON返却       │  │
│  │  POST /interpret  Claude API呼び出し → SSE返却    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### データフロー
```
ユーザー入力（生年月日時・出生地）
    │
    ▼
POST /chart
    │  kerykeion で計算
    ▼
チャートデータ JSON
    │  D3.jsで描画（フロント）
    │  + Claude APIへ送信（バック）
    ▼
POST /interpret
    │  kerykeionの to_context() でXML生成
    │  Claude API（claude-sonnet-4-6）へ投げる
    │  Server-Sent Events でストリーミング返却
    ▼
解釈テキスト（ストリーミング表示）
```

---

## 4. ディレクトリ構造

```
caelum/
├── src/                          # Reactフロントエンド
│   ├── components/
│   │   ├── ChartWheel.tsx        # D3.js ネイタルチャート円盤
│   │   ├── PlanetTable.tsx       # 天体配置一覧表
│   │   ├── InterpretationPanel.tsx # AI解釈テキストパネル
│   │   ├── BirthDataForm.tsx     # 入力フォーム（都市オートコンプリート含む）
│   │   └── ui/                   # 共通UIコンポーネント
│   ├── hooks/
│   │   ├── useChart.ts           # チャートデータ取得
│   │   └── useInterpretation.ts  # AI解釈SSE受信
│   ├── types/
│   │   └── astrology.ts          # 型定義
│   ├── lib/
│   │   └── api.ts                # サイドカーAPIクライアント
│   ├── App.tsx
│   └── main.tsx
│
├── sidecar/                      # Pythonサイドカー
│   ├── main.py                   # FastAPIエントリポイント
│   ├── routers/
│   │   ├── chart.py              # /chart エンドポイント
│   │   └── interpret.py          # /interpret エンドポイント
│   ├── services/
│   │   ├── kerykeion_service.py  # kerykeion ラッパー
│   │   └── claude_service.py     # Claude API ラッパー
│   ├── models/
│   │   └── schemas.py            # Pydantic スキーマ
│   ├── prompts/
│   │   └── interpretation.py     # プロンプトテンプレート
│   ├── data/
│   │   └── cities.py             # 主要都市辞書（緯度・経度・TZ）
│   └── requirements.txt
│
├── src-tauri/                    # Tauri設定（Rust）
│   ├── src/
│   │   └── main.rs               # サイドカー起動処理
│   ├── binaries/                 # PyInstallerビルド済みバイナリ配置先
│   ├── Cargo.toml
│   └── tauri.conf.json           # サイドカー・アプリ名設定
│
├── docs/
│   └── DESIGN_caelum.md          # 本ドキュメント
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── CLAUDE.md                     # Claude Code 作業指示
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. 各コンポーネント詳細

### 5-1. Python サイドカー

#### Tauri サイドカー設定（tauri.conf.json）
```json
{
  "bundle": {
    "externalBin": [
      "binaries/sidecar"
    ]
  }
}
```

#### サイドカー起動（main.rs）
```rust
// Tauriアプリ起動時にサイドカーを自動起動
tauri::Builder::default()
    .setup(|app| {
        let sidecar = app.shell().sidecar("sidecar").unwrap();
        sidecar.spawn().unwrap();
        Ok(())
    })
```

#### FastAPI エントリポイント（sidecar/main.py）
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chart, interpret

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])
app.include_router(chart.router)
app.include_router(interpret.router)
```

#### kerykeion呼び出し（offline=False、都市辞書使用）
```python
# sidecar/data/cities.py
CITIES = {
    # 日本
    "札幌":    {"lat": 43.0642, "lng": 141.3469, "tz": "Asia/Tokyo"},
    "仙台":    {"lat": 38.2688, "lng": 140.8721, "tz": "Asia/Tokyo"},
    "東京":    {"lat": 35.6762, "lng": 139.6503, "tz": "Asia/Tokyo"},
    "横浜":    {"lat": 35.4437, "lng": 139.6380, "tz": "Asia/Tokyo"},
    "名古屋":  {"lat": 35.1815, "lng": 136.9066, "tz": "Asia/Tokyo"},
    "大阪":    {"lat": 34.6937, "lng": 135.5023, "tz": "Asia/Tokyo"},
    "京都":    {"lat": 35.0116, "lng": 135.7681, "tz": "Asia/Tokyo"},
    "神戸":    {"lat": 34.6901, "lng": 135.1956, "tz": "Asia/Tokyo"},
    "広島":    {"lat": 34.3853, "lng": 132.4553, "tz": "Asia/Tokyo"},
    "福岡":    {"lat": 33.5904, "lng": 130.4017, "tz": "Asia/Tokyo"},
    "那覇":    {"lat": 26.2124, "lng": 127.6809, "tz": "Asia/Tokyo"},
    "札幌":    {"lat": 43.0642, "lng": 141.3469, "tz": "Asia/Tokyo"},
    # 海外主要都市
    "ニューヨーク": {"lat": 40.7128, "lng": -74.0060, "tz": "America/New_York"},
    "ロンドン":     {"lat": 51.5074, "lng": -0.1278,  "tz": "Europe/London"},
    "パリ":         {"lat": 48.8566, "lng": 2.3522,   "tz": "Europe/Paris"},
    "北京":         {"lat": 39.9042, "lng": 116.4074, "tz": "Asia/Shanghai"},
    "ソウル":       {"lat": 37.5665, "lng": 126.9780, "tz": "Asia/Seoul"},
    "シドニー":     {"lat": -33.8688, "lng": 151.2093,"tz": "Australia/Sydney"},
}
```

#### /chart エンドポイント（sidecar/routers/chart.py）
```python
@router.post("/chart")
async def calculate_chart(data: BirthData):
    city_data = CITIES.get(data.city)
    
    if city_data:
        # 都市辞書ヒット → オフライン計算
        subject = AstrologicalSubjectFactory.from_birth_data(
            data.name,
            data.year, data.month, data.day,
            data.hour, data.minute,
            lat=city_data["lat"],
            lng=city_data["lng"],
            tz_str=city_data["tz"],
            online=False,
        )
    else:
        # フォールバック → 緯度経度直接入力
        subject = AstrologicalSubjectFactory.from_birth_data(
            data.name,
            data.year, data.month, data.day,
            data.hour, data.minute,
            lat=data.lat,
            lng=data.lng,
            tz_str=data.timezone,
            online=False,
        )
    
    natal = ChartDataFactory.get_natal_chart(subject)
    return natal.model_dump()
```

#### /interpret エンドポイント（SSE対応）
```python
@router.post("/interpret")
async def interpret_chart(data: ChartData):
    xml_context = to_context(data.subject)  # kerykeion XML生成
    
    async def generate():
        async with anthropic.stream(
            model="claude-sonnet-4-6",
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": xml_context}]
        ) as stream:
            async for text in stream.text_stream:
                yield f"data: {text}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
```

---

### 5-2. Claude API プロンプト設計

```python
# sidecar/prompts/interpretation.py

SYSTEM_PROMPT = """
あなたは西洋占星術の解説者です。
モダン西洋占星術（熱帯・プラシダス）に基づき、
占星術の初心者にも理解できるよう、平易な日本語で解釈してください。

## 解釈の方針
- 運命の断言はしない。「〜の傾向があります」「〜を大切にするとよいでしょう」という表現を使う
- 自己理解・自己受容を促す前向きなトーンを保つ
- 専門用語を使う場合は必ず平易な説明を添える

## 出力構成（必ずこの順序で）
1. **全体の概観**（3〜4文）
2. **太陽サイン**：本質・アイデンティティ
3. **月サイン**：感情・内面の欲求
4. **アセンダント**：外から見た印象・人生への向き合い方
5. **目立つアスペクト**：上記以外で特徴的な天体間の関係（2〜3個）
6. **まとめ**（2〜3文）

各項目は200〜300字程度を目安にしてください。
""".strip()
```

---

### 5-3. チャートビジュアライゼーション（D3.js）

描画する要素：
- 外円：12サインの区画（各30°、サイン記号付き）
- 中間：12ハウスの区画（プラシダス計算値に基づく）
- 天体アイコン：各天体のグリフと度数表示
- アスペクトライン：天体間の角度関係（色分け）
  - 合（0°）：紫
  - トライン（120°）：青
  - セクスタイル（60°）：緑
  - スクエア（90°）：赤
  - オポジション（180°）：橙

---

## 6. APIスキーマ定義

### POST /chart

**Request**
```typescript
interface BirthData {
  name: string;
  year: number;
  month: number;       // 1-12
  day: number;
  hour: number;        // 0-23
  minute: number;
  city: string;        // 都市辞書キー（例: "東京"）
  // 辞書にない場合のフォールバック
  lat?: number;        // 緯度
  lng?: number;        // 経度
  timezone?: string;   // e.g. "Asia/Tokyo"
}
```

**Response**
```typescript
interface ChartData {
  subject: {
    name: string;
    sun: PlanetData;
    moon: PlanetData;
    mercury: PlanetData;
    venus: PlanetData;
    mars: PlanetData;
    jupiter: PlanetData;
    saturn: PlanetData;
    uranus: PlanetData;
    neptune: PlanetData;
    pluto: PlanetData;
    asc: PlanetData;
    mc: PlanetData;
  };
  houses: HouseData[];
  aspects: AspectData[];
}

interface PlanetData {
  name: string;
  sign: string;
  sign_num: number;
  position: number;       // 黄道上の絶対度数 0-360
  abs_pos: number;
  sign_position: number;  // サイン内度数 0-30
  house: string;
  retrograde: boolean;
  element: string;
  quality: string;
}

interface AspectData {
  p1_name: string;
  p2_name: string;
  aspect: string;
  orbit: number;
}
```

---

## 7. 開発フェーズ

### Phase 1 — MVP（目安: 2〜3週間）

**目標**: 生年月日を入力するとチャートが表示され、AI解釈が読める状態

- [ ] Tauriプロジェクトのスキャフォールド
- [ ] Pythonサイドカーの起動設定
- [ ] kerykeionで天体計算（/chart実装）
- [ ] シンプルなチャート円盤描画（D3.js）
- [ ] Claude APIで太陽・月・ASCの3点解釈
- [ ] ストリーミングテキスト表示

### Phase 2 — 拡充（目安: +2〜3週間）

- [ ] 全天体・ハウスの詳細表示
- [ ] アスペクトライン描画
- [ ] 解釈テキストの章立て表示
- [ ] 複数チャートの保存・切り替え
- [ ] タイムゾーン・都市名のオートコンプリート

### Phase 3 — 差別化（目安: +1ヶ月）

- [ ] トランジットチャート（今日の天体との重ね合わせ）
- [ ] ハウス解釈の追加
- [ ] チャートのPDF/SVGエクスポート
- [ ] 流派切り替え（ホールサイン等）
- [ ] シナストリー（相性チャート）

---

## 8. サイドカービルドフロー（PyInstaller）

```bash
# 【開発時】通常のPython環境で起動
cd sidecar
uvicorn main:app --port 8765 --reload

# 【リリース時】PyInstallerでシングルバイナリ化
cd sidecar
pip install pyinstaller
pyinstaller main.py \
  --onefile \
  --name sidecar \
  --add-data "data:data" \      # 都市辞書を同梱
  --add-data "prompts:prompts"  # プロンプトテンプレートを同梱

# Tauriが期待する命名規則に合わせてリネーム後、配置
# macOS:   sidecar-x86_64-apple-darwin
# Windows: sidecar-x86_64-pc-windows-msvc.exe
cp dist/sidecar ../src-tauri/binaries/sidecar-[TARGET_TRIPLE]
```

### tauri.conf.json（抜粋）
```json
{
  "app": {
    "windows": [{
      "title": "Liber Caeli"
    }]
  },
  "bundle": {
    "externalBin": [
      "binaries/sidecar"
    ]
  }
}
```

### main.rs（サイドカー自動起動）
```rust
tauri::Builder::default()
    .setup(|app| {
        let sidecar = app.shell().sidecar("sidecar").unwrap();
        let (_rx, _child) = sidecar
            .args(["--port", "8765"])
            .spawn()
            .expect("Failed to start sidecar");
        Ok(())
    })
```

---

## 9. 環境変数・シークレット管理

```bash
# .env（gitignore対象）
ANTHROPIC_API_KEY=sk-ant-...
```

Tauriからサイドカーへ環境変数を渡す方法：
```rust
// main.rs にて起動時に引き渡し
// または OS の環境変数として設定しておく（個人利用のため簡易対応で可）
```

---

## 10. CLAUDE.md（Claude Code 作業指示）

```markdown
# caelum — Liber Caeli

西洋占星術ネイタルチャートアプリ（個人利用）。
Tauri v2 + React + TypeScript + Python サイドカー構成。

## 技術スタック
- フロントエンド: Tauri v2, React 18, TypeScript, Tailwind CSS, D3.js
- バックエンド: Python 3.10+, FastAPI, kerykeion（online=False）, uvicorn
- AI: Anthropic Claude API (claude-sonnet-4-6)
- 位置情報: 内蔵都市辞書（sidecar/data/cities.py）、GeoNames不使用

## ディレクトリ構造
- src/        React フロントエンド
- sidecar/    Python サイドカー（FastAPI）
- src-tauri/  Tauri設定・Rustコード

## 開発コマンド
\`\`\`bash
# フロントエンド + サイドカー同時起動
npm run tauri dev

# サイドカーのみ起動（デバッグ用）
cd sidecar && uvicorn main:app --port 8765 --reload

# Pythonパッケージインストール
pip install -r sidecar/requirements.txt
\`\`\`

## コーディング規約
- TypeScript: strict mode、型定義は types/ に集約
- Python: PEP8準拠、型ヒント必須
- コミット: Conventional Commits（feat/fix/docs/refactor）

## 注意事項
- ANTHROPIC_API_KEY は .env に記載（コミット禁止）
- サイドカーのポートは 8765 固定
- kerykeionの計算はすべて sidecar/services/kerykeion_service.py を経由する
- online=False 必須（GeoNames不使用）
```

---

## 11. GitHub リポジトリ設定

### ブランチ戦略
```
main          本番（安定版）
develop       開発統合ブランチ
feature/xxx   機能開発
fix/xxx       バグ修正
```

### .gitignore 追加項目
```
.env
sidecar/__pycache__/
sidecar/*.pyc
sidecar/.venv/
src-tauri/target/
src-tauri/binaries/
dist/
```

### README.md 構成
```
# Liber Caeli ✨

個人利用の西洋占星術ネイタルチャートアプリ。
ラテン語で「天空の書」。

## 機能
- ネイタルチャートの計算・描画（モダン西洋占星術・熱帯・プラシダス）
- Claude AIによる解釈テキスト生成（日本語）
- 完全オフライン動作（Claude API除く）

## セットアップ
...（環境構築手順）

## 技術スタック
- Tauri v2 + React + TypeScript
- Python / FastAPI / kerykeion（Swiss Ephemeris）
- Anthropic Claude API
```

---

## 12. 依存ライブラリ一覧

### sidecar/requirements.txt
```
kerykeion>=4.0.0
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
anthropic>=0.20.0
pydantic>=2.0.0
python-dotenv>=1.0.0
```

### package.json（主要）
```json
{
  "dependencies": {
    "d3": "^7.9.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 13. 既知リスク・注意点

| リスク | 内容 | 対策 |
|---|---|---|
| kerykeionのWindows対応 | Swiss Ephemerisのバイナリ依存 | 事前に動作確認必須 |
| サイドカー起動タイミング | React描画前にサイドカーが未起動の可能性 | ヘルスチェックポーリング実装 |
| Claude APIのレート制限 | 連続解釈生成時 | リクエストキュー or debounce |
| PyInstallerのバイナリサイズ | Python環境全体が同梱されるため大きくなる | --excludeで不要パッケージを除外 |
| Pythonバイナリの命名規則 | Tauriのtarget tripleと一致が必要 | CI/CDでプラットフォーム別にビルド |
