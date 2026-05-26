import { useEffect, useState } from 'react';
import { useUpdateWorkout, useDeleteWorkout } from '../hooks/useWorkouts';

function volumeKg(sets) {
  return sets?.reduce((s, set) => s + set.reps * set.weightKg, 0) ?? 0;
}
function fmt(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(Math.round(n));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const TYPE_LABEL = { WORKING: 'Work', WARMUP: 'Warm-up', DROPSET: 'Drop' };

export default function WorkoutDetailModal({ workout, onClose }) {
  const { mutate: updateWorkout, isPending: isSaving } = useUpdateWorkout();
  const { mutate: deleteWorkout }                       = useDeleteWorkout();

  const [editing,  setEditing]  = useState(false);
  const [editData, setEditData] = useState(() => deepClone(workout));

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => { setEditData(deepClone(workout)); }, [workout]);

  const updateSet = (ei, si, field, value) =>
    setEditData(prev => ({
      ...prev,
      entries: prev.entries.map((e, i) =>
        i !== ei ? e : {
          ...e,
          sets: e.sets.map((s, j) =>
            j !== si ? s : { ...s, [field]: field === 'type' ? value : Number(value) }
          ),
        }
      ),
    }));

  const addSet = (ei) =>
    setEditData(prev => ({
      ...prev,
      entries: prev.entries.map((e, i) =>
        i !== ei ? e : {
          ...e,
          sets: [...e.sets, { reps: 8, weightKg: 0, type: 'WORKING' }],
        }
      ),
    }));

  const removeSet = (ei, si) =>
    setEditData(prev => ({
      ...prev,
      entries: prev.entries.map((e, i) =>
        i !== ei ? e : { ...e, sets: e.sets.filter((_, j) => j !== si) }
      ),
    }));

  const handleSave = () => {
    updateWorkout(
      {
        id:      workout.id,
        name:    editData.name,
        date:    editData.date,
        entries: editData.entries.map(e => ({
          exerciseId:   e.exerciseId,
          exerciseName: e.exerciseName,
          sets: e.sets.map(s => ({
            reps:     s.reps,
            weightKg: s.weightKg,
            type:     s.type,
          })),
        })),
      },
      { onSuccess: () => { setEditing(false); onClose(); } }
    );
  };

  const handleDelete = () => {
    deleteWorkout(workout.id, { onSuccess: onClose });
  };

  const displayData  = editing ? editData : workout;
  const totalSets    = displayData.entries.reduce((s, e) => s + (e.sets?.length ?? 0), 0);
  const totalVolume  = displayData.entries.reduce((s, e) => s + volumeKg(e.sets), 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true">

        <div className="modal__header">
          <div className="modal__title-group">
            {editing ? (
              <input
                className="input modal__name-input"
                value={editData.name}
                onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
              />
            ) : (
              <h2 className="modal__title">{workout.name}</h2>
            )}
            {editing ? (
              <input
                className="input input--sm modal__date-input"
                type="date"
                value={editData.date}
                onChange={e => setEditData(p => ({ ...p, date: e.target.value }))}
              />
            ) : (
              <span className="modal__date">{workout.date}</span>
            )}
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__summary">
          <span className="modal__pill">
            <span className="modal__pill-val">{displayData.entries.length}</span>
            exercise{displayData.entries.length !== 1 ? 's' : ''}
          </span>
          <span className="modal__pill">
            <span className="modal__pill-val">{totalSets}</span> total sets
          </span>
          <span className="modal__pill modal__pill--accent">
            <span className="modal__pill-val">{fmt(totalVolume)}</span> kg volume
          </span>
        </div>

        <div className="modal__body">
          {displayData.entries.map((entry, ei) => {
            const vol = volumeKg(entry.sets);
            return (
              <div className="modal__entry" key={ei}>
                <div className="modal__entry-header">
                  <span className="modal__entry-name">{entry.exerciseName}</span>
                  <span className="modal__entry-vol">{fmt(vol)} kg</span>
                </div>

                <table className="modal__set-table">
                  <thead>
                    <tr>
                      <th>Set</th>
                      <th>Reps</th>
                      <th>Weight (kg)</th>
                      <th>Type</th>
                      <th>Volume</th>
                      {editing && <th />}
                    </tr>
                  </thead>
                  <tbody>
                    {entry.sets?.map((set, si) => (
                      <tr key={si}>
                        <td className="mono muted">{si + 1}</td>

                        <td>
                          {editing ? (
                            <input className="input input--sm"
                              type="number" min="1" value={set.reps}
                              onChange={e => updateSet(ei, si, 'reps', e.target.value)}
                            />
                          ) : (
                            <span className="mono">{set.reps}</span>
                          )}
                        </td>

                        <td>
                          {editing ? (
                            <input className="input input--sm"
                              type="number" min="0" step="0.5" value={set.weightKg}
                              onChange={e => updateSet(ei, si, 'weightKg', e.target.value)}
                            />
                          ) : (
                            <span className="mono">{set.weightKg} kg</span>
                          )}
                        </td>

                        <td>
                          {editing ? (
                            <select className="set-row__type"
                              value={set.type}
                              onChange={e => updateSet(ei, si, 'type', e.target.value)}
                            >
                              <option value="WORKING">Work</option>
                              <option value="WARMUP">Warm-up</option>
                              <option value="DROPSET">Drop</option>
                            </select>
                          ) : (
                            <span className={`set-badge set-badge--${set.type?.toLowerCase()}`}>
                              {TYPE_LABEL[set.type] ?? set.type}
                            </span>
                          )}
                        </td>

                        <td className="mono muted">{fmt(set.reps * set.weightKg)} kg</td>

                        {editing && (
                          <td>
                            <button className="btn btn--danger btn--sm"
                              onClick={() => removeSet(ei, si)}
                              disabled={entry.sets.length <= 1}
                            >✕</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {editing && (
                  <div className="modal__entry-add-set">
                    <button className="btn btn--ghost btn--sm"
                      onClick={() => addSet(ei)}>
                      + Add set
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="modal__footer">
          <button className="btn btn--danger btn--sm" onClick={handleDelete}>
            Delete
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {editing ? (
              <>
                <button className="btn btn--ghost btn--sm"
                  onClick={() => { setEditData(deepClone(workout)); setEditing(false); }}>
                  Cancel
                </button>
                <button className="btn btn--primary btn--sm"
                  onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </>
            ) : (
              <>
                <button className="btn btn--ghost btn--sm" onClick={onClose}>
                  Close
                </button>
                <button className="btn btn--primary btn--sm"
                  onClick={() => setEditing(true)}>
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
