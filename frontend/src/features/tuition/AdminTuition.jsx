import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminBatchPage, fieldClass } from '../admin/AdminBatchPage.jsx'
import { coveredStatus, parseFee, paymentStatuses, readTuition, saveTuition, scholarships, tuitionFor } from './tuitionRepository.js'

import { formatTuitionAmount } from './tuitionFormat.js'
import { TuitionHistory } from './StudentTuition.jsx'

const currentMonth = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Dhaka', dateStyle: 'short' }).format(new Date()).slice(0, 7)

function TuitionRow({ student, record, onSave, mode }) {
  const [fee, setFee] = useState(String(record.baseFee / 100))
  const [feeError, setFeeError] = useState('')
  const feeErrorId = React.useId()

  function submitFee(event) {
    event.preventDefault()
    try {
      onSave({ baseFee: parseFee(fee) })
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
              aria-label={'Base fee in BDT for ' + student.name} value={fee}
              aria-invalid={Boolean(feeError)} aria-describedby={feeError ? feeErrorId : undefined}
              onChange={event => { setFee(event.target.value); setFeeError('') }} />
            <button type="submit" className="rounded-lg border border-surface-border px-2 py-2 font-semibold text-blue-800 hover:bg-blue-50"
              aria-label={'Save fee for ' + student.name}>Save</button>
          </div>
          {feeError && <p id={feeErrorId} role="alert" className="mt-1 text-sm text-red-800">{feeError}</p>}
        </form> : formatTuitionAmount(record.baseFee)}
      </td>
      <td>
        {['management', 'scholarship'].includes(mode) ? <select className={fieldClass + ' min-w-20'} aria-label={'Scholarship for ' + student.name}
          value={record.scholarship} onChange={event => onSave({ scholarship: Number(event.target.value) })}>
          {scholarships.map(value => <option key={value} value={value}>{value}%</option>)}
        </select> : record.scholarship + '%'}
      </td>
      <td className="whitespace-nowrap font-semibold tabular-nums">{formatTuitionAmount(record.due)}</td>
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

function BatchTuition({ students, mode, initialMonth }) {
  const [month, setMonth] = useState(() => initialMonth ?? currentMonth())
  const [filter, setFilter] = useState('All statuses')
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
  const rows = students.map(student => ({ student, record: tuitionFor(data.records, month, student.historyId) }))
    .filter(({ record }) => filter === 'All statuses' || record.status === filter)

  function save(student, changes) {
    try {
      setData({ records: saveTuition(month, student.historyId, changes), error: '' })
      setFeedback({ message: 'Tuition updated for ' + student.name + '.', error: false })
    } catch {
      setFeedback({ message: 'Tuition could not be saved. Check the billing month and try again.', error: true })
    }
  }

  if (data.error) return <p role="alert" className="mt-4 text-red-800">{data.error}</p>

  return (
    <>
      <div className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2">
        <label className="block min-w-0 text-sm font-semibold">Billing month
          <input type="month" className={fieldClass + ' mt-1'} value={month} required
            onChange={event => { setMonth(event.target.value); setFeedback(null) }} />
        </label>
        <label className="block text-sm font-semibold">Filter by payment status
          <select className={fieldClass + ' mt-1'} value={filter}
            onChange={event => { setFilter(event.target.value); setFeedback(null) }}>
            {['All statuses', ...paymentStatuses, coveredStatus].map(status => <option key={status}>{status}</option>)}
          </select>
        </label>
      </div>
      {feedback && <p className={'mt-4 text-sm ' + (feedback.error ? 'text-red-800' : 'text-blue-900')}
        role={feedback.error ? 'alert' : 'status'}>{feedback.message}</p>}
      {!students.length ? <p className="mt-5 text-slate-600">No students in this batch yet.</p> :
        !month ? <p className="mt-5 text-slate-600">Choose a billing month to view tuition.</p> :
        !rows.length ? <p className="mt-5 text-slate-600">No students match this payment status.</p> : (
          <div className="table-wrap" role="region" tabIndex={0} aria-label="Tuition roster">
            <table className="min-w-2xl">
              <thead><tr>{['Student', 'Base fee', 'Scholarship', 'Amount due', 'Payment status'].map(title =>
                <th key={title} scope="col">{title}</th>)}</tr></thead>
              <tbody>{rows.map(({ student, record }) => (
                <TuitionRow key={JSON.stringify([month, student.historyId, record.baseFee])}
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
  const [params] = useSearchParams()
  const requestedMonth = params.get('month')
  const initialMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : undefined
  return (
    <AdminBatchPage title={title}>
      {({ batch, students }) => <BatchTuition key={batch + (initialMonth ?? "")} students={students} mode={mode} initialMonth={initialMonth} />}
    </AdminBatchPage>
  )
}
