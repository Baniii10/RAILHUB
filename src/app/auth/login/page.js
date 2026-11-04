'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Train, Mail, Lock, Eye, EyeOff, AlertCircle, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LangContext'
import toast from 'react-hot-toast'

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  )
}

export default function LoginPage() {
  const { t, lang } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPw,        setShowPw]        = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,         setError]         = useState('')
  const [showResend,    setShowResend]    = useState(false)
  const [resending,     setResending]     = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'auth_callback_failed') {
      setError(lang === 'en' ? 'Google authentication failed. Please configure Google OAuth in your Supabase dashboard.' : 'Autentikasi Google gagal. Pastikan kredensial Google OAuth telah diaktifkan di dashboard Supabase.')
    }
  }, [lang])

  async function handleResendConfirmation() {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      toast.error('Masukkan email Anda terlebih dahulu.')
      return
    }
    setResending(true)
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (resendErr) {
        toast.error(resendErr.message)
      } else {
        toast.success('Email konfirmasi baru telah dikirim! Cek inbox atau folder Spam Anda.')
      }
    } catch (err) {
      toast.error(err?.message || 'Gagal mengirim ulang email konfirmasi.')
    } finally {
      setResending(false)
    }
  }

  async function handleGoogleAuth() {
    setError('')
    setShowResend(false)
    setGoogleLoading(true)
    try {
      const requestedNext = new URLSearchParams(window.location.search).get('next')
      const safeNext = requestedNext
        && !requestedNext.startsWith('//')
        && (requestedNext.startsWith('/booking/') || requestedNext.startsWith('/dashboard') || requestedNext.startsWith('/trains'))
        ? requestedNext
        : '/dashboard/passenger'

      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`

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
      setError(err?.message || 'Gagal memulai autentikasi Google.')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setShowResend(false)
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (authError) {
      const msg = authError.message?.toLowerCase() || ''
      const code = authError.code || ''

      if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
        setError('Email belum dikonfirmasi! Supabase mewajibkan konfirmasi email sebelum login. Silakan periksa inbox atau folder Spam/Promosi email Anda.')
        setShowResend(true)
      } else if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
        setError('Email atau kata sandi salah. Silakan periksa kembali huruf besar/kecil kata sandi Anda.')
      } else {
        setError(authError.message || t.auth.loginError)
      }
      setLoading(false)
      return
    }

    // Fetch profile to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    toast.success(t.auth.loginSuccess)

    const requestedNext = new URLSearchParams(window.location.search).get('next')
    if (requestedNext
      && !requestedNext.startsWith('//')
      && (requestedNext.startsWith('/booking/') || requestedNext.startsWith('/dashboard'))) {
      router.push(requestedNext)
    } else if (profile?.role === 'admin')     router.push('/dashboard/admin')
    else if (profile?.role === 'conductor') router.push('/dashboard/staff')
    else router.push('/dashboard/passenger')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, var(--rh-navy) 0%, var(--rh-navy-mid) 40%, var(--rh-surface) 100%)',
      padding: '1.5rem',
    }}>
      <div className="animate-scale-in" style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" className="rh-logo" style={{ justifyContent: 'center', color: 'white', marginBottom: '0.75rem', display: 'flex' }}>
            <div className="rh-logo-mark"><Train size={20} strokeWidth={2.5} /></div>
            <span style={{ fontSize: '1.5rem' }}>RAILHUB</span>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem' }}>
            {lang === 'en' ? 'Integrated Railway Platform for Java' : 'Platform Kereta Api Terpadu Pulau Jawa'}
          </p>
        </div>

        {/* Card */}
        <div className="rh-card">
          <div className="rh-card-header">
            <h1 className="rh-h4">{t.auth.login}</h1>
            <p style={{ color: 'var(--rh-text-2)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {lang === 'en' ? 'Sign in to your RAILHUB account' : 'Masuk ke akun RAILHUB Anda'}
            </p>
          </div>
          <div className="rh-card-body">
            {error && (
              <div style={{
                padding: '0.875rem 1rem', borderRadius: 10, background: 'var(--rh-danger-light)',
                border: '1px solid hsla(0,72%,51%,0.2)',
                marginBottom: '1.25rem', color: 'hsl(0,72%,36%)', fontSize: '0.9rem',
              }}>
                <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>{error}</div>
                </div>

                {showResend && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    style={{
                      marginTop: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.75rem',
                      background: '#ffffff',
                      color: 'var(--rh-primary)',
                      border: '1.5px solid var(--rh-primary)',
                      borderRadius: 8,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Send size={13} />
                    {resending ? 'Mengirim…' : 'Kirim Ulang Email Konfirmasi'}
                  </button>
                )}
              </div>
            )}

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading || googleLoading}
              className="rh-btn rh-btn-full"
              style={{
                height: 48,
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: 12,
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '0.9375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                marginBottom: '1rem',
              }}
            >
              {googleLoading ? (
                <span className="rh-spinner rh-spinner-sm" style={{ borderTopColor: 'var(--rh-primary)', borderColor: 'rgba(26,66,138,0.2)' }} />
              ) : (
                <GoogleIcon size={19} />
              )}
              {lang === 'en' ? 'Sign in with Google' : 'Masuk dengan Google'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 1.25rem' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--rh-border)' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--rh-text-3)' }}>{lang === 'en' ? 'or sign in with email' : 'atau masuk dengan email'}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--rh-border)' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Email */}
              <div className="rh-input-group">
                <label className="rh-label-text" htmlFor="email">{t.auth.email}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-text-3)', pointerEvents: 'none' }} />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    spellCheck={false}
                    className="rh-input"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="rh-input-group">
                <label className="rh-label-text" htmlFor="password">{t.auth.password}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-text-3)', pointerEvents: 'none' }} />
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    className="rh-input"
                    placeholder={t.auth.password}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    aria-label={showPw ? (lang === 'en' ? 'Hide password' : 'Sembunyikan kata sandi') : (lang === 'en' ? 'Show password' : 'Tampilkan kata sandi')}
                    onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: '0.35rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rh-text-3)', width: 40, height: 40, padding: 0 }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="rh-btn rh-btn-primary rh-btn-full"
                disabled={loading}
                style={{ marginTop: '0.5rem', height: 48 }}
              >
                {loading && <span className="rh-spinner rh-spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />}
                {loading ? (lang === 'en' ? 'Signing in…' : 'Sedang masuk…') : t.auth.login}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--rh-text-2)', marginTop: '1.25rem' }}>
              {t.auth.noAccount}{' '}
              <Link href="/auth/register" style={{ color: 'var(--rh-primary)', fontWeight: 600 }}>
                {t.auth.register}
              </Link>
            </p>

            {/* Account setup hint */}
            <div style={{
              marginTop: '1.25rem', padding: '0.875rem', background: 'var(--rh-surface)',
              borderRadius: 10, border: '1px solid var(--rh-border)',
              fontSize: '0.8125rem', color: 'var(--rh-text-3)',
            }}>
              <strong style={{ color: 'var(--rh-text-2)', display: 'block', marginBottom: '0.375rem' }}>Informasi Akses Akun</strong>
              <div>{lang === 'en' ? 'New accounts receive passenger access. If you cannot sign in, please verify your email inbox or click resend.' : 'Akun baru otomatis terdaftar sebagai penumpang. Jika tidak bisa masuk, pastikan email Anda sudah dikonfirmasi melalui inbox atau klik tombol kirim ulang di atas.'}</div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)' }}>← {lang === 'en' ? 'Back to Home' : 'Kembali ke Beranda'}</Link>
        </p>
      </div>
    </div>
  )
}
