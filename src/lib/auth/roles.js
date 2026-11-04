export const DASHBOARD_BY_ROLE = {
  admin: '/dashboard/admin',
  conductor: '/dashboard/staff',
  gate: '/dashboard/staff',
  passenger: '/dashboard/passenger',
}

export function getOperationalRole(profile) {
  if (profile?.role === 'admin') return 'admin'
  if (profile?.role !== 'conductor') return 'passenger'
  return profile.staff_type === 'gate' ? 'gate' : 'conductor'
}

export function getDashboardForProfile(profile) {
  return DASHBOARD_BY_ROLE[getOperationalRole(profile)]
}

export function isSafeNextPath(path) {
  return Boolean(path)
    && path.startsWith('/')
    && !path.startsWith('//')
    && ['/booking/', '/dashboard', '/trains'].some(prefix => path.startsWith(prefix))
}
