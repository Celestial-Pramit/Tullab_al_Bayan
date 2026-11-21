import React, { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { formatDate } from '../../demo.js'
import { AdminBatchPage, buttonClass, fieldClass } from '../admin/AdminBatchPage.jsx'
import { readRoster } from '../roster/rosterRepository.js'
import { deleteHomework, readHomework, saveHomework } from './homeworkRepository.js'

function HomeworkList({ assignments, actions }) {
  if (!assignments.length) return <p className="page-description">No homework has been published for this batch yet.</p>

  return (
    <ol className="mt-4 grid gap-4">
      {assignments.map(item => (
        <li key={item.id} className="rounded-xl border border-surface-border bg-field p-4">
          <p className="text-sm font-semibold text-slate-600">
            Published <time dateTime={item.publishedAt}>{formatDate(item.publishedAt.slice(0, 10))}</time>
            {item.deadline && <> · Due <time dateTime={item.deadline}>{formatDate(item.deadline)}</time></>}
          </p>
          <p className="mt-2 whitespace-pre-wrap break-words">{item.text}</p>
          {actions?.(item)}
        </li>
      ))}
    </ol>
  )
}

function DeleteHomeworkDialog({ onCancel, onConfirm }) {
  const dialog = useRef(null)
  const cancelButton = useRef(null)
  useEffect(() => {
    dialog.current.showModal()
    cancelButton.current.focus()
  }, [])

  function close() {
    dialog.current.close()
    onCancel()
  }

  return (
    <dialog ref={dialog} aria-labelledby="delete-homework-title" aria-describedby="delete-homework-description"
      onCancel={event => { event.preventDefault(); close() }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-surface-border bg-surface p-5 shadow-lg backdrop:bg-slate-950/60">
      <h3 id="delete-homework-title" className="text-lg font-bold">Delete homework?</h3>
      <p id="delete-homework-description" className="mt-2">This assignment will disappear from the batch’s homework page.</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button ref={cancelButton} type="button" onClick={close} className="rounded-lg border border-field-border px-3 py-2">Cancel</button>
        <button type="button" className="rounded-lg bg-red-700 px-3 py-2 font-semibold text-white" onClick={() => {
          dialog.current.close()
          onConfirm()
        }}>Delete homework</button>
      </div>
    </dialog>
  )
}

function BatchHomework({ batch }) {
  const [form, setForm] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [result, setResult] = useState(null)
  let assignments
  try {
    assignments = readHomework(batch)
  } catch {
    return <p role="alert" className="mt-4 text-red-800">Homework could not be loaded. Refresh to try again.</p>
  }

  function openForm(item = { text: '' }) {
    setResult(null)
    setForm(item)
  }

  function publish(event) {
    event.preventDefault()
    if (!form.text.trim()) {
      setResult({ error: true, message: 'Enter homework text before saving.' })
      return
    }
    try {
      saveHomework(batch, form.text, form.id)
      setForm(null)
      setResult({ message: 'Homework published to the ' + batch + ' batch.' })
    } catch {
      setResult({ error: true, message: 'Homework could not be saved. Please try again.' })
    }
  }

  function remove() {
    try {
      deleteHomework(batch, deleteTarget.id)
      if (form?.id === deleteTarget.id) setForm(null)
      setResult({ message: 'Homework deleted.' })
    } catch {
      setResult({ error: true, message: 'Homework could not be deleted. Please try again.' })
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <button className={buttonClass + ' mt-4'} type="button" onClick={() => openForm()}>New homework</button>
      {form && (
        <form onSubmit={publish} className="mt-4 rounded-xl border border-surface-border bg-field p-4">
          <h3 className="font-bold">{form.id ? 'Edit homework' : 'New homework'} · {batch} Batch</h3>
          <label className="mt-3 block font-semibold" htmlFor="homework-text">Homework text</label>
          <textarea id="homework-text" rows={6} required className={fieldClass + ' mt-1'}
            value={form.text} onChange={event => setForm({ ...form, text: event.target.value })} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className={buttonClass}>Save homework</button>
            <button type="button" className="rounded-lg border border-field-border px-4 py-2" onClick={() => { setForm(null); setResult(null) }}>Cancel</button>
          </div>
        </form>
      )}
      {result && <p className={'mt-3 text-sm ' + (result.error ? 'text-red-800' : 'text-blue-900')}
        role={result.error ? 'alert' : 'status'}>{result.message}</p>}
      <HomeworkList assignments={assignments} actions={item => (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded-lg border border-field-border px-3 py-2" onClick={() => openForm(item)}>Edit</button>
          <button type="button" className="rounded-lg border border-field-border px-3 py-2 text-red-800"
            onClick={() => setDeleteTarget(item)}>Delete</button>
        </div>
      )} />
      {deleteTarget && <DeleteHomeworkDialog onCancel={() => setDeleteTarget(null)} onConfirm={remove} />}
    </>
  )
}

export function HomeworkManagement({ role }) {
  return (
    <AdminBatchPage title="Homework Management" workspaceLabel={role === 'teacher' ? 'Teacher workspace' : 'Admin dashboard'}>
      {({ batch }) => <BatchHomework key={batch} batch={batch} />}
    </AdminBatchPage>
  )
}

export function StudentHomework() {
  const { account } = useOutletContext()
  let student, assignments, error
  try {
    student = readRoster().find(item => item.historyId === account.historyId)
    assignments = student ? readHomework(student.batch) : []
  } catch {
    error = true
  }

  return (
    <>
      <h1>Homework</h1>
      {error ? <p role="alert" className="mt-4 text-red-800">Homework could not be loaded. Refresh to try again.</p> :
        student ? <><p className="page-description">{student.batch} Batch</p><HomeworkList assignments={assignments} /></> :
          <p className="page-description">No active batch was found for your student account.</p>}
    </>
  )
}
