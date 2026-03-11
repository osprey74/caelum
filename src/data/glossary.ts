/** 用語辞書 — 天体・サイン・ハウス・アスペクトの解説 */

export type GlossaryCategory = "planet" | "sign" | "house" | "aspect";

export interface GlossaryEntry {
  category: GlossaryCategory;
  name: string;
  nameEn: string;
  symbol: string;
  summary: string;
  summaryEn: string;
  description: string;
  descriptionEn: string;
}

// ---------------------------------------------------------------------------
// 天体
// ---------------------------------------------------------------------------

export const PLANET_GLOSSARY: Record<string, GlossaryEntry> = {
  Sun: {
    category: "planet",
    name: "太陽",
    nameEn: "Sun",
    symbol: "☉",
    summary: "自我・本質・人生の目的",
    summaryEn: "Self, Identity, Life Purpose",
    description:
      "太陽はあなたの中心的なアイデンティティを表します。「あなたは何座？」と聞かれるときの星座は、太陽が位置するサインです。人生で何を目指し、どんな存在でありたいかという根本的な方向性を示します。太陽は父親や権威者との関係にも関わります。",
    descriptionEn:
      "The Sun represents your core identity and sense of self. When someone asks 'What's your sign?', they're referring to your Sun sign. It indicates your fundamental direction in life — what you aspire to be and the essence of who you are. The Sun also relates to your relationship with authority figures and your father.",
  },
  Moon: {
    category: "planet",
    name: "月",
    nameEn: "Moon",
    symbol: "☽",
    summary: "感情・無意識・内面の欲求",
    summaryEn: "Emotions, Subconscious, Inner Needs",
    description:
      "月はあなたの感情のパターン、無意識の反応、安心感を得る方法を表します。幼少期の記憶や母親との関係にも関連し、リラックスしているときに自然と出てくる「素の自分」を映し出します。月のサインは感情の処理の仕方を示します。",
    descriptionEn:
      "The Moon reflects your emotional patterns, unconscious reactions, and what makes you feel safe. It connects to childhood memories and your relationship with your mother, revealing the 'real you' that emerges when you're relaxed. The Moon's sign shows how you process and express your emotions.",
  },
  Mercury: {
    category: "planet",
    name: "水星",
    nameEn: "Mercury",
    symbol: "☿",
    summary: "知性・コミュニケーション・思考",
    summaryEn: "Intellect, Communication, Thought",
    description:
      "水星はあなたの考え方、話し方、学び方を表します。情報をどう処理し、どう伝えるかを示す天体です。水星逆行（リトログレード）は通信や契約のトラブルが起きやすい時期として知られていますが、振り返りや見直しに適した期間でもあります。",
    descriptionEn:
      "Mercury governs how you think, speak, and learn. It shows how you process information and communicate your ideas. Mercury retrograde is well known as a period prone to communication mix-ups and contract troubles, but it's also an excellent time for reflection and review.",
  },
  Venus: {
    category: "planet",
    name: "金星",
    nameEn: "Venus",
    symbol: "♀",
    summary: "愛情・美・価値観・お金",
    summaryEn: "Love, Beauty, Values, Money",
    description:
      "金星は愛情表現、美的感覚、人間関係の好みを表します。何に魅力を感じ、何を美しいと思うか、どんな関係性を築きたいかを示します。また金銭感覚や物質的な豊かさへの姿勢にも関わります。",
    descriptionEn:
      "Venus represents how you express love, your aesthetic sensibilities, and your relationship preferences. It reveals what attracts you, what you find beautiful, and what kind of partnerships you seek. Venus also influences your relationship with money and material comfort.",
  },
  Mars: {
    category: "planet",
    name: "火星",
    nameEn: "Mars",
    symbol: "♂",
    summary: "行動力・情熱・闘争心",
    summaryEn: "Drive, Passion, Assertiveness",
    description:
      "火星はあなたのエネルギーの使い方、行動パターン、怒りの表し方を表します。目標に向かって突き進む力であり、競争心や性的エネルギーとも関連します。火星のサインは、あなたがどのように主張し、困難に立ち向かうかを示します。",
    descriptionEn:
      "Mars represents how you channel your energy, your approach to action, and the way you express anger. It is your drive to pursue goals, and it connects to competitiveness and sexual energy. The sign Mars occupies shows how you assert yourself and confront challenges.",
  },
  Jupiter: {
    category: "planet",
    name: "木星",
    nameEn: "Jupiter",
    symbol: "♃",
    summary: "拡大・幸運・成長・哲学",
    summaryEn: "Expansion, Fortune, Growth, Philosophy",
    description:
      "木星は「大吉星」と呼ばれ、成長と発展をもたらす天体です。楽観性、寛大さ、人生における恵みの領域を示します。高等教育、旅行、哲学的な探求とも関わります。木星が位置するハウスやサインは、あなたが自然と恵まれやすい分野を表します。",
    descriptionEn:
      "Jupiter is known as the 'Greater Benefic' — the planet of growth and expansion. It points to optimism, generosity, and the areas of life where blessings flow most easily. It also connects to higher education, travel, and philosophical pursuits. The house and sign Jupiter occupies shows where you tend to find abundance naturally.",
  },
  Saturn: {
    category: "planet",
    name: "土星",
    nameEn: "Saturn",
    symbol: "♄",
    summary: "責任・制限・忍耐・成熟",
    summaryEn: "Responsibility, Limits, Discipline, Maturity",
    description:
      "土星は「試練の星」と呼ばれますが、努力と忍耐を通じて得られる真の成長を表します。社会的な責任、ルール、時間をかけた達成に関わります。約29年周期で星座を一周し、29歳前後の「サターンリターン」は人生の大きな転機となります。",
    descriptionEn:
      "Saturn is called the 'Taskmaster' of the zodiac, but through effort and perseverance it brings genuine, lasting growth. It governs social responsibility, rules, and achievements built over time. Saturn takes roughly 29 years to complete a full cycle, and the 'Saturn Return' around age 29 marks a major turning point in life.",
  },
  Uranus: {
    category: "planet",
    name: "天王星",
    nameEn: "Uranus",
    symbol: "♅",
    summary: "変革・独創性・自由・突発的変化",
    summaryEn: "Revolution, Originality, Freedom, Sudden Change",
    description:
      "天王星は既存の枠組みを打ち破る革新のエネルギーを表します。独立心、オリジナリティ、テクノロジーとの親和性に関わります。天王星が強い人は、常識にとらわれない独自の視点を持つ傾向があります。約84年で一周するため、世代的な影響も持ちます。",
    descriptionEn:
      "Uranus carries the energy of innovation that shatters existing frameworks. It relates to independence, originality, and an affinity for technology. People with a strong Uranus tend to see the world from a uniquely unconventional perspective. With an orbit of about 84 years, it also exerts generational influence.",
  },
  Neptune: {
    category: "planet",
    name: "海王星",
    nameEn: "Neptune",
    symbol: "♆",
    summary: "夢・直感・霊性・幻想",
    summaryEn: "Dreams, Intuition, Spirituality, Illusion",
    description:
      "海王星はインスピレーション、芸術的感性、スピリチュアルな感受性を表します。想像力と共感力に優れる一方、曖昧さや幻想に惑わされやすい面もあります。約165年で一周し、世代全体の夢や理想を形作ります。",
    descriptionEn:
      "Neptune represents inspiration, artistic sensitivity, and spiritual receptivity. It bestows rich imagination and empathy, yet it can also blur boundaries and lead to illusion. With an orbit of roughly 165 years, Neptune shapes the dreams and ideals of entire generations.",
  },
  Pluto: {
    category: "planet",
    name: "冥王星",
    nameEn: "Pluto",
    symbol: "⯓",
    summary: "変容・再生・権力・深層心理",
    summaryEn: "Transformation, Rebirth, Power, the Deep Psyche",
    description:
      "冥王星は根本的な変容、死と再生のプロセスを表します。隠された真実、権力構造、深層心理に関わります。冥王星のトランジットは人生の大きな転換点をもたらすことがあり、古いものを手放して新しい自分に生まれ変わる力を象徴します。約248年で一周します。",
    descriptionEn:
      "Pluto represents profound transformation and the process of death and rebirth. It deals with hidden truths, power structures, and the depths of the psyche. Pluto transits can trigger major life turning points, symbolizing the power to release the old and emerge renewed. It takes about 248 years to orbit the Sun.",
  },
  Chiron: {
    category: "planet",
    name: "キロン",
    nameEn: "Chiron",
    symbol: "⚷",
    summary: "傷・癒し・教え・メンター",
    summaryEn: "Wound, Healing, Teaching, Mentorship",
    description:
      "キロンは「傷ついた癒し手」と呼ばれる小惑星です。あなたが人生で深く傷つきやすい領域を示すと同時に、その経験を通じて他者を癒す力を得られる場所でもあります。自分の弱さを受け入れることで、真の強さと叡智に変わるというテーマを持ちます。",
    descriptionEn:
      "Chiron is known as the 'Wounded Healer.' It points to an area of life where you carry a deep vulnerability, yet through that very experience you gain the ability to heal others. Its central theme is that embracing your own wounds transforms them into genuine strength and wisdom.",
  },
  Mean_Lilith: {
    category: "planet",
    name: "リリス（平均）",
    nameEn: "Lilith (Mean)",
    symbol: "⚸",
    summary: "本能・影・抑圧された欲求",
    summaryEn: "Instinct, Shadow, Repressed Desires",
    description:
      "リリス（ブラックムーンリリス）は月の軌道の遠地点に基づく感受点です。社会的に抑圧されがちな本能的欲求、野生的なエネルギー、既成概念への反発を表します。リリスのサインやハウスは、あなたが「型にはまらない」力を発揮できる領域を示します。",
    descriptionEn:
      "Lilith (Black Moon Lilith) is a sensitive point based on the lunar orbit's apogee. It represents primal desires that society tends to suppress, raw untamed energy, and rebellion against convention. The sign and house Lilith occupies reveals where you can tap into a fierce, unapologetic power.",
  },
  Pars_Fortunae: {
    category: "planet",
    name: "フォルテュナ（幸運点）",
    nameEn: "Part of Fortune",
    symbol: "⊕",
    summary: "幸運・適性・物質的豊かさ",
    summaryEn: "Fortune, Natural Talent, Material Abundance",
    description:
      "パート・オブ・フォルテュナ（幸運点）はアラビック・パーツと呼ばれる計算上のポイントで、太陽・月・アセンダントの関係から導き出されます。あなたが自然体でいるときに幸運や充実感を得やすい分野を示します。物質的な豊かさや適職のヒントにもなります。",
    descriptionEn:
      "The Part of Fortune (Pars Fortunae) is a calculated point known as an Arabic Part, derived from the relationship between the Sun, Moon, and Ascendant. It highlights areas where you attract luck and fulfillment simply by being yourself. It can also offer clues about material prosperity and ideal vocations.",
  },
  Ascendant: {
    category: "planet",
    name: "アセンダント（ASC）",
    nameEn: "Ascendant (ASC)",
    symbol: "Asc",
    summary: "第一印象・外見・人生へのアプローチ",
    summaryEn: "First Impressions, Appearance, Approach to Life",
    description:
      "アセンダント（上昇宮）は、あなたが生まれた瞬間に東の地平線に昇っていたサインです。他人から見た第一印象、外見的な雰囲気、人生に対する基本的なアプローチを表します。太陽サインが「内面の自分」なら、アセンダントは「世界に見せている自分」です。正確な出生時刻が必要です。",
    descriptionEn:
      "The Ascendant (Rising Sign) is the zodiac sign that was rising on the eastern horizon at the moment of your birth. It shapes the first impression you make on others, your outward demeanor, and your instinctive approach to life. If the Sun sign is 'who you are inside,' the Ascendant is 'the face you show the world.' An accurate birth time is required.",
  },
  Medium_Coeli: {
    category: "planet",
    name: "MC（中天）",
    nameEn: "Midheaven (MC)",
    symbol: "MC",
    summary: "社会的地位・キャリア・公的イメージ",
    summaryEn: "Social Standing, Career, Public Image",
    description:
      "MC（ミディアム・コエリ、中天）は出生時に天頂にあったポイントで、あなたの社会的な目標、キャリアの方向性、公的なイメージを表します。第10ハウスのカスプでもあり、「社会でどう認められたいか」を示す重要な感受点です。",
    descriptionEn:
      "The Midheaven (Medium Coeli, MC) is the point that was at the very top of the sky at the time of your birth. It represents your social ambitions, career direction, and public image. As the cusp of the 10th House, it is a key indicator of how you wish to be recognized in the world.",
  },
};

// ---------------------------------------------------------------------------
// サイン（12星座）
// ---------------------------------------------------------------------------

export const SIGN_GLOSSARY: Record<string, GlossaryEntry> = {
  Ari: {
    category: "sign",
    name: "牡羊座",
    nameEn: "Aries",
    symbol: "♈",
    summary: "火 / 活動宮 / 支配星: 火星",
    summaryEn: "Fire / Cardinal / Ruler: Mars",
    description:
      "12星座のトップバッターである牡羊座は、新しいことを始めるエネルギーに満ちています。勇敢で直感的、リーダーシップを発揮しますが、せっかちで衝動的な面も。「まずやってみる」精神の持ち主です。",
    descriptionEn:
      "As the first sign of the zodiac, Aries is brimming with energy to start new things. Brave and intuitive, Aries excels at leadership, though they can be impatient and impulsive. Their motto is 'act first, think later.'",
  },
  Tau: {
    category: "sign",
    name: "牡牛座",
    nameEn: "Taurus",
    symbol: "♉",
    summary: "地 / 不動宮 / 支配星: 金星",
    summaryEn: "Earth / Fixed / Ruler: Venus",
    description:
      "牡牛座は五感の喜びと安定を大切にします。忍耐強く信頼性がありますが、変化を嫌う頑固さも。美しいもの、おいしいもの、心地よい空間など、生活の質を重視する実際的なサインです。",
    descriptionEn:
      "Taurus cherishes sensory pleasures and stability. Patient and dependable, Taurus can also be stubbornly resistant to change. Beautiful objects, good food, comfortable surroundings — this practical sign places a premium on quality of life.",
  },
  Gem: {
    category: "sign",
    name: "双子座",
    nameEn: "Gemini",
    symbol: "♊",
    summary: "風 / 柔軟宮 / 支配星: 水星",
    summaryEn: "Air / Mutable / Ruler: Mercury",
    description:
      "双子座は好奇心旺盛で、情報の収集と発信に長けています。コミュニケーション能力が高く、多才で適応力がありますが、飽きっぽく表面的になりやすい面も。知的な刺激を常に求めるサインです。",
    descriptionEn:
      "Gemini is endlessly curious, gifted at gathering and sharing information. Highly communicative, versatile, and adaptable, Gemini can also be restless and superficial. This sign craves constant intellectual stimulation.",
  },
  Can: {
    category: "sign",
    name: "蟹座",
    nameEn: "Cancer",
    symbol: "♋",
    summary: "水 / 活動宮 / 支配星: 月",
    summaryEn: "Water / Cardinal / Ruler: Moon",
    description:
      "蟹座は感情の深さと家庭を大切にする心を持ちます。共感力が高く面倒見がよいですが、感情に左右されやすく、身内とよそ者を分ける傾向も。安心できる「居場所」を作ることに長けたサインです。",
    descriptionEn:
      "Cancer possesses deep emotions and a heartfelt devotion to home and family. Highly empathetic and nurturing, Cancer can be moody and tends to draw a sharp line between inner circle and outsiders. This sign has a gift for creating a safe, welcoming space.",
  },
  Leo: {
    category: "sign",
    name: "獅子座",
    nameEn: "Leo",
    symbol: "♌",
    summary: "火 / 不動宮 / 支配星: 太陽",
    summaryEn: "Fire / Fixed / Ruler: Sun",
    description:
      "獅子座は自己表現と創造性のサインです。華やかで堂々としており、注目を集める才能がありますが、プライドが高く承認欲求が強い面も。人生をドラマチックに楽しむ情熱を持っています。",
    descriptionEn:
      "Leo is the sign of self-expression and creativity. Radiant and confident, Leo has a natural talent for commanding attention, though pride and a strong need for validation can be challenges. Leo approaches life with a flair for the dramatic and a passion for enjoyment.",
  },
  Vir: {
    category: "sign",
    name: "乙女座",
    nameEn: "Virgo",
    symbol: "♍",
    summary: "地 / 柔軟宮 / 支配星: 水星",
    summaryEn: "Earth / Mutable / Ruler: Mercury",
    description:
      "乙女座は分析力と実務能力に優れたサインです。細部に目が届き、改善と奉仕の精神を持ちますが、完璧主義で批判的になりやすい傾向も。健康管理や日常のルーティンを整えることに適性があります。",
    descriptionEn:
      "Virgo excels in analysis and practical skills. Detail-oriented with a spirit of improvement and service, Virgo can tend toward perfectionism and criticism. This sign has a natural aptitude for health management and organizing daily routines.",
  },
  Lib: {
    category: "sign",
    name: "天秤座",
    nameEn: "Libra",
    symbol: "♎",
    summary: "風 / 活動宮 / 支配星: 金星",
    summaryEn: "Air / Cardinal / Ruler: Venus",
    description:
      "天秤座はバランスと調和を追求するサインです。外交的でセンスがよく、公平さを大切にしますが、優柔不断で他者に合わせすぎる面も。パートナーシップや人間関係の中で自分を見出すタイプです。",
    descriptionEn:
      "Libra pursues balance and harmony in all things. Diplomatic and stylish with a strong sense of fairness, Libra can also be indecisive and overly accommodating. This sign tends to discover itself through partnerships and relationships.",
  },
  Sco: {
    category: "sign",
    name: "蠍座",
    nameEn: "Scorpio",
    symbol: "♏",
    summary: "水 / 不動宮 / 支配星: 冥王星（副支配星: 火星）",
    summaryEn: "Water / Fixed / Ruler: Pluto (Co-ruler: Mars)",
    description:
      "蠍座は深い感情と変容の力を持つサインです。洞察力が鋭く、一度決めたことへの集中力は圧倒的ですが、執着心や秘密主義の面も。表面的な関係を嫌い、真実の絆を求めます。",
    descriptionEn:
      "Scorpio is a sign of deep emotion and transformative power. Perceptive and intensely focused once committed, Scorpio can also be possessive and secretive. This sign rejects superficial connections and seeks bonds built on truth.",
  },
  Sag: {
    category: "sign",
    name: "射手座",
    nameEn: "Sagittarius",
    symbol: "♐",
    summary: "火 / 柔軟宮 / 支配星: 木星",
    summaryEn: "Fire / Mutable / Ruler: Jupiter",
    description:
      "射手座は冒険と哲学のサインです。楽観的で自由を愛し、未知の世界への探求心に溢れていますが、無責任で大雑把になりやすい面も。旅行、高等教育、異文化交流に強い関心を持ちます。",
    descriptionEn:
      "Sagittarius is the sign of adventure and philosophy. Optimistic and freedom-loving, Sagittarius overflows with a desire to explore the unknown, though this can sometimes lead to carelessness or a lack of follow-through. Travel, higher education, and cross-cultural exchange hold special appeal.",
  },
  Cap: {
    category: "sign",
    name: "山羊座",
    nameEn: "Capricorn",
    symbol: "♑",
    summary: "地 / 活動宮 / 支配星: 土星",
    summaryEn: "Earth / Cardinal / Ruler: Saturn",
    description:
      "山羊座は目標達成と社会的成功を重視するサインです。忍耐強く計画的で、着実にキャリアを築く力がありますが、堅苦しく感情を抑えがちな面も。長期的な視野で人生を設計する現実主義者です。",
    descriptionEn:
      "Capricorn values achievement and social success. Patient and methodical, Capricorn has the stamina to build a career step by step, though it can seem rigid and emotionally reserved. This sign is the pragmatist who plans life with a long-term perspective.",
  },
  Aqu: {
    category: "sign",
    name: "水瓶座",
    nameEn: "Aquarius",
    symbol: "♒",
    summary: "風 / 不動宮 / 支配星: 天王星（副支配星: 土星）",
    summaryEn: "Air / Fixed / Ruler: Uranus (Co-ruler: Saturn)",
    description:
      "水瓶座は革新と博愛のサインです。独創的な発想を持ち、社会全体の進歩に関心がありますが、感情面ではクールで変わり者と見られることも。個人よりもコミュニティや未来のビジョンを重視します。",
    descriptionEn:
      "Aquarius is the sign of innovation and humanitarianism. Blessed with original ideas and a genuine concern for social progress, Aquarius can come across as emotionally detached or eccentric. This sign prioritizes the community and its vision for the future over purely personal concerns.",
  },
  Pis: {
    category: "sign",
    name: "魚座",
    nameEn: "Pisces",
    symbol: "♓",
    summary: "水 / 柔軟宮 / 支配星: 海王星（副支配星: 木星）",
    summaryEn: "Water / Mutable / Ruler: Neptune (Co-ruler: Jupiter)",
    description:
      "12星座の最後を飾る魚座は、共感力と想像力が豊かなサインです。芸術的感性に優れ、スピリチュアルな直感を持ちますが、現実逃避しやすく境界線が曖昧になりがちな面も。あらゆるものを受容する包容力があります。",
    descriptionEn:
      "As the final sign of the zodiac, Pisces is rich in empathy and imagination. Artistically gifted and spiritually intuitive, Pisces can be prone to escapism and blurred boundaries. This sign possesses a boundless compassion that embraces all.",
  },
};

// ---------------------------------------------------------------------------
// ハウス
// ---------------------------------------------------------------------------

export const HOUSE_GLOSSARY: Record<number, GlossaryEntry> = {
  1: {
    category: "house",
    name: "第1ハウス",
    nameEn: "1st House",
    symbol: "1",
    summary: "自己・外見・第一印象",
    summaryEn: "Self, Appearance, First Impressions",
    description:
      "第1ハウスはアセンダントから始まる「自分自身」のハウスです。外見、体質、他人に与える第一印象、人生への基本的なアプローチを表します。このハウスに天体がある人は、その天体のエネルギーが外見や行動に強く表れます。",
    descriptionEn:
      "The 1st House begins at the Ascendant and represents 'the self.' It governs your appearance, physical constitution, the first impression you make on others, and your basic approach to life. Planets in this house strongly influence how you present yourself to the world.",
  },
  2: {
    category: "house",
    name: "第2ハウス",
    nameEn: "2nd House",
    symbol: "2",
    summary: "財産・収入・価値観",
    summaryEn: "Possessions, Income, Values",
    description:
      "第2ハウスは物質的な所有物、収入、自分が大切にする価値観を表します。お金の稼ぎ方や使い方、物質的な安定への姿勢がここに現れます。自己価値感（自分にはどれだけの価値があるか）とも深く関わります。",
    descriptionEn:
      "The 2nd House governs material possessions, income, and your personal value system. How you earn and spend money, and your attitude toward financial security, are reflected here. It also connects deeply to self-worth — how much you believe you deserve.",
  },
  3: {
    category: "house",
    name: "第3ハウス",
    nameEn: "3rd House",
    symbol: "3",
    summary: "コミュニケーション・学習・近隣",
    summaryEn: "Communication, Learning, Local Environment",
    description:
      "第3ハウスは日常的なコミュニケーション、初等教育、短距離の移動を表します。兄弟姉妹や近所の人との関係、情報の受発信の仕方もここに含まれます。文章力やプレゼン能力にも関係するハウスです。",
    descriptionEn:
      "The 3rd House covers everyday communication, early education, and short-distance travel. Relationships with siblings and neighbors, as well as how you send and receive information, fall under this house. It also relates to writing and presentation skills.",
  },
  4: {
    category: "house",
    name: "第4ハウス",
    nameEn: "4th House",
    symbol: "4",
    summary: "家庭・ルーツ・心の基盤",
    summaryEn: "Home, Roots, Emotional Foundation",
    description:
      "第4ハウスはIC（天底）から始まり、家庭環境、家族のルーツ、心の安らぎの場を表します。幼少期の環境や親（特に母親）との関係、人生の晩年の過ごし方にも関わります。「帰る場所」のハウスです。",
    descriptionEn:
      "The 4th House begins at the IC (Imum Coeli) and represents your home environment, family roots, and emotional sanctuary. It relates to your childhood surroundings, your relationship with your parents (especially the mother), and how you spend your later years. It is the house of 'where you come home to.'",
  },
  5: {
    category: "house",
    name: "第5ハウス",
    nameEn: "5th House",
    symbol: "5",
    summary: "創造性・恋愛・遊び・子供",
    summaryEn: "Creativity, Romance, Play, Children",
    description:
      "第5ハウスは自己表現の喜び、創造的な活動、恋愛（結婚前の楽しい段階）、子供との関係を表します。趣味、ギャンブル、エンターテインメントなど、人生を楽しむ要素が含まれるハウスです。",
    descriptionEn:
      "The 5th House covers the joy of self-expression, creative endeavors, romance (the exciting stage before commitment), and your relationship with children. Hobbies, speculation, and entertainment — the elements that make life fun — all belong to this house.",
  },
  6: {
    category: "house",
    name: "第6ハウス",
    nameEn: "6th House",
    symbol: "6",
    summary: "健康・日常業務・奉仕",
    summaryEn: "Health, Daily Work, Service",
    description:
      "第6ハウスは日々の仕事のルーティン、健康管理、奉仕の姿勢を表します。職場環境や同僚との関係、ペットとの関わりもここに含まれます。自己改善や生活習慣の整備に関わるハウスです。",
    descriptionEn:
      "The 6th House governs your daily work routines, health maintenance, and attitude toward service. Workplace dynamics, relationships with colleagues, and even pets fall under this house. It is the domain of self-improvement and building healthy habits.",
  },
  7: {
    category: "house",
    name: "第7ハウス",
    nameEn: "7th House",
    symbol: "7",
    summary: "パートナーシップ・結婚・対人関係",
    summaryEn: "Partnerships, Marriage, One-on-One Relationships",
    description:
      "第7ハウスはディセンダントから始まり、1対1の対人関係を表します。結婚相手やビジネスパートナー、契約関係など、対等な関係性がテーマです。第1ハウス（自分）の対極にあり、「自分にないもの」を持つ相手に惹かれる傾向を示します。",
    descriptionEn:
      "The 7th House begins at the Descendant and represents one-on-one relationships. Marriage partners, business partners, and contractual bonds — equal partnerships of all kinds — are its theme. Opposite the 1st House (the self), it often reveals an attraction to people who embody qualities you lack.",
  },
  8: {
    category: "house",
    name: "第8ハウス",
    nameEn: "8th House",
    symbol: "8",
    summary: "変容・深い絆・遺産・性",
    summaryEn: "Transformation, Deep Bonds, Inheritance, Sexuality",
    description:
      "第8ハウスは深い感情的な結びつき、変容のプロセス、他者の資産（遺産・保険・税金）を表します。死と再生、心理的な深みに関わるハウスで、タブーとされるテーマ（性、権力、秘密）とも関連します。",
    descriptionEn:
      "The 8th House governs deep emotional bonds, processes of transformation, and other people's resources (inheritance, insurance, taxes). It is the house of death and rebirth, psychological depth, and topics often considered taboo — sexuality, power, and secrets.",
  },
  9: {
    category: "house",
    name: "第9ハウス",
    nameEn: "9th House",
    symbol: "9",
    summary: "哲学・高等教育・海外・冒険",
    summaryEn: "Philosophy, Higher Education, Foreign Lands, Adventure",
    description:
      "第9ハウスは人生の意味の探求、高等教育、海外旅行や異文化体験を表します。宗教、哲学、法律など、より大きな視野での学びに関わります。第3ハウス（身近な知識）の対極で、「遠くの世界」を示すハウスです。",
    descriptionEn:
      "The 9th House covers the quest for life's meaning, higher education, long-distance travel, and cross-cultural experiences. Religion, philosophy, and law — learning that broadens your horizons — all belong here. Opposite the 3rd House (local knowledge), this is the house of 'the wider world.'",
  },
  10: {
    category: "house",
    name: "第10ハウス",
    nameEn: "10th House",
    symbol: "10",
    summary: "キャリア・社会的地位・天職",
    summaryEn: "Career, Social Status, Vocation",
    description:
      "第10ハウスはMC（中天）から始まり、社会的な達成、キャリア、公的なイメージを表します。どのような仕事で社会に貢献し、認められるかを示す最も「公的な」ハウスです。父親や上司など権威者との関係にも関わります。",
    descriptionEn:
      "The 10th House begins at the MC (Midheaven) and represents social achievement, career, and public image. It is the most 'public' house, showing how you contribute to society through your work and how you are recognized. It also relates to authority figures such as your father or superiors.",
  },
  11: {
    category: "house",
    name: "第11ハウス",
    nameEn: "11th House",
    symbol: "11",
    summary: "友人・コミュニティ・未来のビジョン",
    summaryEn: "Friends, Community, Vision for the Future",
    description:
      "第11ハウスは友人関係、グループ活動、社会的なネットワークを表します。共通の理想を持つ仲間との関わり、未来への希望や夢もここに含まれます。個人を超えた「みんなのため」の活動に関わるハウスです。",
    descriptionEn:
      "The 11th House governs friendships, group activities, and social networks. It encompasses connections with like-minded people, as well as your hopes and dreams for the future. This is the house of endeavors that go beyond the individual — working 'for the greater good.'",
  },
  12: {
    category: "house",
    name: "第12ハウス",
    nameEn: "12th House",
    symbol: "12",
    summary: "無意識・秘密・癒し・手放し",
    summaryEn: "The Unconscious, Secrets, Healing, Letting Go",
    description:
      "第12ハウスは12ハウスの最後に位置し、無意識、隠された世界、スピリチュアリティを表します。夢、瞑想、孤独な時間、過去からのカルマに関わります。「見えない力」が働くハウスであり、自己犠牲や奉仕の精神とも結びつきます。",
    descriptionEn:
      "The 12th House is the final house, representing the unconscious, the hidden realm, and spirituality. It relates to dreams, meditation, solitude, and karma carried from the past. This is the house where 'unseen forces' operate, and it is closely tied to self-sacrifice and the spirit of service.",
  },
};

// ---------------------------------------------------------------------------
// アスペクト
// ---------------------------------------------------------------------------

export const ASPECT_GLOSSARY: Record<string, GlossaryEntry> = {
  conjunction: {
    category: "aspect",
    name: "コンジャンクション",
    nameEn: "Conjunction",
    symbol: "☌",
    summary: "0° — 融合・強調",
    summaryEn: "0° — Fusion, Emphasis",
    description:
      "2つの天体が同じ位置にある状態です。両方のエネルギーが融合し、そのテーマが人生で非常に強く表れます。良くも悪くも強力で、関わる天体の性質次第で建設的にも破壊的にもなり得ます。最も影響力の大きいアスペクトです。",
    descriptionEn:
      "Two planets at the same position. Their energies merge and the associated themes manifest powerfully in your life. This can be constructive or destructive depending on the planets involved. It is the most influential aspect.",
  },
  opposition: {
    category: "aspect",
    name: "オポジション",
    nameEn: "Opposition",
    symbol: "☍",
    summary: "180° — 対立・気づき・バランス",
    summaryEn: "180° — Polarity, Awareness, Balance",
    description:
      "2つの天体が正反対に位置する状態です。相反するエネルギーの間で揺れ動く葛藤を生みますが、両方の視点を統合できれば大きな成長につながります。人間関係を通じて気づきを得やすいアスペクトです。",
    descriptionEn:
      "Two planets positioned directly opposite each other. This creates a tension between conflicting energies, yet integrating both perspectives can lead to tremendous growth. Insights tend to arrive through relationships and encounters with others.",
  },
  trine: {
    category: "aspect",
    name: "トライン",
    nameEn: "Trine",
    symbol: "△",
    summary: "120° — 調和・才能・自然な流れ",
    summaryEn: "120° — Harmony, Talent, Natural Flow",
    description:
      "同じエレメント（火・地・風・水）の天体同士が形成する、最も調和的なアスペクトです。才能として自然に発揮できる領域を示しますが、あまりに楽なため努力を怠りがちになる面もあります。生まれ持った恵みのアスペクトです。",
    descriptionEn:
      "Formed between planets in the same element (Fire, Earth, Air, or Water), the trine is the most harmonious aspect. It reveals areas of natural talent that flow effortlessly, though this very ease can sometimes lead to complacency. It is an aspect of innate gifts and grace.",
  },
  square: {
    category: "aspect",
    name: "スクエア",
    nameEn: "Square",
    symbol: "□",
    summary: "90° — 緊張・挑戦・成長の原動力",
    summaryEn: "90° — Tension, Challenge, Catalyst for Growth",
    description:
      "2つの天体が90度の角度にある状態で、摩擦と緊張を生みます。困難や試練として経験されますが、この緊張が行動を起こすモチベーションとなり、人生を動かすエンジンにもなります。最も成長を促すアスペクトです。",
    descriptionEn:
      "Two planets at a 90-degree angle, generating friction and tension. Often experienced as difficulty or trials, this very tension becomes the motivation to take action and serves as the engine that drives your life forward. It is the aspect most likely to spur growth.",
  },
  sextile: {
    category: "aspect",
    name: "セクスタイル",
    nameEn: "Sextile",
    symbol: "⚹",
    summary: "60° — 機会・協力・穏やかな才能",
    summaryEn: "60° — Opportunity, Cooperation, Gentle Talent",
    description:
      "トラインよりも穏やかな調和のアスペクトです。チャンスや協力関係として現れますが、トラインと違い自動的には発動せず、意識的に活用する努力が必要です。「掴めば開く扉」のようなアスペクトです。",
    descriptionEn:
      "A gentler harmonious aspect compared to the trine. It appears as opportunities and cooperative dynamics, but unlike the trine it does not activate automatically — conscious effort is needed to make the most of it. Think of it as 'a door that opens when you reach for the handle.'",
  },
};

// ---------------------------------------------------------------------------
// キーから辞書を検索するヘルパー
// ---------------------------------------------------------------------------

export function findGlossaryEntry(
  category: GlossaryCategory,
  key: string,
): GlossaryEntry | null {
  switch (category) {
    case "planet":
      return PLANET_GLOSSARY[key] ?? null;
    case "sign":
      return SIGN_GLOSSARY[key] ?? null;
    case "house": {
      const num = parseInt(key, 10);
      return HOUSE_GLOSSARY[num] ?? null;
    }
    case "aspect":
      return ASPECT_GLOSSARY[key] ?? null;
    default:
      return null;
  }
}
