'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Train, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LangContext'
import TrainBumperBanner from '@/components/home/TrainBumperBanner'
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
      setError(lang === 'en' ? 'Google registration failed. Please configure Google OAuth in your Supabase dashboard.' : 'Pendaftaran Google gagal. Pastikan kredensial Google OAuth telah diaktifkan di dashboard Supabase.')
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
      setError(err?.message || 'Gagal memulai pendaftaran Google.')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const cleanEmail = form.email.trim().toLowerCase()
    const cleanName = form.fullName.trim()
    const cleanPhone = form.phone.trim()

    if (form.password !== form.confirmPassword) {
      setError('Kata sandi tidak cocok.')
      return
    }
    if (form.password.length < 8) {
      setError('Kata sandi minimal 8 karakter.')
      return
    }

    setLoading(true)

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

    // Coba langsung login otomatis jika akun langsung aktif
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
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #0d1b3e 0%, #152857 50%, #0a1128 100%)',
      padding: '2rem 1.5rem calc(2.5rem + env(safe-area-inset-bottom, 0px))',
      width: '100%',
    }}>
      <div className="animate-scale-in" style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" className="rh-logo" style={{ justifyContent: 'center', color: 'white', display: 'flex' }}>
            <div className="rh-logo-mark"><Train size={20} strokeWidth={2.5} /></div>
            <span style={{ fontSize: '1.5rem' }}>RAILHUB</span>
          </Link>
        </div>

        {/* Cinematic Train Bumper Banner */}
        <div style={{ marginBottom: '1.25rem' }}>
          <TrainBumperBanner />
        </div>

        <div className="rh-card">
          <div className="rh-card-header">
                <h1 className="rh-h4">{t.auth.register}</h1>
                <p style={{ color: 'var(--rh-text-2)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {lang === 'en' ? 'Create your free RAILHUB account' : 'Buat akun RAILHUB Anda secara gratis'}
                </p>
              </div>
              <div className="rh-card-body">
                {error && (
                  <div style={{
                    padding: '0.875rem 1rem', borderRadius: 10, background: 'var(--rh-danger-light)',
                    border: '1px solid hsla(0,72%,51%,0.2)',
                    display: 'flex', gap: '0.625rem', alignItems: 'center',
                    marginBottom: '1.25rem', color: 'hsl(0,72%,36%)', fontSize: '0.9rem',
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                  </div>
                )}

                {/* Google Register Button */}
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
                  {lang === 'en' ? 'Sign up with Google' : 'Daftar dengan Google'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 1.25rem' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--rh-border)' }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--rh-text-3)' }}>{lang === 'en' ? 'or register with email' : 'atau daftar dengan email'}</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--rh-border)' }} />
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Full Name */}
                  <div className="rh-input-group">
                    <label className="rh-label-text" htmlFor="register-name">{t.auth.fullName}</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-text-3)', pointerEvents: 'none' }} />
                      <input id="register-name" type="text" name="name" autoComplete="name" className="rh-input" placeholder="Nama lengkap sesuai identitas" value={form.fullName} onChange={update('fullName')} required style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="rh-input-group">
                    <label className="rh-label-text" htmlFor="register-email">{t.auth.email}</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-text-3)', pointerEvents: 'none' }} />
                      <input id="register-email" type="email" name="email" autoComplete="email" spellCheck={false} className="rh-input" placeholder="nama@email.com" value={form.email} onChange={update('email')} required style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="rh-input-group">
                    <label className="rh-label-text" htmlFor="register-phone">{t.auth.phone}</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-text-3)', pointerEvents: 'none' }} />
                      <input id="register-phone" type="tel" name="tel" autoComplete="tel" inputMode="tel" className="rh-input" placeholder="08xx-xxxx-xxxx" value={form.phone} onChange={update('phone')} style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="rh-input-group">
                    <label className="rh-label-text" htmlFor="register-password">{t.auth.password}</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-text-3)', pointerEvents: 'none' }} />
                      <input id="register-password" type={showPw ? 'text' : 'password'} name="new-password" autoComplete="new-password" className="rh-input" placeholder="Minimal 8 karakter" value={form.password} onChange={update('password')} required style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }} />
                      <button type="button" aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '0.35rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rh-text-3)', width: 40, height: 40, padding: 0 }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Password strength indicators */}
                    {form.password.length > 0 && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {passwordReqs.map(req => (
                          <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: req.met ? 'var(--rh-success)' : 'var(--rh-text-3)' }}>
                            <CheckCircle size={12} fill={req.met ? 'var(--rh-success)' : 'none'} />
                            {req.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="rh-input-group">
                    <label className="rh-label-text" htmlFor="register-confirm-password">Konfirmasi Kata Sandi</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-text-3)', pointerEvents: 'none' }} />
                      <input
                        id="register-confirm-password" type="password" name="confirm-password" autoComplete="new-password" className={`rh-input ${form.confirmPassword && form.confirmPassword !== form.password ? 'rh-input-error' : ''}`}
                        placeholder="Ulangi kata sandi" value={form.confirmPassword} onChange={update('confirmPassword')} required
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                    {form.confirmPassword && form.confirmPassword !== form.password && (
                      <span className="rh-error-msg">Kata sandi tidak cocok</span>
                    )}
                  </div>

                  <button type="submit" className="rh-btn rh-btn-primary rh-btn-full" disabled={loading} style={{ marginTop: '0.5rem', height: 48 }}>
                    {loading && <span className="rh-spinner rh-spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />}
                    {loading ? 'Mendaftar…' : 'Buat Akun'}
                  </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--rh-text-2)', marginTop: '1.25rem' }}>
                  {t.auth.hasAccount}{' '}
                  <Link href="/auth/login" style={{ color: 'var(--rh-primary)', fontWeight: 600 }}>{t.auth.login}</Link>
                </p>
              </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 600 }}>← {lang === 'en' ? 'Back to Home' : 'Kembali ke Beranda'}</Link>
        </p>
      </div>
    </div>
  )
}
