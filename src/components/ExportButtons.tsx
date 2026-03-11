import { useState } from "react";
import { exportSvg, exportPng, exportPdf } from "../lib/export";
import type { ChartWheelHandle } from "./ChartWheel";

interface Props {
  chartRef: React.RefObject<ChartWheelHandle | null>;
  subjectName: string;
  interpretationText: string;
}

export default function ExportButtons({ chartRef, subjectName, interpretationText }: Props) {
  const [exporting, setExporting] = useState(false);

  function getSvg(): SVGSVGElement | null {
    return chartRef.current?.getSvgElement() ?? null;
  }

  async function handleSvg() {
    const svg = getSvg();
    if (!svg) return;
    const filename = `${subjectName || "chart"}_natal.svg`;
    exportSvg(svg, filename);
  }

  async function handlePng() {
    const svg = getSvg();
    if (!svg) return;
    setExporting(true);
    try {
      const filename = `${subjectName || "chart"}_natal.png`;
      await exportPng(svg, filename);
    } finally {
      setExporting(false);
    }
  }

  async function handlePdf() {
    const svg = getSvg();
    if (!svg) return;
    setExporting(true);
    try {
      const filename = `${subjectName || "chart"}_report.pdf`;
      await exportPdf(svg, subjectName, interpretationText, filename);
    } finally {
      setExporting(false);
    }
  }

  const btnClass =
    "rounded bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex gap-2 items-center">
      <span className="text-xs text-gray-500">エクスポート:</span>
      <button type="button" onClick={handleSvg} disabled={exporting} className={btnClass}>
        SVG
      </button>
      <button type="button" onClick={handlePng} disabled={exporting} className={btnClass}>
        PNG
      </button>
      <button type="button" onClick={handlePdf} disabled={exporting} className={btnClass}>
        PDF
      </button>
    </div>
  );
}
