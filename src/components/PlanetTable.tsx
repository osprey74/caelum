import {
  ChartResponse,
  PLANET_KEYS,
  OPTIONAL_PLANET_KEYS,
  SIGN_NAMES,
  PLANET_SYMBOLS,
  PlanetData,
} from "../types/astrology";
import type { GlossaryClickEvent } from "./ChartWheel";

const PLANET_NAMES_JA: Record<string, string> = {
  Sun: "太陽", Moon: "月", Mercury: "水星", Venus: "金星",
  Mars: "火星", Jupiter: "木星", Saturn: "土星", Uranus: "天王星",
  Neptune: "海王星", Pluto: "冥王星",
  Chiron: "キロン", Mean_Lilith: "リリス", Pars_Fortunae: "フォルテュナ",
  Ascendant: "ASC", Medium_Coeli: "MC",
};

interface Props {
  data: ChartResponse;
  onGlossaryClick?: (event: GlossaryClickEvent) => void;
}

function formatDeg(position: number): string {
  const deg = Math.floor(position);
  const min = Math.floor((position - deg) * 60);
  return `${deg}°${min.toString().padStart(2, "0")}'`;
}

function houseLabel(house: string | null): string {
  if (!house) return "-";
  return house.replace("_House", "").replace("_", " ");
}

export default function PlanetTable({ data, onGlossaryClick }: Props) {
  const subject = data.subject;
  const planets: PlanetData[] = PLANET_KEYS.map((k) => subject[k] as PlanetData);
  for (const k of OPTIONAL_PLANET_KEYS) {
    const p = subject[k] as PlanetData | null;
    if (p) planets.push(p);
  }
  planets.push(subject.ascendant as PlanetData);
  planets.push(subject.medium_coeli as PlanetData);

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm text-gray-200">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="text-left py-1.5 px-2">天体</th>
            <th className="text-left py-1.5 px-2">サイン</th>
            <th className="text-right py-1.5 px-2">度数</th>
            <th className="text-left py-1.5 px-2">ハウス</th>
            <th className="text-center py-1.5 px-2">逆行</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((p) => (
            <tr key={p.name} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="py-1.5 px-2">
                <span
                  className={onGlossaryClick ? "cursor-pointer hover:text-indigo-300 transition-colors" : ""}
                  onClick={onGlossaryClick ? () => onGlossaryClick({ category: "planet", key: p.name }) : undefined}
                >
                  <span className="mr-1.5">{PLANET_SYMBOLS[p.name] || ""}</span>
                  {PLANET_NAMES_JA[p.name] || p.name}
                </span>
              </td>
              <td className="py-1.5 px-2">
                <span
                  className={onGlossaryClick ? "cursor-pointer hover:text-amber-300 transition-colors" : ""}
                  onClick={onGlossaryClick ? () => onGlossaryClick({ category: "sign", key: p.sign }) : undefined}
                >
                  {SIGN_NAMES[p.sign] || p.sign}
                </span>
              </td>
              <td className="py-1.5 px-2 text-right font-mono">{formatDeg(p.position)}</td>
              <td className="py-1.5 px-2">{houseLabel(p.house)}</td>
              <td className="py-1.5 px-2 text-center">
                {p.retrograde ? <span className="text-red-400">R</span> : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
