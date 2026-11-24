import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminBatchPage, buttonClass, fieldClass } from '../admin/AdminBatchPage.jsx'
import { formatTuitionAmount } from './tuitionFormat.js'
import { TuitionHistory } from './StudentTuition.jsx'
import { generateMonthlyTuition, listMonthlyTuition, parseFee, paymentStatuses, saveTuition, scholarships } from './tuitionRepository.js'

const currentMonth = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Dhaka', dateStyle: 'short' }).format(new Date()).slice(0, 7)

function TuitionRow({ student, record, mode, onSaved }) {
  const [fee, setFee] = useState(record?.baseFee?.toFixed(2) ?? '')
  const [scholarship, setScholarship] = useState(record?.scholarship ?? student.defaultScholarshipPercent ?? 0)
  const [payment, setPayment] = useState(record?.payment ?? 'Unpaid')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { setFee(record?.baseFee?.toFixed(2) ?? ''); setScholarship(record?.scholarship ?? student.defaultScholarshipPercent ?? 0); setPayment(record?.payment ?? 'Unpaid') }, [record, student])
  const parsed = parseFee(fee)
  const due = scholarship === 100 ? 0 : parsed.value == null ? null : Math.round(parsed.value * (100 - scholarship)) / 100
  const paymentDisabled = due == null || due <= 0

  async function save() {
    if (!record) { setError('Generate this month before editing its record.'); return }
    if (parsed.error) { setError(parsed.error); return }
    if (record.payment === 'Paid' && (parsed.value !== record.baseFee || scholarship !== record.scholarship) && !window.confirm('This record is already Paid. Change its fee or scholarship?')) return
    setSaving(true); setError('')
    try { await saveTuition(record, { baseFee: parsed.value, scholarship, payment: paymentDisabled ? record.payment : payment }); onSaved() } catch (caught) { setError(caught.message || 'The tuition record could not be saved.') } finally { setSaving(false) }
  }

  return <tr><th scope="row"><strong>{student.name}</strong><span className="block text-xs font-normal">{student.id}</span></th><td><input aria-label={`Base fee for ${student.name}`} className={fieldClass + ' min-w-32'} type="number" min="0" step="0.01" disabled={!record || mode === 'payment'} value={fee} onChange={event => setFee(event.target.value)} /></td><td><select aria-label={`Scholarship for ${student.name}`} className={fieldClass} disabled={!record || mode === 'payment'} value={scholarship} onChange={event => setScholarship(Number(event.target.value))}>{scholarships.map(value => <option key={value} value={value}>{value}%</option>)}</select></td><td>{due === null ? 'Fee not set' : formatTuitionAmount(due)}</td><td><select aria-label={`Payment for ${student.name}`} className={fieldClass} disabled={!record || paymentDisabled || mode === 'scholarship'} value={payment} onChange={event => setPayment(event.target.value)}>{paymentStatuses.map(value => <option key={value}>{value}</option>)}</select></td><td><button type="button" className={buttonClass} disabled={!record || saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>{error && <p className="mt-1 max-w-xs text-xs text-red-800">{error}</p>}</td></tr>
}

function BatchTuition({ batchId, batch, students, month, mode }) {
  const [state, setState] = useState({ records: [], loading: true, error: '' })
  const [notice, setNotice] = useState('')
  const [selectedStudentUuid, setSelectedStudentUuid] = useState('')
  async function load() {
    setState(current => ({ ...current, loading: true, error: '' }))
    try { setState({ records: await listMonthlyTuition({ billingMonth: month, batchId }), loading: false, error: '' }) } catch { setState({ records: [], loading: false, error: 'Tuition records could not be loaded.' }) }
  }
  useEffect(() => { load() }, [batchId, month])
  const byStudent = useMemo(() => new Map(state.records.map(record => [record.studentUuid, record])), [state.records])
  async function generate() {
    try { const count = await generateMonthlyTuition(month, batchId); setNotice(`${count} tuition record${count === 1 ? '' : 's'} generated for ${batch}.`); await load() } catch { setNotice('Monthly tuition could not be generated.') }
  }
  const historyStudent = students.find(student => student.uuid === selectedStudentUuid)

  if (mode === 'ledger') return <section className="mt-5 rounded-2xl border border-surface-border bg-surface p-5"><label className="block max-w-lg font-semibold">Student<select className={fieldClass + ' mt-1'} value={selectedStudentUuid} onChange={event => setSelectedStudentUuid(event.target.value)}><option value="">Select a student</option>{students.map(student => <option key={student.uuid} value={student.uuid}>{student.name} · {student.id}</option>)}</select></label>{historyStudent && <TuitionHistory studentUuid={historyStudent.uuid} />}</section>

  return <><div className="mt-4 flex flex-wrap items-end gap-3"><button type="button" className={buttonClass} onClick={generate}>Generate Monthly Tuition</button>{notice && <p role="status">{notice}</p>}</div>{state.error && <p role="alert" className="mt-3 text-red-800">{state.error}</p>}{state.loading ? <p className="mt-4">Loading tuition…</p> : <div className="mt-5 overflow-x-auto"><table className="min-w-full"><thead><tr>{['Student', 'Base fee', 'Scholarship', 'Amount due', 'Payment', 'Action'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{students.map(student => <TuitionRow key={student.uuid} student={student} record={byStudent.get(student.uuid)} mode={mode} onSaved={load} />)}</tbody></table></div>}</>
}

export default function AdminTuition({ title = 'Tuition Management', mode = 'management' }) {
  const [params, setParams] = useSearchParams()
  const requested = params.get('month')
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requested ?? '') ? requested : currentMonth()
  return <AdminBatchPage title={title} workspaceLabel="Admin dashboard">{({ batchId, batch, students }) => <><label className="mt-4 block max-w-xs text-sm font-semibold">Billing month<input className={fieldClass + ' mt-1'} type="month" value={month} onChange={event => setParams(current => { const next = new URLSearchParams(current); next.set('month', event.target.value); return next })} /></label><BatchTuition key={`${batchId}-${month}-${mode}`} batchId={batchId} batch={batch} students={students} month={month} mode={mode} /></>}</AdminBatchPage>
}
