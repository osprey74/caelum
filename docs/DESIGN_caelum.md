# Liber Caeli 構成設計書

> 作成日: 2026-03-09
> 最終更新: 2026-03-11
> ステータス: Phase 4 全完了（実装済み）
> リポジトリ名: `caelum`
> アプリ表示名: **Liber Caeli**（リベル・カエリ）
> 意味: ラテン語「天空の書」
> バージョン: 1.0.2

---

## 1. プロジェクト概要

### コンセプト
西洋占星術のネイタルチャートを計算・描画し、Claude APIによるAI解釈テキストを生成する個人利用デスクトップアプリ。トランジット（二重円）、シナストリー（相性）、月間カレンダー、用語集、多言語対応（日本語/英語）を備える。

### 採用流派・レイヤー設定

| レイヤー | 選択 | 備考 |
|---|---|---|
| L1 黄道 | 熱帯（Tropical） | 変更禁止 |
| L1 ハウス | ユーザー選択可能 | プラシダス（既定）/ ホールサイン / 等分ハウス |
| L2 天体 | 13天体 + ASC/MC | 10惑星 + キロン・リリス・フォルテュナ |
| L3 アスペクト | 主要5 + セミスクエア・クインカンクス | モダン準拠 |
| L4 解釈軸 | モダン西洋（性格・傾向軸） | 初心者向け自己理解フレーム |

---

## 2. 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|---|---|---|
| Tauri | v2 | デスクトップシェル |
| React | 19 | UIフレームワーク |
| TypeScript | 5.8 | 型安全 |
| Tailwind CSS | 3.4 | スタイリング |
| D3.js | 7.9 | チャートSVG描画 |
| i18next + react-i18next | 25 / 16 | 国際化（日本語/英語） |
| react-markdown | 10 | AI解釈テキストのMarkdownレンダリング |
| jsPDF | 4.2 | PDFレポート生成 |

### バックエンド（Python サイドカー）
| 技術 | バージョン | 用途 |
|---|---|---|
| Python | 3.10+ | サイドカー実行環境 |
| FastAPI | 0.135 | HTTPサーバー |
| uvicorn | 0.41 | ASGIサーバー |
| kerykeion | 5.11 | 天体計算エンジン（Swiss Ephemeris内包）|
| anthropic SDK | 0.84 | Claude API呼び出し |
| timezonefinder | 8.2 | 緯度経度からタイムゾーン推定 |
| PyInstaller | 6.19 | シングルバイナリ化（リリース時） |

### 位置情報
| 方式 | 内容 |
|---|---|
| **`online=False`** | GeoNames API不使用・完全オフライン計算 |
| **都市辞書内蔵** | 日本全国65都市＋海外17都市を地方別グループで収録（多言語ラベル対応） |
| **Nominatim API検索** | 任意の地名を OpenStreetMap Nominatim で検索・緯度経度取得 |
| **手動入力** | 辞書にない都市は緯度・経度・タイムゾーンを直接入力 |

### AI
| 技術 | 用途 |
|---|---|
| Claude API（claude-sonnet-4-6） | 解釈テキスト生成（ネイタル・トランジット・シナストリー・月間フォーカス） |
| SSE（Server-Sent Events） | ストリーミングレスポンス |
| max_tokens: 8192 | 出力上限 |

---

## 3. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────┐
│  Tauri Shell（Rust）                                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React + TypeScript + i18next（WebView）                  │  │
│  │                                                           │  │
│  │  ┌──────────────┐ ┌────────────────┐ ┌────────────────┐  │  │
│  │  │ ChartWheel   │ │ PlanetTable    │ │ GlossaryModal  │  │  │
│  │  │ D3.js SVG    │ │ 天体配置表     │ │ 用語集ポップ   │  │  │
│  │  │ 二重円対応   │ │                │ │ アップ         │  │  │
│  │  └──────┬───────┘ └───────┬────────┘ └────────────────┘  │  │
│  │  ┌──────┴─────────────────┴────────────────────────────┐  │  │
│  │  │ Interpretation / Transit / Synastry / Calendar Panel │  │  │
│  │  │ AI解釈テキスト表示（Markdownレンダリング・折りたたみ） │  │  │
│  │  └──────┬──────────────────────────────────────────────┘  │  │
│  │  ┌──────▼──────────────────────────────────────────────┐  │  │
│  │  │  API Client（src/lib/api.ts）                       │  │  │
│  │  │  localhost:8765 へ fetch                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Python Sidecar（FastAPI + uvicorn :8765）                │  │
│  │                                                           │  │
│  │  POST /chart              ネイタルチャート計算             │  │
│  │  POST /transit            トランジット計算                │  │
│  │  POST /synastry           シナストリー計算                │  │
│  │  POST /transit-calendar   月間カレンダー計算              │  │
│  │  GET  /cities             都市辞書（多言語対応）          │  │
│  │  GET  /geocode            Nominatim 都市名検索            │  │
│  │  POST /interpret          ネイタル AI解釈（SSE）          │  │
│  │  POST /interpret-transit  トランジット AI解釈（SSE）      │  │
│  │  POST /interpret-synastry シナストリー AI解釈（SSE）      │  │
│  │  POST /interpret-monthly  月間フォーカス AI解釈（SSE）    │  │
│  │  POST /generate-prompt*   プロンプト生成（API不要）×4     │  │
│  │  /profiles/*              プロファイルCRUD                │  │
│  │  /settings/*              APIキー・ハウスシステム管理     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### データフロー

#### ネイタルチャート生成
```
ユーザー入力（名前・生年月日時・出生地・ハウスシステム・言語）
    │
    ▼
POST /chart（lang パラメータ付き）
    │  kerykeion で計算（online=False）
    ▼
チャートデータ JSON
    │  D3.js で描画（ChartWheel.tsx）
    │  PlanetTable で一覧表示
    ▼
POST /interpret または /generate-prompt（lang パラメータ付き）
    │  kerykeion の to_context() で XML 生成
    │  get_system_prompt(lang) で言語別プロンプト選択
    │  Claude API（claude-sonnet-4-6）へ投げる
    │  Server-Sent Events でストリーミング返却
    ▼
解釈テキスト（ストリーミング表示、Markdown レンダリング、セクション折りたたみ）
```

#### トランジット / シナストリー / 月間カレンダー
```
ネイタルデータ + トランジット日付 / 2人目プロファイル / 対象月
    │
    ▼
POST /transit | /synastry | /transit-calendar
    │  kerykeion で二重計算
    ▼
二重チャートデータ | カレンダーイベントデータ
    │  ChartWheel 二重円描画 | CalendarPanel グリッド表示
    ▼
POST /interpret-transit | /interpret-synastry | /interpret-monthly
    │  言語別プロンプト + コンテキスト → Claude API（SSE）
    ▼
AI 解釈テキスト
```

---

## 4. ディレクトリ構造

```
caelum/
├── src/                              # React フロントエンド
│   ├── components/
│   │   ├── ChartWheel.tsx            # D3.js チャート円盤（ネイタル・二重円対応）
│   │   ├── PlanetTable.tsx           # 天体配置一覧表（i18n 対応）
│   │   ├── InterpretationPanel.tsx   # AI 解釈パネル（Markdown・折りたたみ）
│   │   ├── TransitPanel.tsx          # トランジット解釈パネル
│   │   ├── SynastryPanel.tsx         # シナストリー解釈パネル
│   │   ├── CalendarPanel.tsx         # 月間カレンダーパネル
│   │   ├── BirthDataForm.tsx         # 入力フォーム（辞書選択・検索・手動入力）
│   │   ├── ProfileList.tsx           # プロファイル管理
│   │   ├── ExportButtons.tsx         # SVG/PNG/PDF エクスポート
│   │   ├── ApiKeyDialog.tsx          # 設定ダイアログ（APIキー・ハウスシステム・言語）
│   │   └── GlossaryModal.tsx         # 用語集モーダル（多言語対応）
│   ├── hooks/
│   │   └── useChart.ts               # サイドカー起動待機フック
│   ├── types/
│   │   └── astrology.ts              # 型定義・定数（天体・サイン・ハウス・アスペクト）
│   ├── lib/
│   │   ├── api.ts                    # サイドカー API クライアント（全エンドポイント）
│   │   └── export.ts                 # SVG/PNG/PDF エクスポートユーティリティ
│   ├── data/
│   │   └── glossary.ts               # 用語辞書データ（JA/EN 46 エントリ）
│   ├── i18n/
│   │   ├── index.ts                  # i18next 初期化（localStorage 永続化）
│   │   └── locales/
│   │       ├── ja.json               # 日本語翻訳
│   │       └── en.json               # 英語翻訳
│   ├── styles.css                    # グローバルCSS（WebView2対応含む）
│   ├── App.tsx                       # メインレイアウト（3カラム + タブ切替）
│   └── main.tsx                      # エントリポイント（i18n import）
│
├── sidecar/                          # Python サイドカー
│   ├── main.py                       # FastAPI エントリポイント（5ルーター登録）
│   ├── routers/
│   │   ├── chart.py                  # /chart, /transit, /synastry, /transit-calendar, /cities
│   │   ├── interpret.py              # /interpret*, /generate-prompt*（4種 × 2 = 8エンドポイント）
│   │   ├── geocode.py                # /geocode（Nominatim + ローカル辞書検索）
│   │   ├── profiles.py               # /profiles CRUD（5エンドポイント）
│   │   └── settings.py               # /settings/* APIキー・ハウスシステム（5エンドポイント）
│   ├── services/
│   │   ├── calendar.py               # 月間トランジット計算（イベント検出ロジック）
│   │   ├── profiles.py               # プロファイル永続化（JSON）
│   │   └── settings.py               # 設定永続化（APIキー・ハウスシステム）
│   ├── models/
│   │   └── schemas.py                # Pydantic スキーマ（全て lang フィールド付き）
│   ├── prompts/
│   │   ├── interpretation.py         # ネイタル解釈プロンプト（JA/EN）
│   │   ├── transit.py                # トランジット解釈プロンプト（JA/EN）
│   │   ├── synastry.py               # シナストリー解釈プロンプト（JA/EN）
│   │   └── monthly.py                # 月間フォーカスプロンプト（JA/EN）
│   ├── data/
│   │   └── cities.py                 # 都市辞書（65+17都市、地方グループ、多言語ラベル）
│   └── requirements.txt
│
├── src-tauri/                        # Tauri 設定（Rust）
│   ├── src/
│   │   └── lib.rs                    # サイドカー自動起動（失敗時手動起動案内）
│   ├── binaries/                     # PyInstaller ビルド済みバイナリ配置先（gitignore）
│   ├── Cargo.toml
│   └── tauri.conf.json               # アプリ設定（1280×1200、externalBin）
│
├── public/
│   └── fonts/
│       └── NotoSansJP-Regular.ttf    # PDF 日本語フォント
│
├── docs/
│   └── DESIGN_caelum.md              # 本ドキュメント
│
├── .github/
│   └── workflows/
│       └── release.yml               # タグプッシュ時自動ビルド（Win x86_64, macOS ARM/Intel）
│
├── CLAUDE.md                         # Claude Code 作業指示
├── HANDOFF_caelum.md                 # 引き継ぎドキュメント
├── README.md                         # 英語 README
├── README.ja.md                      # 日本語 README
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## 5. API エンドポイント一覧

### チャート計算（chart.py）

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/chart` | ネイタルチャート計算 |
| POST | `/transit` | トランジット二重チャート計算 |
| POST | `/synastry` | シナストリー二重チャート計算 |
| POST | `/transit-calendar` | 月間トランジットカレンダー計算 |
| GET | `/cities` | 都市辞書一覧（`?lang=en` で英語ラベル） |

### AI 解釈（interpret.py）

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/interpret` | ネイタル AI 解釈（SSE ストリーミング） |
| POST | `/generate-prompt` | ネイタル プロンプト生成（API 不要） |
| POST | `/interpret-transit` | トランジット AI 解釈（SSE） |
| POST | `/generate-prompt-transit` | トランジット プロンプト生成 |
| POST | `/interpret-synastry` | シナストリー AI 解釈（SSE） |
| POST | `/generate-prompt-synastry` | シナストリー プロンプト生成 |
| POST | `/interpret-monthly` | 月間フォーカス AI 解釈（SSE） |
| POST | `/generate-prompt-monthly` | 月間フォーカス プロンプト生成 |

### ジオコーディング（geocode.py）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/geocode` | 都市名検索（`?q=...&lang=en`、ローカル辞書 + Nominatim API） |

### プロファイル（profiles.py）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/profiles` | プロファイル一覧 |
| GET | `/profiles/{id}` | プロファイル取得 |
| POST | `/profiles` | プロファイル作成 |
| PUT | `/profiles/{id}` | プロファイル更新 |
| DELETE | `/profiles/{id}` | プロファイル削除 |

### 設定（settings.py）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/settings/api-key-status` | APIキー設定状態確認 |
| POST | `/settings/api-key` | APIキー保存 |
| DELETE | `/settings/api-key` | APIキー削除 |
| GET | `/settings/house-system` | ハウスシステム取得 |
| POST | `/settings/house-system` | ハウスシステム変更 |

### ヘルスチェック

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/health` | サイドカー起動確認 |

---

## 6. API スキーマ定義

### 共通フィールド

全リクエストスキーマに以下のフィールドが含まれる:
- `house_system: str = "P"` — ハウスシステム（P: プラシダス / W: ホールサイン / A: 等分ハウス）
- `lang: str = "ja"` — 言語（ja / en）

### POST /chart — BirthData

```typescript
interface BirthData {
  name: string;
  year: number;
  month: number;       // 1-12
  day: number;
  hour: number;        // 0-23
  minute: number;
  city: string;        // 都市辞書キー（例: "東京"）
  lat?: number;        // 緯度（辞書にない場合）
  lng?: number;        // 経度
  timezone?: string;   // e.g. "Asia/Tokyo"
  house_system?: string; // "P" | "W" | "A"
  lang?: string;       // "ja" | "en"
}
```

### ChartResponse

```typescript
interface ChartResponse {
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
    chiron: PlanetData;
    mean_lilith: PlanetData;
    pars_fortunae: PlanetData | null;
    ascendant: PlanetData;
    medium_coeli: PlanetData;
    first_house: HouseData;
    // ... 12ハウス
  };
  aspects: AspectData[];
}

interface PlanetData {
  name: string;
  sign: string;        // "Ari", "Tau", ... "Pis"
  sign_num: number;
  position: number;    // サイン内度数 0-30
  abs_pos: number;     // 黄道上の絶対度数 0-360
  house: string | null;
  retrograde: boolean | null;
}

interface AspectData {
  p1_name: string;
  p2_name: string;
  p1_abs_pos: number;
  p2_abs_pos: number;
  aspect: string;
  orbit: number;
  aspect_degrees: number;
}
```

### POST /transit — TransitRequest

```typescript
interface TransitRequest extends BirthData {
  transit_year: number;
  transit_month: number;
  transit_day: number;
  transit_hour: number;
  transit_minute: number;
}
```

### POST /synastry — SynastryRequest

```typescript
interface SynastryRequest {
  name1: string; year1: number; month1: number; day1: number;
  hour1: number; minute1: number; city1: string;
  lat1?: number; lng1?: number; timezone1?: string;
  name2: string; year2: number; month2: number; day2: number;
  hour2: number; minute2: number; city2: string;
  lat2?: number; lng2?: number; timezone2?: string;
  house_system?: string;
  lang?: string;
}
```

### POST /transit-calendar — MonthlyCalendarRequest / Response

```typescript
interface MonthlyCalendarRequest extends BirthData {
  calendar_year: number;
  calendar_month: number;
}

interface MonthlyCalendarResponse {
  year: number;
  month: number;
  num_days: number;
  first_weekday: number;  // 0=月 ... 6=日
  days: CalendarDay[];
}

interface CalendarDay {
  day: number;
  weekday: number;
  events: CalendarEvent[];
}

interface CalendarEvent {
  type: "new_moon" | "full_moon" | "ingress" | "retrograde" | "direct" | "natal_aspect";
  planet: string;
  description: string;  // 言語に応じた説明文
  detail: string;
}
```

### DualChartResponse（トランジット / シナストリー共通）

```typescript
interface DualChartResponse {
  natal: ChartResponse;
  transit: ChartResponse;  // トランジットまたは2人目のチャート
}
```

---

## 7. プロンプト設計

全プロンプトは `sidecar/prompts/` に格納され、`get_*_prompt(lang)` 関数で言語別に取得される。

### ネイタル解釈（interpretation.py）

**出力構成:**
1. 全体の概観（3〜4文）
2. 太陽サイン：本質・アイデンティティ
3. 月サイン：感情・内面の欲求
4. アセンダント：外から見た印象・人生への向き合い方
5. 目立つアスペクト：特徴的な天体間の関係（2〜3個）
6. まとめ（2〜3文）

**制約:** JA: 全体2000字以内 / EN: 全体1500 words以内

### トランジット解釈（transit.py）

**出力構成:**
1. 全体の流れ
2. 注目すべきトランジット
3. 意識したいテーマ
4. まとめとアドバイス

### シナストリー解釈（synastry.py）

**出力構成:**
1. 2人の関係性の概観
2. 太陽と月の関係
3. 金星と火星の関係
4. コミュニケーション
5. 注目アスペクト
6. 2人の可能性

### 月間フォーカス（monthly.py）

**出力構成:**
1. 今月の全体像
2. 注目イベント
3. 時期別アドバイス（上旬・中旬・下旬）
4. 今月のキーワード

---

## 8. 多言語対応（i18n）

### フロントエンド
- **i18next + react-i18next** による UI テキストの外部化
- 翻訳ファイル: `src/i18n/locales/ja.json`, `en.json`
- localStorage キー `liber-caeli-language` で言語設定を永続化
- 全12コンポーネントで `useTranslation()` フック使用
- 設定画面のドロップダウンで即時切替

### サイドカー
- 全スキーマに `lang: str = "ja"` フィールド
- `get_*_prompt(lang)` で言語別システムプロンプト選択
- `_LABELS` 辞書（interpret.py）でコンテキストラベル多言語化
- `_labels(lang)` 関数（calendar.py）で天体名・サイン名・アスペクト名の多言語化
- Nominatim API の `accept-language` を言語に応じて切替
- 都市辞書の地方グループラベル・都市名ラベルも多言語対応

### 用語集
- `src/data/glossary.ts` に `nameEn`, `summaryEn`, `descriptionEn` フィールド
- GlossaryModal で `i18n.language` に基づき JA/EN 表示切替

---

## 9. チャートビジュアライゼーション（D3.js）

### ネイタルチャート
- 外円: 12サインの区画（各30°、サイン記号＋色分け）
- 中間: 12ハウスの区画（選択ハウスシステムに基づく）
- 天体アイコン: 各天体のグリフと度数表示（重なり回避ロジック付き）
- アスペクトライン: 天体間の角度関係（色分け）
  - 合（0°）：紫 / トライン（120°）：青 / セクスタイル（60°）：緑
  - スクエア（90°）：赤 / オポジション（180°）：橙
- ホバーツールチップ: 天体名・サイン・度数・ハウス・逆行状態

### 二重円（トランジット / シナストリー）
- 内円: ネイタル天体（白色）
- 外円: トランジット/相手天体（アンバー色）
- アスペクトラインは両方の天体間で描画

### インタラクション
- 天体・サイン・ハウスクリックで用語集モーダル表示
- PlanetTable のサイン・ハウスセルもクリック対応

---

## 10. エクスポート機能

| 形式 | 実装 | 用途 |
|---|---|---|
| SVG | SVGシリアライズ → Blobダウンロード | 印刷・ベクター編集 |
| PNG | SVG → Canvas（2倍解像度）→ PNG | SNS共有 |
| PDF | jsPDF + Noto Sans JP フォント + チャート画像 + AI解釈テキスト | A4レポート |

PDF にはアプリタイトル「Liber Caeli」、レポートタイトル（i18n対応）、チャート画像、解釈テキスト（Markdown除去済み）を含む。

---

## 11. データ永続化

| データ | 保存先 | 形式 |
|---|---|---|
| APIキー | OS アプリデータディレクトリ / `config.json` | JSON |
| ハウスシステム設定 | 同上 | JSON |
| プロファイル | 同上 / `profiles.json` | JSON（UUID, timestamps） |
| 言語設定 | ブラウザ localStorage | `liber-caeli-language` キー |

OS アプリデータディレクトリ:
- Windows: `%APPDATA%/liber-caeli/`
- macOS: `~/Library/Application Support/liber-caeli/`
- Linux: `~/.config/liber-caeli/`

---

## 12. CI/CD

### GitHub Actions（release.yml）
- **トリガー**: `v*.*.*` タグプッシュ
- **ビルドマトリクス**:
  - Windows x86_64（`.exe` インストーラー）
  - macOS aarch64（`.dmg` / `.app`）
  - macOS x86_64（`.dmg` / `.app`）
- **ビルドフロー**:
  1. Python仮想環境構築 + PyInstaller でサイドカーバイナリ化
  2. `sidecar-{target_triple}` にリネームして `src-tauri/binaries/` に配置
  3. `npm run tauri build` で Tauri インストーラー生成
  4. GitHub Release ドラフトとしてアーティファクト添付

### バージョン更新対象
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `Cargo.lock` は `cargo generate-lockfile` で自動更新

---

## 13. 開発フェーズ（全完了）

### Phase 1 — MVP ✅
ネイタルチャート計算・描画・AI解釈の基本動作

### Phase 2 — コア強化 ✅
- 2-1: プロファイル保存・呼び出し
- 2-2: SVG/PNG/PDF エクスポート
- 2-3: Nominatim API ジオコーディング + 都市辞書拡充
- 2-4: UI改善（ホバーツールチップ・折りたたみ・CSS整理）

### Phase 3 — 占星術機能拡充 ✅
- 3-1: トランジットチャート（二重円）
- 3-2: シナストリーチャート（相性）
- 3-3: 追加天体（キロン・リリス・フォルテュナ）
- 3-4: ハウスシステム選択（プラシダス/ホールサイン/等分ハウス）

### Phase 4 — 情報・学習・国際化 ✅
- 4-1: 用語集（グロッサリー）
- 4-2: 月間トランジットカレンダー
- 4-3: 多言語対応（日本語/英語）

---

## 14. 既知リスク・注意点

| リスク | 内容 | 対策 |
|---|---|---|
| kerykeionのAGPL | kerykeionのライセンスはAGPL v3 | 個人利用のみのため問題なし |
| サイドカー起動タイミング | React描画前にサイドカーが未起動の可能性 | `useSidecarReady` でポーリング（500ms間隔、15秒タイムアウト） |
| PyInstaller + kerykeion | Swiss Ephemerisのネイティブバイナリが含まれる | `--add-binary` で明示的に同梱 |
| Tauriバイナリ命名規則 | `sidecar-{target_triple}` の形式が必要 | CI/CDでプラットフォーム別にビルド |
| Claude APIキーの管理 | `.env` をコミットしないこと | `.gitignore` で確実に除外 |
| コード署名なし | OS セキュリティ警告が表示される | README にインストール手順を記載 |
