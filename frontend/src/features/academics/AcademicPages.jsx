import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { formatDate } from '../../demo.js'
import {
  instituteWifi, publishedGrades,
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
