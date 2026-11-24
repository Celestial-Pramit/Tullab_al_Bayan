import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { formatBillingMonth, formatTuitionAmount } from './tuitionFormat.js'
import { feeNotSetStatus, listStudentTuition } from './tuitionRepository.js'

export function TuitionHistory({ studentUuid, waiverOnly = false }) {
  const [state, setState] = useState({ records: [], loading: true, error: '' })
  useEffect(() => {
    let active = true
    setState({ records: [], loading: true, error: '' })
    listStudentTuition(studentUuid)
      .then(records => { if (active) setState({ records, loading: false, error: '' }) })
      .catch(() => { if (active) setState({ records: [], loading: false, error: 'Tuition records could not be loaded. Refresh to try again.' }) })
    return () => { active = false }
  }, [studentUuid])
  if (state.loading) return <p className="mt-5">Loading tuition records…</p>
  if (state.error) return <p role="alert" className="mt-5 text-red-800">{state.error}</p>
  const records = waiverOnly ? state.records.filter(record => record.scholarship > 0) : state.records
  if (!records.length) return <p className="page-description">No tuition records have been recorded.</p>
  return <div className="table-wrap" tabIndex={0} role="region" aria-label="Monthly tuition records"><table className="min-w-xl"><thead><tr>{['Billing month', 'Base fee', 'Scholarship', 'Amount due', 'Payment status'].map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{records.map(record => <tr key={record.id}><th scope="row">{formatBillingMonth(record.month)}</th><td>{record.baseFee === null ? feeNotSetStatus : formatTuitionAmount(record.baseFee)}</td><td>{record.scholarship}%</td><td>{record.due === null ? '—' : formatTuitionAmount(record.due)}</td><td>{record.status}</td></tr>)}</tbody></table></div>
}

export default function StudentTuition({ title, waiverOnly }) {
  const { account } = useOutletContext()
  return <><h1>{title}</h1><p className="page-description">Tuition records for {account.name}.</p>{account.isActive === false && <p className="rounded-lg bg-amber-50 p-3 text-amber-950">This is a read-only former-student ledger.</p>}<TuitionHistory studentUuid={account.studentUuid} waiverOnly={waiverOnly} /></>
}
