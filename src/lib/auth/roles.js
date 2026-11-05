export const DASHBOARD_BY_ROLE = {
  admin: '/dashboard/admin',
  conductor: '/dashboard/staff',
  gate: '/dashboard/staff',
  passenger: '/dashboard/passenger',
}

export const DEMO_ROLE_BY_EMAIL = {
  'admin.operasional@railhub.id': 'admin',
  'admin@railhub.com': 'admin',
  'petugas.argobromo@railhub.id': 'conductor',
  'petugas.taksaka@railhub.id': 'conductor',
  'petugas.parahyangan@railhub.id': 'conductor',
  'petugas.argowilis@railhub.id': 'conductor',
  'petugas.turangga@railhub.id': 'conductor',
  'kondektur.parahyangan@railhub.id': 'conductor',
  'gate.gambir@railhub.id': 'gate',
  'staff@railhub.com': 'conductor',
  'penumpang.demo@railhub.id': 'passenger',
  'penumpang@railhub.com': 'passenger',
}

const DASHBOARD_PATHS_BY_ROLE = {
  admin: ['/dashboard/admin', '/dashboard/orders', '/dashboard/reports'],
  conductor: ['/dashboard/staff', '/dashboard/orders', '/dashboard/reports'],
  gate: ['/dashboard/staff'],
  passenger: ['/dashboard/passenger'],
}

function matchesPath(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

export function getOperationalRole(profile, email = null) {
  const userEmail = (email || profile?.email || '').trim().toLowerCase()
  if (userEmail && DEMO_ROLE_BY_EMAIL[userEmail]) {
    return DEMO_ROLE_BY_EMAIL[userEmail]
  }

  if (profile?.role === 'admin') return 'admin'
  if (profile?.role === 'gate') return 'gate'
  if (profile?.role === 'conductor' || profile?.role === 'staff') {
    return profile?.staff_type === 'gate' ? 'gate' : 'conductor'
  }
  if (profile?.staff_type === 'gate') return 'gate'
  if (profile?.staff_type === 'conductor') return 'conductor'

  return 'passenger'
}

export function getDashboardForProfile(profile, email = null) {
  const role = getOperationalRole(profile, email)
  return DASHBOARD_BY_ROLE[role] || '/dashboard/passenger'
}

export function normalizeProfile(profile, email = null) {
  const operationalRole = getOperationalRole(profile, email)
  return {
    ...profile,
    email: profile?.email || email || null,
    role: operationalRole === 'admin' ? 'admin' : operationalRole === 'passenger' ? 'passenger' : 'conductor',
    staff_type: ['gate', 'conductor'].includes(operationalRole) ? operationalRole : null,
  }
}

export function isDashboardAllowed(pathname, role) {
  return (DASHBOARD_PATHS_BY_ROLE[role] || []).some(path => matchesPath(pathname, path))
}

export function isPathAllowedForRole(pathname, role) {
  if (pathname.startsWith('/api/')) return true
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  if (isDashboard) return isDashboardAllowed(pathname, role)
  if (role === 'passenger') return true
  return false
}

export function isSafeNextPath(path, role = null) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return false
  const pathname = path.split(/[?#]/, 1)[0]
  if (!role) {
    return pathname === '/trains' || pathname.startsWith('/booking/') || pathname.startsWith('/dashboard/')
  }
  if (role === 'passenger') {
    return pathname === '/trains'
      || pathname.startsWith('/booking/')
      || isDashboardAllowed(pathname, role)
  }
  return isDashboardAllowed(pathname, role)
}
