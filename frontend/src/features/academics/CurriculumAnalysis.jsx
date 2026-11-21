import React, { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { buttonClass, fieldClass } from '../admin/AdminBatchPage.jsx'
import { deleteSkill, readSkills, saveSkill } from './curriculumSkills.js'

const secondary = 'rounded-lg border border-field-border px-4 py-2 font-semibold text-blue-950'

function ConfirmDelete({ skill, onCancel, onConfirm, error }) {
  const dialog = useRef(null)
  const cancel = useRef(null)
  useEffect(() => {
    dialog.current.showModal()
    cancel.current.focus()
  }, [])

  function dismiss() {
    dialog.current.close()
    onCancel()
  }

  return (
    <dialog ref={dialog} lang="en" dir="ltr" aria-labelledby="delete-skill-title" aria-describedby="delete-skill-description"
      onCancel={event => { event.preventDefault(); dismiss() }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-surface-border bg-surface p-5 text-left shadow-lg backdrop:bg-slate-950/60">
      <h2 id="delete-skill-title" className="text-xl font-bold">Delete skill?</h2>
      <p id="delete-skill-description" className="mt-2">Are you sure you want to delete “{skill.title}”?</p>
      {error && <p role="alert" className="mt-2 text-red-800">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button ref={cancel} type="button" className={secondary} onClick={dismiss}>Cancel</button>
        <button type="button" className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white" onClick={onConfirm}>Delete</button>
      </div>
    </dialog>
  )
}

export default function CurriculumAnalysis() {
  const { role } = useOutletContext()
  const [skills, setSkills] = useState(() => {
    try { return readSkills() } catch { return null }
  })
  const [draft, setDraft] = useState(null)
  const [target, setTarget] = useState(null)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const heading = useRef(null)
  const admin = role === 'admin'

  function save(event) {
    event.preventDefault()
    if (!admin) return
    if (!draft.title.trim() || !draft.description.trim()) {
      setError('Enter both a title and a description.')
      return
    }
    try {
      setSkills(saveSkill(draft.id, draft.title, draft.description))
      setDraft(null)
      setError('')
      heading.current.focus()
    } catch {
      setError('Could not save changes. Please try again.')
    }
  }

  function remove() {
    if (!admin) return
    try {
      setSkills(deleteSkill(target.id))
      if (draft?.id === target.id) setDraft(null)
      setTarget(null)
    } catch {
      setDeleteError('Could not delete the skill. Please try again.')
    }
  }

  return (
    <div lang="en" dir="ltr" className="text-left leading-relaxed">
      <header className="surface-banner rounded-2xl p-5 sm:p-8">
        <h1 ref={heading} tabIndex={-1}>Curriculum Analysis</h1>
        <p className="mt-3 text-lg font-semibold text-blue-950">Four skills we develop in the Arabic course</p>
      </header>
      {skills === null ? <p role="alert" className="mt-5 text-red-800">Could not load skills. Refresh to try again.</p> :
        skills.length === 0 ? <p className="mt-5">No skills to display.</p> : (
          <ul aria-label="Arabic course skills" className="mt-5 grid gap-4 min-[721px]:grid-cols-2">
            {skills.map(skill => (
              <li key={skill.id} className="min-w-0 rounded-xl border border-surface-border bg-surface p-5">
                <h2 className="break-words text-xl font-bold text-blue-950">{skill.title}</h2>
                <p className="mt-2 whitespace-pre-wrap break-words text-slate-700">{skill.description}</p>
                {admin && (draft?.id === skill.id ? (
                  <form className="mt-4 space-y-3" onSubmit={save} noValidate>
                    <label className="block font-semibold">Skill title
                      <input className={fieldClass + ' mt-1'} required value={draft.title}
                        onChange={event => setDraft({ ...draft, title: event.target.value })} />
                    </label>
                    <label className="block font-semibold">Skill description
                      <textarea className={fieldClass + ' mt-1'} rows={3} required value={draft.description}
                        onChange={event => setDraft({ ...draft, description: event.target.value })} />
                    </label>
                    {error && <p role="alert" className="text-red-800">{error}</p>}
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" className={buttonClass}>Save</button>
                      <button type="button" className={secondary} onClick={() => { setDraft(null); setError(''); heading.current.focus() }}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className={secondary} onClick={() => { setDraft(skill); setError('') }}>Edit</button>
                    <button type="button" className={secondary + ' text-red-800'}
                      onClick={() => { setDeleteError(''); setTarget(skill) }}>Delete</button>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      {admin && target && <ConfirmDelete skill={target} onCancel={() => setTarget(null)} onConfirm={remove} error={deleteError} />}
    </div>
  )
}
