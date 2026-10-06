'use client';

import { Range } from '../ui';
import { setSettings, type Settings } from '../../lib/settings';
import { SettingRow } from './SettingRow';
import { useBinding, type KeyOf } from './useBinding';

const ACCENT_KEYS: ReadonlySet<string> = new Set(['hue', 'sat', 'lit']);

/** Slider row bound to a number setting. Dragging an accent channel switches the accent to "customise". */
export function SettingRange({ bind }: { bind: KeyOf<number> }) {
  const b = useBinding(bind);
  const { min = 0, max = 1, step = 1 } = b.def;
  const onChange = (v: number) => {
    if (ACCENT_KEYS.has(bind)) setSettings({ [bind]: v, accent_type: 'customise' } as Partial<Settings>);
    else b.set(v as never);
  };
  return (
    <SettingRow
      id={b.id}
      type="input"
      title={b.title}
      body={b.body}
      slot="range"
      modified={b.modified}
      onReset={b.reset}
      incompatible={b.incompatible}
    >
      <Range
        value={b.value as number}
        min={min}
        max={max}
        step={step}
        label={b.title}
        variant={bind === 'hue' ? 'hue' : 'default'}
        onChange={onChange}
      />
    </SettingRow>
  );
}
