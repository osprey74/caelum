import {
  ChartResponse,
  PLANET_KEYS,
  OPTIONAL_PLANET_KEYS,
  PLANET_SYMBOLS,
  PlanetData,
} from "../types/astrology";
import { useTranslation } from "react-i18next";
import type { GlossaryClickEvent } from "./ChartWheel";

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
  const { t } = useTranslation();
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
            <th className="text-left py-1.5 px-2">{t("planetTable.planet")}</th>
            <th className="text-left py-1.5 px-2">{t("planetTable.sign")}</th>
            <th className="text-right py-1.5 px-2">{t("planetTable.degree")}</th>
            <th className="text-left py-1.5 px-2">{t("planetTable.house")}</th>
            <th className="text-center py-1.5 px-2">{t("planetTable.retrograde")}</th>
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
                  {t("planets." + p.name, p.name)}
                </span>
              </td>
              <td className="py-1.5 px-2">
                <span
                  className={onGlossaryClick ? "cursor-pointer hover:text-amber-300 transition-colors" : ""}
                  onClick={onGlossaryClick ? () => onGlossaryClick({ category: "sign", key: p.sign }) : undefined}
                >
                  {t("signs." + p.sign, p.sign)}
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
