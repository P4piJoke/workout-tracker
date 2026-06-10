import { useMemo, useState } from 'react';
import { useMyWorkouts } from '../hooks/useWorkouts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function volumeOf(workout) {
  return workout.entries.reduce((sum, e) =>
    sum + (e.sets?.reduce((s, set) => s + set.reps * set.weightKg, 0) ?? 0), 0);
}

function intensityLevel(volume, max) {
  if (volume === 0 || max === 0) return 0;
  const pct = volume / max;
  if (pct < 0.25) return 1;
  if (pct < 0.50) return 2;
  if (pct < 0.75) return 3;
  return 4;
}

export default function WorkoutHeatmap() {
  const { data: workouts = [] } = useMyWorkouts();
  const [tooltip, setTooltip] = useState(null);

  const { weeks, monthLabels, maxVol } = useMemo(() => {
    // Build a map of date → volume
    const volByDate = {};
    for (const w of workouts) {
      const v = volumeOf(w);
      volByDate[w.date] = (volByDate[w.date] ?? 0) + v;
    }
    const max = Math.max(...Object.values(volByDate), 0);

    // Build 52-week grid ending today
    const today = new Date();
    // align to last Sunday
    const end = new Date(today);
    end.setDate(end.getDate() - end.getDay());   // last Sunday

    const start = new Date(end);
    start.setDate(start.getDate() - 52 * 7 + 1);

    const weeks = [];
    let current = new Date(start);

    const seenMonths = new Set();
    const monthLabels = [];   // { weekIndex, month }

    for (let w = 0; w < 53; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split('T')[0];
        const vol = volByDate[dateStr] ?? 0;

        if (d === 0) {
          const m = current.getMonth();
          if (!seenMonths.has(m)) {
            seenMonths.add(m);
            monthLabels.push({ weekIndex: w, label: MONTHS[m] });
          }
        }

        week.push({
          date: dateStr,
          vol,
          level: intensityLevel(vol, max),
          future: current > today,
        });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return { weeks, monthLabels, maxVol: max };
  }, [workouts]);

  const totalSessions = workouts.length;
  const activeDays = weeks.flat().filter(d => d.vol > 0).length;

  return (
    <div className="heatmap-card">
      <div className="heatmap-meta">
        <span className="heatmap-stat">
          <strong>{totalSessions}</strong> sessions
        </span>
        <span className="heatmap-stat">
          <strong>{activeDays}</strong> active days this year
        </span>
      </div>

      <div className="heatmap-scroll">
        <div className="heatmap-wrap">
          {/* Month labels */}
          <div className="heatmap-months">
            <div style={{ width: 28 }} />   {/* day-label offset */}
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="heatmap-month-label"
                style={{ gridColumnStart: m.weekIndex + 1 }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 0 }}>
            {/* Day labels */}
            <div className="heatmap-days">
              {DAYS.map((d, i) => (
                <span key={d} className="heatmap-day-label"
                  style={{ visibility: i % 2 === 0 ? 'visible' : 'hidden' }}>
                  {d}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="heatmap-grid">
              {weeks.map((week, wi) => (
                <div key={wi} className="heatmap-week">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={`heatmap-cell heatmap-cell--${day.future ? 'future' : day.level}`}
                      onMouseEnter={e => setTooltip({
                        x: e.clientX, y: e.clientY,
                        date: day.date,
                        vol: day.vol,
                      })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="heatmap-legend">
            <span className="heatmap-legend-label">Less</span>
            {[0, 1, 2, 3, 4].map(l => (
              <div key={l} className={`heatmap-cell heatmap-cell--${l}`} />
            ))}
            <span className="heatmap-legend-label">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="heatmap-tooltip"
          style={{ left: Math.min(tooltip.x + 12, window.innerWidth - 200), top: tooltip.y - 36 }}>
          <strong>{tooltip.date}</strong>
          {tooltip.vol > 0
            ? <> — {Math.round(tooltip.vol).toLocaleString()} kg volume</>
            : ' — rest day'}
        </div>
      )}
    </div>
  );
}