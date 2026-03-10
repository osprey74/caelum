import { useState, useEffect } from "react";
import { useSidecarReady } from "./hooks/useChart";
import { fetchChart, fetchApiKeyStatus, BirthData } from "./lib/api";
import BirthDataForm from "./components/BirthDataForm";
import ChartWheel from "./components/ChartWheel";
import PlanetTable from "./components/PlanetTable";
import InterpretationPanel from "./components/InterpretationPanel";
import ApiKeyDialog from "./components/ApiKeyDialog";
import { ChartResponse } from "./types/astrology";

function App() {
  const ready = useSidecarReady();
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (ready) {
      fetchApiKeyStatus().then(setHasApiKey).catch(() => {});
    }
  }, [ready]);

  async function handleSubmit(data: BirthData) {
    setLoading(true);
    setError(null);
    setBirthData(data);
    try {
      const result = await fetchChart(data);
      setChartData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "チャートの生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p>サイドカーに接続中...</p>
          <p className="text-xs mt-1 text-gray-600">
            サイドカーを手動起動: cd sidecar && uvicorn main:app --port 8765
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide">
          Liber Caeli
          <span className="text-sm font-normal text-gray-500 ml-2">天空の書</span>
        </h1>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-1.5 rounded bg-gray-800 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
          title="APIキー設定"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.993 6.993 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
          </svg>
          {hasApiKey ? "APIキー設定済み" : "APIキー未設定"}
        </button>
      </header>

      <div className="flex h-[calc(100vh-53px)]">
        {/* Left sidebar: Form */}
        <aside className="w-80 shrink-0 border-r border-gray-800 p-4 overflow-auto">
          <BirthDataForm onSubmit={handleSubmit} disabled={loading} />
        </aside>

        {/* Main: Chart + Table */}
        <main className="flex-1 overflow-auto p-4">
          {error && (
            <div className="mb-4 rounded bg-red-900/40 border border-red-700 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          )}

          {chartData && !loading && (
            <div className="space-y-6">
              <ChartWheel data={chartData} size={540} />
              <PlanetTable data={chartData} />
            </div>
          )}

          {!chartData && !loading && (
            <div className="flex items-center justify-center py-20 text-gray-600">
              出生データを入力してチャートを作成してください
            </div>
          )}
        </main>

        {/* Right sidebar: Interpretation */}
        <aside className="w-96 shrink-0 border-l border-gray-800 p-4">
          <InterpretationPanel birthData={birthData} hasApiKey={hasApiKey} />
        </aside>
      </div>

      {/* Settings Dialog */}
      {showSettings && (
        <ApiKeyDialog
          hasKey={hasApiKey}
          onClose={() => setShowSettings(false)}
          onUpdate={setHasApiKey}
        />
      )}
    </div>
  );
}

export default App;
