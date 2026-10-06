'use client';

import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { inputClass } from '../ui';

const PX_PER_CHAR = 4;
const MIN_WIDTH = 240;
const CHROME = 28;

export interface SettingInputFieldProps {
  value: string;
  /** Called on Enter with the trimmed draft when `validate` returns null. */
  onSubmit: (value: string) => void;
  validate?: (value: string) => string | null;
  label: string;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  /** Makes this the 110px hex variant: returns the CSS colour for the leading chip, given the draft. */
  swatch?: (draft: string) => string;
  className?: string;
  /** Content after the field; a function receives the live draft (e.g. a Convert button). */
  children?: ReactNode | ((draft: string) => ReactNode);
}

/** Text input for settings rows: Enter submits, Escape reverts, validation shows an error bubble. */
export function SettingInputField({
  value, onSubmit, validate, label, maxLength, placeholder, disabled, swatch, className, children,
}: SettingInputFieldProps) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  const [error, setError] = useState<string | null>(null);
  if (value !== seen) { setSeen(value); setDraft(value); setError(null); }

  const submit = () => {
    const next = draft.trim();
    const problem = validate?.(next) ?? null;
    setError(problem);
    if (!problem) onSubmit(next);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'Escape') { setDraft(value); setError(null); }
  };

  const width = swatch ? undefined : Math.max(MIN_WIDTH, (maxLength ?? 0) * PX_PER_CHAR + CHROME);
  return (
    <>
      <div
        className={cn('setting-input', className)}
        data-colour={swatch ? '' : undefined}
        data-invalid={error ? '' : undefined}
        style={width ? ({ width } as CSSProperties) : undefined}
      >
        {swatch && <span className="setting-input-swatch" style={{ background: swatch(draft) }} />}
        <input
          className={inputClass}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          value={draft}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          onChange={e => { setDraft(e.target.value); setError(null); }}
          onKeyDown={onKeyDown}
        />
        {error && <div className="setting-input-error" role="alert">{error}</div>}
      </div>
      {typeof children === 'function' ? children(draft) : children}
    </>
  );
}
