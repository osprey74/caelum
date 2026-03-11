import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ja from "./locales/ja.json";
import en from "./locales/en.json";

const STORAGE_KEY = "liber-caeli-language";

function getSavedLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "ja";
  } catch {
    return "ja";
  }
}

i18n.use(initReactI18next).init({
  resources: { ja: { translation: ja }, en: { translation: en } },
  lng: getSavedLanguage(),
  fallbackLng: "ja",
  interpolation: { escapeValue: false },
});

export function setLanguage(lng: string) {
  i18n.changeLanguage(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // ignore
  }
}

export default i18n;
