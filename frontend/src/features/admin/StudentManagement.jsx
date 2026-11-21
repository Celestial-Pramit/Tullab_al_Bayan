import React, { useEffect, useRef, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { BackToBatches, BatchGrid } from './BatchGrid.jsx'
import { batches, deleteStudent, readRoster, saveStudent } from '../roster/rosterRepository.js'

function loadRoster() {
  try {
    return { students: readRoster(), error: '' }
  } catch {
    return { students: [], error: 'The saved roster could not be loaded. Refresh to try again.' }
  }
}

function StudentForm({ student, onSave, onCancel }) {
  const [fields, setFields] = useState(student)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const inputs = [
    { key: 'id', label: 'Student ID', type: 'text' },
    { key: 'name', label: 'Full name', type: 'text' },
    { key: 'email', label: 'Google email', type: 'email' },
  ]

  function change(key, value) {
    setFields(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
    setSaveError('')
  }

  function submit(event) {
    event.preventDefault()
    try {
      const result = saveStudent(fields, student.historyId)
      if (result.errors) setErrors(result.errors)
      else onSave(result)
    } catch {
      setSaveError('The student could not be saved. Please try again.')
    }
  }

  return (
    <section className="rounded-2xl border border-surface-border bg-surface p-5 sm:p-6" aria-labelledby="student-form-title">
      <h2 id="student-form-title" className="text-xl font-bold">{student.historyId ? 'Edit student' : 'Add student'}</h2>
      <form className="mt-4" onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {inputs.map(({ key, label, type }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-semibold" htmlFor={'edit-' + key}>{label}</label>
              <input className="w-full rounded-lg border border-field-border bg-field px-3 py-2"
                id={'edit-' + key} type={type} required value={fields[key]}
                aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? 'error-' + key : undefined}
                onChange={event => change(key, event.target.value)} />
              {errors[key] && <p role="alert" id={'error-' + key} className="mt-1 text-sm text-red-800">{errors[key]}</p>}
            </div>
          ))}
          <div>
            <label htmlFor="edit-batch" className="mb-1 block text-sm font-semibold">Student batch</label>
            <select className="w-full rounded-lg border border-field-border bg-field px-3 py-2" id="edit-batch"
              required value={fields.batch} aria-invalid={Boolean(errors.batch)}
              aria-describedby={errors.batch ? 'error-batch' : undefined}
              onChange={event => change('batch', event.target.value)}>
              {batches.map(batch => <option key={batch}>{batch}</option>)}
            </select>
            {errors.batch && <p role="alert" id="error-batch" className="mt-1 text-sm text-red-800">{errors.batch}</p>}
          </div>
        </div>
        {saveError && <p role="alert" className="mt-3 text-sm text-red-800">{saveError}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">Save student</button>
          <button type="button" className="rounded-lg border border-surface-border px-4 py-2 font-semibold text-blue-900" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </section>
  )
}

function DeleteStudentDialog({ student, onCancel, onDelete }) {
  const dialog = useRef(null)
  const cancelButton = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dialog.current.showModal()
    cancelButton.current.focus()
  }, [])

  function cancel() {
    dialog.current.close()
    onCancel()
  }

  function confirm() {
    let students
    try {
      students = deleteStudent(student.historyId)
    } catch {
      setError('Could not delete this student. They are still on the roster. Please try again.')
      return
    }
    dialog.current.close()
    onDelete(students)
  }

  return (
    <dialog ref={dialog} aria-labelledby="delete-student-title" aria-describedby="delete-student-description"
      onCancel={event => { event.preventDefault(); cancel() }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-surface-border bg-surface p-5 text-blue-950 shadow-xl backdrop:bg-slate-950/60 sm:p-6">
      <h2 id="delete-student-title" className="text-xl font-bold">Delete student?</h2>
      <dl className="my-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt>Name</dt><dd className="break-words font-semibold">{student.name}</dd>
        <dt>Student ID</dt><dd className="break-words font-semibold">{student.id}</dd>
        <dt>Batch</dt><dd className="font-semibold">{student.batch} Batch</dd>
      </dl>
      <p id="delete-student-description">Deleting this student removes them from the active roster and preserves their attendance and tuition history.</p>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-800">{error}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button ref={cancelButton} type="button" className="rounded-lg border border-field-border px-4 py-2 font-semibold"
          onClick={cancel}>Cancel</button>
        <button type="button" className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
          onClick={confirm}>Delete student</button>
      </div>
    </dialog>
  )
}

export default function StudentManagement() {
  const [{ students, error }, setRoster] = useState(loadRoster)
  const [batch, setBatch] = useState(null)
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState(null)
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const rosterSearch = useRef(null)
  const query = search.trim().toLowerCase()
  const batchStudents = students.filter(student => student.batch === batch)
  const visibleStudents = batchStudents.filter(student =>
    student.name.toLowerCase().includes(query) || student.id.toLowerCase().includes(query))

  function openBatch(day) {
    setBatch(day)
    setSearch('')
    setEditor(null)
    setNotice('')
  }

  function openEditor(student) {
    setNotice('')
    setEditor(student)
  }

  function saved(result) {
    setRoster({ students: result.roster, error: '' })
    setBatch(result.student.batch)
    setSearch('')
    setEditor(null)
    setNotice(result.student.name + ' saved in the ' + result.student.batch + ' batch.')
  }

  return (
    <div className="space-y-5">
      <header className="surface-banner rounded-2xl p-5 sm:p-8">
        <p className="text-sm font-semibold text-blue-900">Admin dashboard</p>
        <h1>Student Management</h1>
        <p className="mt-3 text-blue-900">Find students, update their details, and manage batch assignments.</p>
      </header>
      {error && <p role="alert" className="text-red-800">{error}</p>}
      {batch === null ? (
        <BatchGrid students={students} onSelect={openBatch} countUnavailable={Boolean(error)} />
      ) : (
        <div className="space-y-5">
          <BackToBatches onClick={() => openBatch(null)} />
          {notice && <p role="status" className="rounded-lg border border-surface-border bg-blue-50 px-4 py-3 text-blue-950">{notice}</p>}
          {deleteTarget && <DeleteStudentDialog student={deleteTarget} onCancel={() => setDeleteTarget(null)}
            onDelete={remaining => {
              setRoster({ students: remaining, error: '' })
              if (editor?.historyId === deleteTarget.historyId) setEditor(null)
              setNotice(deleteTarget.name + ' was removed from the active roster.')
              setDeleteTarget(null)
              rosterSearch.current?.focus()
            }} />}
          {editor && <StudentForm key={editor.historyId ?? 'new'} student={editor} onSave={saved} onCancel={() => setEditor(null)} />}
          <section className="overflow-hidden rounded-2xl border border-surface-border bg-surface" aria-labelledby="roster-heading">
            <div className="flex flex-wrap items-baseline gap-x-3 px-5 pt-5 sm:px-6">
              <h2 id="roster-heading" className="text-lg font-bold">{batch} Batch roster</h2>
              <p className="text-sm text-slate-600">{visibleStudents.length} of {batchStudents.length} shown</p>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:px-6">
              <div>
                <label className="mb-1 block text-sm font-semibold" htmlFor="roster-search">Search roster</label>
                <input ref={rosterSearch} id="roster-search" type="search" placeholder="Name or student ID"
                  className="w-full rounded-lg border border-field-border bg-field px-3 py-2"
                  value={search} onChange={event => setSearch(event.target.value)} />
              </div>
              <button type="button" disabled={Boolean(error)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50 sm:justify-self-start"
                onClick={() => openEditor({ id: '', name: '', email: '', batch, historyId: null })}>
                <Plus size={18} aria-hidden="true" /> Add student
              </button>
            </div>
            {visibleStudents.length ? (
              <div className="light-roster overflow-x-auto" role="region" aria-labelledby="roster-heading" tabIndex={0}>
                <table className="min-w-lg">
                  <thead><tr>{['Student ID', 'Full name', 'Google email', 'Actions'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
                  <tbody>{visibleStudents.map(student => (
                    <tr key={student.historyId}>
                      <td>{student.id}</td>
                      <td className="font-semibold">{student.name}</td>
                      <td className="break-all">{student.email}</td>
                      <td>
                        <button type="button" aria-label={'Edit ' + student.name}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-blue-800 hover:bg-blue-50"
                          onClick={() => openEditor(student)}><Pencil size={15} aria-hidden="true" /> Edit</button>
                        <button type="button" aria-label={'Delete ' + student.name}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-red-800 hover:bg-red-50"
                          onClick={() => setDeleteTarget(student)}><Trash2 size={15} aria-hidden="true" /> Delete</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <p className="border-t border-surface-border px-5 py-6 text-sm text-slate-600">{query ? 'No students match your search.' : 'No students in this batch yet'}</p>}
          </section>
        </div>
      )}
    </div>
  )
}
