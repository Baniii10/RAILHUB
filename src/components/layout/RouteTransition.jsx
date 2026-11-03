'use client'

import { usePathname } from 'next/navigation'
import { Train } from 'lucide-react'

export default function RouteTransition() {
  const pathname = usePathname()

  return (
    <div key={pathname} className="rh-route-transition" aria-hidden="true">
      <span><Train size={15} /></span>
    </div>
  )
}
