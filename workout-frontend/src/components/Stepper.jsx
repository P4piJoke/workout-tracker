import { useState, useEffect } from 'react';

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
  // Local state allows the user to clear the input or type without instantly updating the parent
  const [inputValue, setInputValue] = useState(value);

  // Sync with parent value if it changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const canDec = value > min;
  const canInc = max === undefined || value < max;

  const dec = () => {
    if (!canDec) return;
    onChange(Math.round((value - step) * 1000) / 1000);
  };

  const inc = () => {
    if (!canInc) return;
    onChange(Math.round((value + step) * 1000) / 1000);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    let parsed = parseFloat(inputValue);

    // Fallback to current saved value if input is empty or invalid
    if (isNaN(parsed)) {
      parsed = value;
    } else {
      // Clamp to min/max
      if (parsed < min) parsed = min;
      if (max !== undefined && parsed > max) parsed = max;
    }

    onChange(parsed);
    setInputValue(parsed); // Re-sync local state to clamped value
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger blur logic to save and clamp
    }
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
          {/* Replaced .stepper__val span with a number input */}
          <input
            type="number"
            className="stepper__input"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            min={min}
            max={max}
            step={step}
          />
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