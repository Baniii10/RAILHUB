'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { getTranslations } from '@/lib/i18n/translations'

const LangContext = createContext({
  lang: 'id',
  t: getTranslations('id'),
  toggleLang: () => {},
})

export function LangProvider({ children }) {
  const [lang, setLang] = useState('id')
  const t = getTranslations(lang)

  const toggleLang = useCallback(() => {
    setLang(prev => (prev === 'id' ? 'en' : 'id'))
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
