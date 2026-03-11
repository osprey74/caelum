import { jsPDF } from "jspdf";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function serializeSvg(svgEl: SVGSVGElement): string {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(clone);
}

/** SVGファイルとしてダウンロード */
export function exportSvg(svgEl: SVGSVGElement, filename = "chart.svg") {
  const svgString = serializeSvg(svgEl);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}

/** SVGをCanvasに描画してPNG Blobを返す */
function svgToCanvas(svgEl: SVGSVGElement, scale = 2): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const svgString = serializeSvg(svgEl);
    const width = svgEl.width.baseVal.value;
    const height = svgEl.height.baseVal.value;

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    const img = new Image();
    img.onload = () => {
      // 背景を暗色で塗りつぶし
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  });
}

/** PNGファイルとしてダウンロード */
export async function exportPng(svgEl: SVGSVGElement, filename = "chart.png") {
  const canvas = await svgToCanvas(svgEl);
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename);
  }, "image/png");
}

/** PDFレポートとしてダウンロード（チャート画像 + 解釈テキスト） */
export async function exportPdf(
  svgEl: SVGSVGElement,
  subjectName: string,
  interpretationText: string,
  filename = "chart-report.pdf",
) {
  const canvas = await svgToCanvas(svgEl, 2);
  const chartDataUrl = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // タイトル
  pdf.setFontSize(18);
  pdf.setTextColor(40, 40, 80);
  pdf.text("Liber Caeli", margin, 20);
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Natal Chart Report - ${subjectName}`, margin, 28);

  // チャート画像（中央配置）
  const chartSize = Math.min(contentWidth, 140);
  const chartX = (pageWidth - chartSize) / 2;
  pdf.addImage(chartDataUrl, "PNG", chartX, 35, chartSize, chartSize);

  // 解釈テキスト
  let y = 35 + chartSize + 10;

  if (interpretationText) {
    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);

    // Markdownの記号を除去してプレーンテキスト化
    const plainText = interpretationText
      .replace(/^#{1,3}\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1");

    const lines = pdf.splitTextToSize(plainText, contentWidth);

    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += 5;
    }
  }

  pdf.save(filename);
}
