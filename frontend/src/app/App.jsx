import React, { useState } from 'react'
import { ArrowRight, BookOpen, ChevronRight, Eye, EyeOff, LogOut, Menu, X } from 'lucide-react'
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import AccountAvatar from '../features/auth/AccountAvatar.jsx'
import MyProfile from '../features/auth/MyProfile.jsx'
import { readRoster } from '../features/roster/rosterRepository.js'
import { initialData } from '../demo.js'
import { navigationFor, roleLabels, WorkspacePage } from './portalNavigation.jsx'
import './portal.css'
const accounts = {
  admin: { name: 'Portal Admin', email: 'admin@example.com' },
  teacher: { name: 'Demo Teacher', email: 'teacher@example.com' },
  student: initialData.students[0],
}
const sessionKey = 'bayan-demo-role'

function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon"><BookOpen size={23} aria-hidden="true" /></span>
      <div><strong lang="ar" dir="rtl">طُلَّابُ الْبَيَانِ</strong><small>Al Bayan Institute</small></div>
    </div>
  )
}

const demoPassword = 'BayanDemo2026'

function SignIn({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  function useSample(role) {
    setEmail(accounts[role].email)
    setPassword(demoPassword)
    setShowPassword(false)
    setError('')
  }

  function submit(event) {
    event.preventDefault()
    const role = Object.keys(accounts).find(key => accounts[key].email === email.trim().toLowerCase())
    if (role && password === demoPassword) {
      onSignIn(role)
    } else {
      setError('The email or password is incorrect. Try one of the sample accounts below.')
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
          <p>Choose a sample account or enter its demo credentials.</p>
          <form onSubmit={submit}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="username" placeholder="you@example.com" required
              value={email} aria-invalid={Boolean(error)} aria-describedby={error ? 'sign-in-error' : undefined}
              onChange={event => { setEmail(event.target.value); setError('') }} />
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                placeholder="Enter your password" required value={password}
                aria-invalid={Boolean(error)} aria-describedby={error ? 'sign-in-error' : undefined}
                onChange={event => { setPassword(event.target.value); setError('') }} />
              <button type="button" aria-controls="password" aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(visible => !visible)}>
                {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
              </button>
            </div>
            {error && <p id="sign-in-error" className="error" role="alert">{error}</p>}
            <button type="submit" className="primary-button">Sign in <ArrowRight size={17} aria-hidden="true" /></button>
          </form>
          <div className="demo-accounts">
            <p>Fill in a sample account</p>
            <div>
              <button type="button" onClick={() => useSample('student')}>Student</button>
              <button type="button" onClick={() => useSample('admin')}>Admin</button>
              <button type="button" onClick={() => useSample('teacher')}>Teacher</button>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
function PortalLayout({ role, account, onSignOut, groups }) {
  const label = roleLabels[role]
  const { key: locationKey } = useLocation()
  const [openAt, setOpenAt] = useState(null)
  const menuOpen = openAt === locationKey
  const closeMenu = () => setOpenAt(null)
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
            <small>{role === 'student' ? account.id : label}</small>
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
          <Outlet context={{ role, account }} />
        </main>
      </div>
    </div>
  )
}

function readRole() {
  const role = sessionStorage.getItem(sessionKey)
  return Object.hasOwn(accounts, role) ? role : null
}

function getDemoAccount(role) {
  if (role !== 'student') return accounts[role]
  try {
    return readRoster().find(student => student.historyId === accounts.student.historyId) ?? accounts.student
  } catch {
    return accounts.student
  }
}

export default function App() {
  const [role, setRole] = useState(readRole)
  const account = getDemoAccount(role)
  const home = role ? '/' + role : '/sign-in'

  function signIn(nextRole) {
    sessionStorage.setItem(sessionKey, nextRole)
    setRole(nextRole)
  }

  function signOut() {
    sessionStorage.removeItem(sessionKey)
    setRole(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={role ? <Navigate to={home} replace /> : <SignIn onSignIn={signIn} />} />
        {Object.keys(roleLabels).map(workspace => {
          const groups = navigationFor(workspace)
          return (
            <Route key={workspace} path={'/' + workspace} element={
              role === workspace
                ? <PortalLayout role={role} account={account} onSignOut={signOut} groups={groups} />
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
