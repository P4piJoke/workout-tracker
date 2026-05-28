import { useState } from 'react';
import { useAuth }         from '../auth/AuthProvider';
import { useAllExercises, useDeleteExercise } from '../hooks/useExercises';
import ExerciseCard        from '../components/ExerciseCard';
import AddExerciseModal    from '../components/AddExerciseModal';

const MUSCLES = [
  'CHEST','BACK','SHOULDERS','BICEPS','TRICEPS',
  'LEGS','GLUTES','CORE','CALVES','FOREARMS',
];
const TYPES = ['STRENGTH', 'CARDIO', 'FLEXIBILITY'];

export default function ExercisesPage() {
  const kc      = useAuth();
  const isAdmin = kc.hasRealmRole('admin');

  const [muscle,          setMuscle]          = useState(null);
  const [type,            setType]            = useState(null);
  const [showAddExercise, setShowAddExercise] = useState(false);

  const { data: exercises = [], isLoading } = useAllExercises({ muscle, type });
  const { mutate: deleteExercise }          = useDeleteExercise();

  const toggleMuscle = (m) => setMuscle(prev => prev === m ? null : m);
  const toggleType   = (t) => setType(prev => prev === t ? null : t);

  return (
    <section>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="dashboard__header">
        <h1 className="dashboard__title">Exercises</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!isLoading && (
            <span className="dashboard__count">
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </span>
          )}
          {isAdmin && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => setShowAddExercise(true)}
            >
              + New exercise
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="filter-section">
        <div className="filter-group">
          <span className="filter-label">Muscle</span>
          <div className="filter-chips">
            {MUSCLES.map(m => (
              <button
                key={m}
                className={`filter-chip ${muscle === m ? 'filter-chip--active' : ''}`}
                onClick={() => toggleMuscle(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Type</span>
          <div className="filter-chips">
            {TYPES.map(t => (
              <button
                key={t}
                className={`filter-chip filter-chip--type ${type === t ? 'filter-chip--active' : ''}`}
                onClick={() => toggleType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {(muscle || type) && (
          <button
            className="btn btn--ghost btn--sm filter-clear"
            onClick={() => { setMuscle(null); setType(null); }}
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      {isLoading && <p className="state-label">Loading exercises…</p>}

      {!isLoading && exercises.length === 0 && (
        <div className="dashboard__empty">
          <div className="dashboard__empty-icon">🔍</div>
          <p>No exercises match these filters.</p>
        </div>
      )}

      {exercises.length > 0 && (
        <div className="ex-grid">
          {exercises.map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              isAdmin={isAdmin}
              onDelete={deleteExercise}
            />
          ))}
        </div>
      )}

      {showAddExercise && (
        <AddExerciseModal onClose={() => setShowAddExercise(false)} />
      )}
    </section>
  );
}