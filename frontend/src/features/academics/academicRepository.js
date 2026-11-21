import { batches } from '../roster/rosterRepository.js'
import { scheduledClasses, shiftMonth } from './studentSchedule.js'

export function classDate() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Dhaka', dateStyle: 'short' }).format(new Date())
}

export function academicCalendar() {
  const today = classDate()
  const month = today.slice(0, 7)
  const end = new Date(today + 'T00:00:00Z')
  end.setUTCDate(end.getUTCDate() + 14)
  const until = end.toISOString().slice(0, 10)
  return [month, shiftMonth(month, 1)].flatMap(period =>
    batches.flatMap(batch => scheduledClasses(batch, period)
      .filter(item => item.date >= today && item.date < until)
      .map(item => ({ ...item, batch, type: 'In-person class' }))))
    .sort((first, second) => first.date.localeCompare(second.date))
}

const grades = [
  { historyId: 'AB-001', title: 'Arabic vocabulary quiz', score: 18, outOf: 20, date: '2026-11-18', published: true },
  { historyId: 'AB-001', title: 'Guided reading assessment', score: 16, outOf: 20, date: '2026-11-20', published: false },
  { historyId: 'SUN-001', title: 'Arabic vocabulary quiz', score: 17, outOf: 20, date: '2026-11-18', published: true },
]

export function publishedGrades(historyId) {
  return grades.filter(grade => grade.published && grade.historyId === historyId)
}

export function instituteWifi() {
  return null
}
