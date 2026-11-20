import React, { useState } from 'react'
import { ArrowUpRight, BookOpenCheck, CalendarDays, ClipboardCheck, CreditCard, Users } from 'lucide-react'
import './staffDashboard.css'
import { Link, useOutletContext } from 'react-router-dom'
import { formatDate } from '../../demo.js'
import { academicCalendar, classDate, publishedHomework } from '../academics/academicRepository.js'
import { markOptions, readSessions } from '../attendance/attendanceRepository.js'
import { batches, readRoster } from '../roster/rosterRepository.js'
import { coveredStatus, readTuition, tuitionFor } from '../tuition/tuitionRepository.js'
import { formatBillingMonth, formatTuitionAmount } from '../tuition/tuitionFormat.js'

const shortcutGroups = {
  admin: [
    ['students', 'Student Management'], ['attendance', 'Attendance'], ['tuition', 'Tuition Management'],
    ['scholarship-management', 'Scholarship Management'], ['homework', 'Homework'],
  ],
  teacher: [['attendance', 'Take attendance'], ['academic-calendar', 'Academic Calendar'], ['homework', 'Homework']],
}

function Summary({ title, period, to, icon: Icon, children }) {
  return (
    <Link className="dashboard-card interactive-card" to={to}>
      <div className="dashboard-card-icons">
        <span><Icon size={21} aria-hidden="true" /></span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </div>
      <h2 className="mt-3 text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{period}</p>
      <div className="mt-4">{children}</div>
    </Link>
  )
}
function AttendanceCompletion({ sessions, students }) {
  if (!sessions.length) return <p>No attendance sessions have been opened today.</p>
  return (
    <ul className="divide-y divide-blue-100">
      {sessions.map(session => {
        const roster = students.filter(student => student.batch === session.batch)
        const marked = roster.filter(student => markOptions.includes(session.marks[student.historyId])).length
        return (
          <li key={session.id} className="flex flex-wrap justify-between gap-2 py-2">
            <span>{session.batch} Batch · {session.type}</span>
            <span className="font-semibold">{marked} / {roster.length} marked</span>
          </li>
        )
      })}
    </ul>
  )
}

function AdminSummary({ students, sessions, today, records }) {
  const [month, setMonth] = useState(today.slice(0, 7))

  const marks = sessions.flatMap(session => Object.values(session.marks)).filter(mark => markOptions.includes(mark))
  const fees = month ? students.map(student => tuitionFor(records, month, student.historyId)) : []
  const unpaid = fees.filter(fee => fee.status === 'Unpaid')
  const outstanding = unpaid.reduce((total, fee) => total + fee.due, 0)

  return (
    <div className="space-y-3">
      <label className="dashboard-month">
        <span>Billing month</span>
        <input type="month" value={month} onChange={event => setMonth(event.target.value)} />
      </label>
      <div className="grid gap-4 lg:grid-cols-3">
        <Summary title="Total students" period={'Across ' + batches.length + ' batches'} to="/admin/students" icon={Users}>
          <p className="text-3xl font-bold">{students.length}</p>
        </Summary>
        <Summary title="Recorded attendance" period={formatDate(today)} to="/admin/attendance" icon={ClipboardCheck}>
          <p className="font-bold">{marks.length} marks · {sessions.length} sessions</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 text-sm">
            {markOptions.map(mark => <div key={mark}><dt>{mark}</dt><dd className="font-bold">{marks.filter(value => value === mark).length}</dd></div>)}
          </dl>
        </Summary>
        <Summary title="Tuition summary" period={month ? formatBillingMonth(month) : 'Select a billing month'}
          to={month ? '/admin/tuition?month=' + encodeURIComponent(month) : '/admin/tuition'} icon={CreditCard}>
          {month && <div className="text-sm">
            <p className="font-bold">{formatTuitionAmount(outstanding)} outstanding</p>
            <p>{fees.filter(fee => fee.status === 'Paid').length} paid · {unpaid.length} unpaid</p>
            <p>{fees.filter(fee => fee.status === coveredStatus).length} covered by scholarship</p>
          </div>}
        </Summary>
      </div>
    </div>
  )
}

function TeacherSummary({ students, sessions, today }) {
  const calendar = academicCalendar()
  const classes = calendar.filter(item => item.batch && item.date === today)
  const upcoming = calendar.filter(item => item.batch && item.date > today).slice(0, 3)
  const homework = publishedHomework().filter(item => item.deadline >= today).slice(0, 3)
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Summary title="Today's classes" period={formatDate(today) + ' · Demo schedule'}
        to="/teacher/academic-calendar" icon={CalendarDays}>
        {classes.length ? classes.map(item => (
          <p key={item.batch} className="mb-2 font-semibold">{item.batch} Batch · {item.type} · {item.title}</p>
        )) : <p>No classes scheduled today.</p>}
        {upcoming.length > 0 && <>
          <h3 className="mt-4 text-sm font-bold">Upcoming classes</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {upcoming.map(item => <li key={item.date}>{formatDate(item.date)} · {item.batch} Batch · {item.type}</li>)}
          </ul>
        </>}
      </Summary>
      <Summary title="Attendance progress" period={formatDate(today)} to="/teacher/attendance" icon={ClipboardCheck}>
        <AttendanceCompletion sessions={sessions} students={students} />
      </Summary>
      <Summary title="Homework" period="Published demo assignments" to="/teacher/homework" icon={BookOpenCheck}>
        {homework.length ? <ul className="space-y-2">
          {homework.map(item => <li key={item.id}>{item.title} · Due {formatDate(item.deadline)}</li>)}
        </ul> : <p>No upcoming homework deadlines.</p>}
      </Summary>
    </div>
  )
}
function DashboardData({ role }) {
  let students, sessions, records
  const today = classDate()
  try {
    students = readRoster()
    sessions = readSessions().filter(session => session.date === today)
    // Check stored tuition before rendering the admin summary so errors stay local to this page.
    if (role === 'admin') records = readTuition()
  } catch {
    return <p className="text-red-800" role="alert">Dashboard records could not be loaded. Refresh to try again.</p>
  }
  const SummaryPage = role === 'admin' ? AdminSummary : TeacherSummary
  return <SummaryPage students={students} sessions={sessions} today={today} records={records} />
}

export default function StaffDashboard() {
  const { role } = useOutletContext()
  return (
    <div className="space-y-5">
      <header className="surface-banner rounded-2xl p-5 sm:p-8">
        <p className="text-sm font-semibold text-sky-900">Al Bayan Institute · Demo</p>
        <h1>{role === 'admin' ? 'Admin Dashboard' : 'Teacher Dashboard'}</h1>
      </header>
      <nav aria-label="Dashboard shortcuts" className="flex flex-wrap gap-2">
        {shortcutGroups[role].map(([path, label], index) => (
          <Link key={path} to={'/' + role + '/' + path}
            className={'interactive-action dashboard-shortcut ' +
              (role === 'teacher' && index === 0 ? 'dashboard-shortcut-primary' : '')}>
            {label}
          </Link>
        ))}
      </nav>
      <DashboardData role={role} />
    </div>
  )
}
