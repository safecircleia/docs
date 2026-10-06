'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseFilled, CopyFilled, Download2Filled, Refresh1Filled, Share2Filled, UploadFilled } from '@mingcute/react/core-filled';
import { exportSettings, importSettings, resetAllSettings } from '../../lib/settings';
import { toast } from '../../lib/toast';
import { Button, FooterFill, InlineAlert, Input, Modal, SeeMore, Textarea } from '../ui';

const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [text] = useState(exportSettings);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.status(t('settings_ui.export.copied'));
    } catch {
      toast.error({ title: t('settings_ui.export.copy_failed') });
    }
  };
  const share = () => {
    navigator.share({ title: t('settings_ui.export.share_title'), text }).catch(() => { /* dismissed */ });
  };

  return (
    <Modal
      title={t('settings_ui.export.title')}
      description={t('settings_ui.export.body')}
      icon={<UploadFilled size={14} />}
      onClose={onClose}
      width={500}
      footer={(
        <>
          <FooterFill />
          {canShare() && <Button appearance="primary" label={t('settings_ui.export.share')} icon={<Share2Filled />} onClick={share} />}
          <Button appearance="primary" label={t('settings_ui.export.copy')} icon={<CopyFilled />} onClick={copy} />
        </>
      )}
    >
      <Input readOnly label={t('settings_ui.export.field_label')} value={text} onFocus={e => e.currentTarget.select()} />
    </Modal>
  );
}

export function ImportDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    if (!text.trim()) { setError(t('settings_ui.import.error_empty')); return; }
    const result = importSettings(text);
    if (!result.ok) { setError(t(`settings_ui.import.error_${result.error}`)); return; }
    toast.success({ title: t('settings_ui.import.done', { count: result.applied }) });
    onClose();
  };

  return (
    <Modal
      title={t('settings_ui.import.title')}
      icon={<Download2Filled size={14} />}
      onClose={onClose}
      width={560}
      footer={(
        <>
          <SeeMore iconLeft={<CloseFilled />} onClick={onClose}>{t('settings_ui.cancel')}</SeeMore>
          <FooterFill />
          <Button appearance="primary" label={t('settings_ui.import.confirm')} icon={<Download2Filled />} onClick={run} />
        </>
      )}
    >
      <div className="flex flex-col gap-3.5">
        <InlineAlert tone="error">{t('settings_ui.import.warning')}</InlineAlert>
        <Textarea
          label={t('settings_ui.import.field_label')}
          placeholder={t('settings_ui.import.placeholder')}
          value={text}
          error={error ?? undefined}
          spellCheck={false}
          onChange={e => { setText(e.target.value); setError(null); }}
        />
      </div>
    </Modal>
  );
}

export function ResetDialog({ onClose, onBackup }: { onClose: () => void; onBackup: () => void }) {
  const { t } = useTranslation();
  const confirm = () => {
    resetAllSettings();
    toast.success({ title: t('settings_ui.reset.done') });
    onClose();
  };

  return (
    <Modal
      title={t('settings_ui.reset.title')}
      icon={<Refresh1Filled size={14} />}
      onClose={onClose}
      width={460}
      footer={(
        <>
          <SeeMore iconLeft={<CloseFilled />} onClick={onClose}>{t('settings_ui.cancel')}</SeeMore>
          <FooterFill />
          <Button appearance="danger-primary" label={t('settings_ui.reset.confirm')} icon={<Refresh1Filled />} onClick={confirm} />
        </>
      )}
    >
      <InlineAlert tone="error">
        <strong>{t('settings_ui.reset.warning')}</strong>
        <SeeMore className="ml-2" onClick={onBackup}>{t('settings_ui.reset.backup')}</SeeMore>
      </InlineAlert>
    </Modal>
  );
}
