import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Sidebar from '@features/dashboard/components/Sidebar';
import RoleBasedRoute from '@features/auth/components/RoleBasedRoute';
import HrRouteGuard from '@features/hr/components/HrRouteGuard';
import { ROUTES } from '@shared/constants/routeConstants';

const mocks = vi.hoisted(() => ({ role: 'org-admin', permitted: true }));
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({
  role: mocks.role, user: { role: mocks.role }, isAuthenticated: true,
  loading: false, logout: vi.fn(), getDashboardRoute: () => '/employee/dashboard',
}) }));
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => mocks.permitted }) }));
vi.mock('@features/hr/hooks/useHrPermissions', () => ({ default: () => ({
  can: () => false, canAccessModule: () => false, canModule: () => false, isLoading: false,
}) }));
vi.mock('@features/student/hooks/useStudentProgressAccess', () => ({ default: () => ({ progress: {} }) }));
afterEach(cleanup);
beforeEach(() => { mocks.role = 'org-admin'; mocks.permitted = true; });

function mount(path) {
  return render(<MemoryRouter initialEntries={[path]}>
    <Sidebar role="org-admin" />
    <Routes>
      <Route path={ROUTES.ORG_ADMIN.SYLLABUS} element={
        <RoleBasedRoute allowedRoles={['org-admin']}>
          <HrRouteGuard module="syllabus" action="assign" allowOrganizationAdmin>
            <h1>Syllabus content</h1>
          </HrRouteGuard>
        </RoleBasedRoute>
      } />
      <Route path={ROUTES.ORG_ADMIN.DASHBOARD} element={<h1>Dashboard content</h1>} />
      <Route path="/employee/dashboard" element={<h1>Employee dashboard</h1>} />
    </Routes>
  </MemoryRouter>);
}

it('omits syllabus from the organization sidebar', () => {
  mount(ROUTES.ORG_ADMIN.DASHBOARD);
  expect(screen.queryByRole('link', { name: /syllabus/i })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Dashboard content' })).toBeInTheDocument();
});
it('accepts direct navigation and a fresh router mount at the syllabus URL', () => {
  const view = mount(ROUTES.ORG_ADMIN.SYLLABUS);
  expect(screen.getByRole('heading', { name: 'Syllabus content' })).toBeInTheDocument();
  view.unmount();
  mount(ROUTES.ORG_ADMIN.SYLLABUS);
  expect(screen.getByRole('heading', { name: 'Syllabus content' })).toBeInTheDocument();
});
it('retains the organization role restriction', async () => {
  mocks.role = 'employee';
  mount(ROUTES.ORG_ADMIN.SYLLABUS);
  expect(await screen.findByRole('heading', { name: 'Employee dashboard' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Syllabus content' })).not.toBeInTheDocument();
});
it('hides syllabus navigation without its permission', () => {
  mocks.permitted = false;
  mount(ROUTES.ORG_ADMIN.DASHBOARD);
  expect(screen.queryByRole('link', { name: 'Syllabus Assignments' })).not.toBeInTheDocument();
});
