'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle, Smartphone, Monitor } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LangContext'
import toast from 'react-hot-toast'
import MobileTrainIllustration from '@/components/auth/MobileTrainIllustration'

function GoogleIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  )
}

export default function RegisterPage() {
  const { t, lang } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPw,        setShowPw]        = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,         setError]         = useState('')
  const [frameMode,     setFrameMode]     = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'auth_callback_failed') {
      setError(
        lang === 'en'
          ? 'Google registration failed. Please configure Google OAuth in your Supabase dashboard.'
          : 'Pendaftaran Google gagal. Pastikan kredensial Google OAuth telah diaktifkan di dashboard Supabase.'
      )
    }
  }, [lang])

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const passwordReqs = [
    { label: 'Minimal 8 karakter', met: form.password.length >= 8 },
    { label: 'Mengandung huruf kapital', met: /[A-Z]/.test(form.password) },
    { label: 'Mengandung angka', met: /[0-9]/.test(form.password) },
  ]

  async function handleGoogleAuth() {
    setError('')
    setGoogleLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard/passenger`
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        setGoogleLoading(false)
      }
    } catch (err) {
      setError(err?.message || 'Gagal memulai pendaftaran Google.')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Kata sandi harus minimal 8 karakter.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setLoading(true)

    const cleanEmail = form.email.trim().toLowerCase()
    const cleanName = form.fullName.trim()
    const cleanPhone = form.phone.trim()

    const { data, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: form.password,
      options: {
        data: { full_name: cleanName, phone_number: cleanPhone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user?.identities && data.user.identities.length === 0) {
      setError('Email ini sudah terdaftar sebelumnya. Silakan langsung masuk ke akun Anda.')
      setLoading(false)
      return
    }

    if (data.session) {
      toast.success('Pendaftaran berhasil! Mengalihkan...')
      router.push('/dashboard/passenger')
      return
    }

    // Auto login check
    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: form.password,
    })

    if (loginData?.session) {
      toast.success('Pendaftaran berhasil! Selamat datang di RAILHUB.')
      router.push('/dashboard/passenger')
      return
    }

    toast.success('Pendaftaran berhasil! Silakan masuk ke akun Anda.')
    router.push(`/auth/login?email=${encodeURIComponent(cleanEmail)}`)
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b1120 0%, #171738 45%, #231244 100%)',
        padding: '1.5rem 1rem',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      {/* View Mode Toggle Pill (Desktop Only) */}
      <div
        className="rh-desktop-toggle"
        style={{
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 24,
          padding: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setFrameMode(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: frameMode ? '#2563eb' : 'transparent',
            color: frameMode ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s ease',
          }}
        >
          <Smartphone size={14} />
          <span>Mobile Device View</span>
        </button>

        <button
          type="button"
          onClick={() => setFrameMode(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: !frameMode ? '#2563eb' : 'transparent',
            color: !frameMode ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s ease',
          }}
        >
          <Monitor size={14} />
          <span>Expanded Card</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`rh-login-screen-wrapper ${frameMode ? 'is-phone-mockup' : 'is-expanded-card'}`}
        style={{
          width: '100%',
          maxWidth: frameMode ? 412 : 460,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Smartphone Outer Bezel */}
        <div
          style={{
            position: 'relative',
            backgroundColor: frameMode ? '#0a0d14' : 'transparent',
            borderRadius: frameMode ? 48 : 28,
            padding: frameMode ? '10px 10px 14px' : 0,
            boxShadow: frameMode
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 2.5px #2d3748, 0 0 0 4px #1a202c, 0 0 40px rgba(99, 102, 241, 0.2)'
              : '0 20px 50px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
          }}
        >
          {/* Smartphone Top Notch / Speaker Slit */}
          {frameMode && (
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 96,
                height: 18,
                backgroundColor: '#05070a',
                borderRadius: 14,
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ width: 42, height: 3.5, backgroundColor: '#1e293b', borderRadius: 2 }} />
              <div style={{ width: 6.5, height: 6.5, backgroundColor: '#0f172a', borderRadius: '50%', border: '1px solid #1e293b' }} />
            </div>
          )}

          {/* Inner Screen */}
          <div
            style={{
              position: 'relative',
              borderRadius: frameMode ? 40 : 28,
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: frameMode ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.15)' : 'none',
            }}
          >
            {/* Header Vector Illustration */}
            <MobileTrainIllustration />

            {/* Bottom Card Form */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                marginTop: -26,
                position: 'relative',
                zIndex: 10,
                padding: '24px 22px 28px',
                boxShadow: '0 -10px 25px rgba(44, 12, 89, 0.12)',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <h1
                  style={{
                    fontSize: '1.4375rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.25,
                    marginBottom: 6,
                  }}
                >
                  {lang === 'en' ? 'Create Account' : 'Daftar Akun RAILHUB'}
                </h1>
                <p
                  style={{
                    fontSize: '0.84375rem',
                    color: '#64748b',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {lang === 'en'
                    ? 'Register now to book tickets and manage your trips across Java!'
                    : 'Daftar sekarang untuk pesan tiket dan kelola perjalanan kereta api Anda!'}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    padding: '0.75rem 0.875rem',
                    borderRadius: 12,
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    marginBottom: '1rem',
                    color: '#b91c1c',
                    fontSize: '0.84375rem',
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2, color: '#dc2626' }} />
                    <div style={{ flex: 1 }}>{error}</div>
                  </div>
                </div>
              )}

              {/* Google Register Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading || googleLoading}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  marginBottom: '1rem',
                }}
              >
                {googleLoading ? (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: '2px solid rgba(37, 99, 235, 0.2)',
                      borderTopColor: '#2563eb',
                      borderRadius: '50%',
                      animation: 'spin 0.75s linear infinite',
                    }}
                  />
                ) : (
                  <GoogleIcon size={19} />
                )}
                <span>{lang === 'en' ? 'Sign up with Google' : 'Daftar dengan Google'}</span>
              </button>

              {/* Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  margin: '12px 0 14px',
                }}
              >
                <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                <span style={{ fontSize: '0.78125rem', color: '#94a3b8', fontWeight: 500 }}>
                  {lang === 'en' ? 'or register with email' : 'atau daftar dengan email'}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="register-name"
                    style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                  >
                    {t.auth.fullName}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="Nama lengkap sesuai KTP"
                      value={form.fullName}
                      onChange={update('fullName')}
                      required
                      style={{ width: '100%', height: 46, paddingLeft: 42, paddingRight: 14, borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="register-email"
                    style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                  >
                    {t.auth.email}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      value={form.email}
                      onChange={update('email')}
                      required
                      style={{ width: '100%', height: 46, paddingLeft: 42, paddingRight: 14, borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="register-phone"
                    style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                  >
                    {t.auth.phone}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      id="register-phone"
                      type="tel"
                      name="tel"
                      autoComplete="tel"
                      placeholder="08xx-xxxx-xxxx"
                      value={form.phone}
                      onChange={update('phone')}
                      style={{ width: '100%', height: 46, paddingLeft: 42, paddingRight: 14, borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="register-password"
                    style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                  >
                    {t.auth.password}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      id="register-password"
                      type={showPw ? 'text' : 'password'}
                      name="new-password"
                      autoComplete="new-password"
                      placeholder="Minimal 8 karakter"
                      value={form.password}
                      onChange={update('password')}
                      required
                      style={{ width: '100%', height: 46, paddingLeft: 42, paddingRight: 44, borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }}
                    />
                    <button
                      type="button"
                      aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      onClick={() => setShowPw(v => !v)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength indicators */}
                  {form.password.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {passwordReqs.map(req => (
                        <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: req.met ? '#16a34a' : '#94a3b8' }}>
                          <CheckCircle size={12} fill={req.met ? '#16a34a' : 'none'} color={req.met ? '#ffffff' : '#94a3b8'} />
                          {req.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="register-confirm-password"
                    style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                  >
                    {lang === 'en' ? 'Confirm Password' : 'Konfirmasi Kata Sandi'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      id="register-confirm-password"
                      type="password"
                      name="confirm-password"
                      autoComplete="new-password"
                      placeholder="Ulangi kata sandi"
                      value={form.confirmPassword}
                      onChange={update('confirmPassword')}
                      required
                      style={{
                        width: '100%',
                        height: 46,
                        paddingLeft: 42,
                        paddingRight: 14,
                        borderRadius: 12,
                        border: form.confirmPassword && form.confirmPassword !== form.password ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                        fontSize: '0.875rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: 48,
                    marginTop: 6,
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {loading ? (
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        border: '2.5px solid rgba(255, 255, 255, 0.35)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        animation: 'spin 0.75s linear infinite',
                      }}
                    />
                  ) : (
                    <span>{lang === 'en' ? 'REGISTER' : 'DAFTAR SEKARANG'}</span>
                  )}
                </button>
              </form>

              {/* Already have account */}
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '0.84375rem',
                  color: '#64748b',
                  margin: '16px 0 0',
                }}
              >
                {t.auth.hasAccount}{' '}
                <Link
                  href="/auth/login"
                  style={{
                    color: '#2563eb',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  {t.auth.login}
                </Link>
              </p>
            </div>

            {/* Bottom bar */}
            {frameMode && (
              <div
                style={{
                  width: '100%',
                  height: 22,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: 6,
                }}
              >
                <div style={{ width: 110, height: 4, backgroundColor: '#cbd5e1', borderRadius: 3 }} />
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <p style={{ textAlign: 'center', marginTop: '1.25rem', marginBottom: 0 }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255, 255, 255, 0.75)',
              textDecoration: 'none',
              fontSize: '0.84375rem',
              fontWeight: 500,
            }}
          >
            ← {lang === 'en' ? 'Back to RailHub Home' : 'Kembali ke Beranda RailHub'}
          </Link>
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .rh-desktop-toggle {
            display: none !important;
          }
          .rh-login-screen-wrapper.is-phone-mockup {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .rh-login-screen-wrapper.is-phone-mockup > div {
            border-radius: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background-color: transparent !important;
          }
          .rh-login-screen-wrapper.is-phone-mockup > div > div:last-child {
            border-radius: 0 !important;
            min-height: 100vh !important;
            min-height: 100dvh !important;
          }
        }
      `}</style>
    </div>
  )
}
