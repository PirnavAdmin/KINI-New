import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import Sidebar from '../../src/features/dashboard/components/Sidebar';
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({ user: {}, logout: vi.fn() }) }));
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true }) }));
vi.mock('@features/hr/hooks/useHrPermissions', () => ({ default: () => ({ canModule: () => true }) }));
vi.mock('@features/student/hooks/useStudentProgressAccess', () => ({ default: () => ({ progress: 100 }) }));
afterEach(cleanup);
it.each(['/organization/classes','/organization/classes/42','/organization/live-classes?class=React','/organization/live-classes/42'])('highlights Classes at %s', path => {
 render(<MemoryRouter initialEntries={[path]}><Sidebar role="org-admin" /></MemoryRouter>);
 expect(screen.getByRole('link', { name: 'Classes', exact: true }).querySelector('.mentor-sidebar-item').className).toContain('bg-[#F39924]');
 expect(screen.getByRole('link', { name: 'Students', exact: true }).querySelector('.mentor-sidebar-item').className).not.toContain('bg-[#F39924]');
});
it('only highlights Students when opening a student', () => {
 render(<MemoryRouter initialEntries={['/organization/students/42']}><Sidebar role="org-admin" /></MemoryRouter>);
 expect(screen.getByRole('link', { name: 'Classes', exact: true }).querySelector('.mentor-sidebar-item').className).not.toContain('bg-[#F39924]');
 expect(screen.getByRole('link', { name: 'Students', exact: true }).querySelector('.mentor-sidebar-item').className).toContain('bg-[#F39924]');
});
