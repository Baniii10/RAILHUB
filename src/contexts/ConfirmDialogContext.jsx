'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import RailConfirmDialog from '@/components/ui/RailConfirmDialog'

const ConfirmDialogContext = createContext({
  confirm: async () => false,
  alert: async () => {},
})

export function ConfirmDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Konfirmasi',
    cancelText: 'Batal',
    variant: 'primary',
    icon: null,
    isAlert: false,
  })

  const resolverRef = useRef(null)

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setDialogState({
        isOpen: true,
        title: options.title || 'Konfirmasi Tindakan',
        message: options.message || 'Apakah Anda yakin ingin melanjutkan?',
        confirmText: options.confirmText || 'Konfirmasi',
        cancelText: options.cancelText || 'Batal',
        variant: options.variant || 'primary',
        icon: options.icon || null,
        isAlert: false,
      })
    })
  }, [])

  const alert = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setDialogState({
        isOpen: true,
        title: options.title || 'Pemberitahuan',
        message: typeof options === 'string' ? options : options.message || '',
        confirmText: options.confirmText || 'Mengerti',
        cancelText: '',
        variant: options.variant || 'primary',
        icon: options.icon || null,
        isAlert: true,
      })
    })
  }, [])

  // Override window.alert so that ANY third party or browser alert uses RailHub theme
  useEffect(() => {
    if (typeof window === 'undefined') return
    const originalAlert = window.alert
    window.alert = (msg) => {
      alert({ title: 'Pemberitahuan RailHub', message: String(msg) })
    }
    return () => {
      window.alert = originalAlert
    }
  }, [alert])

  const handleConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }))
    if (resolverRef.current) {
      resolverRef.current(true)
      resolverRef.current = null
    }
  }, [])

  const handleCancel = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }))
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
  }, [])

  return (
    <ConfirmDialogContext.Provider value={{ confirm, alert }}>
      {children}
      <RailConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        icon={dialogState.icon}
        isAlert={dialogState.isAlert}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmDialogContext)
}
