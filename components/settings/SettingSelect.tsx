'use client';

import { Select } from '../ui';
import { SettingRow } from './SettingRow';
import { useBinding, type KeyOf } from './useBinding';

/** Select row bound to a string setting (settings flavour of the select button). */
export function SettingSelect({ bind }: { bind: KeyOf<string> }) {
  const b = useBinding(bind);
  const options = (b.def.options ?? []).map(o => ({ value: String(o.value), label: b.t(o.labelKey) }));
  return (
    <SettingRow id={b.id} type="select" title={b.title} body={b.body} incompatible={b.incompatible}>
      <Select variant="settings" label={b.title} value={String(b.value)} options={options} onChange={v => b.set(v as never)} />
    </SettingRow>
  );
}
