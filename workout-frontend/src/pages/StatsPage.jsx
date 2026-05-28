import PersonalRecords       from '../components/PersonalRecords';
import ExerciseProgressChart from '../components/ExerciseProgressChart';
import MuscleRadarChart      from '../components/MuscleRadarChart';

export default function StatsPage() {
  return (
    <section>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="dashboard__header">
        <h1 className="dashboard__title">Stats</h1>
      </div>

      {/* ── Section: Personal Records ─────────────────────── */}
      <div className="stats-section">
        <div className="stats-section__header">
          <h2 className="stats-section__title">Personal Records</h2>
          <p className="stats-section__sub">
            Estimated 1RM via Epley formula — weight × (1 + reps ÷ 30)
          </p>
        </div>
        <PersonalRecords />
      </div>

      {/* ── Section: Exercise Progress ────────────────────── */}
      <div className="stats-section">
        <div className="stats-section__header">
          <h2 className="stats-section__title">Exercise Progress</h2>
          <p className="stats-section__sub">
            Track volume, max weight, or sets over time for any exercise.
          </p>
        </div>
        <ExerciseProgressChart />
      </div>

      {/* ── Section: Muscle Balance ───────────────────────── */}
      <div className="stats-section">
        <div className="stats-section__header">
          <h2 className="stats-section__title">Muscle Balance</h2>
          <p className="stats-section__sub">
            Total sets per muscle group across all sessions.
          </p>
        </div>
        <MuscleRadarChart />
      </div>

    </section>
  );
}