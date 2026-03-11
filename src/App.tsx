import { useState, useEffect, useRef, useCallback } from "react";
import { useSidecarReady } from "./hooks/useChart";
import { fetchChart, fetchApiKeyStatus, BirthData } from "./lib/api";
import BirthDataForm from "./components/BirthDataForm";
import ProfileList from "./components/ProfileList";
import ChartWheel, { ChartWheelHandle } from "./components/ChartWheel";
import PlanetTable from "./components/PlanetTable";
import InterpretationPanel from "./components/InterpretationPanel";
import TransitPanel from "./components/TransitPanel";
import ExportButtons from "./components/ExportButtons";
import ApiKeyDialog from "./components/ApiKeyDialog";
import { ChartResponse, DualChartResponse } from "./types/astrology";

type RightTab = "interpretation" | "transit";

function App() {
  const ready = useSidecarReady();
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formInitialData, setFormInitialData] = useState<BirthData | null>(null);
  const [interpretationText, setInterpretationText] = useState("");
  const [transitData, setTransitData] = useState<DualChartResponse | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>("interpretation");
  const chartRef = useRef<ChartWheelHandle>(null);

  const handleInterpretationTextChange = useCallback((text: string) => {
    setInterpretationText(text);
  }, []);

  useEffect(() => {
    if (ready) {
      fetchApiKeyStatus().then(setHasApiKey).catch(() => {});
    }
  }, [ready]);

  async function handleSubmit(data: BirthData) {
    setLoading(true);
    setError(null);
    setBirthData(data);
    setTransitData(null);
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

  const tabBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded-t transition-colors ${
      active
        ? "bg-gray-800 text-gray-100 border-b-2 border-indigo-500"
        : "text-gray-500 hover:text-gray-300"
    }`;

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
        {/* Left sidebar: Profiles + Form */}
        <aside className="w-80 shrink-0 border-r border-gray-800 p-4 overflow-auto">
          <ProfileList
            onSelect={setFormInitialData}
            currentBirthData={birthData}
            disabled={loading}
          />
          <BirthDataForm
            onSubmit={handleSubmit}
            disabled={loading}
            initialData={formInitialData}
          />
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
              <ChartWheel ref={chartRef} data={chartData} transitData={transitData} size={540} />
              <ExportButtons
                chartRef={chartRef}
                subjectName={chartData.subject.name}
                interpretationText={interpretationText}
              />
              <PlanetTable data={chartData} />
            </div>
          )}

          {!chartData && !loading && (
            <div className="flex items-center justify-center py-20 text-gray-600">
              出生データを入力してチャートを作成してください
            </div>
          )}
        </main>

        {/* Right sidebar: Interpretation / Transit tabs */}
        <aside className="w-96 shrink-0 border-l border-gray-800 flex flex-col">
          <div className="flex gap-1 px-4 pt-3 border-b border-gray-800">
            <button type="button" onClick={() => setRightTab("interpretation")}
              className={tabBtnClass(rightTab === "interpretation")}>
              ネイタル解釈
            </button>
            <button type="button" onClick={() => setRightTab("transit")}
              className={tabBtnClass(rightTab === "transit")}>
              トランジット
            </button>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            {rightTab === "interpretation" ? (
              <InterpretationPanel
                birthData={birthData}
                hasApiKey={hasApiKey}
                onTextChange={handleInterpretationTextChange}
              />
            ) : (
              <TransitPanel
                birthData={birthData}
                hasApiKey={hasApiKey}
                onTransitData={setTransitData}
              />
            )}
          </div>
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
