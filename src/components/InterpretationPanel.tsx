import { useState, useRef, useEffect, useMemo } from "react";
import Markdown from "react-markdown";
import { streamInterpretation, generatePrompt, BirthData } from "../lib/api";

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
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
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

export default function InterpretationPanel({ birthData, hasApiKey, onTextChange }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [text]);

  useEffect(() => {
    onTextChange?.(text);
  }, [text, onTextChange]);

  function handleGenerate() {
    if (!birthData) return;
    cancelRef.current?.();
    setText("");
    setError(null);
    setCopied(false);
    setLoading(true);

    if (hasApiKey) {
      cancelRef.current = streamInterpretation(
        birthData,
        (chunk) => setText((prev) => prev + chunk),
        () => setLoading(false),
      );
    } else {
      generatePrompt(birthData)
        .then((prompt) => setText(prompt))
        .catch((e) =>
          setError(e instanceof Error ? e.message : "プロンプト生成に失敗しました。"),
        )
        .finally(() => setLoading(false));
    }
  }

  function handleCancel() {
    cancelRef.current?.();
    cancelRef.current = null;
    setLoading(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  const sections = useMemo(() => splitSections(text), [text]);
  const hasSections = !loading && sections.length > 1 && sections.some((s) => s.heading);

  function toggleSection(idx: number) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  // Reset collapsed state when new generation starts
  useEffect(() => {
    if (loading) setCollapsedSections(new Set());
  }, [loading]);

  const isPromptMode = !hasApiKey;
  const buttonLabel = isPromptMode ? "プロンプトを生成" : "解釈を生成";
  const panelTitle = isPromptMode ? "AI プロンプト" : "AI 解釈";

  const mdComponents = {
    h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-xl font-bold text-gray-100 mt-4 mb-2">{children}</h1>,
    h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-lg font-bold text-gray-200 mt-4 mb-2">{children}</h2>,
    h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-base font-semibold text-gray-200 mt-3 mb-1">{children}</h3>,
    hr: () => <hr className="border-gray-700 my-3" />,
    p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2">{children}</p>,
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="text-indigo-300 font-semibold">{children}</strong>,
    blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote className="border-l-2 border-indigo-500 pl-3 text-gray-400 italic my-2">{children}</blockquote>,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-200">{panelTitle}</h2>
        <div className="flex gap-2">
          {text && !loading && (
            <button
              type="button"
              onClick={handleCopy}
              className="rounded bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600 transition-colors"
            >
              {copied ? "コピー済み" : "コピー"}
            </button>
          )}
          {loading && hasApiKey ? (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition-colors"
            >
              中止
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!birthData || loading}
              className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>

      {isPromptMode && !text && !loading && (
        <div className="mb-2 rounded bg-amber-900/30 border border-amber-700 px-3 py-2 text-xs text-amber-300">
          APIキー未設定のため、プロンプト生成モードです。生成されたテキストをお使いのAIにコピー＆ペーストしてください。
          ヘッダーの設定ボタンからAPIキーを登録するとAI自動解釈が利用できます。
        </div>
      )}

      {error && (
        <div className="mb-2 rounded bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div
        ref={textRef}
        className="flex-1 overflow-auto rounded bg-gray-800/50 border border-gray-700 p-4 text-sm text-gray-200 leading-relaxed"
      >
        {text ? (
          <>
            {isPromptMode ? (
              <pre className="whitespace-pre-wrap font-mono text-xs">{text}</pre>
            ) : hasSections ? (
              <div className="space-y-1">
                {sections.map((sec, idx) => {
                  const isCollapsed = collapsedSections.has(idx);
                  if (!sec.heading) {
                    return (
                      <div key={idx}>
                        <Markdown components={mdComponents}>{sec.body}</Markdown>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="border border-gray-700 rounded">
                      <button
                        type="button"
                        onClick={() => toggleSection(idx)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-200 font-semibold hover:bg-gray-700/50 transition-colors"
                      >
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
              <Markdown components={mdComponents}>{text}</Markdown>
            )}
            {loading && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-400 animate-pulse" />
            )}
          </>
        ) : (
          <p className="text-gray-500">
            {birthData
              ? isPromptMode
                ? "「プロンプトを生成」ボタンを押すと、AIに渡すテキストが生成されます。"
                : "「解釈を生成」ボタンを押すと、Claude AIによる解釈が表示されます。"
              : "まず出生データを入力してチャートを作成してください。"}
          </p>
        )}
      </div>
    </div>
  );
}
