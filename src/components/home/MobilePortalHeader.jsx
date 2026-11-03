'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'
import { IconAntarKota, IconLokal, IconMultiTrip, IconLebihBanyak } from '@/components/ui/VectorLogos'

export default function MobilePortalHeader() {
  const { user } = useAuth()
  const { lang } = useLang()
  const tomorrow = useMemo(() => {
    const value = new Date()
    value.setDate(value.getDate() + 1)
    return value.toISOString().slice(0, 10)
  }, [])

  const services = [
    { id: 'intercity', title: lang === 'en' ? 'Intercity' : 'Antar Kota', href: '/trains', icon: IconAntarKota },
    { id: 'local', title: lang === 'en' ? 'Local' : 'Lokal', href: `/trains?from=BD&to=CCL&date=${tomorrow}&pax=1`, icon: IconLokal },
    {
      id: 'journeys',
      title: lang === 'en' ? 'My Journeys' : 'Perjalanan',
      href: user ? '/dashboard/passenger?tab=tickets' : '/auth/login?next=%2Fdashboard%2Fpassenger%3Ftab%3Dtickets',
      icon: IconMultiTrip,
    },
    { id: 'help', title: lang === 'en' ? 'Help' : 'Bantuan', href: '/faq', icon: IconLebihBanyak },
  ]

  return (
    <section className="mobile-quick-access" aria-labelledby="quick-access-title">
      <div>
        <small>{lang === 'en' ? 'Your essentials' : 'Kebutuhan utama'}</small>
        <h2 id="quick-access-title">{lang === 'en' ? 'Quick access' : 'Akses cepat'}</h2>
      </div>
      <nav aria-label={lang === 'en' ? 'Quick access' : 'Akses cepat'}>
        {services.map(({ id, title, href, icon: Icon }) => (
          <Link key={id} href={href}>
            <span><Icon size={22} /></span>
            {title}
          </Link>
        ))}
      </nav>
    </section>
  )
}
