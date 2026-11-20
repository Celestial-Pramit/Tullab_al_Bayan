import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { formatBillingMonth, formatTuitionAmount } from './tuitionFormat.js'
import { listStudentTuition } from './tuitionRepository.js'

export function TuitionHistory({ student, waiverOnly = false }) {
  let records
  try {
    records = listStudentTuition(student.historyId)
  } catch {
    return <p role="alert" className="mt-5 text-red-800">Tuition records could not be loaded. Refresh to try again.</p>
  }
  return waiverOnly ? <MonthlyWaiver records={records} /> : <TuitionTable records={records} />
}

function MonthlyWaiver({ records }) {
  const [month, setMonth] = useState(() => records[0]?.month ??
    new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Dhaka', dateStyle: 'short' }).format(new Date()).slice(0, 7))
  const record = records.find(item => item.month === month)
  return (
    <>
      <label className="mt-5 block max-w-xs text-sm font-semibold">Billing month
        <input type="month" value={month} onChange={event => setMonth(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-field-border bg-field p-2" />
      </label>
      {record ? (
        <>
          {record.scholarship === 0 && <p className="page-description">No scholarship or waiver was recorded for this month.</p>}
          <TuitionTable records={[record]} label="Monthly waiver details" />
        </>
      ) : <p className="page-description">{month ? 'No tuition or waiver record was found for this month.' : 'Select a billing month to view waiver details.'}</p>}
    </>
  )
}

function TuitionTable({ records, label = 'Monthly tuition records' }) {
  if (!records.length) return <p className="page-description">No tuition records have been recorded.</p>
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={label}>
      <table className="min-w-xl">
        <thead><tr>{['Billing month', 'Base fee', 'Scholarship', 'Amount due', 'Payment status'].map(column =>
          <th key={column} scope="col">{column}</th>)}</tr></thead>
        <tbody>{records.map(record => (
          <tr key={record.month}>
            <th scope="row" className="bg-transparent">{formatBillingMonth(record.month)}</th>
            <td>{formatTuitionAmount(record.baseFee)}</td>
            <td>{record.scholarship}% · {formatTuitionAmount(record.baseFee - record.due)} off</td>
            <td className="font-semibold">{formatTuitionAmount(record.due)}</td>
            <td>{record.status}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

export default function StudentTuition({ title, waiverOnly }) {
  const { account } = useOutletContext()

  return (
    <>
      <h1>{title}</h1>
      <p className="page-description">Demo tuition records for {account.name}.</p>
      <TuitionHistory student={account} waiverOnly={waiverOnly} />
    </>
  )
}
