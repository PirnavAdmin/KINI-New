import { beforeEach, expect, it, vi } from 'vitest';
import * as api from '../../src/shared/services/mentorService';
import { liveClassService } from '../../src/features/live-classes/services/liveClassService';
import { loadMentorDashboardSources, selectDashboardClasses } from '../../src/features/mentor/services/mentorDashboardData';

vi.mock('../../src/shared/services/mentorService', () => ({
  getMentorDashboard: vi.fn(), getMentorDashboardToday: vi.fn(), getMentorDashboardUpcoming: vi.fn(),
  getMentorDashboardAttendance: vi.fn(), getMentorDashboardCourses: vi.fn(), getMentorDashboardBatches: vi.fn(),
  getMentorDashboardStudents: vi.fn(), getMentorDashboardClasses: vi.fn(),
}));
vi.mock('../../src/shared/services/batchService', () => ({ default: { getMentorBatches: vi.fn().mockResolvedValue([]) } }));
vi.mock('../../src/features/live-classes/services/liveClassService', () => ({ liveClassService: {
  list: vi.fn(), today: vi.fn(), upcoming: vi.fn(),
} }));
beforeEach(() => { vi.clearAllMocks(); Object.values(api).forEach((fn) => fn.mockResolvedValue([])); });

it('loads real user-scoped data without a mentor ID or an invented ID', async () => {
  api.getMentorDashboardCourses.mockResolvedValue([{ courseId: 8, name: 'Node.js' }]);
  const result = await loadMentorDashboardSources({ mentorId: null, employeeId: 9 });
  expect(result.widgets[0].value[0].name).toBe('Node.js');
  expect(api.getMentorDashboard).not.toHaveBeenCalled();
  expect(liveClassService.list).not.toHaveBeenCalled();
});
it('shares concurrent requests and allows a later Retry', async () => {
  const identity = { mentorId: 27, employeeId: 9 };
  await Promise.all([loadMentorDashboardSources(identity), loadMentorDashboardSources(identity)]);
  expect(api.getMentorDashboardCourses).toHaveBeenCalledTimes(1);
  expect(api.getMentorDashboard).toHaveBeenCalledWith(27);
  await loadMentorDashboardSources(identity);
  expect(api.getMentorDashboardCourses).toHaveBeenCalledTimes(2);
});
it('uses only scoped compatibility calls when the class widget fails', async () => {
  api.getMentorDashboardClasses.mockRejectedValue({ response: { status: 500 } });
  await loadMentorDashboardSources({ mentorId: 27, employeeId: 9 });
  expect(liveClassService.list).toHaveBeenCalledExactlyOnceWith({ mentorId: 27, page: 1, pageSize: 1000 });
});
it('does not confuse all classes with today or include past upcoming classes', () => {
  const rows = [
    { id: 1, date: '2026-09-15', status: 'Scheduled' },
    { id: 2, date: '2026-09-16', status: 'Scheduled' },
    { id: 3, date: '2026-09-14', status: 'Scheduled' },
    { id: 4, date: '2026-09-15', status: 'Cancelled' },
  ];
  const result = selectDashboardClasses(rows, new Date(2026, 8, 15, 12));
  expect(result.today.map((row) => row.id)).toEqual([1]);
  expect(result.upcoming.map((row) => row.id)).toEqual([1, 2]);
});
