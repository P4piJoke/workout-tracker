/**
 * Stepper — replaces <input type="number"> everywhere.
 * No browser up/down arrows. Clean − VALUE + layout.
 *
 * Props:
 *   value     number   current value
 *   onChange  fn       called with new number
 *   min       number   minimum (default 0)
 *   max       number   maximum (optional)
 *   step      number   increment size (default 1)
 *   unit      string   label shown below value (optional, e.g. "kg", "reps")
 *   label     string   label shown above the control (optional)
 *   size      string   "sm" | "md" (default "md")
 */
export default function Stepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  label,
  size = 'md',
}) {
  const canDec = value > min;
  const canInc = max === undefined || value < max;

  const dec = () => {
    if (!canDec) return;
    // round to avoid floating-point drift (e.g. 2.5 + 2.5 = 5.000000001)
    onChange(Math.round((value - step) * 1000) / 1000);
  };

  const inc = () => {
    if (!canInc) return;
    onChange(Math.round((value + step) * 1000) / 1000);
  };

  return (
    <div className={`stepper stepper--${size}`}>
      {label && <span className="stepper__label">{label}</span>}

      <div className="stepper__control">
        <button
          type="button"
          className="stepper__btn stepper__btn--dec"
          onClick={dec}
          disabled={!canDec}
          aria-label="Decrease"
        >
          −
        </button>

        <div className="stepper__display">
          <span className="stepper__val">{value}</span>
          {unit && <span className="stepper__unit">{unit}</span>}
        </div>

        <button
          type="button"
          className="stepper__btn stepper__btn--inc"
          onClick={inc}
          disabled={!canInc}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  );
}