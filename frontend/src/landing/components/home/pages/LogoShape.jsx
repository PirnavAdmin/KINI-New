// src/components/LogoShape.jsx
import React from 'react';

export const LogoShape = ({ variant, className }) => {
  const isDesktop = variant === 'desktop';
  const viewBox = isDesktop ? '0 0 280 145' : '0 0 175 90';
  const path = isDesktop
    ? 'M0 0 H280 L235 42 C215 66 190 90 160 108 C125 129 87 141 50 144 C28 146 12 143 0 138 Z'
    : 'M0 0 H175 L148 26 C135 40 120 55 100 66 C77 80 54 87 31 89 C18 90 8 87 0 83 Z';

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={`absolute left-0 top-0 h-full w-full ${className || ''}`}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible', pointerEvents: 'none' }}
    >
      <path d={path} fill="#FFFFFF" />
    </svg>
  );
};