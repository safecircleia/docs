'use client';

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckFilled, Copy2Filled, EditFilled, MarkdownFilled } from '@mingcute/react/core-filled';
import { toast } from '@/lib/toast';
import { SideAction } from '../shell/card';

const COPIED_MS = 2000;

interface PageActionsProps { markdownUrl: string; editUrl: string }

/** Copy the page as Markdown, open the raw Markdown, or edit it on GitHub. */
export function PageActions({ markdownUrl, editUrl }: PageActionsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // The ClipboardItem takes the pending fetch, so the copy still counts as the click (Safari/iOS).
  const copy = async () => {
    try {
      const text = fetch(markdownUrl).then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return new Blob([await res.text()], { type: 'text/plain' });
      });
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': text })]);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      toast.error({ title: t('docs.copy_failed') });
    }
  };

  return (
    <div className="cc-side-actions">
      <SideAction icon={copied ? <CheckFilled size={16} /> : <Copy2Filled size={16} />} label={copied ? t('docs.copied') : t('docs.copy_markdown')} onClick={() => void copy()} />
      <SideAction icon={<MarkdownFilled size={16} />} label={t('docs.view_markdown')} href={markdownUrl} />
      <SideAction icon={<EditFilled size={16} />} label={t('docs.edit')} href={editUrl} />
    </div>
  );
}
