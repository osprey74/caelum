import { useState } from "react";
import { useSidecarReady } from "./hooks/useChart";
import { fetchChart, BirthData } from "./lib/api";
import BirthDataForm from "./components/BirthDataForm";
import ChartWheel from "./components/ChartWheel";
import PlanetTable from "./components/PlanetTable";
import InterpretationPanel from "./components/InterpretationPanel";
import { ChartResponse } from "./types/astrology";

function App() {
  const ready = useSidecarReady();
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3">
        <h1 className="text-xl font-bold tracking-wide">
          Liber Caeli
          <span className="text-sm font-normal text-gray-500 ml-2">天空の書</span>
        </h1>
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
          <InterpretationPanel birthData={birthData} />
        </aside>
      </div>
    </div>
  );
}

export default App;
