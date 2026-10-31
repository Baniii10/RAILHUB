import Link from 'next/link'
import { Train, MapPin, Phone, Mail, Camera, MessageCircle, Send } from 'lucide-react'

const footerLinks = {
  layanan: [
    { href: '/trains', label: 'Pesan Tiket' },
    { href: '/dashboard/passenger', label: 'Cek Booking' },
    { href: '/dashboard/passenger/journey', label: 'Lacak Perjalanan' },
  ],
  informasi: [
    { href: '/about', label: 'Tentang RAILHUB' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Kontak' },
  ],
  lainnya: [
    { href: '/auth/login', label: 'Login' },
    { href: '/auth/register', label: 'Daftar' },
  ],
}

export default function Footer() {
  return (
    <footer style={{ background: 'var(--rh-navy)', color: 'rgba(255,255,255,0.75)' }}>
      {/* Main Footer */}
      <div className="rh-container" style={{ padding: '4rem 1.5rem 3rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div className="rh-logo" style={{ color: 'white', marginBottom: '1rem' }}>
              <div className="rh-logo-mark"><Train size={18} strokeWidth={2.5} /></div>
              <span>RAILHUB</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', maxWidth: 260 }}>
              Platform perjalanan kereta api terpadu untuk seluruh Pulau Jawa. Nikmati pengalaman berkelas dunia.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {[Camera, MessageCircle, Send].map((Icon, i) => (
                <button key={i} style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.65)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 style={{
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                marginBottom: '1rem'
              }}>
                {section === 'layanan' ? 'Layanan' : section === 'informasi' ? 'Informasi' : 'Akun'}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} style={{
                      fontSize: '0.9375rem',
                      color: 'rgba(255,255,255,0.65)',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 style={{
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
              marginBottom: '1rem'
            }}>
              Kontak
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { Icon: MapPin, text: 'Pulau Jawa, Indonesia' },
                { Icon: Phone, text: '+62 812-3456-7890' },
                { Icon: Mail, text: 'support@railhub.id' },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9rem' }}>
                  <Icon size={15} style={{ color: 'var(--rh-accent)', flexShrink: 0 }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="rh-container" style={{
          padding: '1.25rem 1.5rem',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem',
          fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)'
        }}>
          <span>© RAILHUB — Kelompok 14. Proyek Pemrograman Web.</span>
          <span style={{ display: 'flex', gap: '1rem' }}>
            <span>Bukan layanan resmi KAI</span>
            <span>·</span>
            <span>Simulasi edukasi</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
