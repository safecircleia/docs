'use client';

/**
 * Card gloss overlay (bleh glass highlight). Kept under the old name so every
 * card/modal that used to render CRT scanlines now gets the inset ring + top sheen.
 */
export function Scanline({ enableBorders: _enableBorders }: { enableBorders?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] shadow-inset"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgb(255 255 255 / 0.05), transparent 38%)',
      }}
    />
  );
}
