'use client'
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'
import { useConfirm } from '@/contexts/ConfirmDialogContext'
import { getTranslations } from '@/lib/i18n/translations'
import toast from 'react-hot-toast'

const LangContext = createContext({
  lang: 'id',
  t: getTranslations('id'),
  toggleLang: () => {},
})

const langListeners = new Set()

function getLanguage() {
  if (typeof window === 'undefined') return 'id'
  const saved = window.localStorage.getItem('railhub-language')
  if (saved === 'id' || saved === 'en') return saved
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
  return languages.some(value => value?.toLowerCase().startsWith('id')) ? 'id' : 'en'
}

function subscribeLanguage(listener) {
  langListeners.add(listener)
  const onStorage = () => listener()
  const onCustom = () => listener()
  window.addEventListener('storage', onStorage)
  window.addEventListener('railhub-lang-change', onCustom)
  return () => {
    langListeners.delete(listener)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('railhub-lang-change', onCustom)
  }
}

export function LangProvider({ children }) {
  const { confirm } = useConfirm()
  const lang = useSyncExternalStore(subscribeLanguage, getLanguage, () => 'id')
  const t = getTranslations(lang)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.cookie = `railhub-lang=${lang}; path=/; max-age=31536000; SameSite=Lax`
    }
  }, [lang])

  const toggleLang = useCallback(async () => {
    const currentLang = getLanguage()
    const nextLang = currentLang === 'id' ? 'en' : 'id'
    const targetLabel = nextLang === 'en' ? 'Bahasa Inggris (English)' : 'Bahasa Indonesia'
    
    const ok = await confirm({
      title: currentLang === 'id' ? 'Ubah Bahasa Tampilan' : 'Change Display Language',
      message: currentLang === 'id'
        ? `Apakah Anda yakin ingin mengubah bahasa tampilan ke ${targetLabel}?`
        : `Are you sure you want to change the display language to ${targetLabel}?`,
      confirmText: currentLang === 'id' ? 'Ganti Bahasa' : 'Switch Language',
      cancelText: currentLang === 'id' ? 'Batal' : 'Cancel',
      variant: 'globe',
    })

    if (ok) {
      window.localStorage.setItem('railhub-language', nextLang)
      document.cookie = `railhub-lang=${nextLang}; path=/; max-age=31536000; SameSite=Lax`
      document.documentElement.lang = nextLang
      langListeners.forEach(listener => listener())
      window.dispatchEvent(new Event('railhub-lang-change'))
      toast.success(nextLang === 'en' ? 'Language switched to English' : 'Bahasa berhasil diubah ke Bahasa Indonesia')
    }
  }, [confirm])

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
