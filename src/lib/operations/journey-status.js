export const JOURNEY_STATUSES = [
  ['scheduled', 'Terjadwal'],
  ['boarding', 'Boarding'],
  ['departed', 'Berangkat'],
  ['arrived', 'Tiba'],
  ['delayed', 'Tertunda'],
  ['cancelled', 'Dibatalkan'],
]

const NEXT_JOURNEY_STATUSES = {
  scheduled: ['boarding', 'delayed', 'cancelled'],
  boarding: ['departed', 'delayed', 'cancelled'],
  departed: ['delayed', 'arrived'],
  delayed: ['boarding', 'departed', 'arrived', 'cancelled'],
  arrived: [],
  cancelled: [],
}

export function getNextJourneyStatuses(status) {
  return NEXT_JOURNEY_STATUSES[status] || []
}

export function getJourneyStatusLabel(status) {
  return JOURNEY_STATUSES.find(([value]) => value === status)?.[1] || status
}
