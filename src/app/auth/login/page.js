'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Train, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LangContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { t, lang } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(t.auth.loginError)
      setLoading(false)
      return
    }

    // Fetch profile to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

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
                display: 'flex', gap: '0.625rem', alignItems: 'center',
                marginBottom: '1.25rem', color: 'hsl(0,72%,36%)', fontSize: '0.9rem',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

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

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--rh-border)' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--rh-text-3)' }}>{lang === 'en' ? 'or' : 'atau'}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--rh-border)' }} />
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--rh-text-2)' }}>
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
              <strong style={{ color: 'var(--rh-text-2)', display: 'block', marginBottom: '0.375rem' }}>{t.auth.noAccount}</strong>
              <div>{lang === 'en' ? 'Demo accounts are not provided. New accounts receive passenger access; only a project administrator can assign elevated roles.' : 'Akun demo tidak tersedia. Akun baru mendapat akses penumpang; role lebih tinggi hanya dapat diberikan oleh pengelola project.'}</div>
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
