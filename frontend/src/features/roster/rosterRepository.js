import { batches, demoRoster } from './demoRoster.js'

export { batches }
const storageKey = 'bayan-roster-v2'
const previousStorageKey = 'bayan-roster-v1'

function mergePreviousRoster(previous) {
  const roster = previous.map(student => {
    if (student.historyId !== 'AB-001') return student
    const amina = demoRoster[0]
    const others = previous.filter(entry => entry.historyId !== student.historyId)
    const idAvailable = !others.some(entry =>
      [entry.id, entry.historyId].some(id => id.toLowerCase() === amina.id.toLowerCase()))
    const emailAvailable = !others.some(entry => entry.email.toLowerCase() === amina.email)
    return {
      ...student,
      id: student.id === 'AB-001' && idAvailable ? amina.id : student.id,
      email: student.email === 'amina@example.com' && emailAvailable ? amina.email : student.email,
    }
  })
  // Saved students take precedence when the new seed overlaps a custom entry.
  const ids = new Set(roster.flatMap(student => [student.id.toLowerCase(), student.historyId.toLowerCase()]))
  const emails = new Set(roster.map(student => student.email.toLowerCase()))
  return [...roster, ...demoRoster.filter(student =>
    !ids.has(student.id.toLowerCase()) && !ids.has(student.historyId.toLowerCase()) && !emails.has(student.email))]
}

function readStoredRoster() {
  const saved = localStorage.getItem(storageKey)
  if (saved !== null) return JSON.parse(saved)

  const previous = localStorage.getItem(previousStorageKey)
  const roster = previous === null ? demoRoster : mergePreviousRoster(JSON.parse(previous))
  localStorage.setItem(storageKey, JSON.stringify(roster))
  return roster
}

export function readRoster() {
  return readStoredRoster().filter(student => !student.deletedAt)
}

export function deleteStudent(historyId) {
  const roster = readStoredRoster()
  if (!roster.some(student => student.historyId === historyId && !student.deletedAt)) {
    throw new Error('This student is no longer on the active roster.')
  }

  const deletedAt = new Date().toISOString()
  const nextRoster = roster.map(student =>
    student.historyId === historyId ? { ...student, deletedAt } : student)
  localStorage.setItem(storageKey, JSON.stringify(nextRoster))
  return nextRoster.filter(student => !student.deletedAt)
}

export function saveStudent(input, historyId = null) {
  const student = {
    id: input.id.trim(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    batch: input.batch,
  }
  const errors = {}
  if (!student.id) errors.id = 'Enter a student ID.'
  if (!student.name) errors.name = 'Enter a full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) errors.email = 'Enter a valid Google account email.'
  if (!batches.includes(student.batch)) errors.batch = 'Select a batch.'

  const roster = readStoredRoster()
  const others = roster.filter(entry => entry.historyId !== historyId)
  const id = student.id.toLowerCase()
  if (!errors.id && others.some(entry => entry.id.toLowerCase() === id || entry.historyId.toLowerCase() === id)) {
    errors.id = 'This student ID is already in use.'
  }
  if (!errors.email && others.some(entry => entry.email.toLowerCase() === student.email)) {
    errors.email = 'This email is already in use.'
  }
  if (Object.keys(errors).length) return { errors }
  if (historyId !== null && !roster.some(entry => entry.historyId === historyId && !entry.deletedAt)) {
    throw new Error('This student could not be found.')
  }

  // Keep the original ID as the key for attendance and tuition, even after an ID edit.
  const saved = { ...student, historyId: historyId ?? student.id }
  const nextRoster = historyId === null
    ? [...roster, saved]
    : roster.map(entry => entry.historyId === historyId ? saved : entry)
  localStorage.setItem(storageKey, JSON.stringify(nextRoster))
  return { roster: nextRoster.filter(entry => !entry.deletedAt), student: saved }
}
