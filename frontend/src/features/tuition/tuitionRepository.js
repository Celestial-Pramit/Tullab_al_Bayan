import { initialData } from '../../demo.js'

export const scholarships = [0, 50, 100]
export const paymentStatuses = ['Paid', 'Unpaid']
export const coveredStatus = 'Covered by scholarship'
export const feeNotSetStatus = 'Fee not set'
export const noAmountDueStatus = 'No amount due'
export const tuitionStatuses = [...paymentStatuses, coveredStatus, feeNotSetStatus, noAmountDueStatus]
const storageKey = 'bayan-tuition-v1'
const sampleRecords = Object.fromEntries(Object.entries(initialData.tuition).map(([key, payment]) => [
  key, { baseFee: 100000, scholarship: 0, payment },
]))

export function readTuition() {
  const saved = localStorage.getItem(storageKey)
  return saved === null ? sampleRecords : JSON.parse(saved)
}

function amountDue(baseFee, scholarship) {
  if (scholarship === 100) return 0
  if (baseFee === null) return null
  return scholarship === 50 ? Math.round(baseFee / 2) : baseFee
}

export function tuitionFor(records, month, historyId) {
  const record = records[month + ':' + historyId]
  const baseFee = record?.baseFee ?? null
  const scholarship = record?.scholarship ?? 0
  const payment = record?.payment ?? 'Unpaid'
  const due = amountDue(baseFee, scholarship)
  const status = scholarship === 100 ? coveredStatus : due === null ? feeNotSetStatus : due > 0 ? payment : noAmountDueStatus
  return { baseFee, scholarship, payment, due, status }
}
export function parseFee(value) {
  const trimmed = value.trim()
  if (!/^\d{1,9}(?:\.\d{1,2})?$/.test(trimmed)) {
    throw new Error('Enter a non-negative BDT fee with up to nine whole digits and two decimal places.')
  }
  return Math.round(Number(trimmed) * 100)
}

export function saveTuition(month, historyId, changes) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Choose a billing month.')
  const records = readTuition()
  const { baseFee, scholarship, payment } = { ...tuitionFor(records, month, historyId), ...changes }
  if ((baseFee !== null && (!Number.isSafeInteger(baseFee) || baseFee < 0)) || !scholarships.includes(scholarship)
      || !paymentStatuses.includes(payment)) throw new Error('Enter valid tuition details.')
  if (changes.payment && !(amountDue(baseFee, scholarship) > 0)) {
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
