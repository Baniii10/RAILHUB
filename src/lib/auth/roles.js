export const DASHBOARD_BY_ROLE = {
  admin: '/dashboard/admin',
  conductor: '/dashboard/staff',
  gate: '/dashboard/staff',
  passenger: '/dashboard/passenger',
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

export function getOperationalRole(profile) {
  if (profile?.role === 'admin') return 'admin'
  if (profile?.role !== 'conductor') return 'passenger'
  return profile.staff_type === 'gate' ? 'gate' : 'conductor'
}

export function getDashboardForProfile(profile) {
  return DASHBOARD_BY_ROLE[getOperationalRole(profile)]
}

export function normalizeProfile(profile) {
  const operationalRole = getOperationalRole(profile)
  return {
    ...profile,
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
