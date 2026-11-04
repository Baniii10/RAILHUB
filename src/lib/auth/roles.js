export const DASHBOARD_BY_ROLE = {
  admin: '/dashboard/admin',
  conductor: '/dashboard/staff',
  gate: '/dashboard/staff',
  passenger: '/dashboard/passenger',
}

const DEMO_ROLE_BY_EMAIL = {
  'gate.gambir@railhub.id': 'gate',
  'kondektur.parahyangan@railhub.id': 'conductor',
  'admin.operasional@railhub.id': 'admin',
  'penumpang.demo@railhub.id': 'passenger',
}

export function getOperationalRole(profile, email) {
  const demoRole = DEMO_ROLE_BY_EMAIL[email?.toLowerCase()]
  if (demoRole) return demoRole
  if (profile?.role === 'admin') return 'admin'
  if (profile?.role !== 'conductor') return 'passenger'
  return profile.staff_type === 'gate' ? 'gate' : 'conductor'
}

export function getDashboardForProfile(profile, email) {
  return DASHBOARD_BY_ROLE[getOperationalRole(profile, email)]
}

export function normalizeProfile(profile, email) {
  const operationalRole = getOperationalRole(profile, email)
  return {
    ...profile,
    role: operationalRole === 'admin' ? 'admin' : operationalRole === 'passenger' ? 'passenger' : 'conductor',
    staff_type: ['gate', 'conductor'].includes(operationalRole) ? operationalRole : null,
  }
}

export function isSafeNextPath(path) {
  return Boolean(path)
    && path.startsWith('/')
    && !path.startsWith('//')
    && ['/booking/', '/dashboard', '/trains'].some(prefix => path.startsWith(prefix))
}
