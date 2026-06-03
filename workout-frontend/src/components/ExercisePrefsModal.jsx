import { useState } from 'react';
import { useUpsertExercisePreference } from '../hooks/useExercisePreferences';
import Stepper from './Stepper';

export default function ExercisePrefsModal({ rec, currentPrefs, onClose }) {
  const [form, setForm] = useState({
    targetRepsMin: currentPrefs?.targetRepsMin ?? rec.targetReps,
    targetRepsMax: currentPrefs?.targetRepsMax ?? rec.targetReps + 2,
  });

  const { mutate: upsert, isPending, isError } = useUpsertExercisePreference();

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSave = () =>
    upsert(
      {
        exerciseId:   rec.exerciseId,
        exerciseName: rec.exerciseName,
        ...form,
      },
      { onSuccess: onClose }
    );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--narrow"
           onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true">

        <div className="modal__header">
          <div className="modal__title-group">
            <h2 className="modal__title">Rep range</h2>
            <span className="modal__date">{rec.exerciseName}</span>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Overrides your global rep range for this exercise only.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
            <Stepper
              label="Min reps"
              value={form.targetRepsMin}
              min={1}
              max={form.targetRepsMax - 1}
              onChange={v => set('targetRepsMin', v)}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>—</span>
            <Stepper
              label="Max reps"
              value={form.targetRepsMax}
              min={form.targetRepsMin + 1}
              max={30}
              onChange={v => set('targetRepsMax', v)}
            />
          </div>

          {isError && (
            <p className="form-error" style={{ marginTop: '1rem' }}>
              Failed to save — please try again.
            </p>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary btn--sm"
                  onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}