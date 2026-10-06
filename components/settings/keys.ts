/** Keybind helpers: platform modifier glyphs and the printable-key rule used by record mode. */
const APPLE = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

export const MODIFIER_KEYS = ['mod', 'shift', 'alt', 'ctrl', 'enter', 'backspace'] as const;
export type ModifierKey = (typeof MODIFIER_KEYS)[number];

export const isModifierKey = (key: string): key is ModifierKey => (MODIFIER_KEYS as readonly string[]).includes(key);

/** Glyph and tooltip name for a fixed modifier key. */
export function modifierGlyph(key: ModifierKey, apple: boolean = APPLE): { glyph: string; name: string } {
  switch (key) {
    case 'mod': return apple ? { glyph: '⌘', name: 'Command' } : { glyph: 'Ctrl', name: 'Ctrl' };
    case 'ctrl': return { glyph: apple ? '⌃' : 'Ctrl', name: 'Ctrl' };
    case 'shift': return { glyph: '⇧', name: 'Shift' };
    case 'alt': return { glyph: apple ? '⌥' : 'Alt', name: apple ? 'Option' : 'Alt' };
    case 'enter': return { glyph: '⏎', name: 'Enter' };
    case 'backspace': return { glyph: '⌫', name: 'Backspace' };
  }
}

/** The single printable character a key press records, or null for named keys, space and chords. */
export function recordableKey(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>): string | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  return e.key.length === 1 && e.key !== ' ' ? e.key.toLowerCase() : null;
}
