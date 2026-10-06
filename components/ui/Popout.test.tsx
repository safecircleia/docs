import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Popout } from './Popout';
import { MenuItem } from './Menu';

const rect = new DOMRect(0, 0, 100, 30);

function menu() {
  render(
    <Popout rect={rect} menuRef={{ current: null }}>
      <MenuItem label="Apple" />
      <MenuItem label="Banana" />
      <MenuItem label="Blueberry" />
    </Popout>
  );
  return screen.getByRole('menu');
}

describe('Popout typeahead', () => {
  it('focuses the first item starting with the typed text and narrows as you keep typing', () => {
    const el = menu();
    fireEvent.keyDown(el, { key: 'b' });
    expect(screen.getByRole('menuitem', { name: 'Banana' })).toHaveFocus();
    fireEvent.keyDown(el, { key: 'l' });
    expect(screen.getByRole('menuitem', { name: 'Blueberry' })).toHaveFocus();
  });

  it('ignores shortcuts with a modifier key', () => {
    const el = menu();
    const spy = vi.fn();
    el.addEventListener('keydown', e => spy(e.defaultPrevented));
    fireEvent.keyDown(el, { key: 'b', ctrlKey: true });
    expect(spy).toHaveBeenCalledWith(false);
  });
});
