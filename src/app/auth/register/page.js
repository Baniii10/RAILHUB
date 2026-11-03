'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Train, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LangContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { t } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const passwordReqs = [
    { label: 'Minimal 8 karakter', met: form.password.length >= 8 },
    { label: 'Mengandung huruf kapital', met: /[A-Z]/.test(form.password) },
    { label: 'Mengandung angka', met: /[0-9]/.test(form.password) },
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

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
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone_number: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Pendaftaran tidak mengembalikan akun pengguna. Silakan coba kembali.')
      setLoading(false)
      return
    }

    toast.success('Registrasi berhasil! Silakan masuk.')
    const requestedNext = new URLSearchParams(window.location.search).get('next')
    const safeNext = requestedNext
      && !requestedNext.startsWith('//')
      && (requestedNext.startsWith('/booking/') || requestedNext.startsWith('/dashboard'))
      ? requestedNext
      : null
    router.push(safeNext ? `/auth/login?next=${encodeURIComponent(safeNext)}` : '/auth/login')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, var(--rh-navy) 0%, var(--rh-navy-mid) 40%, var(--rh-surface) 100%)',
      padding: '1.5rem',
    }}>
      <div className="animate-scale-in" style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" className="rh-logo" style={{ justifyContent: 'center', color: 'white', display: 'flex' }}>
            <div className="rh-logo-mark"><Train size={20} strokeWidth={2.5} /></div>
            <span style={{ fontSize: '1.5rem' }}>RAILHUB</span>
          </Link>
        </div>

        <div className="rh-card">
          <div className="rh-card-header">
            <h1 className="rh-h4">{t.auth.register}</h1>
            <p style={{ color: 'var(--rh-text-2)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Buat akun RAILHUB Anda secara gratis
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

            <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--rh-text-2)', marginTop: '1.5rem' }}>
              {t.auth.hasAccount}{' '}
              <Link href="/auth/login" style={{ color: 'var(--rh-primary)', fontWeight: 600 }}>{t.auth.login}</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)' }}>← Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  )
}
