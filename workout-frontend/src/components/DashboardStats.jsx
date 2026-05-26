import { useMemo } from 'react';

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n));
}

export default function DashboardStats({ workouts }) {
  const stats = useMemo(() => {
    if (!workouts.length) return null;

    const totalSets = workouts.reduce(
      (sum, w) => sum + w.entries.reduce((s, e) => s + (e.sets?.length ?? 0), 0),
      0
    );

    const totalVolume = workouts.reduce(
      (sum, w) =>
        w.entries.reduce(
          (s, e) =>
            e.sets?.reduce((ss, set) => ss + set.reps * set.weightKg, s) ?? s,
          sum
        ),
      0
    );

    const exerciseCounts = {};
    workouts.forEach(w =>
      w.entries.forEach(e => {
        exerciseCounts[e.exerciseName] =
          (exerciseCounts[e.exerciseName] ?? 0) + 1;
      })
    );
    const topExercise =
      Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo).length;

    const streak = (() => {
      const days = new Set(workouts.map(w => w.date));
      let count = 0;
      const d = new Date();
      while (true) {
        const key = d.toISOString().split('T')[0];
        if (!days.has(key)) break;
        count++;
        d.setDate(d.getDate() - 1);
      }
      return count;
    })();

    return { totalSets, totalVolume, topExercise, thisWeek, streak };
  }, [workouts]);

  if (!stats) return null;

  return (
    <div className="stats-bar">
      <StatCard label="This week" value={stats.thisWeek} unit="sessions" accent />
      <StatCard label="Total sets" value={fmt(stats.totalSets)} unit="sets" />
      <StatCard
        label="Total volume"
        value={fmt(stats.totalVolume)}
        unit="kg lifted"
      />
      <StatCard label="Top exercise" value={stats.topExercise} unit="most logged" />
      {stats.streak > 0 && (
        <StatCard label="Streak" value={stats.streak} unit="days" />
      )}
    </div>
  );
}

function StatCard({ label, value, unit, accent }) {
  return (
    <div className={`stat-card ${accent ? 'stat-card--accent' : ''}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__unit">{unit}</span>
    </div>
  );
}