import React from 'react';
import { useTheme } from './ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      style={{
        background: 'var(--surface-high)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-primary)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '0.7rem',
        fontWeight: '800',
        letterSpacing: '0.1em',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
      }}
    >
      {theme === 'dark' ? '☀️ LIGHT' : '🌙 DARK'}
    </button>
  );
};

export default ThemeToggle;
