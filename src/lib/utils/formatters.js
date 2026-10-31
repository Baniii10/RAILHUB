/**
 * Format Indonesian Rupiah currency
 */
export function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to Indonesian locale string
 */
export function formatDate(dateString, options = {}) {
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(dateString).toLocaleDateString('id-ID', { ...defaultOptions, ...options })
}

/**
 * Format time from ISO string (HH:MM)
 */
export function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  })
}

/**
 * Calculate journey duration in hours and minutes
 */
export function formatDuration(departureStr, arrivalStr) {
  const dep = new Date(departureStr)
  const arr = new Date(arrivalStr)
  const diffMs = arr - dep
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}j ${minutes}m`
}

/**
 * Format short date (e.g. "31 Okt 2026")
 */
export function formatShortDate(dateString) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Truncate text to a max length
 */
export function truncate(text, maxLength = 100) {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text
}

/**
 * Generate a random booking code (e.g. RH-ABCD1234)
 */
export function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'RH-'
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * Merge class names (simple utility)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Get booking status label and color in Indonesian
 */
export function getBookingStatusInfo(status) {
  const map = {
    pending: { label: 'Menunggu Pembayaran', color: 'warning' },
    paid: { label: 'Terbayar', color: 'success' },
    cancelled: { label: 'Dibatalkan', color: 'danger' },
    expired: { label: 'Kedaluwarsa', color: 'muted' },
  }
  return map[status] || { label: status, color: 'muted' }
}

/**
 * Get schedule status label in Indonesian
 */
export function getScheduleStatusInfo(status) {
  const map = {
    scheduled: { label: 'Terjadwal', color: 'info' },
    boarding: { label: 'Boarding', color: 'warning' },
    departed: { label: 'Berangkat', color: 'primary' },
    arrived: { label: 'Tiba', color: 'success' },
    delayed: { label: 'Tertunda', color: 'warning' },
    cancelled: { label: 'Dibatalkan', color: 'danger' },
  }
  return map[status] || { label: status, color: 'muted' }
}
