import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import {
    useTemplates,
    useCreateTemplate,
    useCloneTemplate,
    useDeleteTemplate,
} from '../hooks/useTemplates';
import { useAllExercises } from '../hooks/useExercises';
import { usePreferences } from '../hooks/usePreferences';

// ── Template card ─────────────────────────────────────────────────────────────
function TemplateCard({ template, onApply, onClone, onDelete, isAdmin }) {
    const totalSets = template.entries.reduce((s, e) => s + e.defaultSets, 0);

    return (
        <article className="ex-card" style={{ minHeight: 'unset' }}>
            <div className="ex-card__top">
                <h3 className="ex-card__name">{template.name}</h3>
                {template.isSystem && (
                    <span className="ex-card__muscle" style={{ '--muscle-color': '#78b4ff' }}>
                        System
                    </span>
                )}
                {!template.isSystem && template.isOwn && (
                    <span className="ex-card__muscle" style={{ '--muscle-color': '#c8ff3c' }}>
                        Mine
                    </span>
                )}
            </div>

            {template.description && (
                <p className="ex-card__desc">{template.description}</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', margin: '0.5rem 0' }}>
                {template.entries.map((e, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8375rem', color: 'var(--text-secondary)' }}>
                            {e.exerciseName}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {e.defaultSets}×{e.defaultReps}
                            {e.notes && <span title={e.notes}> 💬</span>}
                        </span>
                    </div>
                ))}
            </div>

            <div className="ex-card__footer">
                <span className="ex-card__type ex-card__type--strength">
                    {totalSets} sets total
                </span>
                <div className="ex-card__footer-right" style={{ gap: '0.4rem' }}>
                    {(template.isSystem || !template.isOwn) && (
                        <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => onClone(template.id)}
                            title="Clone to my library"
                        >
                            ⊕ Clone
                        </button>
                    )}
                    <button
                        className="btn btn--primary btn--sm"
                        onClick={() => onApply(template)}
                    >
                        Use →
                    </button>
                    {(template.isOwn || (isAdmin && template.isSystem)) && (
                        <button
                            className="ex-card__delete"
                            onClick={() => {
                                if (window.confirm(`Delete template "${template.name}"?`))
                                    onDelete(template.id);
                            }}
                            title="Delete template"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

// ── Create template modal ─────────────────────────────────────────────────────
function CreateTemplateModal({ onClose, isAdmin }) {
    const { data: exercises = [] } = useAllExercises();
    const { data: prefs } = usePreferences();
    const { mutate: create, isPending } = useCreateTemplate();

    const defaultSets = prefs?.defaultSets ?? 3;
    const defaultReps = prefs ? prefs.targetRepsMin : 8;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [entries, setEntries] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const filtered = exercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8);

    const addExercise = (ex) => {
        if (entries.find(e => e.exerciseId === ex.id)) return;
        setEntries(prev => [...prev, {
            exerciseId: ex.id,
            exerciseName: ex.name,
            defaultSets,
            defaultReps,
            notes: '',
        }]);
        setSearch('');
    };

    const updateEntry = (i, field, val) =>
        setEntries(prev => prev.map((e, idx) =>
            idx !== i ? e : { ...e, [field]: val }
        ));

    const removeEntry = (i) =>
        setEntries(prev => prev.filter((_, idx) => idx !== i));

    const handleCreate = () => {
        if (!name.trim()) { setError('Name is required.'); return; }
        if (entries.length === 0) { setError('Add at least one exercise.'); return; }
        setError('');
        create(
            { name, description, entries, isPublic: isAdmin && isPublic },
            { onSuccess: onClose }
        );
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}
                role="dialog" aria-modal="true"
                style={{ maxWidth: 580 }}>

                <div className="modal__header">
                    <div className="modal__title-group">
                        <h2 className="modal__title">New Template</h2>
                    </div>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="modal__body">
                    {error && <div className="form-error">{error}</div>}

                    <div className="field">
                        <label className="field__label">Template name</label>
                        <input className="input" placeholder="e.g. Monday Push"
                            value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="field__label">Description (optional)</label>
                        <input className="input" placeholder="Short description or goal"
                            value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    {isAdmin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <button
                                type="button"
                                className={`filter-chip ${isPublic ? 'filter-chip--active' : ''}`}
                                onClick={() => setIsPublic(p => !p)}
                            >
                                🌐 Publish as shared (System)
                            </button>
                            {isPublic && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Visible to all users
                                </span>
                            )}
                        </div>
                    )}

                    <div className="field">
                        <label className="field__label">Add exercises</label>
                        <input className="input" placeholder="Search exercises…"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {search.length > 0 && filtered.length > 0 && (
                        <div className="search-results" style={{ marginBottom: '1rem' }}>
                            {filtered.map(ex => (
                                <div key={ex.id} className="search-result-item"
                                    onClick={() => addExercise(ex)}>
                                    <span className="search-result-item__name">{ex.name}</span>
                                    <span className="search-result-item__muscle">{ex.primaryMuscle}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Entry list */}
                    {entries.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {entries.map((e, i) => (
                                <div key={i} style={{
                                    background: 'var(--bg-raised)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.75rem',
                                }}>
                                    {/* Row 1: exercise name + sets/reps + remove button */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 64px 64px 28px',
                                        gap: '0.5rem',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem',
                                    }}>
                                        <span style={{
                                            fontFamily: 'var(--font-display)',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.03em',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {e.exerciseName}
                                        </span>

                                        <div className="field">
                                            <label className="field__label" style={{ fontSize: '0.6rem' }}>Sets</label>
                                            <input
                                                className="input input--sm"
                                                type="number" min="1" max="10"
                                                value={e.defaultSets}
                                                onChange={ev => updateEntry(i, 'defaultSets', Number(ev.target.value))}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <div className="field">
                                            <label className="field__label" style={{ fontSize: '0.6rem' }}>Reps</label>
                                            <input
                                                className="input input--sm"
                                                type="number" min="1"
                                                value={e.defaultReps}
                                                onChange={ev => updateEntry(i, 'defaultReps', Number(ev.target.value))}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <button
                                            className="ex-card__delete"
                                            style={{ marginTop: '1.25rem' }}
                                            onClick={() => removeEntry(i)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Row 2: notes — full width, no competing grid column */}
                                    <input
                                        className="input"
                                        placeholder="Coaching cue (optional) — e.g. pause at the bottom"
                                        value={e.notes ?? ''}
                                        onChange={ev => updateEntry(i, 'notes', ev.target.value)}
                                        style={{ fontSize: '0.8125rem' }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancel</button>
                    <button className="btn btn--primary btn--sm"
                        onClick={handleCreate} disabled={isPending}>
                        {isPending ? 'Saving…' : 'Create template'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TemplatesPage({ onApplyTemplate }) {
    const kc = useAuth();
    const isAdmin = kc.hasRealmRole('admin');

    const { data: templates = [], isLoading } = useTemplates();
    const { mutate: cloneTemplate } = useCloneTemplate();
    const { mutate: deleteTemplate } = useDeleteTemplate();

    const [showCreate, setShowCreate] = useState(false);
    const [filter, setFilter] = useState('ALL');

    const systemTemplates = templates.filter(t => t.isSystem);
    const myTemplates = templates.filter(t => t.isOwn && !t.isSystem);

    const filtered = filter === 'MINE' ? myTemplates
        : filter === 'SYSTEM' ? systemTemplates
            : templates;

    return (
        <section>
            <div className="dashboard__header">
                <div>
                    <h1 className="dashboard__title">Templates</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Save workout structures and load them when logging a session.
                    </p>
                </div>
                <button className="btn btn--primary btn--sm" onClick={() => setShowCreate(true)}>
                    + New template
                </button>
            </div>

            <div className="filter-chips" style={{ marginBottom: '1.5rem' }}>
                {[
                    { key: 'ALL', label: `All (${templates.length})` },
                    { key: 'SYSTEM', label: `System (${systemTemplates.length})` },
                    { key: 'MINE', label: `Mine (${myTemplates.length})` },
                ].map(f => (
                    <button key={f.key}
                        className={`filter-chip ${filter === f.key ? 'filter-chip--active' : ''}`}
                        onClick={() => setFilter(f.key)}>
                        {f.label}
                    </button>
                ))}
            </div>

            {isLoading && <p className="state-label">Loading templates…</p>}

            {!isLoading && filtered.length === 0 && (
                <div className="dashboard__empty">
                    <div className="dashboard__empty-icon">📋</div>
                    <p>No templates yet. Create one or clone a system template.</p>
                </div>
            )}

            {filtered.length > 0 && (
                <div className="ex-grid">
                    {filtered.map(t => (
                        <TemplateCard
                            key={t.id}
                            template={t}
                            isAdmin={isAdmin}
                            onApply={onApplyTemplate}
                            onClone={cloneTemplate}
                            onDelete={deleteTemplate}
                        />
                    ))}
                </div>
            )}

            {showCreate && (
                <CreateTemplateModal
                    isAdmin={isAdmin}
                    onClose={() => setShowCreate(false)}
                />
            )}
        </section>
    );
}