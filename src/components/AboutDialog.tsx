import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { version } from "../../package.json";

const SITE_URL = "https://caeli.osprey74.com";
const REPO_URL = "https://github.com/osprey74/caelum";
const KERYKEION_URL = "https://github.com/g-battaglia/kerykeion";
const ICON_URL = "https://www.flaticon.com/free-icons/orbit";

interface Props {
  onClose: () => void;
}

/** Opens a link in the default browser (falls back to a new window outside the desktop app). */
function open(url: string) {
  openUrl(url).catch(() => window.open(url, "_blank", "noopener"));
}

/** "About this app": version, how to use it, notes, licenses and links to the site and the source. */
export default function AboutDialog({ onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const steps = t("about.steps", { returnObjects: true }) as string[];
  const link =
    "rounded border border-gray-600 px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="flex max-h-full w-[36rem] flex-col rounded-lg border border-gray-700 bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-800 px-6 pb-4 pt-5">
          <div>
            <h2 id="about-title" className="text-xl font-bold tracking-wide">
              Liber Caeli
              <span className="ml-2 text-sm font-normal text-gray-500">{t("app.subtitle")}</span>
            </h2>
            <p className="mt-1 text-sm text-gray-400">{t("about.version", { version })}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("about.close")}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-gray-300">
          <section className="space-y-2">
            <h3 className="font-semibold text-indigo-300">{t("about.howTo")}</h3>
            <ol className="list-decimal space-y-1 pl-5">
              {steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="text-gray-400">{t("about.storage")}</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-indigo-300">{t("about.notesTitle")}</h3>
            <p>{t("about.notes")}</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-indigo-300">{t("about.licenseTitle")}</h3>
            <ul className="space-y-1">
              <li>{t("about.licenseCode")}</li>
              <li>
                {t("about.licenseAgpl")}{" "}
                <button type="button" onClick={() => open(KERYKEION_URL)} className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200">
                  kerykeion
                </button>
              </li>
              <li>
                <button type="button" onClick={() => open(ICON_URL)} className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200">
                  Orbit icons created by Eucalyp - Flaticon
                </button>
              </li>
            </ul>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-800 px-6 py-4">
          <button
            type="button"
            onClick={() => open(SITE_URL)}
            className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            {t("about.site")}
          </button>
          <button type="button" onClick={() => open(REPO_URL)} className={link}>
            GitHub
          </button>
          <button type="button" onClick={() => open(`${REPO_URL}/releases`)} className={link}>
            {t("about.releases")}
          </button>
          <span className="ml-auto text-xs text-gray-500">© 2026 osprey74</span>
        </div>
      </div>
    </div>
  );
}
