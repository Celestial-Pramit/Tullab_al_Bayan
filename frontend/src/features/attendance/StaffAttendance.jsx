import React, { useState } from 'react'
import { AdminBatchPage, buttonClass, fieldClass } from '../admin/AdminBatchPage.jsx'
import './staffAttendance.css'
import { createSession, markOptions, readSessions, saveMark, sessionTypes } from './attendanceRepository.js'

const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Dhaka', dateStyle: 'short' }).format(new Date())

function BatchAttendance({ batch, students }) {
  const [date, setDate] = useState(today)
  const [type, setType] = useState(sessionTypes[0])
  const [selectedId, setSelectedId] = useState('')
  const [data, setData] = useState(() => {
    try {
      return { sessions: readSessions(), error: '' }
    } catch {
      return { sessions: [], error: 'Saved attendance could not be loaded. Refresh to try again.' }
    }
  })
  const [actionError, setActionError] = useState('')
  const [markErrors, setMarkErrors] = useState({})
  const available = data.sessions.filter(session => session.batch === batch && session.date === date)
  const session = available.find(item => item.id === selectedId) ?? available[0]

  const roster = students.map(student => ({
    ...student,
    mark: session && Object.hasOwn(session.marks, student.historyId)
      ? session.marks[student.historyId]
      : 'Unmarked',
  }))
  const totals = Object.fromEntries(['Total Students', ...markOptions, 'Unmarked'].map(mark => [mark, 0]))
  totals['Total Students'] = roster.length
  for (const student of roster) totals[student.mark]++

  function addSession(event) {
    event.preventDefault()
    try {
      const result = createSession(batch, date, type)
      setData({ sessions: result.sessions, error: '' })
      setSelectedId(result.session.id)
      setMarkErrors({})
      setActionError('')
    } catch {
      setActionError('The session could not be created. Check the date and try again.')
    }
  }

  function updateMark(student, mark) {
    try {
      const result = saveMark({ sessionId: session?.id, batch, date, type, historyId: student.historyId, mark })
      setData({ sessions: result.sessions, error: '' })
      setSelectedId(result.session.id)
      setActionError('')
      setMarkErrors(errors => ({ ...errors, [student.historyId]: false }))
    } catch {
      setMarkErrors(errors => ({ ...errors, [student.historyId]: true }))
    }
  }

  if (data.error) return <p role="alert" className="mt-4 text-red-800">{data.error}</p>

  return (
    <>
      <form className="mt-4 grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={addSession}>
        <label className="block min-w-0 text-sm font-semibold">Class date
          <input className={fieldClass + ' mt-1'} type="date" required value={date}
            onChange={event => { setDate(event.target.value); setSelectedId(''); setActionError(''); setMarkErrors({}) }} />
        </label>
        <label className="block text-sm font-semibold">Session
          <select className={fieldClass + ' mt-1'} value={session?.id ?? ''} disabled={!available.length}
            onChange={event => { setSelectedId(event.target.value); setActionError(''); setMarkErrors({}) }}>
            {!available.length && <option value="">No sessions for this date</option>}
            {available.map((item, index) => <option key={item.id} value={item.id}>{item.type} · Session {index + 1}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">New session type
          <select className={fieldClass + ' mt-1'} value={type} onChange={event => setType(event.target.value)}>
            {sessionTypes.map(option => <option key={option}>{option}</option>)}
          </select>
        </label>
        <button type="submit" className={buttonClass}>Create session</button>
      </form>
      {actionError && <p role="alert" className="mt-3 text-red-800">{actionError}</p>}
      <dl aria-label="Session totals" aria-live="polite" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {Object.entries(totals).map(([mark, count]) => (
            <div key={mark} className="rounded-xl bg-blue-50 px-3 py-2 sm:px-4">
              <dt className="text-sm font-semibold text-slate-700">{mark}</dt>
              <dd className="text-xl font-bold tabular-nums">{count}</dd>
            </div>
          ))}
      </dl>
      {!students.length ? <p className="mt-5 text-slate-600">No students in this batch yet.</p> : (
        <>
          {!session && <p className="mt-5 text-sm text-slate-600">Your first mark creates a session for the selected date and class type.</p>}
          <div className="staff-roster">
            <table role="table" aria-label="Attendance roster">
              <thead role="rowgroup">
                <tr role="row">
                  {['Student Name', 'Student ID', 'Current Status', 'Mark Attendance'].map(label => (
                    <th key={label} role="columnheader" scope="col">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody role="rowgroup">
                {roster.map(student => (
                  <tr key={student.historyId} role="row">
                    <th scope="row" role="rowheader" className="staff-student-name">{student.name}</th>
                    <td role="cell" className="staff-student-id">{student.id}</td>
                    <td role="cell" className="staff-student-status">
                      <span className="staff-status" data-mark={student.mark}>{student.mark}</span>
                    </td>
                    <td role="cell" className="staff-mark-cell">
                      <div role="group" aria-label={'Attendance for ' + student.name} className="staff-mark-buttons">
                        {markOptions.map(mark => (
                          <button key={mark} type="button" disabled={!date} data-mark={mark}
                            aria-pressed={student.mark === mark} onClick={() => updateMark(student, mark)}>
                            {mark}
                          </button>
                        ))}
                      </div>
                      {markErrors[student.historyId] === true && (
                        <p className="staff-mark-error" role="alert">Could not save the mark for {student.name}. Try again.</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

export default function StaffAttendance({ workspaceLabel = 'Admin dashboard' }) {
  return (
    <AdminBatchPage title="Attendance" workspaceLabel={workspaceLabel}>
      {({ batch, students }) => <BatchAttendance key={batch} batch={batch} students={students} />}
    </AdminBatchPage>
  )
}

