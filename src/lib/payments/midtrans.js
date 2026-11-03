import { createHash, timingSafeEqual } from 'node:crypto'

const MIDTRANS_BASE_URL = 'https://app.sandbox.midtrans.com'
const MIDTRANS_API_BASE_URL = 'https://api.sandbox.midtrans.com'

const ENABLED_PAYMENT_METHODS = {
  qr_payment: ['qris'],
  bank_transfer: ['bca_va', 'bni_va', 'bri_va', 'permata_va', 'echannel'],
  e_wallet: ['gopay', 'shopeepay'],
  qris: ['qris'],
}

function getServerKey() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY is not configured on the server.')
  return serverKey
}

function authorizationHeader() {
  return `Basic ${Buffer.from(`${getServerKey()}:`).toString('base64')}`
}

export function isValidNotificationSignature(notification) {
  if (typeof notification?.order_id !== 'string'
    || typeof notification?.status_code !== 'string'
    || typeof notification?.gross_amount !== 'string'
    || typeof notification?.signature_key !== 'string') {
    return false
  }
  const expected = createHash('sha512')
    .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${getServerKey()}`)
    .digest()
  let received
  try {
    received = Buffer.from(notification.signature_key, 'hex')
  } catch {
    return false
  }
  return received.length === expected.length && timingSafeEqual(received, expected)
}

export async function createSnapTransaction({ orderId, amount, paymentMethod, finishUrl, expiryMinutes }) {
  const enabledPayments = ENABLED_PAYMENT_METHODS[paymentMethod]
  if (!enabledPayments) throw new Error('The selected Midtrans payment method is not supported.')
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('The Midtrans payment amount must be a positive whole number of rupiah.')
  }

  const response = await fetch(`${MIDTRANS_BASE_URL}/snap/v1/transactions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authorizationHeader(),
    },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: amount },
      enabled_payments: enabledPayments,
      callbacks: { finish: finishUrl },
      expiry: { unit: 'minute', duration: expiryMinutes },
    }),
    cache: 'no-store',
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const message = Array.isArray(result?.error_messages)
      ? result.error_messages.join(' ')
      : 'Midtrans rejected the payment request.'
    throw new Error(message)
  }

  if (typeof result?.redirect_url !== 'string' || typeof result?.token !== 'string') {
    throw new Error('Midtrans returned an invalid Snap transaction response.')
  }

  const redirectUrl = new URL(result.redirect_url)
  if (redirectUrl.protocol !== 'https:'
    || !['app.sandbox.midtrans.com', 'simulator.sandbox.midtrans.com'].includes(redirectUrl.hostname)) {
    throw new Error('Midtrans returned an unexpected payment URL.')
  }

  return { redirectUrl: redirectUrl.toString(), token: result.token }
}

export async function getMidtransTransactionStatus(orderId) {
  const response = await fetch(
    `${MIDTRANS_API_BASE_URL}/v2/${encodeURIComponent(orderId)}/status`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authorizationHeader(),
      },
      cache: 'no-store',
    }
  )
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(`Midtrans status verification failed with HTTP ${response.status}.`)
  }

  return result
}

export function getMidtransExpiryMinutes(expiresAt) {
  const remainingMinutes = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60_000)
  if (!Number.isFinite(remainingMinutes) || remainingMinutes < 1) {
    throw new Error('The booking has expired and can no longer be paid.')
  }
  return Math.min(remainingMinutes, 10_080)
}

export function isTerminalMidtransStatus(status) {
  return ['deny', 'cancel', 'expire', 'failure', 'refund', 'chargeback', 'partial_refund', 'partial_chargeback']
    .includes(status)
}
