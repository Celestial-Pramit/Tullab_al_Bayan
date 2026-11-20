import { initialData } from '../../demo.js'

export const scholarships = [0, 50, 100]
export const paymentStatuses = ['Paid', 'Unpaid']
export const coveredStatus = 'Covered by scholarship'
const storageKey = 'bayan-tuition-v1'
const sampleRecords = Object.fromEntries(Object.entries(initialData.tuition).map(([key, payment]) => [
  key, { baseFee: 100000, scholarship: 0, payment },
]))

export function readTuition() {
  const saved = localStorage.getItem(storageKey)
  return saved === null ? sampleRecords : JSON.parse(saved)
}

export function tuitionFor(records, month, historyId) {
  const record = records[month + ':' + historyId] ?? { baseFee: 0, scholarship: 0, payment: 'Unpaid' }
  const due = Math.round(record.baseFee * (100 - record.scholarship) / 100)
  const status = record.scholarship === 100 ? coveredStatus : due > 0 ? record.payment : 'No amount due'
  return { ...record, due, status }
}

export function parseFee(value) {
  const trimmed = value.trim()
  if (!/^\d{1,9}(?:\.\d{1,2})?$/.test(trimmed)) {
    throw new Error('Enter a valid fee with up to two decimal places.')
  }
  return Math.round(Number(trimmed) * 100)
}

export function saveTuition(month, historyId, changes) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Choose a billing month.')
  const records = readTuition()
  const { baseFee, scholarship, payment } = { ...tuitionFor(records, month, historyId), ...changes }
  if (!Number.isSafeInteger(baseFee) || baseFee < 0 || !scholarships.includes(scholarship)
      || !paymentStatuses.includes(payment)) throw new Error('Enter valid tuition details.')
  if (changes.payment && Math.round(baseFee * (100 - scholarship) / 100) === 0) {
    throw new Error('Payment status is available when an amount is due.')
  }
  const next = { ...records, [month + ':' + historyId]: { baseFee, scholarship, payment } }
  localStorage.setItem(storageKey, JSON.stringify(next))
  return next
}

export function listStudentTuition(historyId) {
  const records = readTuition()
  return Object.keys(records)
    .filter(key => key.slice(8) === historyId)
    .map(key => key.slice(0, 7))
    .sort((first, second) => second.localeCompare(first))
    .map(month => ({ month, ...tuitionFor(records, month, historyId) }))
}
