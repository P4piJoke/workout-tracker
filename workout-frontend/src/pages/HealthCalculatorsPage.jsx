import { useState, useMemo, useEffect } from 'react';
import { usePreferences, useUpdatePreferences } from '../hooks/usePreferences';
import { useMetricsSummary } from '../hooks/useBodyMetrics';
import { useMacroGoal, useSaveMacroGoal } from '../hooks/useMacroGoal';
import Stepper from '../components/Stepper';

// ── Activity multipliers (Mifflin-St Jeor TDEE) ──────────────────────────────
const ACTIVITY = {
    SEDENTARY: { label: 'Sedentary', sub: 'Desk job, no exercise', factor: 1.2 },
    LIGHT: { label: 'Lightly active', sub: '1–3 workouts/week', factor: 1.375 },
    MODERATE: { label: 'Moderately active', sub: '3–5 workouts/week', factor: 1.55 },
    ACTIVE: { label: 'Very active', sub: '6–7 hard workouts/week', factor: 1.725 },
    VERY_ACTIVE: { label: 'Extra active', sub: 'Physical job + daily training', factor: 1.9 },
};

// ── Fitness goal calorie adjustments ─────────────────────────────────────────
const GOAL_CONFIG = {
    CUT: { label: 'Cut', sub: 'Lose fat', delta: -300, color: '#78b4ff', proteinPct: 0.35, carbPct: 0.35, fatPct: 0.30 },
    MAINTAIN: { label: 'Maintain', sub: 'Body recomposition', delta: 0, color: '#c8ff3c', proteinPct: 0.30, carbPct: 0.40, fatPct: 0.30 },
    BULK: { label: 'Bulk', sub: 'Build muscle', delta: +300, color: '#ff8c3c', proteinPct: 0.30, carbPct: 0.45, fatPct: 0.25 },
};

// ── Calculation helpers ───────────────────────────────────────────────────────
function calcBMR(weightKg, heightCm, age, sex) {
    // Mifflin-St Jeor
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return sex === 'MALE' ? base + 5 : base - 161;
}

function calcNavyBF(sex, waistCm, neckCm, hipCm, heightCm) {
    if (!waistCm || !neckCm || !heightCm) return null;
    if (sex === 'MALE') {
        const bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
        return Math.max(0, Math.round(bf * 10) / 10);
    } else {
        if (!hipCm) return null;
        const bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
        return Math.max(0, Math.round(bf * 10) / 10);
    }
}

function calcBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm) return null;
    return Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;
}

function bmiCategory(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', color: '#78b4ff' };
    if (bmi < 25) return { label: 'Normal', color: '#c8ff3c' };
    if (bmi < 30) return { label: 'Overweight', color: '#ff8c3c' };
    return { label: 'Obese', color: '#ff4d4d' };
}

function bfCategory(bf, sex) {
    if (sex === 'MALE') {
        if (bf < 6) return { label: 'Essential fat', color: '#78b4ff' };
        if (bf < 14) return { label: 'Athletic', color: '#c8ff3c' };
        if (bf < 18) return { label: 'Fitness', color: '#c8ff3c' };
        if (bf < 25) return { label: 'Average', color: '#ff8c3c' };
        return { label: 'Obese', color: '#ff4d4d' };
    } else {
        if (bf < 14) return { label: 'Essential fat', color: '#78b4ff' };
        if (bf < 21) return { label: 'Athletic', color: '#c8ff3c' };
        if (bf < 25) return { label: 'Fitness', color: '#c8ff3c' };
        if (bf < 32) return { label: 'Average', color: '#ff8c3c' };
        return { label: 'Obese', color: '#ff4d4d' };
    }
}

// ── Small reusable components ─────────────────────────────────────────────────
function SectionHeader({ title, sub }) {
    return (
        <div className="stats-section__header">
            <h2 className="stats-section__title">{title}</h2>
            {sub && <p className="stats-section__sub">{sub}</p>}
        </div>
    );
}

function ResultCard({ label, value, unit, color, sub }) {
    return (
        <div className="calc-result-card">
            <span className="calc-result-card__label">{label}</span>
            <span className="calc-result-card__value" style={{ color: color ?? 'var(--text-primary)' }}>
                {value ?? '—'}
            </span>
            {unit && <span className="calc-result-card__unit">{unit}</span>}
            {sub && <span className="calc-result-card__sub">{sub}</span>}
        </div>
    );
}

function MacroBar({ label, grams, kcal, total, color }) {
    const pct = total > 0 ? Math.round((kcal / total) * 100) : 0;
    return (
        <div className="macro-bar">
            <div className="macro-bar__header">
                <span className="macro-bar__label">{label}</span>
                <span className="macro-bar__grams" style={{ color }}>{grams}g</span>
                <span className="macro-bar__kcal">{kcal} kcal</span>
                <span className="macro-bar__pct">{pct}%</span>
            </div>
            <div className="macro-bar__track">
                <div className="macro-bar__fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HealthCalculatorsPage() {
    const { data: prefs } = usePreferences();
    const { data: summary } = useMetricsSummary();
    const { data: savedGoal } = useMacroGoal();
    const { mutate: updatePrefs } = useUpdatePreferences();
    const { mutate: saveGoal, isPending: isSaving } = useSaveMacroGoal();

    // ── Shared body inputs (pre-filled from prefs / latest weight) ────────────
    const [age, setAge] = useState(25);
    const [heightCm, setHeightCm] = useState(170);
    const [weightKg, setWeightKg] = useState(75);
    const [sex, setSex] = useState('MALE');
    const [activityLevel, setActivity] = useState('MODERATE');

    // ── Navy BF% inputs ───────────────────────────────────────────────────────
    const [waistCm, setWaist] = useState(85);
    const [neckCm, setNeck] = useState(38);
    const [hipCm, setHip] = useState(95);   // females only

    // ── Goal selection ─────────────────────────────────────────────────────────
    const [fitnessGoal, setFitnessGoal] = useState('MAINTAIN');

    // ── Populate from prefs + summary on load ─────────────────────────────────
    useEffect(() => {
        if (prefs?.heightCm) setHeightCm(prefs.heightCm);
        if (prefs?.sex) setSex(prefs.sex);
        if (prefs?.activityLevel) setActivity(prefs.activityLevel);
    }, [prefs]);

    useEffect(() => {
        if (summary?.latestWeight) setWeightKg(summary.latestWeight);
    }, [summary]);

    useEffect(() => {
        if (savedGoal?.fitnessGoal) setFitnessGoal(savedGoal.fitnessGoal);
    }, [savedGoal]);

    // ── Calculations ──────────────────────────────────────────────────────────
    const bmi = useMemo(() => calcBMI(weightKg, heightCm), [weightKg, heightCm]);
    const bmiCat = bmi ? bmiCategory(bmi) : null;

    const navyBF = useMemo(
        () => calcNavyBF(sex, waistCm, neckCm, hipCm, heightCm),
        [sex, waistCm, neckCm, hipCm, heightCm]
    );
    const bfCat = navyBF ? bfCategory(navyBF, sex) : null;

    const bmr = useMemo(() => calcBMR(weightKg, heightCm, age, sex), [weightKg, heightCm, age, sex]);
    const tdee = useMemo(() => Math.round(bmr * (ACTIVITY[activityLevel]?.factor ?? 1.55)), [bmr, activityLevel]);

    const goalCfg = GOAL_CONFIG[fitnessGoal];
    const targetCalories = Math.max(1200, tdee + goalCfg.delta);

    const proteinG = Math.round((targetCalories * goalCfg.proteinPct) / 4);
    const carbsG = Math.round((targetCalories * goalCfg.carbPct) / 4);
    const fatG = Math.round((targetCalories * goalCfg.fatPct) / 9);

    const proteinKcal = proteinG * 4;
    const carbsKcal = carbsG * 4;
    const fatKcal = fatG * 9;

    // ── Save handlers ─────────────────────────────────────────────────────────
    const handleSaveBodyToPrefs = () => {
        if (!prefs) return;
        updatePrefs({
            targetRepsMin: prefs.targetRepsMin,
            targetRepsMax: prefs.targetRepsMax,
            defaultSets: prefs.defaultSets,
            heightCm,
            sex,
            activityLevel,
        });
    };

    const handleSaveMacros = () => {
        saveGoal({
            targetCalories,
            targetProteinG: proteinG,
            targetCarbsG: carbsG,
            targetFatG: fatG,
            fitnessGoal,
            tdee,
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <section>
            {/* ── Page header ──────────────────────────────────────────────── */}
            <div className="dashboard__header">
                <div>
                    <h1 className="dashboard__title">Health Calculators</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        BMI · Navy body fat · TDEE · Macro targets — all in one place.
                    </p>
                </div>
            </div>

            {/* ── Section 1: Shared body inputs ────────────────────────────── */}
            <div className="stats-section">
                <SectionHeader
                    title="Your measurements"
                    sub="Pre-filled from preferences and latest logged weight. Changes here are not auto-saved — use the button below."
                />
                <div className="calc-card">
                    <div className="calc-inputs-grid">
                        {/* Sex */}
                        <div className="field">
                            <label className="field__label">Sex</label>
                            <div className="calc-toggle-group">
                                {['MALE', 'FEMALE'].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        className={`calc-toggle ${sex === s ? 'calc-toggle--active' : ''}`}
                                        onClick={() => setSex(s)}
                                    >
                                        {s === 'MALE' ? '♂ Male' : '♀ Female'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Age */}
                        <div className="field">
                            <label className="field__label">Age</label>
                            <Stepper value={age} min={10} max={100} unit="yrs" onChange={setAge} />
                        </div>

                        {/* Height */}
                        <div className="field">
                            <label className="field__label">Height</label>
                            <Stepper value={heightCm} min={100} max={250} unit="cm" onChange={setHeightCm} />
                        </div>

                        {/* Weight */}
                        <div className="field">
                            <label className="field__label">Weight <span style={{ color: 'var(--accent)', fontSize: '0.65rem' }}>↑ from logs</span></label>
                            <Stepper value={weightKg} min={20} max={300} step={0.1} unit="kg" onChange={v => setWeightKg(Math.round(v * 10) / 10)} />
                        </div>

                        {/* Activity */}
                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label className="field__label">Activity level</label>
                            <div className="calc-activity-grid">
                                {Object.entries(ACTIVITY).map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`calc-activity-btn ${activityLevel === key ? 'calc-activity-btn--active' : ''}`}
                                        onClick={() => setActivity(key)}
                                    >
                                        <span className="calc-activity-btn__label">{cfg.label}</span>
                                        <span className="calc-activity-btn__sub">{cfg.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn--ghost btn--sm" onClick={handleSaveBodyToPrefs}>
                            Save height / sex / activity to profile
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Section 2: BMI ───────────────────────────────────────────── */}
            <div className="stats-section">
                <SectionHeader
                    title="BMI"
                    sub="Body Mass Index — a rough population-level screen. Not accurate for athletic builds."
                />
                <div className="calc-results-bar">
                    <ResultCard
                        label="BMI"
                        value={bmi}
                        color={bmiCat?.color}
                        sub={bmiCat?.label}
                    />
                    <ResultCard label="Healthy range" value="18.5 – 24.9" color="var(--text-secondary)" />
                    <div className="calc-result-card calc-result-card--chart">
                        <span className="calc-result-card__label">Scale</span>
                        <div className="bmi-scale">
                            {[
                                { label: 'Under', end: 18.5, color: '#78b4ff' },
                                { label: 'Normal', end: 25, color: '#c8ff3c' },
                                { label: 'Over', end: 30, color: '#ff8c3c' },
                                { label: 'Obese', end: 40, color: '#ff4d4d' },
                            ].map(seg => (
                                <div key={seg.label} className="bmi-scale__seg" style={{ background: seg.color }}>
                                    <span>{seg.label}</span>
                                </div>
                            ))}
                            {bmi && (
                                <div
                                    className="bmi-scale__marker"
                                    style={{ left: `${Math.min(98, Math.max(1, ((bmi - 15) / 25) * 100))}%` }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 3: Navy Body Fat ─────────────────────────────────── */}
            <div className="stats-section">
                <SectionHeader
                    title="Navy body fat estimate"
                    sub="US Navy circumference method. Measure at the widest point, relaxed, in cm."
                />
                <div className="calc-card">
                    <div className="calc-inputs-grid">
                        <div className="field">
                            <label className="field__label">Waist (at navel)</label>
                            <Stepper value={waistCm} min={40} max={200} step={0.5} unit="cm" onChange={setWaist} />
                        </div>
                        <div className="field">
                            <label className="field__label">Neck (below larynx)</label>
                            <Stepper value={neckCm} min={20} max={80} step={0.5} unit="cm" onChange={setNeck} />
                        </div>
                        {sex === 'FEMALE' && (
                            <div className="field">
                                <label className="field__label">Hips (widest)</label>
                                <Stepper value={hipCm} min={50} max={180} step={0.5} unit="cm" onChange={setHip} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="calc-results-bar" style={{ marginTop: '1rem' }}>
                    <ResultCard
                        label="Body fat"
                        value={navyBF != null ? `${navyBF}%` : null}
                        color={bfCat?.color}
                        sub={bfCat?.label ?? (navyBF == null ? 'Fill measurements' : '')}
                    />
                    {navyBF != null && (
                        <ResultCard
                            label="Lean mass"
                            value={`${Math.round(weightKg * (1 - navyBF / 100) * 10) / 10} kg`}
                            color="var(--text-primary)"
                        />
                    )}
                    {navyBF != null && (
                        <ResultCard
                            label="Fat mass"
                            value={`${Math.round(weightKg * (navyBF / 100) * 10) / 10} kg`}
                            color="var(--text-secondary)"
                        />
                    )}
                </div>
            </div>

            {/* ── Section 4: TDEE + Macros ─────────────────────────────────── */}
            <div className="stats-section">
                <SectionHeader
                    title="TDEE & macro targets"
                    sub="Mifflin-St Jeor BMR × activity factor. Macros split by fitness goal."
                />

                {/* TDEE results */}
                <div className="calc-results-bar" style={{ marginBottom: '1.5rem' }}>
                    <ResultCard label="BMR" value={Math.round(bmr)} unit="kcal/day" color="var(--text-secondary)" sub="At complete rest" />
                    <ResultCard label="TDEE" value={tdee} unit="kcal/day" color="var(--accent)" sub="With your activity" />
                </div>

                {/* Goal selector */}
                <div className="calc-card" style={{ marginBottom: '1.5rem' }}>
                    <label className="field__label" style={{ display: 'block', marginBottom: '0.75rem' }}>Fitness goal</label>
                    <div className="calc-goal-grid">
                        {Object.entries(GOAL_CONFIG).map(([key, cfg]) => (
                            <button
                                key={key}
                                type="button"
                                className={`calc-goal-btn ${fitnessGoal === key ? 'calc-goal-btn--active' : ''}`}
                                style={{ '--goal-color': cfg.color }}
                                onClick={() => setFitnessGoal(key)}
                            >
                                <span className="calc-goal-btn__label">{cfg.label}</span>
                                <span className="calc-goal-btn__sub">{cfg.sub}</span>
                                <span className="calc-goal-btn__delta">
                                    {cfg.delta === 0 ? 'TDEE' : `TDEE ${cfg.delta > 0 ? '+' : ''}${cfg.delta} kcal`}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Macro breakdown */}
                <div className="calc-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                                {targetCalories}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>kcal / day</span>
                        </div>
                        <span
                            className="ex-card__type"
                            style={{ background: `rgba(from ${goalCfg.color} r g b / 0.12)`, color: goalCfg.color, border: 'none' }}
                        >
                            {goalCfg.label}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <MacroBar label="Protein" grams={proteinG} kcal={proteinKcal} total={targetCalories} color="#c8ff3c" />
                        <MacroBar label="Carbs" grams={carbsG} kcal={carbsKcal} total={targetCalories} color="#78b4ff" />
                        <MacroBar label="Fat" grams={fatG} kcal={fatKcal} total={targetCalories} color="#ff8c3c" />
                    </div>

                    {/* Saved goal banner */}
                    {savedGoal && (
                        <div className="calc-saved-goal">
                            <span>Saved: <strong>{savedGoal.targetCalories} kcal</strong> · P {savedGoal.targetProteinG}g · C {savedGoal.targetCarbsG}g · F {savedGoal.targetFatG}g</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {savedGoal.fitnessGoal} · saved {new Date(savedGoal.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                            className="btn btn--primary btn--sm"
                            onClick={handleSaveMacros}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving…' : 'Save macro targets'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}