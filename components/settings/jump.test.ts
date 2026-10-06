import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { highlightElement, jumpToSetting, settingDomId } from './jump';

describe('settingDomId', () => {
  it('prefixes keys and leaves ids alone', () => {
    expect(settingDomId('noise')).toBe('setting_noise');
    expect(settingDomId('setting_noise')).toBe('setting_noise');
  });
});

describe('highlightElement', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ''; });

  it('adds the class and removes it on animationend so it can retrigger', () => {
    const el = document.createElement('div');
    highlightElement(el);
    expect(el.classList.contains('animate-highlight')).toBe(true);
    el.dispatchEvent(new Event('animationend'));
    expect(el.classList.contains('animate-highlight')).toBe(false);
    highlightElement(el);
    expect(el.classList.contains('animate-highlight')).toBe(true);
  });

  it('removes the class by itself when the animation never runs (reduced motion)', () => {
    const el = document.createElement('div');
    highlightElement(el);
    vi.advanceTimersByTime(5000);
    expect(el.classList.contains('animate-highlight')).toBe(false);
  });
});

describe('jumpToSetting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ''; });

  it('scrolls the row to the centre, then highlights it', () => {
    document.body.innerHTML = '<div id="setting_noise"></div>';
    const el = document.getElementById('setting_noise')!;
    jumpToSetting('noise');
    vi.advanceTimersByTime(1);
    expect(el.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'center' }));
    expect(el.classList.contains('animate-highlight')).toBe(false);
    vi.advanceTimersByTime(200);
    expect(el.classList.contains('animate-highlight')).toBe(true);
  });

  it('waits for a row that mounts after the call (tab switch)', () => {
    jumpToSetting('setting_hue');
    vi.advanceTimersByTime(100);
    document.body.innerHTML = '<div id="setting_hue"></div>';
    vi.advanceTimersByTime(60);
    expect(document.getElementById('setting_hue')!.scrollIntoView).toHaveBeenCalled();
  });

  it('can be cancelled', () => {
    document.body.innerHTML = '<div id="setting_noise"></div>';
    const cancel = jumpToSetting('noise');
    cancel();
    vi.advanceTimersByTime(1000);
    expect(document.getElementById('setting_noise')!.scrollIntoView).not.toHaveBeenCalled();
  });
});
