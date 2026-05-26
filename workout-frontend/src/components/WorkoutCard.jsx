export default function WorkoutCard({ workout, onClick }) {
  const totalSets = workout.entries.reduce(
    (sum, e) => sum + (e.sets?.length ?? 0), 0
  );
  const totalVolume = workout.entries.reduce(
    (sum, e) =>
      e.sets?.reduce((s, set) => s + set.reps * set.weightKg, sum) ?? sum,
    0
  );

  return (
    <article className="workout-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="workout-card__top">
        <div className="workout-card__meta">
          <h2 className="workout-card__name">{workout.name}</h2>
          <span className="workout-card__date">{workout.date}</span>
        </div>
        <div className="workout-card__stats">
          <span className="workout-card__stat">
            <span className="workout-card__stat-val">{totalSets}</span> sets
          </span>
          <span className="workout-card__stat">
            <span className="workout-card__stat-val">
              {totalVolume >= 1000
                ? (totalVolume / 1000).toFixed(1) + 'k'
                : Math.round(totalVolume)}
            </span> kg
          </span>
        </div>
      </div>

      <div className="workout-card__entries">
        {workout.entries.map((entry, i) => (
          <span className="exercise-pill" key={i}>
            {entry.exerciseName}
            <span className="exercise-pill__sets">
              {entry.sets?.length ?? 0}×
            </span>
          </span>
        ))}
      </div>

      <div className="workout-card__cta">
        View details →
      </div>
    </article>
  );
}