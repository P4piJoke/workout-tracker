import { useState } from 'react';
import { useMyWorkouts, useDeleteWorkout } from '../hooks/useWorkouts';
import WorkoutCard         from '../components/WorkoutCard';
import WorkoutDetailModal  from '../components/WorkoutDetailModal';
import DashboardStats      from '../components/DashboardStats';

export default function DashboardPage() {
  const { data: workouts = [], isLoading } = useMyWorkouts();
  const { mutate: deleteWorkout }          = useDeleteWorkout();
  const [selected, setSelected]            = useState(null);

  return (
    <section>
      <div className="dashboard__header">
        <h1 className="dashboard__title">My Workouts</h1>
        {!isLoading && (
          <span className="dashboard__count">
            {workouts.length} session{workouts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <DashboardStats workouts={workouts} />

      {isLoading && <p className="state-label">Loading sessions…</p>}

      {!isLoading && workouts.length === 0 && (
        <div className="dashboard__empty">
          <div className="dashboard__empty-icon">🏋️</div>
          <p>No sessions logged yet.</p>
          <p>Head to <strong>Log Workout</strong> to start tracking.</p>
        </div>
      )}

      {workouts.length > 0 && (
        <div className="workout-list">
          {workouts.map(w => (
            <WorkoutCard
              key={w.id}
              workout={w}
              onClick={() => setSelected(w)}
            />
          ))}
        </div>
      )}

      {selected && (
        <WorkoutDetailModal
          workout={selected}
          onClose={() => setSelected(null)}
          onDelete={(id) => { deleteWorkout(id); setSelected(null); }}
        />
      )}
    </section>
  );
}