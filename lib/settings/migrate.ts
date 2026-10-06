import { DEFAULT_ACCENT, THEME_IDS, type Settings } from './registry';

export const LEGACY_THEME_KEY = 'sc_theme';
export const LEGACY_APPEARANCE_KEY = 'sc_appearance';

type Diff = Partial<Settings>;
type Raw = Record<string, unknown>;

function parseObject(text: string | null): Raw | null {
  if (!text) return null;
  try {
    const v: unknown = JSON.parse(text);
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : null;
  } catch {
    return null;
  }
}

function migrateTheme(stored: string | null, out: Diff) {
  if (stored === 'system') out.theme_schedule = true;
  else if ((THEME_IDS as readonly string[]).includes(stored ?? '')) out.theme = stored as Settings['theme'];
}

function migrateAppearance(a: Raw, out: Diff) {
  if (typeof a.glass === 'boolean') out.solarium = a.glass;
  if (typeof a.grain === 'boolean') out.noise = a.grain ? 0.25 : 0;
  if (typeof a.serifHeadings === 'boolean') out.font_serif = a.serifHeadings;
  if (a.font === 'funnel') out.font_choice = 'font_2025';
  else if (a.font === 'hyperlegible') out.font_choice = 'hyperlegible';
  else if (a.font === 'custom' && typeof a.customFont === 'string' && a.customFont.trim()) {
    out.font_choice = 'custom';
    out.font = a.customFont.trim();
  }
  if (typeof a.reducedMotion === 'boolean') out.reduced_motion = a.reducedMotion;
  if (typeof a.underlineLinks === 'boolean') out.underline_links = a.underlineLinks;
  if (typeof a.showScroller === 'boolean') out.show_scroller = a.showScroller;
  if (typeof a.gridGlow === 'boolean') out.grid_glow = a.gridGlow;
  if (a.avatarRadius === 'circle' || a.avatarRadius === 'squircle' || a.avatarRadius === 'square') out.avatar_radius = a.avatarRadius;

  const { hue, sat, lit } = a;
  if (typeof hue === 'number' && typeof sat === 'number' && typeof lit === 'number'
    && (hue !== DEFAULT_ACCENT.hue || sat !== DEFAULT_ACCENT.sat || lit !== DEFAULT_ACCENT.lit)) {
    Object.assign(out, { accent_type: 'colour', hue, sat, lit });
  }
}

/**
 * Converts the pre-registry `sc_theme` / `sc_appearance` keys into setting diffs.
 * Returns null when neither key exists. Values are validated by the caller.
 */
export function readLegacySettings(storage: Pick<Storage, 'getItem'>): Diff | null {
  const theme = storage.getItem(LEGACY_THEME_KEY);
  const appearance = parseObject(storage.getItem(LEGACY_APPEARANCE_KEY));
  if (theme === null && !appearance) return null;
  const out: Diff = {};
  migrateTheme(theme, out);
  if (appearance) migrateAppearance(appearance, out);
  return out;
}

export function clearLegacySettings(storage: Pick<Storage, 'removeItem'>) {
  storage.removeItem(LEGACY_THEME_KEY);
  storage.removeItem(LEGACY_APPEARANCE_KEY);
}
