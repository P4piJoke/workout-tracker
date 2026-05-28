import { useState, useEffect, useRef } from 'react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

/**
 * DatePicker — replaces <input type="date">.
 *
 * Props:
 *   value     string   ISO date string "YYYY-MM-DD"
 *   onChange  fn       called with new ISO date string
 */
export default function DatePicker({ value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [view, setView]   = useState(() => initView(value));
  const containerRef      = useRef(null);

  // sync view month when value changes externally
  useEffect(() => { if (value) setView(initView(value)); }, [value]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // ── calendar math ──────────────────────────────────────────
  const firstOfMonth   = new Date(view.year, view.month, 1);
  const daysInMonth    = new Date(view.year, view.month + 1, 0).getDate();
  // Mon-first offset: JS Sun=0 → we need Mon=0
  const startOffset    = (firstOfMonth.getDay() + 6) % 7;

  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today    = new Date();
  const selected = value ? parseLocal(value) : null;

  const isSelected = (day) =>
    selected &&
    selected.getFullYear() === view.year &&
    selected.getMonth()    === view.month &&
    selected.getDate()     === day;

  const isToday = (day) =>
    today.getFullYear() === view.year &&
    today.getMonth()    === view.month &&
    today.getDate()     === day;

  // ── navigation ─────────────────────────────────────────────
  const prevMonth = () =>
    setView(v => v.month === 0
      ? { year: v.year - 1, month: 11 }
      : { ...v, month: v.month - 1 });

  const nextMonth = () =>
    setView(v => v.month === 11
      ? { year: v.year + 1, month: 0 }
      : { ...v, month: v.month + 1 });

  const goToday = () => {
    const now = new Date();
    setView({ year: now.getFullYear(), month: now.getMonth() });
  };

  // ── select a day ───────────────────────────────────────────
  const selectDay = (day) => {
    const m = String(view.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${view.year}-${m}-${d}`);
    setOpen(false);
  };

  // ── display label ──────────────────────────────────────────
  const displayLabel = value
    ? parseLocal(value).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : 'Select date';

  return (
    <div className="datepicker" ref={containerRef}>
      {/* trigger */}
      <button
        type="button"
        className={`datepicker__trigger ${open ? 'datepicker__trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg className="datepicker__icon" viewBox="0 0 16 16" fill="none"
          stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="1" y="2.5" width="14" height="12.5" rx="2"/>
          <path d="M1 6.5h14M5 1v3M11 1v3"/>
        </svg>
        <span className="datepicker__label">{displayLabel}</span>
        <svg className="datepicker__chevron" viewBox="0 0 10 6" fill="none"
          stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d={open ? 'M1 5L5 1L9 5' : 'M1 1L5 5L9 1'}/>
        </svg>
      </button>

      {/* popup */}
      {open && (
        <div className="datepicker__popup">

          {/* month navigation */}
          <div className="datepicker__nav">
            <button
              type="button"
              className="datepicker__nav-btn"
              onClick={prevMonth}
              aria-label="Previous month"
            >‹</button>

            <button
              type="button"
              className="datepicker__month-btn"
              onClick={goToday}
              title="Go to today"
            >
              {MONTHS[view.month]} {view.year}
            </button>

            <button
              type="button"
              className="datepicker__nav-btn"
              onClick={nextMonth}
              aria-label="Next month"
            >›</button>
          </div>

          {/* weekday headers */}
          <div className="datepicker__weekdays">
            {WEEKDAYS.map(d => (
              <span key={d} className="datepicker__weekday">{d}</span>
            ))}
          </div>

          {/* day grid */}
          <div className="datepicker__grid">
            {cells.map((day, i) =>
              day === null ? (
                <span key={`empty-${i}`} className="datepicker__empty" />
              ) : (
                <button
                  key={day}
                  type="button"
                  className={[
                    'datepicker__day',
                    isSelected(day) ? 'datepicker__day--selected' : '',
                    isToday(day)    ? 'datepicker__day--today'    : '',
                  ].join(' ')}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              )
            )}
          </div>

          {/* today shortcut */}
          <div className="datepicker__footer">
            <button
              type="button"
              className="datepicker__today-btn"
              onClick={() => {
                const now = new Date();
                const iso = now.toISOString().split('T')[0];
                onChange(iso);
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────
function initView(iso) {
  const d = iso ? parseLocal(iso) : new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

// Parse ISO without timezone shift (new Date("2024-01-15") = UTC midnight = wrong local day)
function parseLocal(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}