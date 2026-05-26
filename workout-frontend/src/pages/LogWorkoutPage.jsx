import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useCreateWorkout } from '../hooks/useWorkouts';
import { useExerciseSearch } from '../hooks/useExercises';
import AddExerciseModal from '../components/AddExerciseModal';

const EMPTY_SET = { reps: 8, weightKg: 0, type: 'WORKING' };

export default function LogWorkoutPage() {
  const kc      = useAuth();
  const isAdmin = kc.hasRealmRole('admin');   // keycloak-js built-in check

  const [query,           setQuery]           = useState('');
  const [entries,         setEntries]         = useState([]);
  const [name,            setName]            = useState('');
  const [date,            setDate]            = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showAddExercise, setShowAddExercise] = useState(false);

  const { data: results = [] }                 = useExerciseSearch(query);
  const { mutate: createWorkout, isPending, isSuccess } = useCreateWorkout();

  const addExercise = (exercise) => {
    setEntries(prev => [...prev, {
      exerciseId:   exercise.id,
      exerciseName: exercise.name,
      sets: [{ ...EMPTY_SET }],
    }]);
    setQuery('');
  };

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

  const removeEntry = (ei) =>
    setEntries(prev => prev.filter((_, i) => i !== ei));

  const handleSubmit = () => {
    if (!name || entries.length === 0) return;
    createWorkout(
      { name, date, entries },
      {
        onSuccess: () => {
          setName('');
          setEntries([]);
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

      <div className="log-meta-grid">
        <div className="field">
          <label className="field__label">Session name</label>
          <input className="input" placeholder="e.g. Monday Push"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">Date</label>
          <input className="input" type="date"
            value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <div className="log-section">
        <div className="field">
          <label className="field__label">Add exercise</label>
          <input className="input"
            placeholder='Search — e.g. "chest", "squat"'
            value={query} onChange={e => setQuery(e.target.value)} />
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

      {entries.length > 0 && (
        <div className="entry-list">
          {entries.map((entry, ei) => (
            <div className="entry-block" key={ei}>
              <div className="entry-block__header">
                <span className="entry-block__name">{entry.exerciseName}</span>
                <button className="btn btn--danger btn--sm"
                  onClick={() => removeEntry(ei)}>Remove</button>
              </div>

              <div className="entry-block__body">
                <div className="set-row">
                  <span />
                  <span className="set-row__field-label">Reps</span>
                  <span className="set-row__field-label">kg</span>
                  <span className="set-row__field-label">Type</span>
                </div>

                {entry.sets.map((s, si) => (
                  <div className="set-row" key={si}>
                    <span className="set-row__num">{si + 1}</span>
                    <input className="input input--sm" type="number" min="1"
                      value={s.reps}
                      onChange={e => updateSet(ei, si, 'reps', Number(e.target.value))} />
                    <input className="input input--sm" type="number" min="0" step="0.5"
                      value={s.weightKg}
                      onChange={e => updateSet(ei, si, 'weightKg', Number(e.target.value))} />
                    <select className="set-row__type" value={s.type}
                      onChange={e => updateSet(ei, si, 'type', e.target.value)}>
                      <option value="WORKING">Work</option>
                      <option value="WARMUP">Warm</option>
                      <option value="DROPSET">Drop</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="entry-block__footer">
                <button className="btn btn--ghost btn--sm"
                  onClick={() => addSet(ei)}>+ Add set</button>
              </div>
            </div>
          ))}
        </div>
      )}

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