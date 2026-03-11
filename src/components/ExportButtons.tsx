import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { exportSvg, exportPng, exportPdf } from "../lib/export";
import type { ChartWheelHandle } from "./ChartWheel";

interface Props {
  chartRef: React.RefObject<ChartWheelHandle | null>;
  subjectName: string;
  fileBaseName: string;
  interpretationText: string;
}

export default function ExportButtons({ chartRef, subjectName, fileBaseName, interpretationText }: Props) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function getSvg(): SVGSVGElement | null {
    return chartRef.current?.getSvgElement() ?? null;
  }

  async function handleSvg() {
    const svg = getSvg();
    if (!svg) return;
    exportSvg(svg, `${fileBaseName}.svg`);
    setToast(t("export.svgDone"));
  }

  async function handlePng() {
    const svg = getSvg();
    if (!svg) return;
    setExporting(true);
    try {
      await exportPng(svg, `${fileBaseName}.png`);
      setToast(t("export.pngDone"));
    } finally {
      setExporting(false);
    }
  }

  async function handlePdf() {
    const svg = getSvg();
    if (!svg) return;
    setExporting(true);
    try {
      await exportPdf(svg, subjectName, interpretationText, `${fileBaseName}.pdf`, t("pdf.reportTitle"));
      setToast(t("export.pdfDone"));
    } finally {
      setExporting(false);
    }
  }

  const btnClass =
    "rounded bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="relative flex gap-2 items-center">
      <span className="text-xs text-gray-500">{t("export.label")}</span>
      <button type="button" onClick={handleSvg} disabled={exporting} className={btnClass}>
        SVG
      </button>
      <button type="button" onClick={handlePng} disabled={exporting} className={btnClass}>
        PNG
      </button>
      <button type="button" onClick={handlePdf} disabled={exporting} className={btnClass}>
        PDF
      </button>
      {toast && (
        <div className="absolute left-0 -top-10 bg-green-800/90 border border-green-600 text-green-100 text-sm px-3 py-1.5 rounded shadow-lg animate-fade-in-out whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
