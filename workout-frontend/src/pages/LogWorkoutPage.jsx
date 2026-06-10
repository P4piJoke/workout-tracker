import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useCreateWorkout } from '../hooks/useWorkouts';
import { useExerciseSearch } from '../hooks/useExercises';
import { usePreferences } from '../hooks/usePreferences';
import Stepper from '../components/Stepper';
import DatePicker from '../components/DatePicker';
import AddExerciseModal from '../components/AddExerciseModal';

const EMPTY_SET = { reps: 8, weightKg: 0, type: 'WORKING' };

function makeEmptySets(count, reps) {
  return Array.from({ length: count }, () => ({ ...EMPTY_SET, reps: reps ?? 8 }));
}

/**
 * Props:
 *   initialTemplate    — WorkoutTemplate object from TemplatesPage (optional)
 *   onTemplateConsumed — callback to clear the template in App state
 */
export default function LogWorkoutPage({ initialTemplate, onTemplateConsumed }) {
  const kc = useAuth();
  const isAdmin = kc.hasRealmRole('admin');

  const { data: prefs } = usePreferences();
  const defaultSets = prefs?.defaultSets ?? 3;

  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState(null);

  const { data: results = [] } = useExerciseSearch(query);
  const { mutate: createWorkout, isPending, isSuccess } = useCreateWorkout();

  /*
   * Template handoff:
   * When a template arrives via prop, pre-fill the form.
   * We fire this once (when initialTemplate changes from null to a value).
   * After consuming it, we call onTemplateConsumed so App.jsx clears it —
   * preventing re-application if the user navigates away and back.
   */
  useEffect(() => {
    if (!initialTemplate) return;

    setName(initialTemplate.name);
    setEntries(initialTemplate.entries.map(e => ({
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      sets: makeEmptySets(e.defaultSets, e.defaultReps),
    })));
    setAppliedTemplate(initialTemplate.name);
    onTemplateConsumed?.();
  }, [initialTemplate]);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── entry helpers ────────────────────────────────────────────────────────
  const addExercise = (exercise) => {
    setEntries(prev => [...prev, {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: makeEmptySets(defaultSets),
    }]);
    setQuery('');
  };

  const removeEntry = (ei) =>
    setEntries(prev => prev.filter((_, i) => i !== ei));

  const updateSet = (ei, si, field, value) =>
    setEntries(prev => prev.map((e, i) =>
      i !== ei ? e : {
        ...e,
        sets: e.sets.map((s, j) =>
          j !== si ? s : { ...s, [field]: value }
        ),
      }
    ));

  const addSet = (ei) =>
    setEntries(prev => prev.map((e, i) =>
      i !== ei ? e : { ...e, sets: [...e.sets, { ...EMPTY_SET }] }
    ));

  const removeSet = (ei, si) =>
    setEntries(prev => prev.map((e, i) =>
      i !== ei ? e : { ...e, sets: e.sets.filter((_, j) => j !== si) }
    ));

  const handleSubmit = () => {
    if (!name || entries.length === 0) return;
    createWorkout(
      { name, date, entries },
      {
        onSuccess: () => {
          setName('');
          setEntries([]);
          setAppliedTemplate(null);
          setDate(new Date().toISOString().split('T')[0]);
        },
      }
    );
  };

  return (
    <section>
      <div className="log-header">
        <div className="log-header__row">
          <div>
            <h1 className="log-header__title">Log Session</h1>
            <p className="log-header__sub">Search an exercise, build your sets, save.</p>
          </div>
          {isAdmin && (
            <button className="btn btn--ghost btn--sm"
              onClick={() => setShowAddExercise(true)}>
              + New exercise
            </button>
          )}
        </div>
      </div>

      {/* Template origin banner */}
      {appliedTemplate && (
        <div style={{
          background: 'var(--accent-dim)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.6rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--accent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>📋 Pre-filled from template: <strong>{appliedTemplate}</strong></span>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem' }}
            onClick={() => setAppliedTemplate(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Workout meta ─────────────────────────────────────────────── */}
      <div className="log-meta-grid">
        <div className="field">
          <label className="field__label">Session name</label>
          <input
            className="input"
            placeholder="e.g. Monday Push"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field__label">Date</label>
          <DatePicker value={date} onChange={setDate} />
        </div>
      </div>

      {/* ── Exercise search ───────────────────────────────────────────── */}
      <div className="log-section">
        <div className="field">
          <label className="field__label">Add exercise</label>
          <input
            className="input"
            placeholder='Search — e.g. "chest", "squat"'
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {results.length > 0 && (
          <div className="search-results">
            {results.map(ex => (
              <div key={ex.id} className="search-result-item"
                onClick={() => addExercise(ex)}>
                <span className="search-result-item__name">{ex.name}</span>
                <span className="search-result-item__muscle">{ex.primaryMuscle}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Entry blocks ──────────────────────────────────────────────── */}
      {entries.length > 0 && (
        <div className="entry-list">
          {entries.map((entry, ei) => (
            <div className="entry-block" key={ei}>

              <div className="entry-block__header">
                <span className="entry-block__name">{entry.exerciseName}</span>
                <button className="btn btn--danger btn--sm" onClick={() => removeEntry(ei)}>
                  Remove exercise
                </button>
              </div>

              <div className="entry-block__body">
                <div className="set-row set-row--header">
                  <span className="set-row__num">#</span>
                  <span className="set-row__col-label">Reps</span>
                  <span className="set-row__col-label">Weight</span>
                  <span className="set-row__col-label">Type</span>
                  <span />
                </div>

                {entry.sets.map((s, si) => (
                  <div className="set-row" key={si}>
                    <span className="set-row__num">{si + 1}</span>
                    <Stepper value={s.reps} min={1}
                      onChange={v => updateSet(ei, si, 'reps', v)}
                      size="sm" />
                    <Stepper value={s.weightKg} min={0} step={2.5}
                      onChange={v => updateSet(ei, si, 'weightKg', v)}
                      size="sm" />
                    <select className="set-row__type" value={s.type}
                      onChange={e => updateSet(ei, si, 'type', e.target.value)}>
                      <option value="WORKING">Work</option>
                      <option value="WARMUP">Warm</option>
                      <option value="DROPSET">Drop</option>
                    </select>
                    <button className="set-row__remove"
                      onClick={() => removeSet(ei, si)}
                      disabled={entry.sets.length <= 1}
                      aria-label="Remove set" title="Remove set">✕</button>
                  </div>
                ))}
              </div>

              <div className="entry-block__footer">
                <button className="btn btn--ghost btn--sm" onClick={() => addSet(ei)}>
                  + Add set
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className="log-submit-bar">
        <button className="btn btn--primary"
          onClick={handleSubmit}
          disabled={isPending || !name || entries.length === 0}>
          {isPending ? 'Saving…' : 'Save Session'}
        </button>
      </div>

      {isSuccess && (
        <p className="state-label" style={{ color: 'var(--accent)' }}>
          Session saved ✓
        </p>
      )}

      {showAddExercise && (
        <AddExerciseModal onClose={() => setShowAddExercise(false)} />
      )}
    </section>
  );
}