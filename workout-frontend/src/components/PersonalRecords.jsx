import { usePersonalRecords } from '../hooks/useStats';

export default function PersonalRecords() {
  const { data: prs = [], isLoading } = usePersonalRecords();

  if (isLoading) return <p className="state-label">Computing records…</p>;

  if (prs.length === 0)
    return (
      <div className="dashboard__empty">
        <div className="dashboard__empty-icon">🏆</div>
        <p>Log some workouts to see your personal records.</p>
      </div>
    );

  return (
    <div className="pr-grid">
      {prs.map(pr => (
        <article className="pr-card" key={pr.exerciseId}>
          <span className="pr-card__trophy" aria-hidden="true">🏆</span>

          <h3 className="pr-card__name">{pr.exerciseName}</h3>

          <div className="pr-card__lift">
            <span className="pr-card__weight">{pr.weight}</span>
            <span className="pr-card__unit">kg</span>
            <span className="pr-card__sep">×</span>
            <span className="pr-card__reps">{pr.reps}</span>
            <span className="pr-card__unit">reps</span>
          </div>

          <div className="pr-card__1rm">
            <span className="pr-card__1rm-val">{pr.estimatedOneRM}</span>
            <span className="pr-card__1rm-label">kg est. 1RM</span>
          </div>

          <span className="pr-card__date">{pr.date}</span>
        </article>
      ))}
    </div>
  );
}