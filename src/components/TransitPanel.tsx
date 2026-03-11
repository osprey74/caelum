import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { fetchTransit, streamTransitInterpretation, generateTransitPrompt, BirthData } from "../lib/api";
import type { DualChartResponse, TransitRequest } from "../types/astrology";

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
  onTransitData: (data: DualChartResponse | null) => void;
  onTextChange?: (text: string) => void;
  onTransitDateChange?: (date: string) => void;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TransitPanel({ birthData, hasApiKey, onTransitData, onTextChange, onTransitDateChange }: Props) {
  const { t } = useTranslation();
  const [transitDate, setTransitDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [interpText, setInterpText] = useState("");
  const [interpLoading, setInterpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    onTransitDateChange?.(transitDate);
  }, [transitDate, onTransitDateChange]);

  function buildTransitRequest(): TransitRequest | null {
    if (!birthData) return null;
    const [y, m, d] = transitDate.split("-").map(Number);
    if (!y || !m || !d) return null;
    return {
      ...birthData,
      transit_year: y,
      transit_month: m,
      transit_day: d,
      transit_hour: 12,
      transit_minute: 0,
    };
  }

  async function handleCalculate() {
    const req = buildTransitRequest();
    if (!req) return;
    setLoading(true);
    setError(null);
    setInterpText("");
    setCollapsedSections(new Set());
    try {
      const data = await fetchTransit(req);
      onTransitData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("transit.error"));
      onTransitData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleInterpret() {
    const req = buildTransitRequest();
    if (!req) return;
    cancelRef.current?.();
    setInterpText("");
    setError(null);
    setInterpLoading(true);
    setCopied(false);
    setCollapsedSections(new Set());

    if (hasApiKey) {
      cancelRef.current = streamTransitInterpretation(
        req,
        (chunk) => setInterpText((prev) => prev + chunk),
        () => setInterpLoading(false),
      );
    } else {
      generateTransitPrompt(req)
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

  const isPromptMode = !hasApiKey;
  const btnClass = "rounded px-3 py-1.5 text-sm text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-200 mb-3">{t("transit.title")}</h2>

      {/* 日付ピッカー + 計算ボタン */}
      <div className="flex gap-2 mb-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">{t("transit.dateLabel")}</label>
          <input
            type="date"
            lang="en"
            value={transitDate}
            onChange={(e) => setTransitDate(e.target.value)}
            className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500 text-sm"
            disabled={loading}
          />
        </div>
        <button
          type="button"
          onClick={handleCalculate}
          disabled={!birthData || loading}
          className={`${btnClass} bg-indigo-600 hover:bg-indigo-500`}
        >
          {loading ? t("common.calculating") : t("common.calculate")}
        </button>
      </div>

      {error && (
        <div className="mb-2 rounded bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* トランジット解釈 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{isPromptMode ? t("common.aiPrompt") : t("common.aiInterpretation")}</span>
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
              disabled={!birthData || interpLoading}
              className={`${btnClass} bg-indigo-600 hover:bg-indigo-500`}>
              {isPromptMode ? t("common.generatePrompt") : t("common.generateInterpretation")}
            </button>
          )}
        </div>
      </div>

      {isPromptMode && !interpText && !interpLoading && (
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
            {birthData
              ? isPromptMode
                ? t("transit.promptHelp")
                : t("transit.aiHelp")
              : t("common.noChartFirst")}
          </p>
        )}
      </div>
    </div>
  );
}
