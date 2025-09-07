import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";
import { de } from "./dictionaries/de";
import { it } from "./dictionaries/it";

type Locale = "en" | "fr" | "de" | "it";
const DICTS = { en, fr, de, it } as const;

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);
const STORAGE_KEY = "engagepods-locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && DICTS[saved]) return saved;
    const nav = navigator.language.slice(0,2) as Locale;
    return (DICTS[nav] ? nav : "fr");
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, locale); document.documentElement.lang = locale; }, [locale]);

  const t = useMemo(() => (path: string) => {
    const parts = path.split(".");
    let cur: any = DICTS[locale];
    for (const p of parts) cur = cur?.[p];
    return (typeof cur === "string" ? cur : path);
  }, [locale]);

  const setLocale = (l: Locale) => setLocaleState(l);

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
