import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminBatchPage, fieldClass } from '../admin/AdminBatchPage.jsx'
import { coveredStatus, feeNotSetStatus, noAmountDueStatus, parseFee, paymentStatuses, readTuition, saveTuition, scholarships, tuitionFor, tuitionStatuses } from './tuitionRepository.js'

import { formatTuitionAmount } from './tuitionFormat.js'
import { TuitionHistory } from './StudentTuition.jsx'

const currentMonth = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Dhaka', dateStyle: 'short' }).format(new Date()).slice(0, 7)

function TuitionRow({ student, record, onSave, mode }) {
  const [fee, setFee] = useState(() => record.baseFee === null ? '' : String(record.baseFee / 100))
  const [feeError, setFeeError] = useState('')
  const feeErrorId = React.useId()

  function submitFee(event) {
    event.preventDefault()
    try {
      const baseFee = parseFee(fee)
      if (onSave({ baseFee })) setFee(String(baseFee / 100))
      setFeeError('')
    } catch (error) {
      setFeeError(error.message)
    }
  }

  return (
    <tr>
      <th scope="row" className="bg-transparent">
        <span className="block">{student.name}</span>
        <span className="text-sm font-normal text-slate-600">{student.id}</span>
      </th>
      <td>
        {mode === 'management' ? <form onSubmit={submitFee} className="min-w-44">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-xs text-slate-600">BDT</span>
            <input type="text" inputMode="decimal" className={fieldClass + ' min-w-0'}
              aria-label={'Base fee in BDT for ' + student.name} placeholder={record.baseFee === null ? feeNotSetStatus : undefined} value={fee}
              aria-invalid={Boolean(feeError)} aria-describedby={feeError ? feeErrorId : undefined}
              onChange={event => { setFee(event.target.value); setFeeError('') }} />
            <button type="submit" className="rounded-lg border border-surface-border px-2 py-2 font-semibold text-blue-800 hover:bg-blue-50"
              aria-label={'Save fee for ' + student.name}>Save</button>
          </div>
          {feeError && <p id={feeErrorId} role="alert" className="mt-1 text-sm text-red-800">{feeError}</p>}
        </form> : record.baseFee === null ? feeNotSetStatus : formatTuitionAmount(record.baseFee)}
      </td>
      <td>
        {['management', 'scholarship'].includes(mode) ? <select className={fieldClass + ' min-w-20'} aria-label={'Scholarship for ' + student.name}
          value={record.scholarship} onChange={event => onSave({ scholarship: Number(event.target.value) })}>
          {scholarships.map(value => <option key={value} value={value}>{value}%</option>)}
        </select> : record.scholarship + '%'}
      </td>
      <td className="whitespace-nowrap font-semibold tabular-nums">{record.due === null ? '—' : formatTuitionAmount(record.due)}</td>
      <td>
        {record.due > 0 && ['management', 'payment'].includes(mode) ? (
          <select className={fieldClass} aria-label={'Payment status for ' + student.name}
            value={record.payment} onChange={event => onSave({ payment: event.target.value })}>
            {paymentStatuses.map(status => <option key={status}>{status}</option>)}
          </select>
        ) : <span className="inline-block rounded-md bg-blue-50 px-2 py-1 font-semibold text-blue-900">{record.status}</span>}
      </td>
    </tr>
  )
}

const emptyByStatus = {
  Paid: 'No paid students for this batch and month.',
  Unpaid: 'No unpaid students for this batch and month.',
  [coveredStatus]: 'No students covered by scholarship for this batch and month.',
  [feeNotSetStatus]: 'No students with unset fees for this batch and month.',
  [noAmountDueStatus]: 'No students with zero fees due for this batch and month.',
}

function BatchTuition({ students, mode, month, onMonthChange }) {
  const [filter, setFilter] = useState('All statuses')
  const [search, setSearch] = useState('')
  const [historyId, setHistoryId] = useState('')
  const historyStudent = students.find(student => student.historyId === historyId)
  const [data, setData] = useState(() => {
    try {
      return { records: readTuition(), error: '' }
    } catch {
      return { records: {}, error: 'Saved tuition could not be loaded. Refresh to try again.' }
    }
  })
  const [feedback, setFeedback] = useState(null)
  const roster = students.map(student => ({ student, record: tuitionFor(data.records, month, student.historyId) }))
  const counts = Object.fromEntries(tuitionStatuses.map(status => [status, 0]))
  for (const { record } of roster) counts[record.status]++
  const query = search.trim().toLowerCase()
  const rows = roster.filter(({ student, record }) =>
    (filter === 'All statuses' || record.status === filter) &&
    (student.name.toLowerCase().includes(query) || student.id.toLowerCase().includes(query)))
  function selectFilter(status) {
    setFilter(status)
    setFeedback(null)
  }

  function save(student, changes) {
    try {
      setData({ records: saveTuition(month, student.historyId, changes), error: '' })
      setFeedback({ message: 'Tuition updated for ' + student.name + '.', error: false })
      return true
    } catch {
      setFeedback({ message: 'Tuition could not be saved. Check the billing month and try again.', error: true })
      return false
    }
  }

  if (data.error) return <p role="alert" className="mt-4 text-red-800">{data.error}</p>

  return (
    <>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="block min-w-0 text-sm font-semibold">Billing month
          <input type="month" className={fieldClass + ' mt-1'} value={month} required
            onChange={event => { onMonthChange(event.target.value); selectFilter('All statuses') }} />
        </label>
        <label className="block text-sm font-semibold">Filter by payment status
          <select className={fieldClass + ' mt-1'} value={filter}
            onChange={event => selectFilter(event.target.value)}>
            {['All statuses', ...tuitionStatuses].map(status => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="block min-w-0 text-sm font-semibold">Search roster
          <input type="search" className={fieldClass + ' mt-1'} placeholder="Name or student ID" value={search}
            onChange={event => setSearch(event.target.value)} />
        </label>
      </div>
      {mode === 'management' && (
        <p className="mt-4 text-sm text-slate-600">Payment status tracks payments received outside the portal.</p>
      )}
      {month && (
        <section aria-label="Batch payment summary" className="mt-4">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[...paymentStatuses, coveredStatus, feeNotSetStatus].map(status => (
              <button key={status} type="button" aria-pressed={filter === status}
                className="interactive-card rounded-xl border border-surface-border bg-field px-3 py-2 text-left aria-pressed:border-sky-700 aria-pressed:bg-sky-100 aria-pressed:ring-1 aria-pressed:ring-sky-700"
                onClick={() => selectFilter(status)}>
                <span className="block text-sm font-semibold text-slate-700">{status}</span>
                <span className="block text-xl font-bold tabular-nums">{counts[status]}</span>
              </button>
            ))}
          </div>
          {counts[noAmountDueStatus] > 0 && <p className="mt-2 text-sm text-slate-600">{noAmountDueStatus} · {counts[noAmountDueStatus]}</p>}
          {filter !== 'All statuses' && (
            <button type="button" className="mt-3 rounded-lg border border-field-border px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-sky-100"
              onClick={() => selectFilter('All statuses')}>Clear filter</button>
          )}
        </section>
      )}
      {feedback && <p className={'mt-4 text-sm ' + (feedback.error ? 'text-red-800' : 'text-blue-900')}
        role={feedback.error ? 'alert' : 'status'}>{feedback.message}</p>}
      {!students.length ? <p className="mt-5 text-slate-600">No students in this batch yet.</p> :
        !month ? <p className="mt-5 text-slate-600">Choose a billing month to view tuition.</p> :
        !rows.length ? <p className="mt-5 text-slate-600" role="status">
          {counts[filter] === 0 ? emptyByStatus[filter] : 'No students match your search and payment filter.'}
        </p> : (
          <div className="table-wrap" role="region" tabIndex={0} aria-label="Tuition roster">
            <table className="min-w-2xl">
              <thead><tr>{['Student', 'Base fee', 'Scholarship', 'Amount due', 'Payment status'].map(title =>
                <th key={title} scope="col">{title}</th>)}</tr></thead>
              <tbody>{rows.map(({ student, record }) => (
                <TuitionRow key={JSON.stringify([month, student.historyId])}
                  student={student} record={record} mode={mode} onSave={changes => save(student, changes)} />
              ))}</tbody>
            </table>
          </div>
        )}
      {mode === 'ledger' && students.length > 0 && (
        <section className="mt-6 border-t border-surface-border pt-5" aria-labelledby="individual-ledger-title">
          <h3 id="individual-ledger-title" className="font-bold">Individual student records</h3>
          <label className="mt-3 block max-w-sm text-sm font-semibold">View student ledger
            <select className={fieldClass + ' mt-1'} value={historyId} onChange={event => setHistoryId(event.target.value)}>
              <option value="">Select a student</option>
              {students.map(student => <option key={student.historyId} value={student.historyId}>{student.name} · {student.id}</option>)}
            </select>
          </label>
          {historyStudent && <TuitionHistory student={historyStudent} />}
        </section>
      )}
    </>
  )
}

export default function AdminTuition({ title = 'Tuition Management', mode = 'management' }) {
  const [params, setParams] = useSearchParams()
  const requestedMonth = params.get('month')
  const month = requestedMonth === '' || /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth)
    ? requestedMonth : currentMonth()

  function changeMonth(nextMonth) {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      next.set('month', nextMonth)
      return next
    }, { replace: true })
  }

  return (
    <AdminBatchPage title={title}>
      {({ batch, students }) => <BatchTuition key={batch} students={students} mode={mode} month={month} onMonthChange={changeMonth} />}
    </AdminBatchPage>
  )
}
