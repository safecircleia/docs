'use client';

import { Switch } from '../ui';
import { SettingRow } from './SettingRow';
import { useBinding, type KeyOf } from './useBinding';

/** Toggle row bound to a boolean setting; the whole row is clickable. */
export function SettingSwitch({ bind }: { bind: KeyOf<boolean> }) {
  const b = useBinding(bind);
  const on = b.value as boolean;
  const toggle = () => b.set(!on as never);
  return (
    <SettingRow id={b.id} type="toggle" title={b.title} body={b.body} incompatible={b.incompatible} onClick={toggle}>
      <Switch checked={on} onChange={toggle} label={b.title} />
    </SettingRow>
  );
}
