import { initialData } from '../../demo.js'
import { batches } from '../roster/rosterRepository.js'

const storageKey = 'bayan-homework-v1'
const sampleHomework = initialData.homework.map(item => ({
  id: 'demo-' + item.id,
  batch: 'Saturday',
  text: item.title + '\n\n' + item.instructions,
  deadline: item.deadline,
  publishedAt: '2026-11-20T00:00:00.000Z',
}))

export function readHomework(batch) {
  const saved = localStorage.getItem(storageKey)
  const assignments = saved === null ? sampleHomework : JSON.parse(saved)
  const matching = batch === undefined ? assignments : assignments.filter(item => item.batch === batch)
  return [...matching].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function saveHomework(batch, text, id) {
  if (!batches.includes(batch) || !text.trim()) throw new Error('Enter homework text for the selected batch.')
  const assignments = readHomework()
  if (id && !assignments.some(item => item.id === id && item.batch === batch)) {
    throw new Error('This assignment is no longer available in this batch.')
  }
  const next = id
    ? assignments.map(item => item.id === id && item.batch === batch ? { ...item, text } : item)
    : [{ id: crypto.randomUUID(), batch, text, publishedAt: new Date().toISOString() }, ...assignments]
  localStorage.setItem(storageKey, JSON.stringify(next))
}

export function deleteHomework(batch, id) {
  const next = readHomework().filter(item => item.id !== id || item.batch !== batch)
  localStorage.setItem(storageKey, JSON.stringify(next))
}

export function homeworkTitle(text) {
  return text.trim().split(/\r?\n/, 1)[0]
}
