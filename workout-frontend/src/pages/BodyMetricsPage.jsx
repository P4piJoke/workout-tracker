import { useState } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  useMetricsHistory,
  useMetricsSummary,
  useLogMetric,
  useDeleteMetric,
} from '../hooks/useBodyMetrics';
import DatePicker from '../components/DatePicker';
import Stepper from '../components/Stepper';

// ── Custom dual-axis tooltip ──────────────────────────────────────────────────
function MetricsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__date">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="chart-tooltip__val" style={{ color: p.color }}>
          {p.value != null ? p.value : '—'}
          <span className="chart-tooltip__unit"> {p.name}</span>
        </p>
      ))}
    </div>
  );
}

function MetricStat({ label, value, unit, accent, positive, negative }) {
  const valueColor = positive ? 'var(--accent)'
    : negative ? 'var(--danger)'
      : 'var(--text-primary)';
  return (
    <div className={`stat-card ${accent ? 'stat-card--accent' : ''}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value" style={{ color: valueColor }}>
        {value ?? '—'}
      </span>
      <span className="stat-card__unit">{unit}</span>
    </div>
  );
}

/**
 * Compute a Y-axis domain with padding so the line doesn't hug the top/bottom.
 * Without explicit domain, recharts auto-scale can collapse the axis when the
 * value range is narrow (e.g. 79–81 kg), making the axis label invisible.
 */
function yDomain(data, key, padPct = 0.05) {
  const vals = data.map(d => d[key]).filter(v => v != null);
  if (vals.length === 0) return ['auto', 'auto'];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = Math.max((max - min) * padPct, 1); // at least 1 unit padding
  return [Math.floor(min - pad), Math.ceil(max + pad)];
}

export default function BodyMetricsPage() {
  const { data: history = [], isLoading: histLoading } = useMetricsHistory();
  const { data: summary } = useMetricsSummary();
  const { mutate: logMetric, isPending } = useLogMetric();
  const { mutate: deleteMetric } = useDeleteMetric();

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: 80,
    bodyFatPct: null,
    notes: '',
  });
  const [showFat, setShowFat] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSubmit = () => {
    if (!form.date || !form.weightKg) {
      setError('Date and weight are required.');
      return;
    }
    setError('');
    logMetric(
      { ...form, bodyFatPct: showFat ? form.bodyFatPct : null },
      { onSuccess: () => setShowForm(false) }
    );
  };

  const chartData = history.map(p => ({
    date: p.date.slice(5),
    fullDate: p.date,
    weightKg: p.weightKg,
    bodyFatPct: p.bodyFatPct,
  }));

  const hasBodyFat = history.some(p => p.bodyFatPct != null);

  const weightDomain = yDomain(chartData, 'weightKg');
  const fatDomain = yDomain(chartData, 'bodyFatPct');

  const delta = summary?.weightChangeLast30Days;
  const deltaLabel = delta != null
    ? `${delta > 0 ? '+' : ''}${delta} kg`
    : '—';

  const recent = [...history].reverse().slice(0, 10);

  return (
    <section>
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Body Metrics</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Track weight and body fat — overlaid on strength progress.
          </p>
        </div>
        <button
          className="btn btn--primary btn--sm"
          onClick={() => setShowForm(p => !p)}
        >
          {showForm ? 'Cancel' : '+ Log today'}
        </button>
      </div>

      {showForm && (
        <div className="chart-card" style={{ marginBottom: '2rem' }}>
          {error && <div className="form-error">{error}</div>}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="field">
              <label className="field__label">Date</label>
              <DatePicker value={form.date} onChange={v => set('date', v)} />
            </div>
            <div className="field">
              <label className="field__label">Body weight</label>
              <Stepper
                value={form.weightKg}
                min={20} max={300} step={0.1} unit="kg"
                onChange={v => set('weightKg', Math.round(v * 10) / 10)}
              />
            </div>
            <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="field__label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Body fat
                <button
                  type="button"
                  style={{
                    background: 'none', border: 'none',
                    color: showFat ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '0.75rem', cursor: 'pointer',
                  }}
                  onClick={() => setShowFat(p => !p)}
                >
                  {showFat ? '✓ on' : '+ add'}
                </button>
              </label>
              {showFat && (
                <Stepper
                  value={form.bodyFatPct ?? 20}
                  min={3} max={60} step={0.1} unit="%"
                  onChange={v => set('bodyFatPct', Math.round(v * 10) / 10)}
                />
              )}
            </div>
            <div className="field" style={{ flex: 1, minWidth: 160 }}>
              <label className="field__label">Notes (optional)</label>
              <input
                className="input"
                placeholder="e.g. after training, fasted"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>
            <button className="btn btn--primary btn--sm" onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving…' : 'Save entry'}
            </button>
          </div>
        </div>
      )}

      {summary && (
        <div className="stats-bar" style={{ marginBottom: '2rem' }}>
          <MetricStat label="Current weight"
            value={summary.latestWeight != null ? `${summary.latestWeight}` : null}
            unit="kg" accent />
          {summary.latestBodyFat != null && (
            <MetricStat label="Body fat" value={`${summary.latestBodyFat}`} unit="%" />
          )}
          <MetricStat label="30-day change" value={deltaLabel} unit="body weight"
            positive={delta != null && delta < 0}
            negative={delta != null && delta > 0} />
          <MetricStat label="Entries logged" value={summary.totalEntries} unit="measurements" />
        </div>
      )}

      <div className="stats-section">
        <div className="stats-section__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 className="stats-section__title">Weight over time</h2>
            <p className="stats-section__sub">
              Dual axis — weight (left) and body fat % (right) on the same timeline.
            </p>
          </div>
        </div>

        <div className="chart-card">
          {histLoading && <p className="state-label">Loading…</p>}

          {!histLoading && chartData.length < 2 && (
            <p className="state-label">Log at least 2 entries to see a trend.</p>
          )}

          {chartData.length >= 2 && (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={chartData}
                margin={{ top: 8, right: hasBodyFat ? 48 : 16, bottom: 0, left: 0 }}
              >
                <CartesianGrid stroke="#242424" strokeDasharray="4 4" vertical={false} />

                <XAxis
                  dataKey="date"
                  tick={{ fill: '#8a8a8a', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#242424' }}
                />

                {/* ── Left Y-axis — body weight ─────────────────────────────
                    FIX: explicit domain + width so the axis never collapses.
                    Recharts' 'auto' domain works poorly for narrow value ranges
                    (e.g. all readings between 79–81 kg) — the rendered ticks
                    overlap or disappear. We compute a padded domain instead.
                ─────────────────────────────────────────────────────────── */}
                <YAxis
                  yAxisId="left"
                  domain={weightDomain}
                  tick={{ fill: '#8a8a8a', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={v => `${v}`}
                  label={{
                    value: 'kg',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    style: { fill: '#555', fontSize: 10 },
                  }}
                />

                {hasBodyFat && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={fatDomain}
                    tick={{ fill: '#8a8a8a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    unit="%"
                  />
                )}

                <Tooltip
                  content={<MetricsTooltip />}
                  cursor={{ stroke: '#383838' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weightKg"
                  name="kg"
                  stroke="#c8ff3c"
                  strokeWidth={2}
                  dot={{ fill: '#c8ff3c', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />

                {hasBodyFat && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bodyFatPct"
                    name="%"
                    stroke="#78b4ff"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={{ fill: '#78b4ff', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="stats-section">
          <h2 className="stats-section__title">Recent entries</h2>
          <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="modal__set-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Body fat</th>
                  <th>Notes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recent.map(p => (
                  <tr key={p.date}>
                    <td className="mono">{p.date}</td>
                    <td className="mono">{p.weightKg != null ? `${p.weightKg} kg` : '—'}</td>
                    <td className="mono muted">{p.bodyFatPct != null ? `${p.bodyFatPct}%` : '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</td>
                    <td>
                      <button
                        className="ex-card__delete"
                        onClick={() => {
                          if (window.confirm(`Delete entry for ${p.date}?`))
                            deleteMetric(p.date);
                        }}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}