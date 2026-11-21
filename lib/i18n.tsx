"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Dict, type Lang } from "./dictionary";

type I18nValue = { lang: Lang; t: Dict; setLang: (l: Lang) => void; toggle: () => void };

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "sysupe013cm.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ro");

  // Restore a previously chosen language after hydration (default stays RO).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ro") setLangState(saved);
    } catch {
      /* storage unavailable – keep RO */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => setLang(lang === "ro" ? "en" : "ro"), [lang, setLang]);

  const value = useMemo(() => ({ lang, t: dictionaries[lang], setLang, toggle }), [lang, setLang, toggle]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
