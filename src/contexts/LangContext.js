'use client'
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'
import { getTranslations } from '@/lib/i18n/translations'

const LangContext = createContext({
  lang: 'id',
  t: getTranslations('id'),
  toggleLang: () => {},
})

const langListeners = new Set()

function getLanguage() {
  const saved = window.localStorage.getItem('railhub-language')
  if (saved === 'id' || saved === 'en') return saved
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
  return languages.some(value => value?.toLowerCase().startsWith('id')) ? 'id' : 'en'
}

function subscribeLanguage(listener) {
  langListeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    langListeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

export function LangProvider({ children }) {
  const lang = useSyncExternalStore(subscribeLanguage, getLanguage, () => 'id')
  const t = getTranslations(lang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const toggleLang = useCallback(() => {
    const next = getLanguage() === 'id' ? 'en' : 'id'
    window.localStorage.setItem('railhub-language', next)
    langListeners.forEach(listener => listener())
  }, [])

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
