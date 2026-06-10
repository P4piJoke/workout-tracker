import { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthProvider';
import DashboardPage from './pages/DashboardPage';
import LogWorkoutPage from './pages/LogWorkoutPage';
import ExercisesPage from './pages/ExercisesPage';
import StatsPage from './pages/StatsPage';
import OverloadPage from './pages/OverloadPage';
import TemplatesPage from './pages/TemplatesPage';
import BodyMetricsPage from './pages/BodyMetricsPage';
import HealthCalculatorsPage from './pages/HealthCalculatorsPage';
import PreferencesModal from './components/PreferencesModal';

const NAV = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'log', label: 'Log Workout' },
  { key: 'templates', label: 'Templates' },
  { key: 'exercises', label: 'Exercises' },
  { key: 'stats', label: 'Stats' },
  { key: 'overload', label: 'Overload' },
  { key: 'metrics', label: 'Body' },
  { key: 'calculators', label: 'Calculators' },
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

function BurgerIcon({ open }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 20 20"
      fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" aria-hidden="true"
      className={`burger-icon ${open ? 'burger-icon--open' : ''}`}
    >
      {/* Top line — rotates to first arm of X */}
      <line x1="2" y1="5" x2="18" y2="5" className="burger-line burger-line--top" />
      {/* Middle line — fades out */}
      <line x1="2" y1="10" x2="18" y2="10" className="burger-line burger-line--mid" />
      {/* Bottom line — rotates to second arm of X */}
      <line x1="2" y1="15" x2="18" y2="15" className="burger-line burger-line--bot" />
    </svg>
  );
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [showPref, setShowPref] = useState(false);
  const [initialTemplate, setInitialTemplate] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const kc = useAuth();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close menu on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => { if (e.matches) setMenuOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const navigateTo = (key) => {
    setPage(key);
    setMenuOpen(false);
  };

  const handleApplyTemplate = (template) => {
    setInitialTemplate(template);
    setPage('log');
  };

  const clearTemplate = () => setInitialTemplate(null);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="topbar__brand"
          onClick={() => navigateTo('dashboard')}
          aria-label="Go to dashboard"
          type="button"
        >
          WORK<span>OUT</span>
        </button>

        {/* ── Burger button — mobile only ── */}
        <button
          className="topbar__burger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <BurgerIcon open={menuOpen} />
        </button>

        {/* ── Desktop nav ── */}
        <nav className="topbar__nav" aria-label="Main navigation">
          {NAV.map(({ key, label }) => (
            <button
              key={key}
              className={`btn-nav ${page === key ? 'active' : ''}`}
              onClick={() => navigateTo(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ── Right side controls ── */}
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

      {/* ── Mobile slide-in overlay ── */}
      <div
        className={`mobile-nav-backdrop ${menuOpen ? 'mobile-nav-backdrop--visible' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <nav
        className={`mobile-nav ${menuOpen ? 'mobile-nav--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav__header">
          <span className="mobile-nav__brand">WORK<span>OUT</span></span>
        </div>

        <div className="mobile-nav__links">
          {NAV.map(({ key, label }) => (
            <button
              key={key}
              className={`mobile-nav__item ${page === key ? 'mobile-nav__item--active' : ''}`}
              onClick={() => navigateTo(key)}
              tabIndex={menuOpen ? 0 : -1}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mobile-nav__footer">
          <span className="mobile-nav__user">
            {kc.tokenParsed?.preferred_username ?? 'athlete'}
          </span>
          <div className="mobile-nav__actions">
            <button
              className="mobile-nav__pref-btn"
              onClick={() => { setShowPref(true); setMenuOpen(false); }}
              tabIndex={menuOpen ? 0 : -1}
            >
              <GearIcon /> Preferences
            </button>
            <button
              className="mobile-nav__logout"
              onClick={() => kc.logout()}
              tabIndex={menuOpen ? 0 : -1}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

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
        {page === 'calculators' && <HealthCalculatorsPage />}
      </main>

      {showPref && <PreferencesModal onClose={() => setShowPref(false)} />}
    </div>
  );
}