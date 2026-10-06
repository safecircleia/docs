'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../ui';
import { SettingRow } from './SettingRow';
import { isModifierKey, modifierGlyph, recordableKey } from './keys';

/**
 * Key caps for a shortcut. Modifiers ('mod', 'shift', ...) are fixed glyphs; clicking a letter key
 * records the next printable key (Escape or blur cancels).
 */
export function SettingKeybind({ id, title, body, keys, onChange }: {
  id?: string; title: string; body?: string; keys: string[]; onChange?: (keys: string[]) => void;
}) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState<number | null>(null);

  const record = (index: number, key: string) => {
    onChange?.(keys.map((k, i) => (i === index ? key : k)));
    setRecording(null);
  };

  return (
    <SettingRow id={id} type="action" title={title} body={body}>
      <span className="keybind" role="group" aria-label={title}>
        {keys.map((key, i) => {
          if (isModifierKey(key)) {
            const { glyph, name } = modifierGlyph(key);
            return (
              <Tooltip key={i} content={name}>
                <kbd className="ui-kbd keycap" data-fixed="">{glyph}</kbd>
              </Tooltip>
            );
          }
          const active = recording === i;
          return (
            <button
              key={i}
              type="button"
              className="ui-kbd keycap"
              data-recording={active ? '' : undefined}
              aria-label={active ? t('settings_ui.keybind.recording') : `${t('settings_ui.keybind.edit')}: ${key.toUpperCase()}`}
              disabled={!onChange}
              onClick={() => setRecording(active ? null : i)}
              onBlur={() => setRecording(null)}
              onKeyDown={e => {
                if (!active) return;
                if (e.key === 'Escape') { setRecording(null); return; }
                const next = recordableKey(e.nativeEvent);
                if (next) { e.preventDefault(); record(i, next); }
              }}
            >
              {active ? '…' : key}
            </button>
          );
        })}
      </span>
    </SettingRow>
  );
}
