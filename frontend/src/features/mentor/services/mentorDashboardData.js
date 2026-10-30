import {
  getMentorDashboard, getMentorDashboardToday, getMentorDashboardUpcoming,
  getMentorDashboardAttendance, getMentorDashboardCourses, getMentorDashboardBatches,
  getMentorDashboardStudents, getMentorDashboardClasses,
} from '@shared/services/mentorService';
import batchService from '@shared/services/batchService';
import { liveClassService } from '@features/live-classes/services/liveClassService';

const skipped = () => ({ status: 'skipped' });
const present = (value) => value != null && String(value).trim() !== '';
const requests = new Map();

// Widgets resolve the calling mentor from authentication. Only the explicit
// /{mentorId} endpoints require a mentor ID; an employee ID cannot replace it.
export const loadMentorDashboardSources = ({ mentorId, employeeId }) => {
  const session = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
  const key = JSON.stringify([session, mentorId, employeeId]);
  if (requests.has(key)) return requests.get(key);
  const request = (async () => {
    const [canonical, widgets] = await Promise.all([
      present(mentorId) ? Promise.allSettled([
        getMentorDashboard(mentorId), getMentorDashboardToday(mentorId),
        getMentorDashboardUpcoming(mentorId), getMentorDashboardAttendance(mentorId),
      ]) : Promise.resolve(Array.from({ length: 4 }, skipped)),
      Promise.allSettled([
        getMentorDashboardCourses(), getMentorDashboardBatches(),
        getMentorDashboardStudents(), getMentorDashboardClasses(),
      ]),
    ]);
    const [live, assignedBatches] = await Promise.all([
      // Use scoped compatibility endpoints only when the class widget fails.
      // Never fall back to an unfiltered organization-wide class list.
      widgets[3].status === 'rejected' && present(mentorId) ? Promise.allSettled([
        liveClassService.list({ mentorId, page: 1, pageSize: 1000 }),
        liveClassService.today({ mentorId }), liveClassService.upcoming({ mentorId }),
      ]) : Promise.resolve(Array.from({ length: 3 }, skipped)),
      widgets[1].status === 'rejected' && present(employeeId)
        ? Promise.allSettled([batchService.getMentorBatches(employeeId)])
        : Promise.resolve([skipped()]),
    ]);
    return { canonical, widgets, live, assignedBatches };
  })();
  requests.set(key, request);
  request.then(() => requests.delete(key), () => requests.delete(key));
  return request;
};

export const classDate = (item) => String(item.classDate ?? item.scheduledDate ?? item.date
  ?? item.dateKey ?? item.startDateTime ?? '').slice(0, 10);

export const selectDashboardClasses = (classes, now = new Date()) => {
  const todayKey = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const active = classes.filter((item) => !['cancelled', 'canceled'].includes(String(item.status ?? item.classStatus ?? '').toLowerCase()));
  return {
    today: active.filter((item) => classDate(item) === todayKey),
    upcoming: active.filter((item) => {
      const state = String(item.status ?? item.classStatus ?? '').toLowerCase();
      const date = classDate(item);
      return ['scheduled', 'upcoming'].includes(state) && (!date || date >= todayKey);
    }),
  };
};
