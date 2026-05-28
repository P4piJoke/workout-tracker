import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { usePersonalRecords }  from '../hooks/useStats';
import { useExerciseProgress } from '../hooks/useStats';

const METRICS = [
  { key: 'totalVolume', label: 'Total volume (kg)' },
  { key: 'maxWeight',   label: 'Max weight (kg)'   },
  { key: 'totalSets',   label: 'Sets'               },
];

// Custom dark-theme tooltip
function ChartTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__date">{label}</p>
      <p className="chart-tooltip__val">
        {payload[0].value}
        <span className="chart-tooltip__unit">
          {metric === 'totalSets' ? ' sets' : ' kg'}
        </span>
      </p>
    </div>
  );
}

export default function ExerciseProgressChart() {
  const { data: prs = [] }           = usePersonalRecords();
  const [exerciseId, setExerciseId]  = useState('');
  const [metric, setMetric]          = useState('totalVolume');

  // derive exercise list from PRs — user has only logged these
  const exercises = prs.map(p => ({ id: p.exerciseId, name: p.exerciseName }));

  const { data: points = [], isLoading } = useExerciseProgress(exerciseId);

  // find PR value for reference line
  const selectedPr = prs.find(p => p.exerciseId === exerciseId);
  const prValue = metric === 'maxWeight' && selectedPr
    ? selectedPr.weight : null;

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
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#242424" strokeDasharray="4 4" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: '#8a8a8a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#242424' }}
              tickFormatter={d => d.slice(5)}   // show MM-DD
            />

            <YAxis
              tick={{ fill: '#8a8a8a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />

            <Tooltip
              content={<ChartTooltip metric={metric} />}
              cursor={{ stroke: '#383838', strokeWidth: 1 }}
            />

            {/* PR reference line on max-weight metric */}
            {prValue && (
              <ReferenceLine
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

            <Line
              type="monotone"
              dataKey={metric}
              stroke="#c8ff3c"
              strokeWidth={2}
              dot={{ fill: '#c8ff3c', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#c8ff3c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}