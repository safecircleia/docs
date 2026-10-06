import { describe, it, expect } from 'vitest';
import { avatarHue, avatarInitial, avatarModel } from './avatarModel';

describe('avatarModel', () => {
  it('is deterministic per seed', () => {
    expect(avatarModel('child-1')).toEqual(avatarModel('child-1'));
  });

  it('varies across seeds', () => {
    const models = new Set(Array.from({ length: 30 }, (_, i) => JSON.stringify(avatarModel(`child-${i}`))));
    expect(models.size).toBe(30);
  });

  it('keeps avatarHue in step with the model hue', () => {
    for (let i = 0; i < 50; i++) expect(avatarHue(`s${i}`)).toBe(avatarModel(`s${i}`).hue);
  });

  it('keeps blobs inside the canvas', () => {
    for (const b of avatarModel('x').blobs) {
      expect(b.x).toBeGreaterThan(0);
      expect(b.x).toBeLessThan(1);
      expect(b.hue).toBeGreaterThanOrEqual(0);
      expect(b.hue).toBeLessThan(360);
    }
  });
});

describe('avatarInitial', () => {
  it('uppercases the first letter', () => expect(avatarInitial(' lucía')).toBe('L'));
  it('is empty without a name', () => expect(avatarInitial(undefined)).toBe(''));
});
