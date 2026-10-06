'use client';

'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { avatarHue } from './avatarModel';
import { Avatar } from './Avatar';
import { sectionIcon } from './sectionIcons';

const HERO_AVATAR_PX = 180;
const AVATAR_ACCENT = { sat: 1.3, lit: 0.9 };

interface DocsHeroProps {
  seed: string;
  iconKey: string;
  eyebrow?: string;
  title: string;
  description?: string;
  /** Level-1 heading only on pages whose own content has no <h1> (home, settings). */
  asHeading?: boolean;
}

/** Generated avatar with the section icon and an accent glow, the eyebrow, title and one-line description. */
export function DocsHero({ seed, iconKey, eyebrow, title, description, asHeading = false }: DocsHeroProps) {
  const { t } = useTranslation();
  const Icon = sectionIcon(iconKey);
  const glow = { '--hue-over': avatarHue(seed), '--sat-over': AVATAR_ACCENT.sat, '--lit-over': AVATAR_ACCENT.lit } as CSSProperties;
  return (
    <section className="sh-hero">
      <div className="sh-hero-avatar avatar-shape colourful" style={glow} aria-hidden="true">
        <Avatar seed={seed} size={HERO_AVATAR_PX} />
        <Icon className="sh-hero-icon" />
      </div>
      <div className="sh-hero-text">
        <p className="sh-hero-eyebrow">{eyebrow ?? t('docs.hero_eyebrow')}</p>
        <p className="sh-hero-title" {...(asHeading ? { role: 'heading', 'aria-level': 1 } : {})}>{title}</p>
        {description && <p className="sh-hero-desc">{description}</p>}
      </div>
    </section>
  );
}
