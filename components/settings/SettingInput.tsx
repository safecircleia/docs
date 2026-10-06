'use client';

import { SettingInputField } from './SettingInputField';
import { SettingRow } from './SettingRow';
import { useBinding, type KeyOf } from './useBinding';

/** Text row bound to a string setting (e.g. the custom font name). Enter saves. */
export function SettingInput({ bind, placeholder, keepWhenIncompatible }: {
  bind: KeyOf<string>; placeholder?: string;
  /** Show the dimmed row (with the Incompatible overlay) instead of hiding it. */
  keepWhenIncompatible?: boolean;
}) {
  const b = useBinding(bind);
  return (
    <SettingRow
      id={b.id}
      type="input"
      title={b.title}
      body={b.body}
      modified={b.modified}
      onReset={b.reset}
      incompatible={b.incompatible}
      hideIfDisabled={!keepWhenIncompatible}
    >
      <SettingInputField
        label={b.title}
        value={String(b.value)}
        maxLength={b.def.max}
        placeholder={placeholder}
        onSubmit={v => b.set(v as never)}
      />
    </SettingRow>
  );
}
