import React, { useState } from 'react'
import { BookOpen, ChevronRight, LogOut, Menu, RefreshCw, X } from 'lucide-react'
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import AccountAvatar from '../features/auth/AccountAvatar.jsx'
import MyProfile from '../features/auth/MyProfile.jsx'
import { startGoogleSignIn } from '../features/auth/supabaseAuth.js'
import { useLiveAuth } from '../features/auth/useLiveAuth.js'
import { navigationFor, roleLabels, WorkspacePage } from './portalNavigation.jsx'
import './portal.css'

function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon"><BookOpen size={23} aria-hidden="true" /></span>
      <div><strong lang="ar" dir="rtl">طُلَّابُ الْبَيَانِ</strong><small>Al Bayan Institute</small></div>
    </div>
  )
}

function SignIn({ configured, callbackError }) {
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const displayedError = error || (callbackError
    ? 'Google sign-in could not be completed. Please try signing in again.'
    : '')

  async function handleGoogleSignIn() {
    setError('')
    setStarting(true)
    try {
      await startGoogleSignIn()
    } catch (signInError) {
      setError(signInError?.message || 'Google sign-in could not start. Please try again.')
      setStarting(false)
    }
  }

  return (
    <main className="sign-in">
      <section className="sign-in-intro" aria-label="Al Bayan Institute">
        <Brand />
        <div className="welcome">
          <div className="welcome-rule" aria-hidden="true" />
          <p className="arabic-greeting" lang="ar" dir="rtl">السَّلَامُ عَلَيْكُمْ</p>
          <h1 className="welcome-title">Welcome to your<br />Arabic classroom.</h1>
          <p className="intro-description">Find your homework, review your attendance, and check your tuition for classes at Al Bayan Institute.</p>
        </div>
        <div className="intro-footer"><BookOpen size={17} aria-hidden="true" /> Arabic language learning</div>
      </section>
      <section className="sign-in-content" aria-labelledby="form-title">
        <div className="sign-in-form">
          <p className="eyebrow">Al Bayan Institute</p>
          <h2 id="form-title">Sign in</h2>
          <p>Sign in with your Google account approved by Al Bayan Institute.</p>

          {!configured && (
            <p className="google-notice mt-4" role="status">
              Live authentication is not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code>.
            </p>
          )}

          <button
            type="button"
            className="google-button"
            disabled={!configured || starting}
            aria-describedby={displayedError ? 'sign-in-error' : undefined}
            onClick={handleGoogleSignIn}
          >
            <span className="google-mark" aria-hidden="true">G</span>
            {starting ? 'Redirecting to Google...' : 'Continue with Google'}
          </button>

          {displayedError && (
            <p id="sign-in-error" className="error mt-3" role="alert">{displayedError}</p>
          )}
        </div>
      </section>
    </main>
  )
}

function AccessStatusScreen({ title, message, error, actionLabel, onAction, onSignOut, signOutError }) {
  return (
    <main className="min-h-dvh p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface p-4 sm:px-6">
          <Brand />
          {onSignOut && (
            <button type="button" onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-lg border border-field-border bg-field px-3 py-2 text-sm font-semibold text-blue-950 hover:bg-blue-50">
              <LogOut size={17} aria-hidden="true" /> Sign out
            </button>
          )}
        </header>
        <section className="rounded-2xl border border-surface-border bg-surface p-5 sm:p-7">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-slate-700" role={error ? 'alert' : 'status'}>{message}</p>
          {signOutError && <p className="mt-3 text-sm text-red-800" role="alert">{signOutError}</p>}
          {onAction && (
            <button type="button" onClick={onAction}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">
              <RefreshCw size={16} aria-hidden="true" /> {actionLabel}
            </button>
          )}
        </section>
      </div>
    </main>
  )
}

function PendingAccessScreen({ account, onRetry, onSignOut, signOutError }) {
  return (
    <main className="min-h-dvh p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface p-4 sm:px-6">
          <Brand />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-lg border border-field-border bg-field px-3 py-2 text-sm font-semibold text-blue-950 hover:bg-blue-50">
              <RefreshCw size={16} aria-hidden="true" /> Check access again
            </button>
            <button type="button" onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-900">
              <LogOut size={17} aria-hidden="true" /> Sign out
            </button>
          </div>
        </header>
        {signOutError && <p className="text-sm text-red-800" role="alert">{signOutError}</p>}
        <section className="surface-banner rounded-2xl p-5 sm:p-6">
          <p className="eyebrow">Awaiting institute access</p>
          <p className="mt-2 text-slate-700">
            Your Google account has not been linked to an administrator, teacher, or student record yet.
          </p>
        </section>
        <MyProfile account={account} role="pending" />
      </div>
    </main>
  )
}

function PortalLayout({ role, account, onSignOut, signOutError, groups }) {
  const label = roleLabels[role]
  const { key: locationKey } = useLocation()
  const [openAt, setOpenAt] = useState(null)
  const menuOpen = openAt === locationKey
  const closeMenu = () => setOpenAt(null)
  const accountSubtitle = role === 'student'
    ? (account.id ?? 'Student') + (account.isActive ? '' : ' · Inactive')
    : label

  function navigationLinks(pages) {
    return pages.filter(page => !page.hiddenFromSidebar).map(({ path, title, icon: Icon }) => (
      <NavLink key={path} to={path ? '/' + role + '/' + path : '/' + role} onClick={closeMenu} end>
        <Icon size={17} aria-hidden="true" /> {title}
      </NavLink>
    ))
  }

  return (
    <div className="portal">
      <a href="#portal-content" className="skip-link">Skip to content</a>
      <aside id="portal-sidebar" className="sidebar" data-open={menuOpen}>
        <Brand />
        <NavLink className="sidebar-account" to={'/' + role + '/profile'} onClick={closeMenu} end
          aria-label={'My Profile for ' + account.name}>
          <AccountAvatar account={account} className="size-10 text-sm" />
          <span className="sidebar-account-details">
            <strong>{account.name}</strong>
            <small>{accountSubtitle}</small>
          </span>
          <ChevronRight size={16} aria-hidden="true" />
        </NavLink>
        <nav aria-label={label + ' navigation'}>
          {groups.map(group => (
            <section key={group.title} aria-labelledby={'nav-' + group.title.toLowerCase()}>
              <h2 id={'nav-' + group.title.toLowerCase()}>{group.title}</h2>
              <div className="sidebar-links">{navigationLinks(group.pages)}</div>
            </section>
          ))}
        </nav>
      </aside>
      <div className="portal-body">
        <header className="portal-header">
          <button type="button" className="portal-menu-toggle" aria-controls="portal-sidebar" aria-expanded={menuOpen}
            onClick={() => setOpenAt(menuOpen ? null : locationKey)}>
            {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />} Menu
          </button>
          <span className="portal-workspace">{label} workspace</span>
          <button type="button" className="portal-sign-out" onClick={onSignOut}><LogOut size={17} aria-hidden="true" /> Sign out</button>
        </header>
        <main id="portal-content" tabIndex={-1} className="portal-content">
          {signOutError && <p className="mb-4 text-sm text-red-800" role="alert">{signOutError}</p>}
          <Outlet context={{ role, account }} />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const auth = useLiveAuth()

  async function handleSignOut() {
    try {
      await auth.signOut()
    } catch {
      // Sign-out failures are captured and cleared inside useLiveAuth.
    }
  }

  if (auth.loading) {
    return (
      <AccessStatusScreen
        title="Checking institute access"
        message="Verifying your Google sign-in and portal permissions..."
      />
    )
  }

  if (auth.error) {
    return (
      <AccessStatusScreen
        title="Access check failed"
        message={auth.error}
        error
        actionLabel="Try again"
        onAction={auth.retry}
        onSignOut={auth.session ? handleSignOut : undefined}
        signOutError={auth.signOutError}
      />
    )
  }

  const account = auth.profile
  const role = account?.role ?? null

  if (role === 'pending') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={
            <PendingAccessScreen
              account={account}
              onRetry={auth.retry}
              onSignOut={handleSignOut}
              signOutError={auth.signOutError}
            />
          } />
        </Routes>
      </BrowserRouter>
    )
  }

  const home = role ? '/' + role : '/sign-in'

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={
          role ? <Navigate to={home} replace /> : <SignIn configured={auth.configured} callbackError={auth.callbackError} />
        } />
        {Object.keys(roleLabels).map(workspace => {
          const groups = navigationFor(workspace)
          return (
            <Route key={workspace} path={'/' + workspace} element={
              role === workspace
                ? <PortalLayout role={role} account={account} onSignOut={handleSignOut} signOutError={auth.signOutError} groups={groups} />
                : <Navigate to={home} replace />
            }>
              <Route path="profile" element={<MyProfile key={workspace} account={account} role={role} />} />
              {groups.flatMap(group => group.pages).map(section => section.path
                ? <Route key={section.path} path={section.path} element={<WorkspacePage key={section.path} section={section} />} />
                : <Route key="dashboard" index element={<WorkspacePage key="dashboard" section={section} />} />)}
            </Route>
          )
        })}
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
