import { batches } from '../roster/rosterRepository.js'

const demoWeek = [
  ['Physical', 'Arabic foundations'],
  ['Online', 'Arabic reading practice'],
  ['Physical', 'Grammar and sentence structure'],
  ['Online', 'Listening and comprehension'],
  ['Physical', 'Arabic foundations'],
  ['Online', 'Guided reading'],
  ['Physical', 'Vocabulary and conversation'],
]

export function classDate() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Dhaka', dateStyle: 'short' }).format(new Date())
}

export function academicCalendar() {
  const today = classDate()
  const date = new Date(today + 'T00:00:00Z')
  const classes = Array.from({ length: 14 }, (_, offset) => {
    const day = new Date(date)
    day.setUTCDate(date.getUTCDate() + offset)
    const index = (day.getUTCDay() + 1) % 7
    const [type, title] = demoWeek[index]
    return { date: day.toISOString().slice(0, 10), batch: batches[index], type, title }
  })
  return [...classes, { date: classes[6].date, type: 'Institute event', title: 'Arabic reading circle' }]
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
