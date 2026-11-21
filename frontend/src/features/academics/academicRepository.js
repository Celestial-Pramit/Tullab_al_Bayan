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

const syllabus = {
  course: 'Arabic Foundations',
  topics: [
    { id: 'alphabet', name: 'Alphabet and pronunciation', description: 'Recognize Arabic letters in their different forms and practice common sounds.' },
    { id: 'vocabulary', name: 'Everyday vocabulary', description: 'Build a working vocabulary for greetings, family, and everyday activities.' },
    { id: 'sentences', name: 'Basic sentence patterns', description: 'Read and write simple nominal and verbal sentences.' },
    { id: 'reading', name: 'Guided reading', description: 'Read short passages and answer questions about their meaning.' },
  ],
}

const progress = {
  'AB-001': { batch: 'Saturday', completed: ['alphabet', 'vocabulary'] },
}

const grades = [
  { historyId: 'AB-001', title: 'Arabic vocabulary quiz', score: 18, outOf: 20, date: '2026-11-18', published: true },
  { historyId: 'AB-001', title: 'Guided reading assessment', score: 16, outOf: 20, date: '2026-11-20', published: false },
  { historyId: 'SUN-001', title: 'Arabic vocabulary quiz', score: 17, outOf: 20, date: '2026-11-18', published: true },
]

export function curriculumFor(batch) {
  return batches.includes(batch) ? syllabus : null
}

export function curriculumProgress(batch, historyId) {
  if (historyId) return progress[historyId]?.batch === batch ? [progress[historyId]] : []
  return Object.values(progress).filter(record => record.batch === batch)
}

export function publishedGrades(historyId) {
  return grades.filter(grade => grade.published && grade.historyId === historyId)
}

export function instituteWifi() {
  return null
}
