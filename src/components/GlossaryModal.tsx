import type { GlossaryEntry } from "../data/glossary";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

interface Props {
  entry: GlossaryEntry;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  planet: "text-indigo-400",
  sign: "text-amber-400",
  house: "text-emerald-400",
  aspect: "text-pink-400",
};

const CATEGORY_BORDER: Record<string, string> = {
  planet: "border-indigo-500/30",
  sign: "border-amber-500/30",
  house: "border-emerald-500/30",
  aspect: "border-pink-500/30",
};

export default function GlossaryModal({ entry, onClose }: Props) {
  const { t } = useTranslation();
  const isEn = i18n.language === "en";
  const displayName = isEn && entry.nameEn ? entry.nameEn : entry.name;
  const displaySummary = isEn && entry.summaryEn ? entry.summaryEn : entry.summary;
  const displayDescription = isEn && entry.descriptionEn ? entry.descriptionEn : entry.description;

  const CATEGORY_LABELS: Record<string, string> = {
    planet: t("glossary.planet"),
    sign: t("glossary.sign"),
    house: t("glossary.house"),
    aspect: t("glossary.aspect"),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className={`w-[26rem] max-h-[80vh] overflow-auto rounded-lg bg-gray-900 border ${CATEGORY_BORDER[entry.category]} p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{entry.symbol}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-100">{displayName}</h3>
              <span className={`text-xs font-medium ${CATEGORY_COLORS[entry.category]}`}>
                {CATEGORY_LABELS[entry.category]}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Summary */}
        <div className="mb-3 rounded bg-gray-800/60 px-3 py-2 text-sm text-gray-300">
          {displaySummary}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-200 leading-relaxed">
          {displayDescription}
        </p>

        {/* Close button */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-700 px-4 py-1.5 text-sm text-gray-300 hover:bg-gray-600 transition-colors"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
