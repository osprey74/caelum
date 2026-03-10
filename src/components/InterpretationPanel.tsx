import { useState, useRef, useEffect } from "react";
import { streamInterpretation, BirthData } from "../lib/api";

interface Props {
  birthData: BirthData | null;
}

export default function InterpretationPanel({ birthData }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom as text streams in
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [text]);

  function handleGenerate() {
    if (!birthData) return;

    // Cancel previous stream
    cancelRef.current?.();

    setText("");
    setError(null);
    setLoading(true);

    cancelRef.current = streamInterpretation(
      birthData,
      (chunk) => setText((prev) => prev + chunk),
      () => setLoading(false),
    );
  }

  function handleCancel() {
    cancelRef.current?.();
    cancelRef.current = null;
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-200">AI 解釈</h2>
        <div className="flex gap-2">
          {loading ? (
            <button
              onClick={handleCancel}
              className="rounded bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition-colors"
            >
              中止
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!birthData}
              className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              解釈を生成
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-2 rounded bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div
        ref={textRef}
        className="flex-1 overflow-auto rounded bg-gray-800/50 border border-gray-700 p-4 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap"
      >
        {text ? (
          <>
            {text}
            {loading && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-400 animate-pulse" />
            )}
          </>
        ) : (
          <p className="text-gray-500">
            {birthData
              ? "「解釈を生成」ボタンを押すと、Claude AIによる解釈が表示されます。"
              : "まず出生データを入力してチャートを作成してください。"}
          </p>
        )}
      </div>
    </div>
  );
}
