import { batches } from '../roster/rosterRepository.js'

// Add institute-provided { time, venue } details here, keyed by batch name.
const classDetails = {}

const toDate = value => new Date(value + 'T00:00:00Z')
const toIso = date => date.toISOString().slice(0, 10)

export function shiftMonth(month, offset) {
  const date = toDate(month + '-01')
  date.setUTCMonth(date.getUTCMonth() + offset)
  return toIso(date).slice(0, 7)
}

export function monthDays(month) {
  const first = toDate(month + '-01')
  const end = toDate(shiftMonth(month, 1) + '-01')
  const days = []
  for (const date = new Date(first); date < end; date.setUTCDate(date.getUTCDate() + 1)) {
    days.push({ date: toIso(date), day: date.getUTCDate(), weekday: date.getUTCDay() })
  }
  return days
}

function batchWeekday(batch) {
  const index = batches.indexOf(batch)
  return index < 0 ? -1 : (index + 6) % 7
}

export function scheduledClasses(batch, month) {
  const weekday = batchWeekday(batch)
  return monthDays(month).filter(day => day.weekday === weekday)
    .map(day => ({ ...day, ...classDetails[batch] }))
}

export function nextClassDate(batch, today) {
  const weekday = batchWeekday(batch)
  if (weekday < 0) return null
  const date = toDate(today)
  date.setUTCDate(date.getUTCDate() + (weekday - date.getUTCDay() + 7) % 7)
  return toIso(date)
}
