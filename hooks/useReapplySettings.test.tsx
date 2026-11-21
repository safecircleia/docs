import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { resetSettingsStore, setSettings } from '@/lib/settings';
import { useReapplySettings } from './useReapplySettings';

function Probe() {
  useReapplySettings();
  return null;
}

/** What React does to <html> when hydration fails and it falls back to a client render. */
function wipeRoot() {
  const el = document.documentElement;
  for (const name of el.getAttributeNames()) if (name !== 'lang') el.removeAttribute(name);
  el.removeAttribute('style');
  el.className = '';
}

describe('useReapplySettings', () => {
  beforeEach(() => {
    localStorage.clear();
    resetSettingsStore();
    wipeRoot();
  });
  afterEach(() => {
    localStorage.clear();
    resetSettingsStore();
    wipeRoot();
  });

  it('restores the saved theme on <html> after React rebuilt it', () => {
    setSettings({ theme: 'light' });
    wipeRoot();
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();

    render(<Probe />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-bleh--theme')).toBe('light');
  });

  it('leaves the attributes untouched when they are already correct', () => {
    setSettings({ theme: 'rose_pine' });
    const before = [...document.documentElement.getAttributeNames()].sort().join(',');

    render(<Probe />);

    expect([...document.documentElement.getAttributeNames()].sort().join(',')).toBe(before);
    expect(document.documentElement.getAttribute('data-bleh--theme')).toBe('rose_pine');
  });
});
