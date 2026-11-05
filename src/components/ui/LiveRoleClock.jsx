'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Clock3 } from 'lucide-react'

function jakartaNow() {
  const now = new Date()
  return {
    date: new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now),
    time: new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now),
  }
}

export default function LiveRoleClock() {
  const [value, setValue] = useState(null)
  useEffect(() => {
    const update = () => setValue(jakartaNow())
    const first = window.setTimeout(update, 0)
    const timer = window.setInterval(update, 1000)
    return () => { window.clearTimeout(first); window.clearInterval(timer) }
  }, [])

  return <div className="role-clock" aria-live="off">
    <span><CalendarDays size={15} /> {value?.date || 'Waktu Jakarta'}</span>
    <strong><Clock3 size={17} /> {value?.time || '--.--.--'} WIB</strong>
  </div>
}
