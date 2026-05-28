import { useState } from 'react';
import { useOverload }     from '../hooks/useOverload';
import OverloadCard        from '../components/OverloadCard';
import WorkoutHeatmap      from '../components/WorkoutHeatmap';

const FILTERS = [
  { key: 'ALL',            label: 'All'        },
  { key: 'INCREASE_WEIGHT',label: 'Add weight' },
  { key: 'DELOAD',         label: 'Deload'     },
  { key: 'STALLING',       label: 'Stalling'   },
];

export default function OverloadPage() {
  const { data: recs = [], isLoading } = useOverload();
  const [filter, setFilter] = useState('ALL');

  const filtered = recs.filter(r => {
    if (filter === 'ALL')      return true;
    if (filter === 'STALLING') return r.trend === 'STALLING';
    return r.type === filter;
  });

  const stalling = recs.filter(r => r.trend === 'STALLING').length;

  return (
    <section>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Progressive Overload</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Next-session targets based on your double-progression history.
          </p>
        </div>
        {stalling > 0 && (
          <div className="ol-stall-badge">
            ⚡ {stalling} exercise{stalling > 1 ? 's' : ''} stalling
          </div>
        )}
      </div>

      {/* ── Consistency heatmap ───────────────────────────── */}
      <div className="stats-section">
        <div className="stats-section__header">
          <h2 className="stats-section__title">Training consistency</h2>
          <p className="stats-section__sub">
            Daily volume over the past year — darker = more volume.
          </p>
        </div>
        <WorkoutHeatmap />
      </div>

      {/* ── Filter chips ──────────────────────────────────── */}
      <div className="stats-section">
        <div className="stats-section__header">
          <h2 className="stats-section__title">Recommendations</h2>
        </div>

        <div className="filter-chips" style={{ marginBottom: '1.25rem' }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-chip ${filter === f.key ? 'filter-chip--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key === 'STALLING' && stalling > 0 && (
                <span className="filter-chip-count">{stalling}</span>
              )}
            </button>
          ))}
        </div>

        {isLoading && <p className="state-label">Analysing your history…</p>}

        {!isLoading && filtered.length === 0 && (
          <div className="dashboard__empty">
            <div className="dashboard__empty-icon">📋</div>
            <p>Log at least 2 sessions per exercise to get recommendations.</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="ol-grid">
            {filtered.map(rec => (
              <OverloadCard key={rec.exerciseId} rec={rec} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}