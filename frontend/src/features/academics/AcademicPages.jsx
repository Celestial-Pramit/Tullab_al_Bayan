import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { formatDate } from '../../demo.js'
import { batches } from '../roster/rosterRepository.js'
import {
  academicCalendar, curriculumFor, curriculumProgress, instituteWifi, publishedGrades,
} from './academicRepository.js'

function AcademicPage({ title, demo, children }) {
  return (
    <>
      <h1>{title}</h1>
      {demo && <p className="page-description">Demo data</p>}
      <div className="mt-5">{children}</div>
    </>
  )
}

export function Curriculum({ analysis = false }) {
  const { role, account } = useOutletContext()
  const [selectedBatch, setSelectedBatch] = useState(batches[0])
  const student = role === 'student'
  const batch = student ? account.batch : selectedBatch
  const syllabus = curriculumFor(batch)
  const progress = analysis ? curriculumProgress(batch, student ? account.historyId : undefined) : []
  const completeCount = id => progress.filter(record => record.completed.includes(id)).length

  return (
    <AcademicPage title={analysis ? 'Curriculum Analysis' : 'Curriculum Details'} demo>
      {student ? <p className="font-semibold">{batch} Batch</p> :
        <label className="block max-w-xs font-semibold">Batch
          <select value={batch} onChange={event => setSelectedBatch(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-field-border bg-field p-2">
            {batches.map(day => <option key={day}>{day}</option>)}
          </select>
        </label>}
      {!syllabus ? <p className="page-description">No syllabus has been posted for this batch.</p> :
        analysis && !progress.length ? <p className="page-description">No curriculum progress has been recorded for this batch.</p> : (
          <section className="mt-4 rounded-2xl border border-surface-border bg-surface p-5">
            <h2 className="text-xl font-bold">{syllabus.course}</h2>
            {analysis && (
              <p className="mt-1 text-sm text-slate-600">{syllabus.topics.filter(topic => completeCount(topic.id) === progress.length).length} of {syllabus.topics.length} topics completed
                {!student && ' across ' + progress.length + ' recorded progress ' + (progress.length === 1 ? 'entry' : 'entries')}.</p>
            )}
            <ol className="mt-3 divide-y divide-surface-border">
              {syllabus.topics.map(topic => (
                <li key={topic.id} className="py-3">
                  <h3 className="font-bold">{topic.name}</h3>
                  <p className="mt-1 text-sm text-slate-700">{topic.description}</p>
                  {analysis && <p className="mt-1 text-sm font-semibold text-blue-900">
                    {student ? completeCount(topic.id) ? 'Completed' : 'Remaining'
                      : completeCount(topic.id) + ' completed · ' + (progress.length - completeCount(topic.id)) + ' remaining'}
                  </p>}
                </li>
              ))}
            </ol>
          </section>
        )}
    </AcademicPage>
  )
}

export function Calendar() {
  const { role, account } = useOutletContext()
  const events = academicCalendar().filter(event => role !== 'student' || !event.batch || event.batch === account.batch)
  return (
    <AcademicPage title="Academic Calendar" demo>
      {!events.length ? <p>No classes or institute events have been posted.</p> : (
        <ul className="divide-y divide-surface-border rounded-2xl border border-surface-border bg-surface px-5">
          {events.map(event => (
            <li key={event.date + ':' + event.title} className="flex flex-wrap items-start justify-between gap-2 py-4">
              <div><p className="font-bold">{event.title}</p><p className="text-sm text-slate-600">{event.type}{event.batch && ' · ' + event.batch + ' Batch'}</p></div>
              <time dateTime={event.date} className="text-sm font-semibold">{formatDate(event.date)}</time>
            </li>
          ))}
        </ul>
      )}
    </AcademicPage>
  )
}

export function Grades() {
  const { role, account } = useOutletContext()
  const grades = role === 'student' ? publishedGrades(account.historyId) : []
  return (
    <AcademicPage title="Grades" demo={role === 'student'}>
      {role !== 'student' ? <p>Grade records are available only in the student’s own workspace.</p> :
        grades.length === 0 ? <p>No grades have been published for you yet.</p> : (
          <ul className="divide-y divide-surface-border rounded-2xl border border-surface-border bg-surface px-5">
            {grades.map(grade => <li key={grade.title + grade.date} className="flex flex-wrap justify-between gap-2 py-4">
              <div><p className="font-bold">{grade.title}</p><p className="text-sm text-slate-600">{formatDate(grade.date)}</p></div>
              <p className="font-semibold">{grade.score} / {grade.outOf}</p>
            </li>)}
          </ul>
        )}
    </AcademicPage>
  )
}

export function WifiInstructions() {
  const instructions = instituteWifi()
  return <AcademicPage title="Bayan Wi-Fi"><p>{instructions ?? 'Wi-Fi connection instructions have not been provided by the institute yet.'}</p></AcademicPage>
}
