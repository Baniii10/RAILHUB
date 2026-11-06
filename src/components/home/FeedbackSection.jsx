'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  MessageSquare,
  Frown,
  Meh,
  Smile,
  Laugh,
  Heart,
  Send,
  CheckCircle2,
} from 'lucide-react'
import { useLang } from '@/contexts/LangContext'

const EMOT_SCALE = [
  { val: 1, icon: Frown },
  { val: 2, icon: Meh },
  { val: 3, icon: Smile },
  { val: 4, icon: Laugh },
  { val: 5, icon: Heart },
]

export default function FeedbackSection() {
  const { lang } = useLang()
  const [rating, setRating] = useState(4)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!feedback.trim()) {
      toast.error(
        lang === 'en'
          ? 'Tuliskan kritik atau saran Anda.'
          : 'Tuliskan kritik atau saran Anda.'
      )
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      toast.success(
        lang === 'en'
          ? 'Kritik & saran Anda berhasil dikirim!'
          : 'Kritik & saran Anda berhasil dikirim!'
      )
    }, 400)
  }

  return (
    <section
      id="kritik-saran"
      className="rh-feedback-bottom-section"
      style={{
        background: 'var(--rh-primary)',
        padding: '1.25rem 1rem calc(5.25rem + env(safe-area-inset-bottom, 0px))',
        color: '#ffffff',
      }}
    >
      <div className="rh-container" style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Judul Sebaris Sederhana (Minimalis) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '0.55rem',
          }}
        >
          <MessageSquare size={14} style={{ color: '#f58220' }} />
          <h3
            style={{
              margin: 0,
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.01em',
            }}
          >
            {lang === 'en' ? 'Critique & Suggestions' : 'Kritik & Saran Perjalanan'}
          </h3>
        </div>

        {submitted ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: 12,
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              color: '#ffffff',
            }}
          >
            <CheckCircle2 size={15} color="#4ade80" />
            <span>
              {lang === 'en'
                ? 'Thank you! Your feedback has been received.'
                : 'Terima kasih! Kritik dan saran Anda telah kami terima.'}
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: 14,
              padding: '0.6rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {/* Skala Emot 1-5 (Lucide Vector Icons Tanpa Emote Bawaan) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              {EMOT_SCALE.map(item => {
                const IconComponent = item.icon
                const isSelected = rating === item.val
                return (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setRating(item.val)}
                    aria-label={`Skala ${item.val}`}
                    style={{
                      flex: 1,
                      maxWidth: '82px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '0.3rem 0.4rem',
                      borderRadius: 8,
                      border: isSelected
                        ? '1px solid #f58220'
                        : '1px solid rgba(255, 255, 255, 0.12)',
                      background: isSelected
                        ? 'rgba(245, 130, 32, 0.24)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#f58220' : 'rgba(255, 255, 255, 0.7)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComponent
                      size={14}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                    />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: isSelected ? 800 : 600,
                      }}
                    >
                      {item.val}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Input & Tombol Kirim Jadi Satu Baris Kompak */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(0, 0, 0, 0.28)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: 10,
                padding: '0.28rem 0.35rem 0.28rem 0.7rem',
              }}
            >
              <input
                type="text"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Tulis kritik atau saran...'
                    : 'Tulis kritik atau saran...'
                }
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontFamily: 'inherit',
                  minWidth: 0,
                }}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="rh-btn rh-btn-sm"
                style={{
                  background: 'var(--rh-accent)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                }}
              >
                <span>{lang === 'en' ? 'Kirim' : 'Kirim'}</span>
                <Send size={12} />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
