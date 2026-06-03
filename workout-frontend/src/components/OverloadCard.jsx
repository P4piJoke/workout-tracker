import { useState } from "react";
import ExercisePrefsModal from "./ExercisePrefsModal";
import { useExercisePreferences } from "../hooks/useExercisePreferences";

const TYPE_CONFIG = {
  INCREASE_WEIGHT: { label: 'Add weight',  mod: 'green',  icon: '↑' },
  INCREASE_REPS:   { label: 'Add reps',    mod: 'green',  icon: '↗' },
  MAINTAIN:        { label: 'Maintain',    mod: 'blue',   icon: '→' },
  DELOAD:          { label: 'Deload',      mod: 'orange', icon: '⚡' },
  BASELINE:        { label: 'Baseline',    mod: 'muted',  icon: '◎' },
};

const TREND_ICON = {
  IMPROVING: '▲',
  STALLING:  '■',
  DECLINING: '▼',
  NEW:       '●',
};

export default function OverloadCard({ rec }) {
  const cfg = TYPE_CONFIG[rec.type] ?? TYPE_CONFIG.MAINTAIN;
  const [showPrefs, setShowPrefs] = useState(false);

  const { data: exercisePrefs = [] } = useExercisePreferences();
  const customPrefs = exercisePrefs.find(p => p.exerciseId === rec.exerciseId);
  const hasCustomRange = !!customPrefs;

  const weightChanged = rec.suggestedWeight !== rec.lastWeight;
  const repsChanged   = rec.targetReps      !== rec.lastAvgReps;

  return (
    <>
      <article className={`ol-card ol-card--${cfg.mod}`}>
        <div className={`ol-card__trend ol-card__trend--${rec.trend.toLowerCase()}`}>
          <span className="ol-card__trend-icon">{TREND_ICON[rec.trend]}</span>
          <span className="ol-card__trend-label">{rec.trend}</span>
        </div>

        <div className="ol-card__body">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <h3 className="ol-card__name">{rec.exerciseName}</h3>

            {/* rep range badge — shows which range is driving this recommendation */}
            <button
              className={`ol-range-badge ${hasCustomRange ? 'ol-range-badge--custom' : 'ol-range-badge--global'}`}
              onClick={() => setShowPrefs(true)}
              title={hasCustomRange ? 'Custom rep range — click to edit' : 'Using global rep range — click to customize'}
            >
              {hasCustomRange
                ? `${customPrefs.targetRepsMin}–${customPrefs.targetRepsMax} ✎`
                : `${rec.targetReps} global ✎`}
            </button>
          </div>

          {/* rest of card body unchanged */}
          <span className={`ol-card__badge ol-card__badge--${cfg.mod}`}>
            {cfg.icon} {cfg.label}
          </span>

          <div className="ol-card__comparison">
            <div className="ol-card__col">
              <span className="ol-card__col-label">Last session</span>
              <span className="ol-card__val">{rec.lastWeight} kg</span>
              <span className="ol-card__sub">
                {rec.lastAvgReps} reps × {rec.lastSets} sets
              </span>
            </div>
            <span className="ol-card__arrow">→</span>
            <div className="ol-card__col ol-card__col--target">
              <span className="ol-card__col-label">Next session</span>
              <span className={`ol-card__val ${weightChanged ? 'ol-card__val--highlight' : ''}`}>
                {rec.suggestedWeight} kg
              </span>
              <span className={`ol-card__sub ${repsChanged ? 'ol-card__sub--highlight' : ''}`}>
                {rec.targetReps} reps × {rec.lastSets} sets
              </span>
            </div>
          </div>

          <p className="ol-card__rationale">{rec.rationale}</p>

          {rec.stallingSessions > 0 && (
            <div className="ol-card__stall-warn">
              ⚡ Stalled for {rec.stallingSessions} sessions
            </div>
          )}
        </div>
      </article>

      {showPrefs && (
        <ExercisePrefsModal
          rec={rec}
          currentPrefs={customPrefs}
          onClose={() => setShowPrefs(false)}
        />
      )}
    </>
  );
}