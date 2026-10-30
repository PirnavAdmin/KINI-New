import { beforeEach, expect, it, vi } from 'vitest';
import { resolveStudentClasses, studentDashboardClasses } from '@features/student/utils/resolveStudentClasses';
import { liveClassService } from '@features/live-classes/services/liveClassService';
import { dashboardApi } from '@shared/services/apiServices';
import { buildStudentClassScope, partitionClassesByScope } from '@features/student/utils/studentClassAccess';

vi.mock('@features/live-classes/services/liveClassService', () => ({ liveClassService: { getById: vi.fn(), dashboard: vi.fn() } }));
vi.mock('@shared/services/apiServices', () => ({ dashboardApi: { studentDashboard: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());
it('extracts nested class records from status-keyed dashboards', () => {
  const record = { liveClassId: 5, classTitle: 'Python Oops Concept', courseId: 1, batchId: 1 };
  expect(studentDashboardClasses({ data: { upcoming: [{ liveClass: record }] } })).toEqual([record]);
  expect(studentDashboardClasses({ data: { completed: [{ id: 8, title: 'Past class', scheduledDate: '2026-10-13', courseId: 1, batchId: 1 }] } })).toHaveLength(1);
});
it('resolves new sessions without attendance and only shows the enrolled batch', async () => {
  dashboardApi.studentDashboard.mockResolvedValue({ upcomingClasses: [10, 11].map(id => ({ liveClassId: id, courseId: 5, batchId: id === 10 ? 3 : 99, scheduledDate: '2026-10-22', startTime: '11:00:00', endTime: '11:30:00', classTitle: 'Control Flow and Data Types' })) });
  const rows = await resolveStudentClasses([{ liveClassId: 10 }, { liveClassId: 11 }]);
  const scope = buildStudentClassScope({ enrollments: [{ courseId: 5, batchId: 3 }] });
  const result = partitionClassesByScope(rows, scope);
  expect(result.allowed.map(item => item.id)).toEqual([10]);
  expect(result.allowed[0].title).toBe('Control Flow and Data Types');
  expect(result.blocked.map(item => item.id)).toEqual([11]);
  expect(liveClassService.getById).not.toHaveBeenCalled();
});
it('merges duplicate list rows before filtering so a sparse row cannot hide enrollment IDs', async () => {
  const rows = await resolveStudentClasses([{ id: 10, courseId: 5, batchId: 3 }, { id: 10, courseId: null }]);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ courseId: 5, batchId: 3 });
  expect(liveClassService.getById).not.toHaveBeenCalled();
});
it('keeps unknown classes blocked when details cannot be fetched', async () => {
  dashboardApi.studentDashboard.mockRejectedValue(new Error('Forbidden'));
  const rows = await resolveStudentClasses([{ id: 10 }]);
  const scope = buildStudentClassScope({ enrollments: [{ courseId: 5, batchId: 3 }] });
  expect(partitionClassesByScope(rows, scope).allowed).toEqual([]);
});

it('loads new student-feed sessions even when the general class list is empty', async () => {
  dashboardApi.studentDashboard.mockResolvedValue({ upcomingClasses: [{ liveClassId: 12, courseId: 5, batchId: 3, classTitle: 'New Python session' }] });
  const rows = await resolveStudentClasses([]);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ id: 12, title: 'New Python session', courseId: 5, batchId: 3 });
});

it('integrates the live-class dashboard and retains batch IDs across nested dashboard lists', async () => {
  liveClassService.dashboard.mockResolvedValue({ data: { upcomingLiveClasses: { items: [
    { liveClassId: 25, courseId: 5, batchId: 3, classTitle: 'Python Oops', scheduledDate: '2026-10-22', startTime: '12:30:00', endTime: '13:10:00' },
  ] } } });
  dashboardApi.studentDashboard.mockRejectedValue(new Error('Unavailable'));
  const rows = await resolveStudentClasses([{ liveClassId: 25, classTitle: 'Python Oops' }]);
  expect(liveClassService.dashboard).toHaveBeenCalledOnce();
  const scope = buildStudentClassScope({ enrollments: [{ courseId: 5, batchId: 3 }] });
  expect(partitionClassesByScope(rows, scope).allowed).toHaveLength(1);
  expect(rows[0]).toMatchObject({ id: 25, title: 'Python Oops', batchId: 3, courseId: 5 });
});

it('preserves the supplied single-class response and shows it for course 1 batch 1 only', async () => {
  liveClassService.dashboard.mockResolvedValue({ success: true, data: {
    liveClassId: 5, classTitle: 'Python Oops Concept', description: null,
    courseId: 1, courseName: 'python', batchId: 1, batchName: 'python 1',
    mentorId: 1, mentorName: 'Lakshmilahari Gandikota',
    scheduledDate: '2026-10-22T00:00:00', startTime: '12:30:00', endTime: '13:10:00',
    meetingPlatform: 'Jitsi', status: 'Scheduled', attendanceCount: 0,
  } });
  const rows = await resolveStudentClasses([]);
  const enrolled = buildStudentClassScope({ enrollments: [{ courseId: 1, batchId: 1 }] });
  expect(partitionClassesByScope(rows, enrolled).allowed).toHaveLength(1);
  expect(rows[0]).toMatchObject({ id: 5, title: 'Python Oops Concept', courseId: 1, batchId: 1 });
  const otherBatch = buildStudentClassScope({ enrollments: [{ courseId: 1, batchId: 2 }] });
  expect(partitionClassesByScope(rows, otherBatch).allowed).toHaveLength(0);
});
