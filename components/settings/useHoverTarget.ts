import { useEffect, useState } from 'react';

/** True while the pointer is over the element with this DOM id (or any of its children). */
export function useHoverTarget(id: string): boolean {
  const [hovering, setHovering] = useState(false);
  useEffect(() => {
    const onOver = (e: PointerEvent) => setHovering(e.target instanceof Element && e.target.closest(`#${id}`) !== null);
    document.addEventListener('pointerover', onOver);
    return () => document.removeEventListener('pointerover', onOver);
  }, [id]);
  return hovering;
}
