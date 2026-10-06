import { describe, expect, it } from 'vitest';
import { buildSettingsIndex, findMatchRanges, searchSettings, type SearchEntry } from './search';

const entries: SearchEntry[] = [
  { id: 'setting_a', tab: 'visual', title: 'Noise overlay opacity', body: 'Apply a coat of subtle noise', tags: ['grain', 'texture'] },
  { id: 'setting_b', tab: 'visual', title: 'Theme', body: 'Choose the colour scheme', tags: ['dark', 'noise'] },
  { id: 'setting_c', tab: 'interface', title: 'Contraseña', body: 'Cambia tu clave', tags: ['password'] },
  { id: 'setting_d', tab: 'accessibility', title: 'Developer mode', body: 'Shows the theme ids' },
];

const ids = (query: string) => searchSettings(entries, query).map(r => r.entry.id);

describe('searchSettings', () => {
  it('returns nothing for an empty or blank query', () => {
    expect(ids('')).toEqual([]);
    expect(ids('   ')).toEqual([]);
  });

  it('matches title, body and tags case-insensitively', () => {
    expect(ids('NOISE')).toContain('setting_a');
    expect(ids('subtle')).toEqual(['setting_a']);
    expect(ids('grain')).toEqual(['setting_a']);
  });

  it('ignores accents on both sides', () => {
    expect(ids('contrasena')).toEqual(['setting_c']);
    expect(ids('CONTRASEÑA')).toEqual(['setting_c']);
  });

  it('requires every word to match somewhere', () => {
    expect(ids('noise opacity')).toEqual(['setting_a']);
    expect(ids('noise banana')).toEqual([]);
  });

  it('ranks title hits above tag hits above body hits, then keeps index order', () => {
    expect(ids('noise')).toEqual(['setting_a', 'setting_b']);
    expect(ids('theme')).toEqual(['setting_b', 'setting_d']);
  });

  it('returns no results when nothing matches', () => {
    expect(ids('zzz')).toEqual([]);
  });
});

describe('findMatchRanges', () => {
  it('finds accent-insensitive ranges in the original text', () => {
    expect(findMatchRanges('Contraseña nueva', 'contrasena')).toEqual([[0, 10]]);
  });

  it('merges overlapping and adjacent matches', () => {
    expect(findMatchRanges('theme', 'the hem')).toEqual([[0, 4]]);
  });

  it('returns nothing for an empty query', () => {
    expect(findMatchRanges('theme', '')).toEqual([]);
  });
});

describe('buildSettingsIndex', () => {
  const index = buildSettingsIndex(key => key, [{ id: 'account_name', tab: 'interface', title: 'Name' }]);

  it('indexes registry settings by DOM id and includes extras', () => {
    expect(index.some(e => e.id === 'setting_solarium')).toBe(true);
    expect(index.some(e => e.id === 'account_name')).toBe(true);
  });

  it('skips rows that only exist inside a dialog', () => {
    expect(index.some(e => e.id === 'setting_theme_day')).toBe(false);
  });

  it('keeps tab order', () => {
    const tabs = index.map(e => e.tab);
    expect(tabs.indexOf('visual')).toBeLessThan(tabs.indexOf('interface'));
    expect(tabs.indexOf('interface')).toBeLessThan(tabs.indexOf('seasonal'));
  });
});
