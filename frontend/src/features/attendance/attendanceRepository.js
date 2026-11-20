import { initialData } from '../../demo.js'
import { batches } from '../roster/rosterRepository.js'

export const sessionTypes = ['Physical', 'Online']
export const markOptions = ['Present', 'Late', 'Sick', 'Absent']
const storageKey = 'bayan-attendance-v1'
const sampleSessions = initialData.sessions.flatMap(session => {
  const sampleBatches = session.id === '1' ? ['Saturday', 'Monday'] : ['Saturday']
  return sampleBatches.map(batch => ({
    ...session,
    batch,
    id: batch + ':' + session.id,
    marks: Object.fromEntries(Object.entries(initialData.attendance).flatMap(([key, mark]) => {
      const [sessionId, historyId] = key.split(':')
      const studentBatch = historyId === 'AB-002' ? 'Monday' : 'Saturday'
      return sessionId === session.id && studentBatch === batch ? [[historyId, mark]] : []
    })),
  }))
})

export function readSessions() {
  const saved = localStorage.getItem(storageKey)
  return saved === null ? sampleSessions : JSON.parse(saved)
}

function newSession(batch, date, type) {
  if (!batches.includes(batch) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !sessionTypes.includes(type)) {
    throw new Error('Choose a class date and session type.')
  }
  return { id: crypto.randomUUID(), batch, date, type, marks: {} }
}

export function createSession(batch, date, type) {
  const session = newSession(batch, date, type)
  const sessions = [...readSessions(), session]
  localStorage.setItem(storageKey, JSON.stringify(sessions))
  return { sessions, session }
}

export function saveMark({ sessionId, batch, date, type, historyId, mark }) {
  if (!markOptions.includes(mark)) throw new Error('Choose an attendance mark.')

  const saved = readSessions()
  const existing = sessionId
    ? saved.find(session => session.id === sessionId)
    : saved.find(session => session.batch === batch && session.date === date && session.type === type)
  if (sessionId && !existing) throw new Error('The selected session is unavailable.')

  const target = existing ?? newSession(batch, date, type)
  const session = { ...target, marks: { ...target.marks, [historyId]: mark } }
  const sessions = existing
    ? saved.map(item => item.id === session.id ? session : item)
    : [...saved, session]
  localStorage.setItem(storageKey, JSON.stringify(sessions))
  return { sessions, session }
}
