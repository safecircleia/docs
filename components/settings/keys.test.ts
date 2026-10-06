import { describe, expect, it } from 'vitest';
import { isModifierKey, modifierGlyph, recordableKey } from './keys';

describe('modifierGlyph', () => {
  it('draws Apple glyphs on Apple platforms and names elsewhere', () => {
    expect(modifierGlyph('mod', true).glyph).toBe('⌘');
    expect(modifierGlyph('mod', false)).toEqual({ glyph: 'Ctrl', name: 'Ctrl' });
    expect(modifierGlyph('alt', true).name).toBe('Option');
  });
});

describe('recordableKey', () => {
  const press = (key: string, extra = {}) => ({ key, ctrlKey: false, metaKey: false, altKey: false, ...extra });

  it('records a single printable key, lower-cased', () => {
    expect(recordableKey(press('K'))).toBe('k');
  });

  it('ignores space, named keys and chords', () => {
    expect(recordableKey(press(' '))).toBeNull();
    expect(recordableKey(press('Enter'))).toBeNull();
    expect(recordableKey(press('k', { metaKey: true }))).toBeNull();
  });

  it('knows which keys are fixed modifiers', () => {
    expect(isModifierKey('shift')).toBe(true);
    expect(isModifierKey('k')).toBe(false);
  });
});
