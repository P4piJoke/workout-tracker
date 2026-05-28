import { useState, useEffect } from 'react';
import { usePreferences, useUpdatePreferences } from '../hooks/usePreferences';
import Stepper from './Stepper';

function repRangeLabel(min, max) {
  if (max <= 5)  return 'Max strength';
  if (max <= 8)  return 'Strength';
  if (max <= 12) return 'Strength / hypertrophy';
  if (max <= 20) return 'Hypertrophy / endurance';
  return 'Endurance';
}

export default function PreferencesModal({ onClose }) {
  const { data: prefs }                      = usePreferences();
  const { mutate: save, isPending, isError } = useUpdatePreferences();

  const [form, setForm] = useState({
    targetRepsMin: 8,
    targetRepsMax: 12,
    defaultSets:   3,
  });

  // populate once prefs load
  useEffect(() => {
    if (prefs) setForm({
      targetRepsMin: prefs.targetRepsMin,
      targetRepsMax: prefs.targetRepsMax,
      defaultSets:   prefs.defaultSets,
    });
  }, [prefs]);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSave = () =>
    save(form, { onSuccess: onClose });

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
                    left:  `${(form.targetRepsMin / 30) * 100}%`,
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

            {/* preset chips */}
            <div className="pref-presets">
              {[
                { label: '1–5',   sub: 'Max strength',  min: 1,  max: 5  },
                { label: '4–6',   sub: 'Strength',      min: 4,  max: 6  },
                { label: '6–8',   sub: 'Str/Hyper',     min: 6,  max: 8  },
                { label: '8–12',  sub: 'Hypertrophy',   min: 8,  max: 12 },
                { label: '12–15', sub: 'Hyper/Endur',   min: 12, max: 15 },
                { label: '15–20', sub: 'Endurance',     min: 15, max: 20 },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  className={`pref-preset ${
                    form.targetRepsMin === p.min && form.targetRepsMax === p.max
                      ? 'pref-preset--active' : ''
                  }`}
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