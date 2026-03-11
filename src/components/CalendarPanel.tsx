import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { fetchMonthlyCalendar, streamMonthlyInterpretation, generateMonthlyPrompt, BirthData } from "../lib/api";
import type { MonthlyCalendarRequest, MonthlyCalendarResponse, CalendarEvent } from "../types/astrology";

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
  onTextChange?: (text: string) => void;
}

const EVENT_ICONS: Record<string, string> = {
  new_moon: "\u{1F311}",     // 🌑
  full_moon: "\u{1F315}",    // 🌕
  ingress: "\u{27A1}\uFE0F", // ➡️
  retrograde: "\u{1F504}",   // 🔄
  direct: "\u{25B6}\uFE0F",  // ▶️
  natal_aspect: "\u{2728}",  // ✨
};

const EVENT_COLORS: Record<string, string> = {
  new_moon: "bg-gray-700 text-gray-200",
  full_moon: "bg-amber-900/60 text-amber-200",
  ingress: "bg-indigo-900/60 text-indigo-200",
  retrograde: "bg-red-900/60 text-red-200",
  direct: "bg-emerald-900/60 text-emerald-200",
  natal_aspect: "bg-pink-900/60 text-pink-200",
};

function currentYearMonth(): { year: number; month: number } {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function CalendarPanel({ birthData, hasApiKey, onTextChange }: Props) {
  const { t } = useTranslation();
  const WEEKDAY_LABELS = t("calendar.weekdays", { returnObjects: true }) as string[];
  const { year: initYear, month: initMonth } = currentYearMonth();
  const [calYear, setCalYear] = useState(initYear);
  const [calMonth, setCalMonth] = useState(initMonth);
  const [calData, setCalData] = useState<MonthlyCalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [interpText, setInterpText] = useState("");
  const [interpLoading, setInterpLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [interpText]);

  useEffect(() => {
    onTextChange?.(interpText);
  }, [interpText, onTextChange]);

  const buildRequest = useCallback((): MonthlyCalendarRequest | null => {
    if (!birthData) return null;
    return {
      ...birthData,
      calendar_year: calYear,
      calendar_month: calMonth,
    };
  }, [birthData, calYear, calMonth]);

  async function handleCalculate() {
    const req = buildRequest();
    if (!req) return;
    setLoading(true);
    setError(null);
    setCalData(null);
    setSelectedDay(null);
    setInterpText("");
    setCollapsedSections(new Set());
    try {
      const data = await fetchMonthlyCalendar(req);
      setCalData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("calendar.error"));
    } finally {
      setLoading(false);
    }
  }

  function handleInterpret() {
    const req = buildRequest();
    if (!req) return;
    cancelRef.current?.();
    setInterpText("");
    setError(null);
    setInterpLoading(true);
    setCopied(false);
    setCollapsedSections(new Set());

    if (hasApiKey) {
      cancelRef.current = streamMonthlyInterpretation(
        req,
        (chunk) => setInterpText((prev) => prev + chunk),
        () => setInterpLoading(false),
      );
    } else {
      generateMonthlyPrompt(req)
        .then((prompt) => setInterpText(prompt))
        .catch((e) =>
          setError(e instanceof Error ? e.message : t("common.promptError")),
        )
        .finally(() => setInterpLoading(false));
    }
  }

  function handleCancel() {
    cancelRef.current?.();
    cancelRef.current = null;
    setInterpLoading(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(interpText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  function prevMonth() {
    if (calMonth === 1) { setCalYear(calYear - 1); setCalMonth(12); }
    else setCalMonth(calMonth - 1);
  }

  function nextMonth() {
    if (calMonth === 12) { setCalYear(calYear + 1); setCalMonth(1); }
    else setCalMonth(calMonth + 1);
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
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="text-indigo-300 font-semibold">{children}</strong>,
    blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote className="border-l-2 border-indigo-500 pl-3 text-gray-400 italic my-2">{children}</blockquote>,
  };

  // 選択日のイベント一覧
  const selectedDayEvents: CalendarEvent[] = useMemo(() => {
    if (!calData || selectedDay === null) return [];
    const dayData = calData.days.find((d) => d.day === selectedDay);
    return dayData?.events || [];
  }, [calData, selectedDay]);

  const isPromptMode = !hasApiKey;
  const btnClass = "rounded px-3 py-1.5 text-sm text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-200 mb-3">{t("calendar.title")}</h2>

      {/* 月ナビゲーション + 計算ボタン */}
      <div className="flex gap-2 mb-3 items-center">
        <button type="button" onClick={prevMonth}
          className="rounded bg-gray-800 px-2 py-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors">
          &lt;
        </button>
        <span className="flex-1 text-center font-medium text-gray-200">
          {t("calendar.yearMonth", { year: calYear, month: calMonth })}
        </span>
        <button type="button" onClick={nextMonth}
          className="rounded bg-gray-800 px-2 py-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors">
          &gt;
        </button>
        <button type="button" onClick={handleCalculate}
          disabled={!birthData || loading}
          className={`${btnClass} bg-indigo-600 hover:bg-indigo-500`}>
          {loading ? t("common.calculating") : t("common.calculate")}
        </button>
      </div>

      {error && (
        <div className="mb-2 rounded bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* カレンダーグリッド */}
      {calData && (
        <div className="mb-3">
          <div className="grid grid-cols-7 gap-px text-xs text-center mb-1">
            {WEEKDAY_LABELS.map((wd, i) => (
              <div key={wd} className={`py-0.5 font-medium ${i === 5 ? "text-blue-400" : i === 6 ? "text-red-400" : "text-gray-500"}`}>
                {wd}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {/* 先頭の空セル */}
            {Array.from({ length: calData.first_weekday }, (_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}
            {/* 日セル */}
            {calData.days.map((dayData) => {
              const hasEvents = dayData.events.length > 0;
              const isSelected = selectedDay === dayData.day;
              const wd = dayData.weekday;
              return (
                <button
                  key={dayData.day}
                  type="button"
                  onClick={() => setSelectedDay(isSelected ? null : dayData.day)}
                  className={`h-10 rounded text-xs relative transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : hasEvents
                        ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                        : "hover:bg-gray-800/50 text-gray-400"
                  } ${wd === 5 ? "text-blue-400" : ""} ${wd === 6 ? "text-red-400" : ""}`}
                >
                  <span className={isSelected ? "text-white" : ""}>{dayData.day}</span>
                  {hasEvents && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayData.events.slice(0, 3).map((ev, i) => (
                        <span key={i} className={`w-1 h-1 rounded-full ${
                          ev.type === "new_moon" || ev.type === "full_moon" ? "bg-amber-400"
                          : ev.type === "natal_aspect" ? "bg-pink-400"
                          : ev.type === "retrograde" || ev.type === "direct" ? "bg-red-400"
                          : "bg-indigo-400"
                        }`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 選択日のイベント詳細 */}
      {selectedDay !== null && (
        <div className="mb-3 rounded bg-gray-800/50 border border-gray-700 p-2">
          <div className="text-xs font-medium text-gray-400 mb-1.5">
            {t("calendar.monthEvents", { month: calMonth, day: selectedDay })}
          </div>
          {selectedDayEvents.length > 0 ? (
            <div className="space-y-1">
              {selectedDayEvents.map((ev, i) => (
                <div key={i} className={`rounded px-2 py-1 text-xs ${EVENT_COLORS[ev.type] || "bg-gray-700 text-gray-200"}`}>
                  <span className="mr-1">{EVENT_ICONS[ev.type] || ""}</span>
                  {ev.description}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500">{t("calendar.noEvents")}</div>
          )}
        </div>
      )}

      {/* 月間AI解釈 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{isPromptMode ? t("common.aiPrompt") : t("calendar.monthlyFocus")}</span>
        <div className="flex gap-2">
          {interpText && !interpLoading && (
            <button type="button" onClick={handleCopy}
              className="rounded bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600 transition-colors">
              {copied ? t("common.copied") : t("common.copy")}
            </button>
          )}
          {interpLoading && hasApiKey ? (
            <button type="button" onClick={handleCancel}
              className={`${btnClass} bg-red-700 hover:bg-red-600`}>
              {t("common.cancel")}
            </button>
          ) : (
            <button type="button" onClick={handleInterpret}
              disabled={!birthData || !calData || interpLoading}
              className={`${btnClass} bg-indigo-600 hover:bg-indigo-500`}>
              {isPromptMode ? t("common.generatePrompt") : t("calendar.generateFocus")}
            </button>
          )}
        </div>
      </div>

      {isPromptMode && !interpText && !interpLoading && calData && (
        <div className="mb-2 rounded bg-amber-900/30 border border-amber-700 px-3 py-2 text-xs text-amber-300">
          {t("common.noApiKeyMessage")}
        </div>
      )}

      <div
        ref={textRef}
        className="flex-1 overflow-auto rounded bg-gray-800/50 border border-gray-700 p-4 text-sm text-gray-200 leading-relaxed"
      >
        {interpText ? (
          <>
            {isPromptMode ? (
              <pre className="whitespace-pre-wrap font-mono text-xs">{interpText}</pre>
            ) : hasSections ? (
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
            {interpLoading && <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-400 animate-pulse" />}
          </>
        ) : (
          <p className="text-gray-500">
            {calData
              ? isPromptMode
                ? t("calendar.promptHelp")
                : t("calendar.aiHelp")
              : birthData
                ? t("calendar.calcHelp")
                : t("common.noChartFirst")}
          </p>
        )}
      </div>
    </div>
  );
}
