import React from 'react'
import AccountAvatar from './AccountAvatar.jsx'

const roleNames = { admin: 'Administrator', teacher: 'Teacher', student: 'Student', pending: 'Awaiting access' }

export default function MyProfile({ account, role }) {
  return (
    <>
      <h1>My Profile</h1>
      <section className="mt-5 max-w-xl rounded-2xl border border-surface-border bg-surface p-5 sm:p-7" aria-label="Account details">
        <div className="flex items-center gap-4">
          <AccountAvatar account={account} className="size-16 text-xl" />
          <h2 className="break-words text-xl font-bold">{account.name}</h2>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-600">Email</dt><dd className="break-all font-semibold">{account.email}</dd></div>
          <div><dt className="text-sm text-slate-600">Account role</dt><dd className="font-semibold">{roleNames[role]}</dd></div>
          {role !== 'student' && account.staffId &&
            <div><dt className="text-sm text-slate-600">Staff ID</dt><dd className="font-semibold">{account.staffId}</dd></div>}
          {role === 'student' && <>
            <div><dt className="text-sm text-slate-600">Student ID</dt><dd className="font-semibold">{account.id}</dd></div>
            <div><dt className="text-sm text-slate-600">Batch</dt><dd className="font-semibold">{account.batch}</dd></div>
          </>}
        </dl>
        {role === 'pending' && <p className="mt-5 rounded-lg bg-blue-50 p-3">Your account is awaiting institute access.</p>}
      </section>
    </>
  )
}
