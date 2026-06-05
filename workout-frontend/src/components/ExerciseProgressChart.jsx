import { useState, useMemo } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { usePersonalRecords } from '../hooks/useStats';
import { useExerciseProgress } from '../hooks/useStats';
import { useMetricsHistory } from '../hooks/useBodyMetrics';

const METRICS = [
  { key: 'totalVolume', label: 'Total volume (kg)' },
  { key: 'maxWeight', label: 'Max weight (kg)' },
  { key: 'totalSets', label: 'Sets' },
];

function ChartTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__date">{label}</p>
      {payload.map((p, i) => (
        p.value != null && (
          <p key={i} className="chart-tooltip__val" style={{ color: p.color }}>
            {p.value}
            <span className="chart-tooltip__unit">
              {p.dataKey === 'weightKg' ? ' kg body' : metric === 'totalSets' ? ' sets' : ' kg'}
            </span>
          </p>
        )
      ))}
    </div>
  );
}

export default function ExerciseProgressChart() {
  const { data: prs = [] } = usePersonalRecords();
  const { data: bodyHistory = [] } = useMetricsHistory();
  const [exerciseId, setExerciseId] = useState('');
  const [metric, setMetric] = useState('totalVolume');
  const [showBodyWeight, setShowBodyWeight] = useState(false);

  const exercises = prs.map(p => ({ id: p.exerciseId, name: p.exerciseName }));

  const { data: points = [], isLoading } = useExerciseProgress(exerciseId);

  const selectedPr = prs.find(p => p.exerciseId === exerciseId);
  const prValue = metric === 'maxWeight' && selectedPr ? selectedPr.weight : null;

  /*
   * Merge body weight data into the exercise progress points.
   *
   * Analogy: two separate ledgers (exercise log, body weight log) indexed
   * by date. We zip them together by date key so Recharts can plot both
   * series on the same x-axis.
   *
   * Points that have no matching body weight entry get weightKg: null —
   * connectNulls on the line means the line still draws through the gap.
   */
  const mergedData = useMemo(() => {
    if (!showBodyWeight || bodyHistory.length === 0) return points;

    const weightByDate = Object.fromEntries(
      bodyHistory.map(b => [b.date, b.weightKg])
    );

    return points.map(p => ({
      ...p,
      weightKg: weightByDate[p.date] ?? null,
    }));
  }, [points, bodyHistory, showBodyWeight]);

  const hasBodyData = bodyHistory.length > 0;

  return (
    <div className="chart-card">
      <div className="chart-card__controls">
        <div className="field" style={{ flex: 2 }}>
          <label className="field__label">Exercise</label>
          <select
            className="set-row__type input"
            value={exerciseId}
            onChange={e => setExerciseId(e.target.value)}
          >
            <option value="">— pick an exercise —</option>
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        <div className="field" style={{ flex: 1 }}>
          <label className="field__label">Metric</label>
          <select
            className="set-row__type input"
            value={metric}
            onChange={e => setMetric(e.target.value)}
          >
            {METRICS.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Body weight overlay toggle */}
        {hasBodyData && (
          <div className="field" style={{ flexShrink: 0 }}>
            <label className="field__label">Overlay</label>
            <button
              type="button"
              className={`filter-chip ${showBodyWeight ? 'filter-chip--active' : ''}`}
              onClick={() => setShowBodyWeight(p => !p)}
              title="Show body weight on the same chart"
            >
              ⚖ Body weight
            </button>
          </div>
        )}
      </div>

      {!exerciseId && (
        <p className="state-label">Select an exercise to see progress.</p>
      )}

      {exerciseId && isLoading && (
        <p className="state-label">Loading…</p>
      )}

      {exerciseId && !isLoading && points.length < 2 && (
        <p className="state-label">
          Need at least 2 sessions logged to draw a trend.
        </p>
      )}

      {exerciseId && !isLoading && points.length >= 2 && (
        <>
          {showBodyWeight && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Solid line = exercise metric (left axis) · Dashed blue = body weight in kg (right axis)
            </p>
          )}

          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={mergedData} margin={{ top: 8, right: showBodyWeight ? 40 : 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#242424" strokeDasharray="4 4" vertical={false} />

              <XAxis
                dataKey="date"
                tick={{ fill: '#8a8a8a', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#242424' }}
                tickFormatter={d => d.slice(5)}
              />

              {/* Left axis — exercise metric */}
              <YAxis
                yAxisId="left"
                tick={{ fill: '#8a8a8a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />

              {/* Right axis — body weight — only rendered when overlay is on */}
              {showBodyWeight && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#8a8a8a', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  unit=" kg"
                  domain={['auto', 'auto']}
                />
              )}

              <Tooltip
                content={<ChartTooltip metric={metric} />}
                cursor={{ stroke: '#383838', strokeWidth: 1 }}
              />

              {showBodyWeight && (
                <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} />
              )}

              {prValue && (
                <ReferenceLine
                  yAxisId="left"
                  y={prValue}
                  stroke="#c8ff3c"
                  strokeDasharray="6 3"
                  label={{
                    value: `PR ${prValue} kg`,
                    fill: '#c8ff3c',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
              )}

              {/* Exercise metric line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey={metric}
                name="Exercise"
                stroke="#c8ff3c"
                strokeWidth={2}
                dot={{ fill: '#c8ff3c', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#c8ff3c' }}
              />

              {/* Body weight overlay line — dashed blue on its own axis */}
              {showBodyWeight && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="weightKg"
                  name="Body weight"
                  stroke="#78b4ff"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ fill: '#78b4ff', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#78b4ff' }}
                  connectNulls
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}