import {
  ChartResponse,
  PLANET_KEYS,
  SIGN_NAMES,
  PLANET_SYMBOLS,
  PlanetData,
} from "../types/astrology";

interface Props {
  data: ChartResponse;
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

export default function PlanetTable({ data }: Props) {
  const subject = data.subject;
  const planets: PlanetData[] = PLANET_KEYS.map((k) => subject[k] as PlanetData);
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
                <span className="mr-1.5">{PLANET_SYMBOLS[p.name] || ""}</span>
                {p.name}
              </td>
              <td className="py-1.5 px-2">{SIGN_NAMES[p.sign] || p.sign}</td>
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
