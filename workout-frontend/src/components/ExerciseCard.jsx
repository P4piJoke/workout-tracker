const MUSCLE_COLOR = {
  CHEST:     '#ff6b6b',
  BACK:      '#4dabf7',
  SHOULDERS: '#f783ac',
  BICEPS:    '#69db7c',
  TRICEPS:   '#a9e34b',
  LEGS:      '#ffa94d',
  GLUTES:    '#f06595',
  CORE:      '#74c0fc',
  CALVES:    '#63e6be',
  FOREARMS:  '#ffe066',
};

const TYPE_LABEL = {
  STRENGTH:    'Strength',
  CARDIO:      'Cardio',
  FLEXIBILITY: 'Flexibility',
};

export default function ExerciseCard({ exercise, isAdmin, onDelete }) {
  const color = MUSCLE_COLOR[exercise.primaryMuscle] ?? '#c8ff3c';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${exercise.name}"? This cannot be undone.`)) {
      onDelete(exercise.id);
    }
  };

  return (
    <article className="ex-card">
      <div className="ex-card__top">
        <h3 className="ex-card__name">{exercise.name}</h3>
        <span
          className="ex-card__muscle"
          style={{ '--muscle-color': color }}
        >
          {exercise.primaryMuscle}
        </span>
      </div>

      {exercise.description && (
        <p className="ex-card__desc">{exercise.description}</p>
      )}

      <div className="ex-card__footer">
        <span className={`ex-card__type ex-card__type--${exercise.type?.toLowerCase()}`}>
          {TYPE_LABEL[exercise.type] ?? exercise.type}
        </span>

        <div className="ex-card__footer-right">
          {exercise.secondaryMuscles?.length > 0 && (
            <div className="ex-card__secondary">
              {exercise.secondaryMuscles.map(m => (
                <span key={m} className="ex-card__sec-chip">{m}</span>
              ))}
            </div>
          )}

          {isAdmin && (
            <button
              className="ex-card__delete"
              onClick={handleDelete}
              aria-label={`Delete ${exercise.name}`}
              title="Delete exercise"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </article>
  );
}