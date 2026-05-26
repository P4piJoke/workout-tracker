import { useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import DashboardPage  from './pages/DashboardPage';
import LogWorkoutPage from './pages/LogWorkoutPage';
import ExercisesPage  from './pages/ExercisesPage';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const kc = useAuth();

  const nav = (target) => (
    <button
      className={`btn-nav ${page === target ? 'active' : ''}`}
      onClick={() => setPage(target)}
    >
      {target === 'dashboard'  && 'Dashboard'}
      {target === 'log'        && 'Log Workout'}
      {target === 'exercises'  && 'Exercises'}
    </button>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="topbar__brand">
          WORK<span>OUT</span>
        </span>

        <nav className="topbar__nav">
          {nav('dashboard')}
          {nav('log')}
          {nav('exercises')}
        </nav>

        <div className="topbar__right">
          <span className="topbar__user">
            {kc.tokenParsed?.preferred_username ?? 'athlete'}
          </span>
          <button className="btn--logout" onClick={() => kc.logout()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="page-content">
        {page === 'dashboard' && <DashboardPage />}
        {page === 'log'       && <LogWorkoutPage />}
        {page === 'exercises' && <ExercisesPage />}
      </main>
    </div>
  );
}