import { demoRoster } from './features/roster/demoRoster.js'

export const months = { '2026-11': 'November 2026', '2026-10': 'October 2026' }

export const initialData = {
  students: demoRoster,
  sessions: [
    { id: '1', date: '2026-11-14', type: 'Physical' },
    { id: '2', date: '2026-11-12', type: 'Online' },
    { id: '3', date: '2026-11-07', type: 'Physical' },
  ],
  attendance: { '1:AB-001': 'Present', '2:AB-001': 'Present', '3:AB-001': 'Absent', '1:AB-002': 'Present' },
  tuition: { '2026-11:AB-001': 'Paid', '2026-10:AB-001': 'Paid' },
  homework: [
    { id: '1', title: 'Arabic vocabulary practice', instructions: 'Review the vocabulary from Week 3 and write five sentences using the new words.', deadline: '2026-11-24' },
    { id: '2', title: 'Reading comprehension', instructions: 'Read the assigned passage and answer the three questions discussed in class.', deadline: '2026-11-27' },
  ],
}

export function readDemo() {
  try {
    return JSON.parse(localStorage.getItem('bayan-demo-v1')) ?? initialData
  } catch {
    return initialData
  }
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(value + 'T00:00:00Z'))
}

export function importRoster(source, students) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const input = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n') + '\n'
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (char === '"' && quoted && input[i + 1] === '"') {
      field += '"'
      i++
    } else if (char === '"') {
      quoted = !quoted
    } else if (!quoted && (char === ',' || char === '\n')) {
      row.push(field.trim())
      field = ''
      if (char === '\n') {
        rows.push(row)
        row = []
      }
    } else {
      field += char
    }
  }
  if (quoted) throw new Error('An opening quote has no matching closing quote.')
  const headers = rows.shift() ?? []
  const columns = ['student_id', 'full_name', 'email'].map(name => headers.indexOf(name))
  if (columns.some(index => index < 0)) throw new Error('Required CSV headers: student_id, full_name, email.')
  const ids = new Set(students.map(student => student.id.toLowerCase()))
  const emails = new Set(students.map(student => student.email.toLowerCase()))
  const imported = []
  const errors = []
  rows.forEach((values, index) => {
    if (!values.some(Boolean)) return
    const [id, name, rawEmail] = columns.map(column => values[column] ?? '')
    const email = rawEmail.toLowerCase()
    if (values.length !== headers.length || !id || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Record ${index + 2}: check the ID, name, email and column count.`)
    } else if (ids.has(id.toLowerCase()) || emails.has(email)) {
      errors.push(`Record ${index + 2}: duplicate student ID or email.`)
    } else {
      imported.push({ id, name, email })
      ids.add(id.toLowerCase())
      emails.add(email)
    }
  })
  return { imported, errors }
}
