'use client';

import { Fragment, type ReactNode } from 'react';
import { Checkbox, Radio } from '../ui';
import { SettingRow } from './SettingRow';
import { useBinding, type KeyOf } from './useBinding';

/** Radio list bound to a string setting; options (and labels) come from the registry. */
export function SettingRadio({ bind }: { bind: KeyOf<string> }) {
  const b = useBinding(bind);
  const options = b.def.options ?? [];
  return (
    <SettingRow
      id={b.id}
      type="options"
      title={b.title}
      body={b.body}
      modified={b.modified}
      onReset={b.reset}
      incompatible={b.incompatible}
      below={(
        <div className="setting-options" role="radiogroup" aria-label={b.title}>
          {options.map(o => (
            <Radio key={String(o.value)} checked={b.value === o.value} onChange={() => b.set(o.value)} label={b.t(o.labelKey)} />
          ))}
        </div>
      )}
    />
  );
}

type OptionItem = { bind: KeyOf<boolean> } | 'sep';

function OptionCheckbox({ bind }: { bind: KeyOf<boolean> }) {
  const b = useBinding(bind);
  return <Checkbox checked={b.value as boolean} onChange={v => b.set(v as never)} label={b.title} disabled={b.incompatible !== undefined} />;
}

/** Heading plus a cluster of standalone checkboxes; `'sep'` draws the short divider between sub-groups. */
export function SettingOptions({ id, title, body, items }: { id?: string; title: ReactNode; body?: ReactNode; items: OptionItem[] }) {
  return (
    <SettingRow
      id={id}
      type="options"
      title={title}
      body={body}
      below={(
        <div className="setting-options">
          {items.map((item, i) => (
            <Fragment key={item === 'sep' ? `sep-${i}` : item.bind}>
              {item === 'sep' ? <div className="setting-options-sep" /> : <OptionCheckbox bind={item.bind} />}
            </Fragment>
          ))}
        </div>
      )}
    />
  );
}
