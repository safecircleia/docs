'use client';

import { Checkbox } from '../ui';
import { SettingRow } from './SettingRow';
import { useBinding, type KeyOf } from './useBinding';

/** Checkbox row bound to a boolean setting; the box sits before the heading. */
export function SettingCheckbox({ bind }: { bind: KeyOf<boolean> }) {
  const b = useBinding(bind);
  const on = b.value as boolean;
  const toggle = () => b.set(!on as never);
  return (
    <SettingRow id={b.id} type="checkbox" title={b.title} body={b.body} incompatible={b.incompatible} onClick={toggle}>
      <Checkbox checked={on} onChange={toggle} aria-label={b.title} />
    </SettingRow>
  );
}
