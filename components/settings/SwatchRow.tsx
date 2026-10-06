'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BrushFilled, CheckFilled, EditFilled, User3Filled } from '@mingcute/react/core-filled';
import { useSettings } from '../../hooks/useSetting';
import { useSeason } from '../../hooks/useSeason';
import {
  ACCENT_PRESETS, DEFAULT_ACCENT, SEASONAL_ACCENT_PRESETS, setSettings, type AccentPreset,
} from '../../lib/settings';
import type { Accent } from './colour';
import { SettingRow } from './SettingRow';
import { useBinding } from './useBinding';

const SEASONAL_PRESET_SEASONS: ReadonlySet<string> = new Set(['christmas', 'new_years']);
const EPSILON = 0.001;

const sameAccent = (a: Accent, b: Accent) =>
  Math.abs(a.hue - b.hue) < EPSILON && Math.abs(a.sat - b.sat) < EPSILON && Math.abs(a.lit - b.lit) < EPSILON;

interface SwatchProps extends Accent {
  label: string;
  sub?: string;
  selected: boolean;
  /** Drawn in b3 with no glow (the custom placeholder while another type is active). */
  inactive?: boolean;
  icon?: ReactNode;
  onSelect: () => void;
}

function Swatch({ hue, sat, lit, label, sub, selected, inactive, icon, onSelect }: SwatchProps) {
  const style = { '--hue-over': hue, '--sat-over': sat, '--lit-over': lit } as CSSProperties;
  return (
    <div className="swatch-item colourful" style={style}>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={sub ? `${label}, ${sub}` : label}
        className="swatch"
        data-inactive={inactive ? '' : undefined}
        onClick={onSelect}
      >
        {icon ?? <CheckFilled className="swatch-check" />}
      </button>
      <span className="swatch-label" aria-hidden="true">
        <strong>{label}</strong>
        {sub && <small>{sub}</small>}
      </span>
    </div>
  );
}

/**
 * The "Presets" row: Default (follows the season), optional Avatar, Custom, then the preset swatches.
 * `avatarAccent` is the colour extracted from the profile picture; omit it to hide the Avatar swatch.
 */
export function SwatchRow({ avatarAccent }: { avatarAccent?: Accent | null }) {
  const { t } = useTranslation();
  const s = useSettings();
  const b = useBinding('accent_type');
  const { active } = useSeason();

  const user: Accent = { hue: s.hue, sat: s.sat, lit: s.lit };
  const seasonal = active?.season;
  const base: Accent = seasonal ? { hue: seasonal.hue, sat: seasonal.sat, lit: seasonal.lit } : DEFAULT_ACCENT;
  const presets: readonly AccentPreset[] = seasonal && SEASONAL_PRESET_SEASONS.has(seasonal.id)
    ? [...SEASONAL_ACCENT_PRESETS, ...ACCENT_PRESETS]
    : ACCENT_PRESETS;
  const seasonalIds = new Set(SEASONAL_ACCENT_PRESETS.map(p => p.id));

  const type = s.accent_type;
  const matched = type === 'colour' ? presets.find(p => sameAccent(p, user)) : undefined;
  const customActive = type === 'customise' || (type === 'colour' && !matched);

  const choose = (accent: Accent, accent_type: typeof type) => setSettings({ accent_type, ...accent });

  return (
    <SettingRow id={b.id} type="action" title={b.title} body={b.body} slot="none">
      <div className="swatch-info" role="radiogroup" aria-label={t('settings_ui.colour.presets_label')}>
        <div className="swatches">
          <Swatch
            {...base}
            label={t('prefs.accent_presets.default')}
            selected={type === 'default'}
            icon={<BrushFilled />}
            onSelect={() => setSettings({ accent_type: 'default' })}
          />
          {avatarAccent && (
            <Swatch
              {...avatarAccent}
              label={t('prefs.accent_presets.avatar')}
              selected={type === 'avatar'}
              icon={<User3Filled />}
              onSelect={() => choose(avatarAccent, 'avatar')}
            />
          )}
          <Swatch
            {...user}
            label={t('prefs.accent_presets.custom')}
            selected={customActive}
            inactive={!customActive}
            icon={<EditFilled />}
            onSelect={() => setSettings({ accent_type: 'customise' })}
          />
        </div>
        <span className="swatch-sep" aria-hidden="true" />
        <div className="swatches">
          {presets.map(p => (
            <Swatch
              key={p.id}
              hue={p.hue}
              sat={p.sat}
              lit={p.lit}
              label={t(p.labelKey)}
              sub={seasonalIds.has(p.id) ? t('prefs.accent_presets.limited') : undefined}
              selected={matched?.id === p.id}
              onSelect={() => choose(p, 'colour')}
            />
          ))}
        </div>
      </div>
    </SettingRow>
  );
}
