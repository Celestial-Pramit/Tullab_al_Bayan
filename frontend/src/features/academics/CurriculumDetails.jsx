import React, { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { curriculumBooks } from './curriculumBooks.js'

function BookCover({ book }) {
  const [failedCover, setFailedCover] = useState(null)
  const hasCover = book.cover && failedCover !== book.cover
  return (
    <div className="relative grid aspect-[3/4] place-items-center overflow-hidden rounded-lg border border-surface-border bg-field">
      {hasCover ? <img src={book.cover} alt={book.alt ?? ('Book ' + book.number + ' cover')}
        className="absolute inset-0 size-full object-contain" decoding="async" onError={() => setFailedCover(book.cover)} /> : (
        <div className="flex flex-col items-center gap-2 p-2 text-center text-blue-900">
          <BookOpen size={28} aria-hidden="true" />
          <span className="text-xs font-medium sm:text-sm">Cover unavailable</span>
        </div>
      )}
    </div>
  )
}

export default function CurriculumDetails() {
  return (
    <>
      <header className="surface-banner rounded-2xl p-5 sm:p-8">
        <h1>Arabic Course Curriculum</h1>
        <p lang="ar" dir="rtl" className="mt-3 w-fit max-w-full text-2xl font-bold leading-relaxed text-blue-950 sm:text-4xl">
          العربية بين يدي أولادنا
        </p>
        <p className="mt-3 max-w-2xl text-slate-700">
          Al Bayan Institute’s Arabic course follows 12 student books and develops speaking, writing, listening, and presentation skills.
        </p>
      </header>
      <ol aria-label="Arabic course student books" className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {curriculumBooks.map(book => (
          <li key={book.number} className="min-w-0 rounded-xl border border-surface-border bg-surface p-2.5 sm:p-3">
            <BookCover book={book} />
            <h2 className="mt-2 text-center font-bold text-blue-950 sm:mt-3">Book {book.number}</h2>
          </li>
        ))}
      </ol>
    </>
  )
}
