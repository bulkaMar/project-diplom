'use client';
import { useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'uk' | 'en';

interface LangState {
    lang: Lang;
    setLang: (lang: Lang) => void;
}

// Interface language. Course content from the database is not translated.
// skipHydration: the server always renders 'uk'; the saved choice is applied after mount
// (see MainLayoutWrapper).
export const useLang = create<LangState>()(
    persist(
        (set) => ({
            lang: 'uk',
            setLang: (lang) => set({ lang }),
        }),
        { name: 'lang', skipHydration: true }
    )
);

/** Returns `tr(uk, en)` — picks the string for the current language. */
export function useT() {
    const lang = useLang((s) => s.lang);
    return useCallback((uk: string, en: string) => (lang === 'en' ? en : uk), [lang]);
}

/** Locale for toLocaleDateString / Intl. */
export function useLocale() {
    return useLang((s) => (s.lang === 'en' ? 'en-GB' : 'uk-UA'));
}
