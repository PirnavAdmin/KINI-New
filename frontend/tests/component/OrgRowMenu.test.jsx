import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OrgRowMenu } from '@features/organization/components/org-ui/OrgPageKit';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('renders outside the table and opens above when there is insufficient room below', () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return this.getAttribute('role') === 'menu'
      ? { width: 190, height: 120 }
      : { top: window.innerHeight - 60, bottom: window.innerHeight - 24, right: 500 };
  });
  const action = vi.fn();
  const { container } = render(<div style={{ overflow: 'hidden' }}><OrgRowMenu items={[{ label: 'Publish', onClick: action }]} /></div>);
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
  const menu = screen.getByRole('menu');
  expect(container.contains(menu)).toBe(false);
  expect(menu.style.position).toBe('fixed');
  expect(Number.parseFloat(menu.style.top)).toBe(window.innerHeight - 186);
  fireEvent.mouseDown(screen.getByRole('menuitem', { name: 'Publish' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Publish' }));
  expect(action).toHaveBeenCalledOnce();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

it('closes on Escape and outside clicks', () => {
  render(<OrgRowMenu items={[{ label: 'Delete' }]} />);
  const trigger = screen.getByRole('button', { name: 'More actions' });
  fireEvent.click(trigger);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  fireEvent.click(trigger);
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});
