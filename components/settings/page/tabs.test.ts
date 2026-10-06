import { describe, expect, it } from 'vitest';
import { isCanonicalTab, resolveTab, tabPath } from './tabs';

describe('settings tabs', () => {
  it('falls back to visual for missing or unknown tabs', () => {
    expect(resolveTab(undefined)).toBe('visual');
    expect(resolveTab('nope')).toBe('visual');
  });

  it('resolves known tabs case-insensitively', () => {
    expect(resolveTab('Seasonal')).toBe('seasonal');
  });

  it('flags non-canonical params for redirect', () => {
    expect(isCanonicalTab('seasonal')).toBe(true);
    expect(isCanonicalTab('Seasonal')).toBe(false);
    expect(isCanonicalTab(undefined)).toBe(true);
  });

  it('builds tab paths', () => {
    expect(tabPath('accessibility')).toBe('/settings/accessibility');
  });
});
