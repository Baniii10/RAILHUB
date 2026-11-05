import test from 'node:test'
import assert from 'node:assert/strict'
import { isDashboardAllowed, isPathAllowedForRole, isSafeNextPath } from '../src/lib/auth/roles.js'

test('dashboard access is isolated by operational role', () => {
  assert.equal(isDashboardAllowed('/dashboard/admin', 'admin'), true)
  assert.equal(isDashboardAllowed('/dashboard/staff', 'admin'), false)
  assert.equal(isDashboardAllowed('/dashboard/orders', 'conductor'), true)
  assert.equal(isDashboardAllowed('/dashboard/orders', 'gate'), false)
  assert.equal(isDashboardAllowed('/dashboard/passenger', 'passenger'), true)
  assert.equal(isDashboardAllowed('/dashboard/admin', 'passenger'), false)
})

test('operational roles cannot enter the passenger portal', () => {
  assert.equal(isPathAllowedForRole('/', 'admin'), false)
  assert.equal(isPathAllowedForRole('/trains', 'conductor'), false)
  assert.equal(isPathAllowedForRole('/booking/example', 'gate'), false)
  assert.equal(isPathAllowedForRole('/dashboard/orders', 'admin'), true)
  assert.equal(isPathAllowedForRole('/dashboard/orders', 'gate'), false)
  assert.equal(isPathAllowedForRole('/trains', 'passenger'), true)
})

test('post-login destinations are role-aware and boundary-safe', () => {
  assert.equal(isSafeNextPath('/booking/abc?x=1', 'passenger'), true)
  assert.equal(isSafeNextPath('/trains', 'admin'), false)
  assert.equal(isSafeNextPath('/dashboard/admin', 'admin'), true)
  assert.equal(isSafeNextPath('/dashboard/admin-evil', 'admin'), false)
  assert.equal(isSafeNextPath('//evil.example', 'passenger'), false)
})
