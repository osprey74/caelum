export interface PlanetData {
  name: string;
  sign: string;
  sign_num: number;
  position: number;
  abs_pos: number;
  house: string | null;
  retrograde: boolean | null;
}

export interface HouseData {
  name: string;
  sign: string;
  sign_num: number;
  position: number;
  abs_pos: number;
}

export interface AspectData {
  p1_name: string;
  p2_name: string;
  p1_abs_pos: number;
  p2_abs_pos: number;
  aspect: string;
  orbit: number;
  aspect_degrees: number;
}

export interface ChartSubject {
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
  second_house: HouseData;
  third_house: HouseData;
  fourth_house: HouseData;
  fifth_house: HouseData;
  sixth_house: HouseData;
  seventh_house: HouseData;
  eighth_house: HouseData;
  ninth_house: HouseData;
  tenth_house: HouseData;
  eleventh_house: HouseData;
  twelfth_house: HouseData;
  [key: string]: unknown;
}

export interface ChartResponse {
  chart_type: string;
  subject: ChartSubject;
  aspects: AspectData[];
}

/** Transit / Synastry の二重円レスポンス（kerykeion DualChartDataModel） */
export interface DualChartResponse {
  chart_type: string;
  first_subject: ChartSubject;
  second_subject: ChartSubject;
  aspects: AspectData[];
}

export interface TransitRequest {
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
  house_system?: string;
  transit_year: number;
  transit_month: number;
  transit_day: number;
  transit_hour?: number;
  transit_minute?: number;
}

export interface SynastryRequest {
  name1: string;
  year1: number;
  month1: number;
  day1: number;
  hour1: number;
  minute1: number;
  city1: string;
  lat1?: number;
  lng1?: number;
  timezone1?: string;
  name2: string;
  year2: number;
  month2: number;
  day2: number;
  hour2: number;
  minute2: number;
  city2: string;
  lat2?: number;
  lng2?: number;
  timezone2?: string;
  house_system?: string;
}

export interface Profile {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export const PLANET_KEYS = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
  "chiron", "mean_lilith",
] as const;

/** null になり得る追加天体キー */
export const OPTIONAL_PLANET_KEYS = ["pars_fortunae"] as const;

export const HOUSE_KEYS = [
  "first_house", "second_house", "third_house", "fourth_house",
  "fifth_house", "sixth_house", "seventh_house", "eighth_house",
  "ninth_house", "tenth_house", "eleventh_house", "twelfth_house",
] as const;

export const SIGN_NAMES: Record<string, string> = {
  Ari: "牡羊座", Tau: "牡牛座", Gem: "双子座", Can: "蟹座",
  Leo: "獅子座", Vir: "乙女座", Lib: "天秤座", Sco: "蠍座",
  Sag: "射手座", Cap: "山羊座", Aqu: "水瓶座", Pis: "魚座",
};

export const SIGN_SYMBOLS: Record<string, string> = {
  Ari: "♈", Tau: "♉", Gem: "♊", Can: "♋",
  Leo: "♌", Vir: "♍", Lib: "♎", Sco: "♏",
  Sag: "♐", Cap: "♑", Aqu: "♒", Pis: "♓",
};

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀",
  Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅",
  Neptune: "♆", Pluto: "⯓",
  Chiron: "⚷", Mean_Lilith: "⚸", Pars_Fortunae: "⊕",
  Ascendant: "Asc", Medium_Coeli: "MC",
};

/** ハウスシステム選択肢 */
export const HOUSE_SYSTEMS: Record<string, string> = {
  P: "プラシダス (Placidus)",
  W: "ホールサイン (Whole Sign)",
  A: "等分ハウス (Equal)",
};

export const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#FFD700",
  opposition: "#FF4444",
  trine: "#44AA44",
  sextile: "#4488FF",
  square: "#FF4444",
};

export const SIGN_COLORS = [
  "#FF6B6B", "#8B9F6B", "#FFD93D", "#6BC5FF",
  "#FF6B6B", "#8B9F6B", "#FFD93D", "#6BC5FF",
  "#FF6B6B", "#8B9F6B", "#FFD93D", "#6BC5FF",
];
