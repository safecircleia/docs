'use client';

import { useEffect, useRef, useState } from 'react';
import { useSeason } from '../../hooks/useSeason';
import { useSettings } from '../../hooks/useSetting';
import { prefersReducedMotion, resolvedThemeType } from '@/lib/settings';
import { particleCount } from '@/lib/seasons';
import {
  createFlakes, createRng, flakeDrawSize, flakePosition, MOBILE_MAX_WIDTH, spriteSpec, stepFlakes, type SpriteSpec,
} from '@/lib/particles';

const MAX_DPR = 2;
const RESIZE_DEBOUNCE_MS = 150;
const LITE_FRAME_MS = 1000 / 30;

function buildSprite(spec: SpriteSpec, dpr: number): HTMLCanvasElement | null {
  const size = spec.size * dpr;
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext('2d');
  if (!ctx) return null;
  if (spec.blur > 0) {
    ctx.shadowColor = spec.glow;
    ctx.shadowBlur = spec.blur * dpr;
  }
  ctx.fillStyle = spec.disc;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, spec.discRadius * dpr, 0, Math.PI * 2);
  ctx.fill();
  return sprite;
}

function useReducedMotion(): boolean {
  const settings = useSettings();
  const [, bump] = useState(0);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => bump(n => n + 1);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return prefersReducedMotion(settings);
}

interface Config { count: number; themeType: 'light' | 'dark'; lite: boolean }

/** One fixed canvas of falling snow. Stops completely (no rAF) whenever there is nothing to show. */
export function SeasonalParticles() {
  const { active } = useSeason();
  const settings = useSettings();
  const reduced = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mode = settings.seasonal_particles;
  const count = settings.seasonal && active ? particleCount(active.season, mode, mobile) : 0;
  const enabled = count > 0 && !reduced;
  const themeType = resolvedThemeType(settings);
  const lite = settings.seasonal_particles_lite;

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= MOBILE_MAX_WIDTH);
    onResize();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const debounced = () => { clearTimeout(timer); timer = setTimeout(onResize, RESIZE_DEBOUNCE_MS); };
    window.addEventListener('resize', debounced);
    return () => { clearTimeout(timer); window.removeEventListener('resize', debounced); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;
    return runParticles(canvas, { count, themeType, lite });
  }, [enabled, count, themeType, lite]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1000] h-full w-full opacity-80"
      style={{ contain: 'strict' }}
    />
  );
}

/** Sizes the canvas, runs the loop and returns the cleanup. */
function runParticles(canvas: HTMLCanvasElement, { count, themeType, lite }: Config): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const sprite = buildSprite(spriteSpec(themeType, lite), dpr);
  if (!sprite) return () => {};
  const flakes = createFlakes(count, createRng(Date.now()));
  const view = { width: window.innerWidth, height: window.innerHeight };

  const size = () => {
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    canvas.width = Math.round(view.width * dpr);
    canvas.height = Math.round(view.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();

  const draw = () => {
    ctx.clearRect(0, 0, view.width, view.height);
    for (const f of flakes) {
      const { x, y } = flakePosition(f, view);
      const s = flakeDrawSize(f);
      ctx.globalAlpha = f.opacity;
      ctx.drawImage(sprite, x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  };

  let raf = 0;
  let last = 0;
  let sinceDraw = 0;
  const frame = (now: number) => {
    const dt = (now - last) / 1000;
    last = now;
    sinceDraw += dt * 1000;
    stepFlakes(flakes, dt, view);
    if (!lite || sinceDraw >= LITE_FRAME_MS) {
      sinceDraw = 0;
      draw();
    }
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (raf || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  const onVisibility = () => (document.hidden ? stop() : start());
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { size(); draw(); }, RESIZE_DEBOUNCE_MS);
  };

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize);
  draw();
  start();

  return () => {
    stop();
    clearTimeout(resizeTimer);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', onResize);
  };
}
