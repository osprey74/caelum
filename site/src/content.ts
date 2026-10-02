// Text of the introduction site, in Japanese and English. Facts here must match the app (README.ja.md, README.md).

export const VERSION = "1.0.7";
export const REPO = "https://github.com/osprey74/caelum";
const DL = `${REPO}/releases/download/v${VERSION}`;
export const DOWNLOADS = {
  windows: { url: `${DL}/caelum_${VERSION}_x64-setup.exe`, mb: 88 },
  macArm: { url: `${DL}/caelum_${VERSION}_aarch64.dmg`, mb: 82 },
  macIntel: { url: `${DL}/caelum_${VERSION}_x64.dmg`, mb: 83 },
};
export const RELEASE = `${REPO}/releases/tag/v${VERSION}`;
export const ARCANORUM = "https://arcanorum.osprey74.com";
export const PORTFOLIO = "https://portfolio.osprey74.com";
export const KERYKEION = "https://github.com/g-battaglia/kerykeion";
export const ICON_CREDIT = "https://www.flaticon.com/free-icons/orbit";

export type Lang = "ja" | "en";

interface Item {
  title: string;
  body: string;
}

interface Shot {
  src: string;
  alt: string;
  caption: string;
}

export interface Content {
  lang: Lang;
  path: string;
  other: { lang: Lang; path: string; label: string };
  title: string;
  description: string;
  nav: { features: string; screens: string; ai: string; download: string; faq: string };
  hero: { subtitle: string; lead: string; cta: string; meta: string; notes: string };
  intro: { heading: string; body: string[]; sister: string };
  features: { heading: string; items: Item[] };
  screens: { heading: string; note: string; main: Shot; panels: Shot[]; extra: Shot };
  ai: { heading: string; body: string[]; points: Item[]; cost: string };
  care: { heading: string; body: string[] };
  download: {
    heading: string;
    windows: string;
    macArm: string;
    macIntel: string;
    winNote: string;
    macNote: string;
    macCommand: string;
    release: string;
  };
  faq: { heading: string; items: { q: string; a: string }[] };
  footer: {
    series: string;
    arcanorum: string;
    source: string;
    license: string;
    kerykeion: string;
    icon: string;
    disclaimer: string;
  };
}

const ja: Content = {
  lang: "ja",
  path: "/",
  other: { lang: "en", path: "/en/", label: "English" },
  title: "Liber Caeli — 天空の書｜西洋占星術アプリ",
  description:
    "生まれた瞬間の空を、一枚の図に。ネイタルチャート・トランジット・シナストリー・月間カレンダーと、Claude による AI 解釈（任意）に対応した、Windows / macOS 向けの西洋占星術アプリ。無料。",
  nav: { features: "機能", screens: "画面", ai: "AI解釈", download: "ダウンロード", faq: "よくある質問" },
  hero: {
    subtitle: "天空の書",
    lead: "生まれた瞬間の空を、一枚の図に。\n星の配置から、自分を読み解くための一冊を。",
    cta: "ダウンロード",
    meta: `v${VERSION} ・ 無料`,
    notes: "Windows / macOS（Apple Silicon・Intel）",
  },
  intro: {
    heading: "空の地図を、ひらく",
    body: [
      "Liber Caeli（リベル・カエリ）は、ラテン語で「天空の書」。タロット占いアプリ Liber Arcanorum と同じ Caelum シリーズの、西洋占星術アプリです。",
      "ネイタルチャート（出生図）は、生まれた瞬間の太陽・月・惑星の配置を描いた「空の地図」です。天体・サイン・ハウス・アスペクトの関係を図と一覧で示し、用語の意味や AI の読み解きを添えて、チャートを読む手助けをします。",
    ],
    sister: "姉妹アプリ Liber Arcanorum（タロット）の公式サイトへ",
  },
  features: {
    heading: "機能",
    items: [
      { title: "ネイタルチャート", body: "生年月日・出生時刻・出生地から、チャートの円盤と天体の配置表を作成します。10天体にキロン・リリス・フォルテュナを加えた13天体に対応しています。" },
      { title: "3つのハウスシステム", body: "プラシダス（既定）・ホールサイン・等分ハウスから選べます。黄道は熱帯黄道（トロピカル）です。" },
      { title: "トランジット・シナストリー", body: "任意の日の天体をネイタルに重ねる二重円と、2人のチャートを重ねて相性を見る二重円に対応しています。" },
      { title: "月間カレンダー", body: "新月・満月、サインの移動、逆行・順行、ネイタルとのアスペクトなど、1か月の天体のできごとを一覧にします。" },
      { title: "用語集", body: "チャート上の天体・サイン・ハウス・アスペクトを選ぶと、その意味と解説が開きます。" },
      { title: "AI 解釈とエクスポート", body: "Claude による解釈（ネイタル・トランジット・シナストリー・月間）と、SVG / PNG / PDF での書き出しに対応。画面は日本語と英語を切り替えられます。" },
    ],
  },
  screens: {
    heading: "画面",
    note: "",
    main: {
      src: "/images/caelum_001.webp",
      alt: "アプリ全体の画面。左に出生データの入力欄、中央にチャートの円盤と天体の配置表、右に AI 解釈の欄",
      caption: "入力・チャート・解釈を一画面に",
    },
    panels: [
      { src: "/images/caelum_008.webp", alt: "トランジットの解釈の画面", caption: "トランジット" },
      { src: "/images/caelum_009.webp", alt: "シナストリーの解釈の画面", caption: "シナストリー" },
      { src: "/images/caelum_010.webp", alt: "月間カレンダーと月間フォーカスの画面", caption: "月間カレンダー" },
    ],
    extra: { src: "/images/caelum_006.webp", alt: "金星を選んだときの用語集のポップアップ", caption: "用語集（金星を選んだ例）" },
  },
  ai: {
    heading: "AI による解釈",
    body: [
      "Anthropic の Claude が、チャートの計算結果をもとに、性格や傾向、今の空があなたに与える影響などを文章で読み解きます。解釈は生成しながら表示され、PDF に書き出すこともできます。",
      "使うかどうかは自由です。チャートの作成・用語集・カレンダー・エクスポートは、AI を使わなくても利用できます。",
    ],
    points: [
      { title: "APIキーはご自身のもの", body: "Anthropic の Console で発行した APIキーを、設定から登録します。キーは OS の安全な保管場所（macOS はキーチェーン、Windows は資格情報マネージャー）に保存されます。" },
      { title: "送る情報", body: "解釈を生成するときに、チャートの情報（名前や出生データ、天体の配置など）を Anthropic に送ります。チャートの計算そのものは PC の中で行います。" },
      { title: "キーがなくても", body: "「プロンプトを生成」で、指示文とチャートのデータをコピーし、ほかの AI に貼り付けて使えます。" },
    ],
    cost: "API の料金はご自身の負担です。目安は、ネイタル解釈で1回あたり約4〜7円、トランジット・シナストリーで約6〜9円です（Claude Sonnet 4.6 での見積もり、文章の長さで変わります）。",
  },
  care: {
    heading: "ご利用にあたって",
    body: [
      "占星術は、自分を知り、考えるための読み物です。結果は未来を断定するものではありません。健康・お金・法律などの大切な判断は、専門家にご相談ください。",
    ],
  },
  download: {
    heading: "ダウンロード",
    windows: "Windows（64ビット）",
    macArm: "macOS（Apple Silicon）",
    macIntel: "macOS（Intel）",
    winNote:
      "インストーラーには電子署名がないため、初回は「Windows によって PC が保護されました」と表示されることがあります。「詳細情報」を押し、「実行」を選んでください。",
    macNote:
      "ダウンロードした .dmg を開き、アプリを「アプリケーション」に入れます。初回の起動時に「開発元を確認できないため開けません」と表示された場合は、「システム設定」→「プライバシーとセキュリティ」の「このまま開く」から許可してください。起動しても読み込み画面のまま進まない場合は、ターミナルで次のコマンドを実行してから、もう一度起動してください。",
    macCommand: "xattr -cr /Applications/caelum.app",
    release: "リリースノート・ほかの形式（GitHub）",
  },
  faq: {
    heading: "よくある質問",
    items: [
      { q: "無料ですか？", a: "アプリは無料です。AI による解釈を使う場合のみ、Anthropic の API の料金がご自身にかかります。" },
      { q: "インターネットにつながっていなくても使えますか？", a: "チャートの計算は PC の中で行うため、オフラインでも使えます。出生地は内蔵の都市一覧から選ぶか、緯度・経度を直接入力します。「都市名で検索」と AI による解釈には、インターネット接続が必要です。" },
      { q: "出生時刻がわからないときは？", a: "時刻はハウスとアセンダントの計算に使います。わからない場合は正午などで作成できますが、ハウスとアセンダントは参考程度にご覧ください。" },
      { q: "プロファイルはどこに保存されますか？", a: "お使いの PC の中に保存されます。アプリが外部と通信するのは、AI による解釈を生成するときと、「都市名で検索」で地名を調べるとき（OpenStreetMap の Nominatim を使います）だけです。" },
      { q: "英語でも使えますか？", a: "はい。設定で画面の言語を日本語と英語から選べます。AI の解釈も、選んだ言語で書かれます。" },
    ],
  },
  footer: {
    series: "Caelum シリーズ",
    arcanorum: "Liber Arcanorum（タロット）",
    source: "ソースコード（GitHub）",
    license:
      "独自のソースコードは MIT License です。天体計算に kerykeion（AGPL v3）を同梱しているため、配布物全体は AGPL v3 の条件に従います。",
    kerykeion: "天体計算：kerykeion（Swiss Ephemeris 内包）",
    icon: "Orbit icons created by Eucalyp - Flaticon",
    disclaimer: "占星術は娯楽と内省を目的としたものです。",
  },
};

const en: Content = {
  lang: "en",
  path: "/en/",
  other: { lang: "ja", path: "/", label: "日本語" },
  title: "Liber Caeli — Book of the Heavens | Astrology app",
  description:
    "The sky at the moment you were born, in one chart. A Western astrology app for Windows and macOS with natal charts, transits, synastry, a monthly calendar and optional AI interpretations by Claude. Free.",
  nav: { features: "Features", screens: "Screens", ai: "AI reading", download: "Download", faq: "FAQ" },
  hero: {
    subtitle: "Book of the Heavens",
    lead: "The sky at the moment you were born, in one chart —\na book for reading yourself in the stars.",
    cta: "Download",
    meta: `v${VERSION} · Free`,
    notes: "Windows / macOS (Apple Silicon, Intel)",
  },
  intro: {
    heading: "Open the map of the sky",
    body: [
      "Liber Caeli is Latin for “Book of the Heavens”. It is a Western astrology app of the Caelum series, sister to the tarot app Liber Arcanorum.",
      "A natal chart is a map of the Sun, Moon and planets at the moment of birth. The app draws the planets, signs, houses and aspects as a chart and a table, and helps you read them with a glossary and, if you like, an AI interpretation.",
    ],
    sister: "Visit the sister app Liber Arcanorum (tarot)",
  },
  features: {
    heading: "Features",
    items: [
      { title: "Natal chart", body: "From the date, time and place of birth, the app draws the chart wheel and a table of positions: ten planets plus Chiron, Lilith and the Part of Fortune." },
      { title: "Three house systems", body: "Placidus (default), Whole Sign and Equal House, on the tropical zodiac." },
      { title: "Transits and synastry", body: "Bi-wheels for the planets of any day over your natal chart, and for two charts together to look at a relationship." },
      { title: "Monthly calendar", body: "New and full moons, sign ingresses, retrograde stations and aspects to your natal chart, day by day." },
      { title: "Glossary", body: "Select a planet, sign, house or aspect in the chart to read what it means." },
      { title: "AI reading and export", body: "Interpretations by Claude for natal, transit, synastry and monthly charts, and export to SVG, PNG or PDF. The interface is in English or Japanese." },
    ],
  },
  screens: {
    heading: "Screens",
    note: "The screenshots show the Japanese interface; the app can also be switched to English.",
    main: {
      src: "/images/caelum_001.webp",
      alt: "The whole app: birth data on the left, the chart wheel and the table of positions in the middle, the AI interpretation on the right",
      caption: "Input, chart and reading on one screen",
    },
    panels: [
      { src: "/images/caelum_008.webp", alt: "Transit interpretation panel", caption: "Transits" },
      { src: "/images/caelum_009.webp", alt: "Synastry interpretation panel", caption: "Synastry" },
      { src: "/images/caelum_010.webp", alt: "Monthly calendar and monthly focus", caption: "Monthly calendar" },
    ],
    extra: { src: "/images/caelum_006.webp", alt: "Glossary pop-up for Venus", caption: "Glossary (Venus)" },
  },
  ai: {
    heading: "AI reading",
    body: [
      "Anthropic’s Claude reads the computed chart and writes about character and tendencies, or how today’s sky meets your chart. The text streams in as it is written and can be exported to PDF.",
      "It is entirely optional: charts, the glossary, the calendar and export all work without AI.",
    ],
    points: [
      { title: "Your own API key", body: "Register a key issued in the Anthropic Console in the settings. It is kept in the OS credential store (Keychain on macOS, Credential Manager on Windows)." },
      { title: "What is sent", body: "When you generate an interpretation, the chart data (including the name and birth data, and the planetary positions) goes to Anthropic. The chart itself is computed on your computer." },
      { title: "No key? Generate the prompt", body: "“Generate prompt” gives you the instructions and the chart data to paste into another AI." },
    ],
    cost: "API usage is billed to you. As a guide, a natal interpretation costs about 4–7 yen and a transit or synastry interpretation about 6–9 yen (estimated with Claude Sonnet 4.6; it depends on the length of the text).",
  },
  care: {
    heading: "Please note",
    body: [
      "Astrology is for self-understanding and reflection; it does not predict the future. For decisions about health, money or the law, please consult a professional.",
    ],
  },
  download: {
    heading: "Download",
    windows: "Windows (64-bit)",
    macArm: "macOS (Apple Silicon)",
    macIntel: "macOS (Intel)",
    winNote:
      "The installer is not code-signed, so Windows may say “Windows protected your PC” the first time. Choose “More info” and then “Run anyway”.",
    macNote:
      "Open the .dmg and move the app to Applications. If macOS says the app cannot be opened because the developer cannot be verified, allow it with “Open Anyway” in System Settings › Privacy & Security. If the app stays on the loading screen, run this command in Terminal and start it again:",
    macCommand: "xattr -cr /Applications/caelum.app",
    release: "Release notes and other formats (GitHub)",
  },
  faq: {
    heading: "FAQ",
    items: [
      { q: "Is it free?", a: "The app is free. Only the AI reading uses Anthropic’s API, which is billed to you." },
      { q: "Does it work offline?", a: "Yes. Charts are computed on your computer; choose the birthplace from the built-in city list or enter the latitude and longitude. Searching for a place by name and the AI reading need a connection." },
      { q: "What if I don’t know the birth time?", a: "The time is used for the houses and the Ascendant. You can use noon, for example, but take the houses and the Ascendant only as a rough guide." },
      { q: "Where are my profiles kept?", a: "On your computer. The app goes online only to generate an AI interpretation and to search for a place by name (with OpenStreetMap Nominatim)." },
      { q: "Is the app in English?", a: "Yes. Choose English or Japanese in the settings; AI readings follow the language you choose." },
    ],
  },
  footer: {
    series: "Caelum series",
    arcanorum: "Liber Arcanorum (tarot)",
    source: "Source code (GitHub)",
    license:
      "The original source code is under the MIT License. The app bundles kerykeion (AGPL v3) for the astronomical calculations, so the distributed program as a whole follows the AGPL v3.",
    kerykeion: "Calculations: kerykeion (with the Swiss Ephemeris)",
    icon: "Orbit icons created by Eucalyp - Flaticon",
    disclaimer: "Astrology is for entertainment and reflection.",
  },
};

export const CONTENT: Record<Lang, Content> = { ja, en };
