import { useState } from 'react';
import { useAuth }        from './auth/AuthProvider';
import DashboardPage      from './pages/DashboardPage';
import LogWorkoutPage     from './pages/LogWorkoutPage';
import ExercisesPage      from './pages/ExercisesPage';
import StatsPage          from './pages/StatsPage';
import OverloadPage       from './pages/OverloadPage';
import PreferencesModal   from './components/PreferencesModal';

const NAV = [
  { key: 'dashboard', label: 'Dashboard'   },
  { key: 'log',       label: 'Log Workout' },
  { key: 'exercises', label: 'Exercises'   },
  { key: 'stats',     label: 'Stats'       },
  { key: 'overload',  label: 'Overload'    },
];

function GearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0
        1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0
        0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0
        9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0
        1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65
        1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65
        0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2
        2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65
        1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65
        0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2
        2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4
        9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65
        1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

export default function App() {
  const [page,    setPage]    = useState('dashboard');
  const [showPref, setShowPref] = useState(false);
  const kc = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="topbar__brand">WORK<span>OUT</span></span>

        <nav className="topbar__nav">
          {NAV.map(({ key, label }) => (
            <button
              key={key}
              className={`btn-nav ${page === key ? 'active' : ''}`}
              onClick={() => setPage(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="topbar__right">
          <span className="topbar__user">
            {kc.tokenParsed?.preferred_username ?? 'athlete'}
          </span>

          <button
            className="topbar__icon-btn"
            onClick={() => setShowPref(true)}
            aria-label="Preferences"
            title="Training preferences"
          >
            <GearIcon />
          </button>

          <button className="btn--logout" onClick={() => kc.logout()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="page-content">
        {page === 'dashboard' && <DashboardPage />}
        {page === 'log'       && <LogWorkoutPage />}
        {page === 'exercises' && <ExercisesPage />}
        {page === 'stats'     && <StatsPage />}
        {page === 'overload'  && <OverloadPage />}
      </main>

      {showPref && <PreferencesModal onClose={() => setShowPref(false)} />}
    </div>
  );
}