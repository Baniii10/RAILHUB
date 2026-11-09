/**
 * RAILHUB Account & Passenger Detection Utility
 * Identifies whether an account or passenger is a real user vs dummy / simulated.
 */

/**
 * Returns true if the email / account represents a real non-dummy user.
 * Returns false if it is a dummy, demo, or quick-dummy (e.g. jxx@gmail.com) account.
 *
 * @param {string|{email?: string, role?: string, full_name?: string}} userOrEmail
 * @returns {boolean}
 */
export function isRealUserAccount(userOrEmail) {
  if (!userOrEmail) return false

  const email = (
    typeof userOrEmail === 'string'
      ? userOrEmail
      : userOrEmail.email || ''
  ).toLowerCase().trim()

  if (!email) return false

  // 1. Official demo / system accounts
  if (email.endsWith('@railhub.id') || email.endsWith('@railhub.com')) {
    return false
  }

  // 2. Dummy quick-staff accounts pattern: j + digits + @gmail.com (e.g. j01@gmail.com, j25@gmail.com)
  if (/^j\d{1,4}@gmail\.com$/.test(email)) {
    return false
  }

  // 3. Known dummy keywords in localpart or domain
  if (
    email.includes('dummy') ||
    email.includes('simulation') ||
    email.includes('simulasi') ||
    email.includes('test_') ||
    email.includes('test.') ||
    email.includes('@example.com') ||
    email.includes('@test.') ||
    email.includes('@localhost')
  ) {
    return false
  }

  // 4. Default prefix patterns
  if (email.startsWith('demo_') || email.startsWith('sample_')) {
    return false
  }

  return true
}

/**
 * Returns account badge metadata for UI rendering.
 *
 * @param {string|object} userOrEmail
 * @returns {{ isReal: boolean, label: string, variant: 'real'|'dummy' }}
 */
export function getAccountTypeInfo(userOrEmail) {
  const isReal = isRealUserAccount(userOrEmail)
  if (isReal) {
    return {
      isReal: true,
      label: 'Akun Asli (Non-Dummy)',
      badgeClass: 'rh-badge-real-account',
      tagText: 'Akun Asli',
      variant: 'real',
    }
  }
  return {
    isReal: false,
    label: 'Akun Dummy / Simulasi',
    badgeClass: 'rh-badge-dummy-account',
    tagText: 'Dummy',
    variant: 'dummy',
  }
}
