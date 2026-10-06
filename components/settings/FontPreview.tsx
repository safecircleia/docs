'use client';

import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSetting';
import { InnerPreview } from './InnerPreview';
import { useHoverTarget } from './useHoverTarget';

/** Sample sentence in the chosen font; hovering the serif checkbox previews the serif heading font. */
export function FontPreview() {
  const { t } = useTranslation();
  const { font_choice, font } = useSettings();
  const serif = useHoverTarget('setting_font_serif');
  const name = serif
    ? t('settings_ui.font.name_serif')
    : font_choice === 'custom' && font.trim() ? font.trim() : t(`settings_ui.font.name_${font_choice}`);

  return (
    <InnerPreview>
      <div className="font-preview">
        <p className="font-sample" data-serif={serif ? '' : undefined}>{t('settings_ui.font.sample')}</p>
        <p className="font-name">{t('settings_ui.font.previewing', { name })}</p>
      </div>
    </InnerPreview>
  );
}
