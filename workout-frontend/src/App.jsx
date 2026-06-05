import { useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import DashboardPage from './pages/DashboardPage';
import LogWorkoutPage from './pages/LogWorkoutPage';
import ExercisesPage from './pages/ExercisesPage';
import StatsPage from './pages/StatsPage';
import OverloadPage from './pages/OverloadPage';
import TemplatesPage from './pages/TemplatesPage';
import BodyMetricsPage from './pages/BodyMetricsPage';
import PreferencesModal from './components/PreferencesModal';

const NAV = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'log', label: 'Log Workout' },
  { key: 'templates', label: 'Templates' },
  { key: 'exercises', label: 'Exercises' },
  { key: 'stats', label: 'Stats' },
  { key: 'overload', label: 'Overload' },
  { key: 'metrics', label: 'Body' },
];

function GearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
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
  const [page, setPage] = useState('dashboard');
  const [showPref, setShowPref] = useState(false);
  /*
   * Template → Log handoff.
   * When the user clicks "Use →" on a template, we store the template in
   * state and navigate to the Log page. LogWorkoutPage reads initialTemplate
   * to pre-fill exercises. This is a simple prop-based handoff — no global
   * state manager needed for this flow.
   */
  const [initialTemplate, setInitialTemplate] = useState(null);

  const kc = useAuth();

  const handleApplyTemplate = (template) => {
    setInitialTemplate(template);
    setPage('log');
  };

  // Clear template after the log page mounts with it
  const clearTemplate = () => setInitialTemplate(null);

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
        {page === 'log' && (
          <LogWorkoutPage
            initialTemplate={initialTemplate}
            onTemplateConsumed={clearTemplate}
          />
        )}
        {page === 'templates' && (
          <TemplatesPage onApplyTemplate={handleApplyTemplate} />
        )}
        {page === 'exercises' && <ExercisesPage />}
        {page === 'stats' && <StatsPage />}
        {page === 'overload' && <OverloadPage />}
        {page === 'metrics' && <BodyMetricsPage />}
      </main>

      {showPref && <PreferencesModal onClose={() => setShowPref(false)} />}
    </div>
  );
}