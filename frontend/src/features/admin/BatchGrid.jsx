import React from 'react'
import { ArrowLeft, Users } from 'lucide-react'

const LEGACY_WEEKDAY_BATCHES = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
].map(name => ({ id: null, name }))

export function BatchGrid({ batches, students = [], onSelect, countUnavailable = false }) {
  const items = batches === undefined ? LEGACY_WEEKDAY_BATCHES : batches

  if (!items.length) {
    return (
      <p className="rounded-xl border border-surface-border bg-surface p-5 text-slate-600">
        No batches found.
      </p>
    )
  }

  return (
    <section aria-label="Batches" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 xl:gap-5">
      {items.map(batch => {
        const count = students.filter(student =>
          (batch.id != null && student.batchId === batch.id) || student.batch === batch.name).length
        return (
          <button key={batch.id ?? batch.name} type="button" onClick={() => onSelect(batch.name)}
            className="interactive-card flex aspect-square min-w-0 flex-col items-start justify-center gap-3 rounded-2xl border border-surface-border bg-surface p-3 text-left shadow-sm sm:p-5">
            <span className="rounded-xl bg-blue-100 p-2.5 text-blue-800"><Users size={21} aria-hidden="true" /></span>
            <span>
              <span className="block font-bold leading-tight text-blue-950 sm:text-lg">{batch.name} Batch</span>
              <span className="mt-1 block text-sm text-slate-600">
                {countUnavailable ? 'Count unavailable' : count + (count === 1 ? ' student' : ' students')}
              </span>
            </span>
          </button>
        )
      })}
    </section>
  )
}

export function BackToBatches({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 py-2 font-semibold text-blue-900 hover:bg-blue-50">
      <ArrowLeft size={17} aria-hidden="true" /> Back to batches
    </button>
  )
}
