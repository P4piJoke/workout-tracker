import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { useMuscleBalance } from '../hooks/useStats';

// All possible muscle groups — ensures the radar always has the same shape
const ALL_MUSCLES = [
  'CHEST','BACK','SHOULDERS','BICEPS','TRICEPS',
  'LEGS','GLUTES','CORE','CALVES','FOREARMS',
];

function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__date">{payload[0].payload.muscle}</p>
      <p className="chart-tooltip__val">
        {payload[0].value}
        <span className="chart-tooltip__unit"> sets</span>
      </p>
    </div>
  );
}

export default function MuscleRadarChart() {
  const { data: balance = [], isLoading } = useMuscleBalance();

  if (isLoading) return <p className="state-label">Loading…</p>;

  if (balance.length === 0)
    return (
      <div className="dashboard__empty">
        <p>Log workouts to see your muscle balance.</p>
      </div>
    );

  // Build a complete dataset — muscles with no sets show 0
  const setsByMuscle = Object.fromEntries(balance.map(b => [b.muscle, b.sets]));
  const data = ALL_MUSCLES.map(m => ({
    muscle: m,
    sets:   setsByMuscle[m] ?? 0,
  })).filter(d => d.sets > 0 ||
    balance.some(b => ALL_MUSCLES.includes(b.muscle)));  // keep all if any logged

  // Most trained muscle — for the "gap" callout
  const top    = balance[0];
  const bottom = [...balance].sort((a, b) => a.sets - b.sets)[0];

  return (
    <div className="chart-card">
      <div className="radar-layout">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid stroke="#242424" />

            <PolarAngleAxis
              dataKey="muscle"
              tick={{ fill: '#8a8a8a', fontSize: 10 }}
              tickLine={false}
            />

            <PolarRadiusAxis
              angle={90}
              tick={{ fill: '#555', fontSize: 9 }}
              tickLine={false}
              axisLine={false}
            />

            <Radar
              dataKey="sets"
              stroke="#c8ff3c"
              fill="#c8ff3c"
              fillOpacity={0.12}
              strokeWidth={1.5}
            />

            <Tooltip content={<RadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>

        {/* Insight callout */}
        <div className="radar-insights">
          {top && (
            <div className="radar-insight radar-insight--top">
              <span className="radar-insight__label">Most trained</span>
              <span className="radar-insight__muscle">{top.muscle}</span>
              <span className="radar-insight__sets">{top.sets} sets</span>
            </div>
          )}
          {bottom && bottom.muscle !== top?.muscle && (
            <div className="radar-insight radar-insight--bottom">
              <span className="radar-insight__label">Least trained</span>
              <span className="radar-insight__muscle">{bottom.muscle}</span>
              <span className="radar-insight__sets">{bottom.sets} sets</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}