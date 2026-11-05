import crypto from 'node:crypto'
import { RAW_TRAIN_FLEET } from './rawFleetCatalog.js'

/**
 * Determines appropriate trains for a corridor based on origin/destination codes or names.
 */
export function getTrainsForRoute(originCode, destCode) {
  const o = String(originCode || '').toUpperCase()
  const d = String(destCode || '').toUpperCase()
  const isJakartaO = ['GMR', 'PSE', 'JNG', 'CKP', 'THB'].includes(o)
  const isJakartaD = ['GMR', 'PSE', 'JNG', 'CKP', 'THB'].includes(d)
  const isBandungO = ['BD', 'KAC', 'CCL', 'KAC'].includes(o)
  const isBandungD = ['BD', 'KAC', 'CCL', 'KAC'].includes(d)
  const isSurabayaO = ['SGU', 'SBI', 'WO'].includes(o)
  const isSurabayaD = ['SGU', 'SBI', 'WO'].includes(d)
  const isYkSoloO = ['YK', 'LPN', 'SLO', 'PWS', 'KT'].includes(o)
  const isYkSoloD = ['YK', 'LPN', 'SLO', 'PWS', 'KT'].includes(d)

  let trainNumbers = []

  // Jakarta - Bandung corridor
  if ((isJakartaO && isBandungD) || (isBandungO && isJakartaD)) {
    trainNumbers = ['KA 34', 'KA 92', 'KA 122', 'KA 218']
  }
  // Jakarta - Surabaya Pantura corridor
  else if ((isJakartaO && isSurabayaD) || (isSurabayaO && isJakartaD)) {
    trainNumbers = ['KA 1', 'KA 64', 'KA 60', 'KA 220', 'KA 236', 'KA 108', 'KA 106', 'KA 218']
  }
  // Jakarta - Yogyakarta / Solo
  else if ((isJakartaO && isYkSoloD) || (isYkSoloO && isJakartaD)) {
    trainNumbers = ['KA 68', 'KA 8', 'KA 10', 'KA 18', 'KA 218', 'KA 106']
  }
  // Bandung - Surabaya / Malang
  else if ((isBandungO && isSurabayaD) || (isSurabayaO && isBandungD)) {
    trainNumbers = ['KA 6', 'KA 66', 'KA 86', 'KA 122', 'KA 240', 'KA 176']
  }
  // Bandung - Solo / Yogyakarta
  else if ((isBandungO && isYkSoloD) || (isYkSoloO && isBandungD)) {
    trainNumbers = ['KA 92', 'KA 122', 'KA 6', 'KA 66', 'KA 86', 'KA 240']
  }
  // Yogyakarta / Solo - Surabaya
  else if ((isYkSoloO && isSurabayaD) || (isSurabayaO && isYkSoloD)) {
    trainNumbers = ['KA 176', 'KA 6', 'KA 66', 'KA 18', 'KA 86', 'KA 240']
  }
  // General Java fallback - return diverse mix
  else {
    trainNumbers = ['KA 1', 'KA 34', 'KA 68', 'KA 92', 'KA 218', 'KA 236', 'KA 106', 'KA 64', 'KA 176']
  }

  const selected = RAW_TRAIN_FLEET.filter(t => trainNumbers.includes(t.train_number))
  return selected.length > 0 ? selected : RAW_TRAIN_FLEET.slice(0, 8)
}

/**
 * Standard departure time templates in WIB (UTC+7)
 */
const DEFAULT_WIB_SLOTS = [
  { hour: 5, minute: 30 },
  { hour: 7, minute: 15 },
  { hour: 8, minute: 45 },
  { hour: 10, minute: 20 },
  { hour: 12, minute: 30 },
  { hour: 14, minute: 10 },
  { hour: 16, minute: 0 },
  { hour: 17, minute: 45 },
  { hour: 19, minute: 15 },
  { hour: 20, minute: 45 },
  { hour: 22, minute: 10 },
  { hour: 23, minute: 20 },
]

/**
 * Generates procedural schedules and fares for a given date and route.
 * Real-time aware: if date === today, departures are dynamically filtered/scheduled after the current WIB time.
 */
export function generateSchedulesForDateRoute({
  routeId,
  originCode,
  destinationCode,
  dateStr, // YYYY-MM-DD
  distanceKm = 200,
  targetCount = 8,
}) {
  const eligibleTrains = getTrainsForRoute(originCode, destinationCode)
  const now = new Date()
  const todayWib = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now) // "YYYY-MM-DD"

  const isToday = dateStr === todayWib
  let currentWibHour = 0
  let currentWibMin = 0

  if (isToday) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now)
    currentWibHour = Number(parts.find(p => p.type === 'hour')?.value || 0)
    currentWibMin = Number(parts.find(p => p.type === 'minute')?.value || 0)
  }

  // Determine departure time slots
  let slots = []
  if (isToday) {
    // For today: departures MUST be in the future (at least 20 mins from now)
    const currentTotalMin = currentWibHour * 60 + currentWibMin + 20
    const remainingSlots = DEFAULT_WIB_SLOTS.filter(s => (s.hour * 60 + s.minute) > currentTotalMin)

    if (remainingSlots.length >= 3) {
      slots = remainingSlots.slice(0, targetCount)
    } else {
      // If late at night, dynamically synthesize upcoming departures in remaining minutes/hours tonight
      let nextStartMin = Math.max(currentTotalMin, currentWibHour * 60 + currentWibMin + 20)
      const dynamicSlots = []
      while (nextStartMin <= 23 * 60 + 55 && dynamicSlots.length < 5) {
        const h = Math.floor(nextStartMin / 60)
        const m = nextStartMin % 60
        dynamicSlots.push({ hour: h, minute: m })
        nextStartMin += 35 + Math.floor(Math.random() * 20)
      }
      slots = dynamicSlots.length > 0 ? dynamicSlots : [{ hour: 23, minute: 50 }]
    }
  } else {
    // Pick targetCount slots distributed across morning, afternoon, evening, night
    const step = Math.max(1, Math.floor(DEFAULT_WIB_SLOTS.length / targetCount))
    slots = DEFAULT_WIB_SLOTS.filter((_, idx) => idx % step === 0).slice(0, targetCount)
  }

  const generatedSchedules = []
  const generatedFares = []

  slots.forEach((slot, idx) => {
    const train = eligibleTrains[idx % eligibleTrains.length]
    const scheduleId = crypto.randomUUID()

    // Departure time in UTC (WIB = UTC+7)
    // Date format: YYYY-MM-DDTHH:mm:00+07:00
    const depIsoWib = `${dateStr}T${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}:00+07:00`
    const depDate = new Date(depIsoWib)

    // Travel duration based on distance: ~75 km/h avg speed + 20 mins dwell
    const estDurationHours = Math.max(1.5, train.typicalDurationHours || (distanceKm / 75 + 0.3))
    const arrDate = new Date(depDate.getTime() + Math.round(estDurationHours * 3600 * 1000))

    generatedSchedules.push({
      id: scheduleId,
      train_id: train.id,
      route_id: routeId,
      departure_time: depDate.toISOString(),
      arrival_time: arrDate.toISOString(),
      status: 'scheduled',
      note: 'Jadwal Resmi Berjalan',
    })

    // Generate fares for each carriage class the train has
    train.classes.forEach(c => {
      // Slight procedural price variation (+/- 5%) for realistic fare bucket feel
      const jitter = (Math.sin(idx * 7 + c.name.length) * 0.08)
      const adjustedPrice = Math.round((c.basePrice * (1 + jitter)) / 1000) * 1000

      generatedFares.push({
        id: crypto.randomUUID(),
        schedule_id: scheduleId,
        carriage_class: c.name,
        price: Math.max(50000, adjustedPrice),
        currency: 'IDR',
        note: 'Tarif Reguler',
      })
    })
  })

  return {
    schedules: generatedSchedules,
    fares: generatedFares,
  }
}
