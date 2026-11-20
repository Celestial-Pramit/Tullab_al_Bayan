import React from 'react'
import { ArrowRight, BookOpen, CalendarDays, CreditCard } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { formatDate } from '../demo.js'
import { publishedHomework } from '../features/academics/academicRepository.js'
import { markOptions, readSessions } from '../features/attendance/attendanceRepository.js'
import { readRoster } from '../features/roster/rosterRepository.js'
import { listStudentTuition } from '../features/tuition/tuitionRepository.js'
import { formatBillingMonth } from '../features/tuition/tuitionFormat.js'
import './student.css'

const percent = new Intl.NumberFormat('en', { style: 'percent' })

function attendanceFor(studentId) {
  let history
  try {
    const batch = readRoster().find(student => student.historyId === studentId)?.batch
    history = readSessions()
      .filter(session => session.batch === batch || Object.hasOwn(session.marks, studentId))
      .map(({ id, date, type, marks }) => ({
        id, date, type, status: Object.hasOwn(marks, studentId) ? marks[studentId] : 'Unrecorded',
      }))
      .sort((first, second) => second.date.localeCompare(first.date))
  } catch {
    return { history: [], attended: 0, marked: 0, rate: null, error: 'Attendance could not be loaded. Refresh to try again.' }
  }
  const present = history.filter(session => session.status === 'Present').length
  const absent = history.filter(session => session.status === 'Absent').length
  const late = history.filter(session => session.status === 'Late').length
  const sick = history.filter(session => session.status === 'Sick').length
  const attended = present + late
  const marked = attended + sick + absent
  return { history, attended, marked, rate: marked ? attended / marked : null }
}

export function StudentOverview() {
  const { account } = useOutletContext()
  const attendance = attendanceFor(account.historyId)
  let latestTuition
  let tuitionDetail = 'No billing records'
  try {
    latestTuition = listStudentTuition(account.historyId)[0]
    if (latestTuition) tuitionDetail = formatBillingMonth(latestTuition.month)
  } catch {
    tuitionDetail = 'Tuition could not be loaded'
  }
  const assignments = publishedHomework()
  const cards = [
    { path: 'attendance', title: 'Attendance', icon: CalendarDays, value: attendance.rate === null ? 'No records' : percent.format(attendance.rate), detail: attendance.error ?? (attendance.attended + ' of ' + attendance.marked + ' marked classes attended') },
    { path: 'homework', title: 'Homework', icon: BookOpen, value: assignments.length, detail: assignments.length === 1 ? 'Assignment available' : 'Assignments available' },
    { path: 'tuition', title: 'Tuition', icon: CreditCard, value: latestTuition?.status ?? 'Unrecorded', detail: tuitionDetail },
  ]

  return (
    <>
      <header className="student-welcome surface-banner">
        <p className="eyebrow">Student dashboard</p>
        <h1>Welcome, {account.name.split(' ')[0]}</h1>
        <p>{account.name} <span aria-hidden="true">·</span> Student ID {account.id}</p>
      </header>
      <div className="summary-grid student-summary">
        {cards.map(({ path, title, icon: Icon, value, detail }) => (
          <Link className="summary-card interactive-card" to={'/student/' + path} key={path}>
            <span className="card-icon"><Icon size={21} aria-hidden="true" /></span>
            <ArrowRight className="card-arrow" size={18} aria-hidden="true" />
            <h2>{title}</h2>
            <strong>{value}</strong>
            <p>{detail}</p>
          </Link>
        ))}
      </div>
      <section className="student-panel" aria-labelledby="homework-preview">
        <div className="student-panel-heading">
          <h2 id="homework-preview">Homework deadlines</h2>
          <Link to="/student/homework">View homework <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        {assignments.length ? (
          <ul className="assignment-list">
            {assignments.slice(0, 3).map(item => (
              <li key={item.id}><strong>{item.title}</strong><time dateTime={item.deadline}>{formatDate(item.deadline)}</time></li>
            ))}
          </ul>
        ) : <p className="student-empty">No assignments yet.</p>}
      </section>
    </>
  )
}

export function StudentAttendance() {
  const { account } = useOutletContext()
  const { history, error } = attendanceFor(account.historyId)
  const statuses = markOptions
  const sessionsByDate = Map.groupBy(history, session => session.date)

  return (
    <>
      <p className="eyebrow">Student dashboard</p>
      <h1>Class attendance</h1>
      {error && <p role="alert" className="student-empty">{error}</p>}
      <section className="student-panel daily-attendance" aria-labelledby="daily-attendance-title">
        <div className="student-panel-heading">
          <h2 id="daily-attendance-title">Class Attendance Record</h2>
        </div>
        <div className="attendance-table" role="region" tabIndex={0} aria-labelledby="daily-attendance-title">
          <table>
            <thead>
              <tr>
                {['Date', 'Total', ...statuses].map(label => <th key={label} scope="col">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from(sessionsByDate, ([date, sessions]) => {
                const counts = statuses.map(status => sessions.filter(session => session.status === status).length)
                const marked = counts.reduce((sum, count) => sum + count, 0)
                const attended = counts[0] + counts[1]
                const rate = marked ? percent.format(attended / marked) : '—'

                return (
                  <tr key={date}>
                    <th scope="row">
                      <strong><time dateTime={date}>{formatDate(date)}</time></strong>
                      <div className="daily-rate">
                        {marked > 0 && <progress aria-label={'Attendance rate for ' + formatDate(date)} value={attended} max={marked} />}
                        <span className="daily-rate-label">{rate}</span>
                      </div>
                    </th>
                    <td>{sessions.length}</td>
                    {counts.map((count, index) => <td key={statuses[index]}>{count}</td>)}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="daily-attendance-note">Attendance rate counts Present and Late out of marked sessions.</p>
      </section>
      <details className="student-panel class-history">
        <summary id="attendance-history">Class history</summary>
        {history.length ? (
          <div className="attendance-table" role="region" tabIndex={0} aria-labelledby="attendance-history">
            <table>
              <thead><tr><th scope="col">Date</th><th scope="col">Class type</th><th scope="col">Status</th></tr></thead>
              <tbody>{history.map(session => (
                <tr key={session.id}>
                  <td><time dateTime={session.date}>{formatDate(session.date)}</time></td>
                  <td>{session.type === 'Physical' ? 'In person' : session.type}</td>
                  <td><span className="attendance-status" data-status={session.status}>{session.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p className="student-empty">No class sessions yet.</p>}
      </details>
    </>
  )
}
