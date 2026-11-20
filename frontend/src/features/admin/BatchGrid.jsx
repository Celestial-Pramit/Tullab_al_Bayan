import React from 'react'
import { ArrowLeft, Users } from 'lucide-react'
import { batches } from '../roster/rosterRepository.js'

export function BatchGrid({ students, onSelect, countUnavailable = false }) {
  return (
    <section aria-label="Batches" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 xl:gap-5">
      {batches.map(day => {
        const count = students.filter(student => student.batch === day).length
        return (
          <button key={day} type="button" onClick={() => onSelect(day)}
            className="interactive-card flex aspect-square min-w-0 flex-col items-start justify-center gap-3 rounded-2xl border border-surface-border bg-surface p-3 text-left shadow-sm sm:p-5">
            <span className="rounded-xl bg-blue-100 p-2.5 text-blue-800"><Users size={21} aria-hidden="true" /></span>
            <span>
              <span className="block font-bold leading-tight text-blue-950 sm:text-lg">{day} Batch</span>
              <span className="mt-1 block text-sm text-slate-600">{countUnavailable ? 'Count unavailable' : count + (count === 1 ? ' student' : ' students')}</span>
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
