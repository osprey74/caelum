# Release Notes — v1.0.3

## ✨ New Features

### Profile Management (Phase 2-1)
- Save and recall birth data as profiles
- Add and delete profiles from the sidebar
- Profile selection auto-fills the birth data form

### City Search & Geocoding (Phase 2-3)
- Search any city worldwide via OpenStreetMap Nominatim API
- Automatic timezone detection from coordinates
- Built-in city dictionary retained as fallback
- Custom latitude/longitude input for any location

### Chart Export (Phase 2-2)
- SVG export (vector image for printing)
- PNG export (raster image for social media)
- PDF report export (chart image + AI interpretation text)
- Japanese font embedding (Noto Sans JP) for correct PDF rendering

### Transit Chart (Phase 3-1)
- Bi-wheel display: natal chart (inner) + transit planets (outer, amber)
- Date picker for any transit date
- AI-powered transit interpretation

### Synastry Chart (Phase 3-2)
- Bi-wheel display for two-person compatibility analysis
- Profile-based partner selection
- AI-powered synastry interpretation

### Additional Celestial Bodies (Phase 3-3)
- Chiron, Lilith (Mean), and Part of Fortune now displayed
- Shown on chart wheel and planet table

### House System Selection (Phase 3-4)
- Placidus (default), Whole Sign, and Equal House systems
- Configurable in Settings dialog
- MC displayed independently for Whole Sign and Equal House

### Glossary Popup (Phase 4-1)
- Click any planet, sign, house, or aspect on the chart for explanations
- Planet table signs and houses are also clickable
- 46 glossary entries covering all chart elements

### Monthly Transit Calendar (Phase 4-2)
- Calendar grid showing celestial events for an entire month
- Event types: new/full moon, sign ingresses, retrograde/direct stations, natal aspects
- AI-generated monthly focus interpretation

### Multilingual Support (Phase 4-3)
- Japanese / English UI switching (configurable in Settings)
- AI interpretation language follows UI language
- City search results displayed in selected language
- Glossary and calendar events in both languages

## 🎨 Improvements

- Hover tooltips on chart planets and aspect lines
- Accordion-style collapsible sections for interpretation text
- Export completion toast notifications
- API-free prompt generation mode (copy prompt to use with any AI)
- Contextual export filenames based on chart type
- Comprehensive README with usage guide and house system explanations

## 📝 Documentation

- Design document (DESIGN_caelum.md) fully rewritten to reflect current implementation
- Bilingual README (English + Japanese)

---

# リリースノート — v1.0.3

## ✨ 新機能

### プロファイル管理 (Phase 2-1)
- 出生データをプロファイルとして保存・呼び出し
- サイドバーからプロファイルの追加・削除
- プロファイル選択でフォーム自動入力

### 都市検索・ジオコーディング (Phase 2-3)
- OpenStreetMap Nominatim APIによる世界中の都市検索
- 緯度経度からタイムゾーンを自動推定
- 内蔵都市辞書をフォールバックとして維持
- 任意の緯度経度の手動入力にも対応

### チャートエクスポート (Phase 2-2)
- SVGエクスポート（印刷向けベクター画像）
- PNGエクスポート（SNS向けラスター画像）
- PDFレポートエクスポート（チャート画像 + AI解釈テキスト）
- 日本語フォント埋め込み（Noto Sans JP）でPDFの文字化けを解消

### トランジットチャート (Phase 3-1)
- 二重円表示：ネイタル（内円）+ トランジット天体（外円、アンバー色）
- 任意の日付を指定可能な日付ピッカー
- AI によるトランジット解釈

### シナストリーチャート (Phase 3-2)
- 2人の相性分析のための二重円表示
- プロファイルから2人目を選択
- AI によるシナストリー解釈

### 追加天体 (Phase 3-3)
- キロン、リリス（平均）、パート・オブ・フォーチュンの表示を追加
- チャートホイールと天体一覧表の両方に表示

### ハウスシステム選択 (Phase 3-4)
- プラシダス（既定）、ホールサイン、等分ハウスの3種類
- 設定ダイアログから切替可能
- ホールサイン・等分ハウスではMCを独立したポイントとして表示

### 用語集ポップアップ (Phase 4-1)
- チャート上の天体・サイン・ハウス・アスペクトをクリックで解説表示
- 天体一覧表のサイン・ハウスもクリック可能
- 全46エントリの用語解説

### 月間トランジットカレンダー (Phase 4-2)
- 1ヶ月の天体イベントをカレンダーグリッドで表示
- イベント種別：新月/満月、サインイングレス、逆行/順行、ネイタルアスペクト
- AI による月間フォーカス解釈生成

### 多言語対応 (Phase 4-3)
- 日本語 / 英語 UI 切替（設定で変更可能）
- AI 解釈言語は UI 言語に連動
- 都市検索結果も選択言語で表示
- 用語集・カレンダーイベントも両言語対応

## 🎨 改善

- チャート天体・アスペクト線のホバーツールチップ
- 解釈テキストのアコーディオン折りたたみ
- エクスポート完了トースト通知
- APIキー不要のプロンプト生成モード（任意のAIにコピー＆ペースト）
- チャート種別に応じたエクスポートファイル名
- 使い方ガイド・ハウスシステム解説を含む包括的なREADME

## 📝 ドキュメント

- 設計書（DESIGN_caelum.md）を現在の実装に基づき全面改訂
- 英語・日本語の2言語README
