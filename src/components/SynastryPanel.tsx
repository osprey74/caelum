import { useState, useRef, useEffect, useMemo } from "react";
import Markdown from "react-markdown";
import { fetchProfiles, fetchSynastry, streamSynastryInterpretation, BirthData } from "../lib/api";
import type { Profile, DualChartResponse, SynastryRequest } from "../types/astrology";

interface Section {
  heading: string;
  body: string;
}

function splitSections(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let currentHeading = "";
  let currentBody: string[] = [];
  for (const line of lines) {
    const headingMatch = line.match(/^#{1,2}\s+(.+)/);
    if (headingMatch) {
      if (currentHeading || currentBody.length > 0) {
        sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
      }
      currentHeading = headingMatch[1];
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentHeading || currentBody.length > 0) {
    sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
  }
  return sections;
}

interface Props {
  birthData: BirthData | null;
  hasApiKey: boolean;
  onSynastryData: (data: DualChartResponse | null) => void;
  onTextChange?: (text: string) => void;
}

export default function SynastryPanel({ birthData, hasApiKey, onSynastryData, onTextChange }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [person2Id, setPerson2Id] = useState("");
  const [person2Data, setPerson2Data] = useState<BirthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [interpText, setInterpText] = useState("");
  const [interpLoading, setInterpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchProfiles().then(setProfiles).catch(() => {});
  }, []);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [interpText]);

  useEffect(() => {
    onTextChange?.(interpText);
  }, [interpText, onTextChange]);

  function handlePerson2Select(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setPerson2Id(id);
    if (!id) {
      setPerson2Data(null);
      return;
    }
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      setPerson2Data({
        name: profile.name,
        year: profile.year,
        month: profile.month,
        day: profile.day,
        hour: profile.hour,
        minute: profile.minute,
        city: profile.city,
        lat: profile.lat,
        lng: profile.lng,
        timezone: profile.timezone,
      });
    }
  }

  function buildSynastryRequest(): SynastryRequest | null {
    if (!birthData || !person2Data) return null;
    return {
      name1: birthData.name,
      year1: birthData.year,
      month1: birthData.month,
      day1: birthData.day,
      hour1: birthData.hour,
      minute1: birthData.minute,
      city1: birthData.city,
      lat1: birthData.lat,
      lng1: birthData.lng,
      timezone1: birthData.timezone,
      name2: person2Data.name,
      year2: person2Data.year,
      month2: person2Data.month,
      day2: person2Data.day,
      hour2: person2Data.hour,
      minute2: person2Data.minute,
      city2: person2Data.city,
      lat2: person2Data.lat,
      lng2: person2Data.lng,
      timezone2: person2Data.timezone,
    };
  }

  async function handleCalculate() {
    const req = buildSynastryRequest();
    if (!req) return;
    setLoading(true);
    setError(null);
    setInterpText("");
    setCollapsedSections(new Set());
    try {
      const data = await fetchSynastry(req);
      onSynastryData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "シナストリー計算に失敗しました。");
      onSynastryData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleInterpret() {
    const req = buildSynastryRequest();
    if (!req) return;
    cancelRef.current?.();
    setInterpText("");
    setError(null);
    setInterpLoading(true);
    setCollapsedSections(new Set());

    cancelRef.current = streamSynastryInterpretation(
      req,
      (chunk) => setInterpText((prev) => prev + chunk),
      () => setInterpLoading(false),
    );
  }

  function handleCancel() {
    cancelRef.current?.();
    cancelRef.current = null;
    setInterpLoading(false);
  }

  const sections = useMemo(() => splitSections(interpText), [interpText]);
  const hasSections = !interpLoading && sections.length > 1 && sections.some((s) => s.heading);

  function toggleSection(idx: number) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  const mdComponents = {
    h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-xl font-bold text-gray-100 mt-4 mb-2">{children}</h1>,
    h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-lg font-bold text-gray-200 mt-4 mb-2">{children}</h2>,
    h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-base font-semibold text-gray-200 mt-3 mb-1">{children}</h3>,
    hr: () => <hr className="border-gray-700 my-3" />,
    p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2">{children}</p>,
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="text-pink-300 font-semibold">{children}</strong>,
    blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote className="border-l-2 border-pink-500 pl-3 text-gray-400 italic my-2">{children}</blockquote>,
  };

  const btnClass = "rounded px-3 py-1.5 text-sm text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const canCalculate = !!birthData && !!person2Data && !loading;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-200 mb-3">シナストリー（相性）</h2>

      {/* Person 1: current natal chart */}
      <div className="mb-2">
        <label className="block text-xs text-gray-400 mb-1">1人目（ネイタルチャート）</label>
        <div className="rounded bg-gray-800/50 border border-gray-700 px-3 py-2 text-sm text-gray-300">
          {birthData ? (
            <span>{birthData.name}（{birthData.year}/{birthData.month}/{birthData.day}）</span>
          ) : (
            <span className="text-gray-500">出生データを入力してください</span>
          )}
        </div>
      </div>

      {/* Person 2: select from profiles */}
      <div className="mb-3">
        <label className="block text-xs text-gray-400 mb-1">2人目（プロファイルから選択）</label>
        <select
          value={person2Id}
          onChange={handlePerson2Select}
          className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-pink-500 text-sm"
          disabled={loading}
        >
          <option value="">選択してください...</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}（{p.year}/{p.month}/{p.day}）
            </option>
          ))}
        </select>
        {profiles.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            プロファイルがありません。左パネルで出生データを保存してください。
          </p>
        )}
      </div>

      {/* Calculate button */}
      <button
        type="button"
        onClick={handleCalculate}
        disabled={!canCalculate}
        className={`${btnClass} bg-pink-600 hover:bg-pink-500 mb-3 w-full`}
      >
        {loading ? "計算中..." : "シナストリーを計算"}
      </button>

      {error && (
        <div className="mb-2 rounded bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Interpretation */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">AI 解釈</span>
        <div className="flex gap-2">
          {interpLoading ? (
            <button type="button" onClick={handleCancel}
              className={`${btnClass} bg-red-700 hover:bg-red-600`}>
              中止
            </button>
          ) : (
            <button type="button" onClick={handleInterpret}
              disabled={!canCalculate || !hasApiKey || interpLoading}
              className={`${btnClass} bg-pink-600 hover:bg-pink-500`}>
              解釈を生成
            </button>
          )}
        </div>
      </div>

      {!hasApiKey && (
        <div className="mb-2 rounded bg-amber-900/30 border border-amber-700 px-3 py-2 text-xs text-amber-300">
          APIキー未設定のため、シナストリー解釈は利用できません。
        </div>
      )}

      <div
        ref={textRef}
        className="flex-1 overflow-auto rounded bg-gray-800/50 border border-gray-700 p-4 text-sm text-gray-200 leading-relaxed"
      >
        {interpText ? (
          <>
            {hasSections ? (
              <div className="space-y-1">
                {sections.map((sec, idx) => {
                  const isCollapsed = collapsedSections.has(idx);
                  if (!sec.heading) {
                    return <div key={idx}><Markdown components={mdComponents}>{sec.body}</Markdown></div>;
                  }
                  return (
                    <div key={idx} className="border border-gray-700 rounded">
                      <button type="button" onClick={() => toggleSection(idx)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-200 font-semibold hover:bg-gray-700/50 transition-colors">
                        <span>{sec.heading}</span>
                        <span className="text-gray-500 text-xs ml-2">{isCollapsed ? "▶" : "▼"}</span>
                      </button>
                      {!isCollapsed && sec.body && (
                        <div className="px-3 pb-3 text-sm">
                          <Markdown components={mdComponents}>{sec.body}</Markdown>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Markdown components={mdComponents}>{interpText}</Markdown>
            )}
            {interpLoading && <span className="inline-block w-2 h-4 ml-0.5 bg-pink-400 animate-pulse" />}
          </>
        ) : (
          <p className="text-gray-500">
            {birthData
              ? "2人目を選択し「シナストリーを計算」ボタンを押すと、相性チャートが表示されます。"
              : "まず出生データを入力してチャートを作成してください。"}
          </p>
        )}
      </div>
    </div>
  );
}
