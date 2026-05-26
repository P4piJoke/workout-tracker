import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

const MUSCLE_GROUPS = [
  'CHEST','BACK','SHOULDERS','BICEPS','TRICEPS',
  'LEGS','GLUTES','CORE','CALVES','FOREARMS',
];
const EXERCISE_TYPES = ['STRENGTH', 'CARDIO', 'FLEXIBILITY'];

function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiClient.post('/api/exercises', payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  });
}

export default function AddExerciseModal({ onClose }) {
  const [form, setForm] = useState({
    name:             '',
    description:      '',
    primaryMuscle:    'CHEST',
    secondaryMuscles: [],
    type:             'STRENGTH',
  });
  const [error, setError] = useState('');

  const { mutate: createExercise, isPending } = useCreateExercise();

  const set = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleSecondary = (muscle) =>
    setForm(prev => ({
      ...prev,
      secondaryMuscles: prev.secondaryMuscles.includes(muscle)
        ? prev.secondaryMuscles.filter(m => m !== muscle)
        : [...prev.secondaryMuscles, muscle],
    }));

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setError('');
    createExercise(form, {
      onSuccess: onClose,
      onError: (err) =>
        setError(err.response?.data?.message ?? 'Failed to create exercise'),
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--narrow" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true">

        <div className="modal__header">
          <div className="modal__title-group">
            <h2 className="modal__title">New Exercise</h2>
            <span className="modal__date">Admin only</span>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label className="field__label">Name</label>
            <input className="input" placeholder="e.g. Bulgarian Split Squat"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div className="field">
            <label className="field__label">Description</label>
            <input className="input"
              placeholder="Short cue or muscle focus"
              value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>

          <div className="log-meta-grid">
            <div className="field">
              <label className="field__label">Primary muscle</label>
              <select className="set-row__type input"
                value={form.primaryMuscle}
                onChange={e => set('primaryMuscle', e.target.value)}>
                {MUSCLE_GROUPS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="field__label">Type</label>
              <select className="set-row__type input"
                value={form.type}
                onChange={e => set('type', e.target.value)}>
                {EXERCISE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field__label">Secondary muscles</label>
            <div className="muscle-grid">
              {MUSCLE_GROUPS.filter(m => m !== form.primaryMuscle).map(m => (
                <button
                  key={m}
                  type="button"
                  className={`muscle-chip ${form.secondaryMuscles.includes(m) ? 'muscle-chip--active' : ''}`}
                  onClick={() => toggleSecondary(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary btn--sm"
            onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving…' : 'Create exercise'}
          </button>
        </div>

      </div>
    </div>
  );
}