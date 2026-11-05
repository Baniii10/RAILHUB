'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'
import {
  IconAboutRailHub,
  IconFaqHelp,
  IconContactCs,
  IconMyTickets,
} from '@/components/ui/VectorLogos'

export default function MobilePortalHeader() {
  const { user } = useAuth()
  const { lang } = useLang()

  const services = [
    {
      id: 'about',
      title: lang === 'en' ? 'About' : 'Tentang',
      href: '/about',
      icon: IconAboutRailHub,
    },
    {
      id: 'faq',
      title: 'FAQ',
      href: '/faq',
      icon: IconFaqHelp,
    },
    {
      id: 'contact',
      title: lang === 'en' ? 'Contact' : 'Kontak',
      href: '/contact',
      icon: IconContactCs,
    },
    {
      id: 'tickets',
      title: lang === 'en' ? 'My Tickets' : 'Tiket Saya',
      href: user ? '/dashboard/passenger?tab=tickets' : '/auth/login?next=%2Fdashboard%2Fpassenger%3Ftab%3Dtickets',
      icon: IconMyTickets,
    },
  ]

  return (
    <section className="mobile-quick-access" aria-labelledby="quick-access-title">
      <div>
        <small>{lang === 'en' ? 'Information & Services' : 'Informasi & Bantuan'}</small>
        <h2 id="quick-access-title">{lang === 'en' ? 'Quick Access' : 'Akses Cepat'}</h2>
      </div>
      <nav aria-label={lang === 'en' ? 'Quick access' : 'Akses cepat'}>
        {services.map(({ id, title, href, icon: Icon }) => (
          <Link key={id} href={href}>
            <span>
              <Icon size={32} />
            </span>
            {title}
          </Link>
        ))}
      </nav>
    </section>
  )
}
