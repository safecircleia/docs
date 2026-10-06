'use client';

import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSetting';
import { setSettings } from '../../lib/settings';
import { Button } from '../ui';
import { accentToHex, hexToAccent, parseHex, type Accent } from './colour';
import { SettingGroup } from './SettingGroup';
import { SettingInputField } from './SettingInputField';
import { SettingRange } from './SettingRange';
import { SettingRow } from './SettingRow';
import { SwatchRow } from './SwatchRow';

const withHash = (v: string) => (v.startsWith('#') ? v : `#${v}`);

/** "Convert colour": a hex field pre-filled with the current accent; Convert maps it onto hue/sat/lit. */
export function ColourConvertRow() {
  const { t } = useTranslation();
  const { hue, sat, lit } = useSettings();
  const hex = accentToHex({ hue, sat, lit });

  const convert = (value: string) => {
    const accent = hexToAccent(value, hue);
    if (accent) setSettings({ ...accent, accent_type: 'customise' });
  };

  return (
    <SettingRow
      id="setting_convert_colour"
      type="input"
      title={t('settings_ui.colour.convert_title')}
      body={t('settings_ui.colour.convert_body')}
      slot="free"
    >
      <div className="flex items-center gap-2.5">
        <SettingInputField
          label={t('settings_ui.colour.hex_label')}
          value={hex}
          maxLength={7}
          swatch={draft => (parseHex(draft) ? withHash(draft.trim()) : hex)}
          validate={v => (parseHex(v) ? null : t('settings_ui.colour.hex_invalid'))}
          onSubmit={convert}
        >
          {draft => <Button label={t('settings_ui.colour.convert_button')} onClick={() => convert(draft)} />}
        </SettingInputField>
      </div>
    </SettingRow>
  );
}

/** The whole Colours group: presets, convert-from-hex, then accent / vibrancy / lightness. */
export function ColourControls({ avatarAccent }: { avatarAccent?: Accent | null }) {
  return (
    <SettingGroup>
      <SwatchRow avatarAccent={avatarAccent} />
      <ColourConvertRow />
      <SettingRange bind="hue" />
      <SettingRange bind="sat" />
      <SettingRange bind="lit" />
    </SettingGroup>
  );
}
