import { useState, useEffect } from 'react';
import { usePreferences, useUpdatePreferences } from '../hooks/usePreferences';
import Stepper from './Stepper';
import { useDeleteExercisePreference, useExercisePreferences } from '../hooks/useExercisePreferences';

function repRangeLabel(min, max) {
  if (max <= 5) return 'Max strength';
  if (max <= 8) return 'Strength';
  if (max <= 12) return 'Strength / hypertrophy';
  if (max <= 20) return 'Hypertrophy / endurance';
  return 'Endurance';
}

const ACTIVITY_LABELS = {
  SEDENTARY: 'Sedentary',
  LIGHT: 'Lightly active',
  MODERATE: 'Moderately active',
  ACTIVE: 'Very active',
  VERY_ACTIVE: 'Extra active',
};

export default function PreferencesModal({ onClose }) {
  const { data: prefs } = usePreferences();
  const { mutate: save, isPending, isError } = useUpdatePreferences();
  const { data: exercisePrefs = [] } = useExercisePreferences();
  const { mutate: deleteExPref } = useDeleteExercisePreference();

  const [form, setForm] = useState({
    targetRepsMin: 8,
    targetRepsMax: 12,
    defaultSets: 3,
    heightCm: null,
    sex: null,
    activityLevel: null,
  });

  useEffect(() => {
    if (prefs) setForm({
      targetRepsMin: prefs.targetRepsMin,
      targetRepsMax: prefs.targetRepsMax,
      defaultSets: prefs.defaultSets,
      heightCm: prefs.heightCm ?? 170,
      sex: prefs.sex ?? 'MALE',
      activityLevel: prefs.activityLevel ?? 'MODERATE',
    });
  }, [prefs]);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSave = () => save(form, { onSuccess: onClose });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal--narrow"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Training preferences"
      >
        <div className="modal__header">
          <div className="modal__title-group">
            <h2 className="modal__title">Preferences</h2>
            <span className="modal__date">Training defaults</span>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <p className="pref-intro">
            The overload engine uses your rep range to decide when to suggest
            a weight increase. Pick the range that matches your current training goal.
          </p>

          {/* ── Rep range ─────────────────────────────── */}
          <div className="pref-section">
            <div className="pref-section__header">
              <span className="pref-section__title">Rep range</span>
              <span className="pref-section__tag">
                {repRangeLabel(form.targetRepsMin, form.targetRepsMax)}
              </span>
            </div>

            <div className="pref-range-row">
              <Stepper
                label="Min reps"
                value={form.targetRepsMin}
                min={1}
                max={form.targetRepsMax - 1}
                onChange={v => set('targetRepsMin', v)}
              />

              <div className="pref-range-bar">
                <div
                  className="pref-range-fill"
                  style={{
                    left: `${(form.targetRepsMin / 30) * 100}%`,
                    right: `${100 - (form.targetRepsMax / 30) * 100}%`,
                  }}
                />
                <span className="pref-range-label">{form.targetRepsMin}–{form.targetRepsMax}</span>
              </div>

              <Stepper
                label="Max reps"
                value={form.targetRepsMax}
                min={form.targetRepsMin + 1}
                max={30}
                onChange={v => set('targetRepsMax', v)}
              />
            </div>

            <div className="pref-presets">
              {[
                { label: '1–5', sub: 'Max strength', min: 1, max: 5 },
                { label: '4–6', sub: 'Strength', min: 4, max: 6 },
                { label: '6–8', sub: 'Str/Hyper', min: 6, max: 8 },
                { label: '8–12', sub: 'Hypertrophy', min: 8, max: 12 },
                { label: '12–15', sub: 'Hyper/Endur', min: 12, max: 15 },
                { label: '15–20', sub: 'Endurance', min: 15, max: 20 },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  className={`pref-preset ${form.targetRepsMin === p.min && form.targetRepsMax === p.max
                    ? 'pref-preset--active' : ''}`}
                  onClick={() => setForm(f => ({
                    ...f, targetRepsMin: p.min, targetRepsMax: p.max,
                  }))}
                >
                  <span className="pref-preset__range">{p.label}</span>
                  <span className="pref-preset__sub">{p.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Default sets ───────────────────────────── */}
          <div className="pref-section">
            <div className="pref-section__header">
              <span className="pref-section__title">Default sets</span>
              <span className="pref-section__tag">Pre-filled when adding an exercise</span>
            </div>
            <div className="pref-sets-row">
              <Stepper
                value={form.defaultSets}
                min={1}
                max={8}
                unit="sets"
                onChange={v => set('defaultSets', v)}
              />
            </div>
          </div>

          {/* ── Body profile ───────────────────────────── */}
          <div className="pref-section">
            <div className="pref-section__header">
              <span className="pref-section__title">Body profile</span>
              <span className="pref-section__tag">Used by Health Calculators</span>
            </div>

            {/* Sex */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="field__label" style={{ display: 'block', marginBottom: '0.4rem' }}>Sex</label>
              <div className="calc-toggle-group" style={{ maxWidth: 240 }}>
                {['MALE', 'FEMALE'].map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`calc-toggle ${form.sex === s ? 'calc-toggle--active' : ''}`}
                    onClick={() => set('sex', s)}
                  >
                    {s === 'MALE' ? '♂ Male' : '♀ Female'}
                  </button>
                ))}
              </div>
            </div>

            {/* Height */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="field__label" style={{ display: 'block', marginBottom: '0.4rem' }}>Height</label>
              <Stepper
                value={form.heightCm ?? 170}
                min={100}
                max={250}
                unit="cm"
                onChange={v => set('heightCm', v)}
              />
            </div>

            {/* Activity level */}
            <div>
              <label className="field__label" style={{ display: 'block', marginBottom: '0.4rem' }}>Activity level</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`filter-chip ${form.activityLevel === key ? 'filter-chip--active' : ''}`}
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    onClick={() => set('activityLevel', key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Per-exercise overrides ─────────────────── */}
          {exercisePrefs.length > 0 && (
            <div className="pref-section">
              <div className="pref-section__header">
                <span className="pref-section__title">Per-exercise overrides</span>
                <span className="pref-section__tag">Set from the Overload page</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {exercisePrefs.map(p => (
                  <div key={p.exerciseId} className="pref-override-row">
                    <span className="pref-override-row__name">{p.exerciseName}</span>
                    <span className="pref-override-row__range">
                      {p.targetRepsMin}–{p.targetRepsMax} reps
                    </span>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => deleteExPref(p.exerciseId)}
                      title="Remove override — reverts to global range"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isError && (
            <p className="form-error">Failed to save — please try again.</p>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn--primary btn--sm"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? 'Saving…' : 'Save preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}