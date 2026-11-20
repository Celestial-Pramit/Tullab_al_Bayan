import React, { useState } from 'react'
import { readRoster } from '../roster/rosterRepository.js'
import { BackToBatches, BatchGrid } from './BatchGrid.jsx'

export const fieldClass = 'w-full rounded-lg border border-field-border bg-field px-3 py-2'
export const buttonClass = 'rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50'

export function AdminBatchPage({ title, children, workspaceLabel = 'Admin dashboard' }) {
  const [batch, setBatch] = useState(null)
  const [{ students, error }] = useState(() => {
    try {
      return { students: readRoster() }
    } catch {
      return { students: [], error: 'The saved roster could not be loaded. Refresh to try again.' }
    }
  })
  const members = students.filter(student => student.batch === batch)

  return (
    <div className="space-y-5">
      <header className="surface-banner rounded-2xl p-5 sm:p-8">
        <p className="text-sm font-semibold text-blue-900">{workspaceLabel}</p>
        <h1>{title}</h1>
      </header>
      {error && <p role="alert" className="text-red-800">{error}</p>}
      {batch === null ? <BatchGrid students={students} onSelect={setBatch} countUnavailable={Boolean(error)} /> : (
        <>
          <BackToBatches onClick={() => setBatch(null)} />
          <section className="rounded-2xl border border-surface-border bg-surface p-5 sm:p-6" aria-labelledby="admin-batch-title">
            <h2 id="admin-batch-title" className="text-xl font-bold">{batch} Batch</h2>
            {!error && children({ batch, students: members })}
          </section>
        </>
      )}
    </div>
  )
}
