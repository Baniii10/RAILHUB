'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'auth_callback_failed') {
      const timer = window.setTimeout(() => setError(
        lang === 'en'
          ? 'Google registration failed. Please configure Google OAuth in your Supabase dashboard.'
          : 'Pendaftaran Google gagal. Pastikan kredensial Google OAuth telah diaktifkan di dashboard Supabase.'
      ), 0)
      return () => window.clearTimeout(timer)
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
      const redirectUrl = `${window.location.origin}/auth/callback?next=/`
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
      router.push('/')
      return
    }

    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: form.password,
    })

    if (loginData?.session) {
      toast.success('Pendaftaran berhasil! Selamat datang di RAILHUB.')
      router.push('/')
      return
    }

    toast.success('Pendaftaran berhasil! Silakan masuk ke akun Anda.')
    router.push(`/auth/login?email=${encodeURIComponent(cleanEmail)}`)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* Standard RAILHUB Navbar with Brand & Language Toggle */}
      <Navbar />

      <div className="rh-login-viewport" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="rh-login-container">
          {/* Top Header Vector Illustration */}
          <MobileTrainIllustration />

          {/* Bottom Form Sheet */}
          <div className="rh-login-sheet">
            <div style={{ marginBottom: '1.25rem' }}>
              <h1
                style={{
                  fontSize: '1.4375rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.25,
                  margin: '0 0 6px',
                }}
              >
                Register Account
              </h1>
              <p
                style={{
                  fontSize: '0.84375rem',
                  color: '#64748b',
                  lineHeight: 1.45,
                  margin: 0,
                }}
              >
                Create your account to start booking trains across Java.
              </p>
            </div>

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
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-start',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2, color: '#dc2626' }} />
                <div>{error}</div>
              </div>
            )}

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
              <span>Sign up with Google</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '0 0 14px',
              }}
            >
              <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              <span style={{ fontSize: '0.78125rem', color: '#94a3b8', fontWeight: 500 }}>
                or register with email
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label
                  htmlFor="register-name"
                  style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                >
                  Full Name
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

              <div>
                <label
                  htmlFor="register-email"
                  style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                >
                  Email Address
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

              <div>
                <label
                  htmlFor="register-phone"
                  style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                >
                  Phone Number
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

              <div>
                <label
                  htmlFor="register-password"
                  style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                >
                  Password
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

              <div>
                <label
                  htmlFor="register-confirm-password"
                  style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#475569', marginBottom: 5 }}
                >
                  Confirm Password
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
                <span>REGISTER</span>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.84375rem',
              color: '#64748b',
              margin: '16px 0 0',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/auth/login"
              style={{
                color: '#2563eb',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  )
}
