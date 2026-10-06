import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';

describe('Tabs', () => {
  it('marks the active tab and calls onChange', () => {
    const onChange = vi.fn();
    render(
      <Tabs
        tabs={[{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta', count: 3 }]}
        active="a"
        onChange={onChange}
      />
    );
    expect(screen.getByRole('tab', { name: /alpha/i })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: /beta/i }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders every variant and moves with the arrow keys', () => {
    const onChange = vi.fn();
    const tabs = [{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta' }];
    for (const variant of ['segmented', 'pill', 'underline', 'tabbed'] as const) {
      const { container, unmount } = render(<Tabs tabs={tabs} active="a" onChange={onChange} variant={variant} />);
      expect(container.querySelector('[role="tablist"]')).toHaveAttribute('data-variant', variant);
      unmount();
    }
    render(<Tabs tabs={tabs} active="a" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
