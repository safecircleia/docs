'use client';

import React from 'react';

const CrosshairIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1" />
    <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export function Crosshairs() {
  const style = (pos: 'tl' | 'tr' | 'bl' | 'br'): React.CSSProperties => ({
    position: 'absolute',
    color: 'var(--text-muted)',
    opacity: 0.35,
    pointerEvents: 'none',
    zIndex: 1,
    ...(pos === 'tl' ? { top: '-8px', left: '-8px' } : {}),
    ...(pos === 'tr' ? { top: '-8px', right: '-8px' } : {}),
    ...(pos === 'bl' ? { bottom: '-8px', left: '-8px' } : {}),
    ...(pos === 'br' ? { bottom: '-8px', right: '-8px' } : {}),
  });

  return (
    <>
      <span aria-hidden="true" style={style('tl')}><CrosshairIcon /></span>
      <span aria-hidden="true" style={style('tr')}><CrosshairIcon /></span>
      <span aria-hidden="true" style={style('bl')}><CrosshairIcon /></span>
      <span aria-hidden="true" style={style('br')}><CrosshairIcon /></span>
    </>
  );
}
