'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { EXTERNAL_THEMES, LIGHT_THEMES, type ThemeId } from '../../lib/settings';
import { Badge } from '../ui';
import { THEME_ICONS } from './themes';

const FALLBACK_BACKDROP = 'linear-gradient(135deg, oklch(var(--h4) / 80%), oklch(var(--h3) / 25%) 70%)';

/** 60x48 preview of one theme, drawn with that theme's own tokens (`.theme-scope`). */
export function ThemeBubble({ id, selected, onSelect, backdrop }: {
  id: ThemeId; selected: boolean; onSelect: () => void; backdrop?: string | null;
}) {
  const { t } = useTranslation();
  const label = t(`prefs.theme.opt.${id}`);
  const bg = backdrop ? `url("${backdrop}")` : FALLBACK_BACKDROP;

  return (
    <button type="button" role="radio" aria-checked={selected} aria-label={label} className="theme-bubble" onClick={onSelect}>
      <span className="theme-card">
        <span
          className="theme-card-inner theme-scope"
          data-bleh--theme={id}
          data-bleh--theme_type={LIGHT_THEMES.has(id) ? 'light' : 'dark'}
          style={{ '--bubble-bg': bg } as CSSProperties}
          aria-hidden="true"
        >
          <span className="theme-card-bg" />
          <span className="theme-mini">
            <span className="theme-mini-main">
              <span className="theme-mini-aa">Aa</span>
              <span className="theme-mini-line" style={{ width: 20 }} />
              <span className="theme-mini-line" style={{ width: 17 }} />
              <span className="theme-mini-line" style={{ width: 14 }} />
            </span>
            <span className="theme-mini-side" />
          </span>
        </span>
        {EXTERNAL_THEMES.has(id) && <Badge tone="sticker" className="theme-new animate-sticker">{t('prefs.theme_group.new_tag')}</Badge>}
      </span>
      <strong className="theme-label">
        {THEME_ICONS[id]}
        {label}
      </strong>
    </button>
  );
}
