'use client';

import { useTranslation } from 'react-i18next';
import { InnerPreview } from '@/components/settings';
import { Avatar } from '@/components/shell/Avatar';

const PREVIEW_PX = 64;

/** Live preview of the avatar shape and glow settings. */
export function AvatarPreview() {
  const { t } = useTranslation();
  return (
    <InnerPreview>
      <Avatar seed="safecircle" name={t('docs.hero_eyebrow')} size={PREVIEW_PX} />
    </InnerPreview>
  );
}
