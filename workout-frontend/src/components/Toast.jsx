import { useEffect } from 'react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: 'var(--accent)',
      color: 'var(--text-on-accent)',
      padding: '0.75rem 1.25rem',
      borderRadius: 'var(--radius)',
      fontWeight: 600,
      fontSize: '0.9rem',
      zIndex: 200,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      animation: 'slide-up 200ms ease',
    }}>
      {message}
    </div>
  );
}