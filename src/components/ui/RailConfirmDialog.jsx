'use client'

import { useEffect, useRef } from 'react'
import {
  AlertTriangle,
  HelpCircle,
  Info,
  CheckCircle2,
  Trash2,
  Globe,
  X,
} from 'lucide-react'

export default function RailConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'primary', // 'primary' | 'danger' | 'warning' | 'info' | 'globe'
  icon: CustomIcon,
  onConfirm,
  onCancel,
  isAlert = false,
}) {
  const confirmBtnRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    // Focus confirm button when dialog opens
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus()
    }, 50)

    // Handle ESC key to dismiss
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    // Lock body scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  // Variant themes
  const themeConfigs = {
    primary: {
      badgeBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      badgeBorder: '#bfdbfe',
      badgeColor: '#2563eb',
      confirmBg: 'linear-gradient(135deg, #1a428a 0%, #2563eb 100%)',
      confirmColor: '#ffffff',
      confirmHoverShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
      defaultIcon: HelpCircle,
    },
    danger: {
      badgeBg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      badgeBorder: '#fecaca',
      badgeColor: '#dc2626',
      confirmBg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      confirmColor: '#ffffff',
      confirmHoverShadow: '0 4px 16px rgba(220, 38, 38, 0.35)',
      defaultIcon: Trash2,
    },
    warning: {
      badgeBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      badgeBorder: '#fde68a',
      badgeColor: '#d97706',
      confirmBg: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)',
      confirmColor: '#ffffff',
      confirmHoverShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
      defaultIcon: AlertTriangle,
    },
    info: {
      badgeBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      badgeBorder: '#bbf7d0',
      badgeColor: '#16a34a',
      confirmBg: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
      confirmColor: '#ffffff',
      confirmHoverShadow: '0 4px 16px rgba(22, 163, 74, 0.35)',
      defaultIcon: Info,
    },
    globe: {
      badgeBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      badgeBorder: '#93c5fd',
      badgeColor: '#1d4ed8',
      confirmBg: 'linear-gradient(135deg, #1a428a 0%, #2563eb 100%)',
      confirmColor: '#ffffff',
      confirmHoverShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
      defaultIcon: Globe,
    },
  }

  const currentTheme = themeConfigs[variant] || themeConfigs.primary
  const IconComponent = CustomIcon || currentTheme.defaultIcon

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rh-dialog-title"
      aria-describedby="rh-dialog-desc"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(7, 22, 44, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'rhFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="rh-confirm-dialog-card"
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#ffffff',
          borderRadius: 22,
          padding: '1.75rem 1.75rem 1.5rem',
          boxShadow: '0 25px 60px -15px rgba(5, 17, 36, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.7)',
          animation: 'rhScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: 'none',
            background: '#f1f5f9',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          aria-label="Tutup dialog"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e2e8f0'
            e.currentTarget.style.color = '#0f172a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          <X size={17} strokeWidth={2.4} />
        </button>

        {/* Themed Icon Badge */}
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: '18px',
            background: currentTheme.badgeBg,
            border: `1.5px solid ${currentTheme.badgeBorder}`,
            color: currentTheme.badgeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.08)',
          }}
        >
          <IconComponent size={28} strokeWidth={2.4} />
        </div>

        {/* Title */}
        <h3
          id="rh-dialog-title"
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.6rem 0',
            lineHeight: 1.3,
            letterSpacing: '-0.015em',
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          id="rh-dialog-desc"
          style={{
            fontSize: '0.9375rem',
            color: '#475569',
            lineHeight: 1.6,
            margin: '0 0 1.75rem 0',
            whiteSpace: 'pre-line',
          }}
        >
          {message}
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            flexWrap: 'wrap-reverse',
          }}
        >
          {!isAlert && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: '1 1 auto',
                minWidth: 100,
                padding: '0.75rem 1.25rem',
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.borderColor = '#94a3b8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.borderColor = '#cbd5e1'
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            style={{
              flex: '1 1 auto',
              minWidth: 120,
              padding: '0.75rem 1.35rem',
              borderRadius: 12,
              border: 'none',
              background: currentTheme.confirmBg,
              color: currentTheme.confirmColor,
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: currentTheme.confirmHoverShadow,
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.filter = 'brightness(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.filter = 'brightness(1)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

