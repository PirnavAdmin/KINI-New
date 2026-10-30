import { dashboardApi } from '@shared/services/apiServices';
import { liveClassService } from '@features/live-classes/services/liveClassService';
import { normalizeLiveClassList } from '@features/live-classes/utils/liveClassMappers';

export function studentDashboardClasses(dashboard) {
  if (Array.isArray(dashboard)) return dashboard.flatMap(studentDashboardClasses);
  if (!dashboard || typeof dashboard !== 'object') return [];
  if (dashboard.liveClassId != null && dashboard.classTitle != null) return [dashboard];
  if ((dashboard.id != null || dashboard.classId != null) && (dashboard.title || dashboard.classTitle) && (dashboard.scheduledDate || dashboard.startAt || dashboard.startDate)) return [dashboard];
  return ['data', 'result', 'dashboard', 'classes', 'liveClasses', 'upcomingClasses',
    'upcomingLiveClasses', 'todayClasses', 'todayLiveClasses', 'scheduledClasses',
    'completedClasses', 'recentClasses', 'upcoming', 'today', 'live', 'completed', 'liveClass', 'items', 'records']
    .flatMap(key => studentDashboardClasses(dashboard[key]));
}

// Student tokens cannot read GET /live-classes/{id}. Resolve sparse list rows
// from the token-scoped dashboard, without retrying the forbidden admin route.
export async function resolveStudentClasses(rows) {
  const unique = new Map();
  for (const row of rows ?? []) {
    const id = row.liveClassId ?? row.classId ?? row.id;
    if (id == null) continue;
    const previous = unique.get(String(id)) ?? {};
    const present = Object.fromEntries(Object.entries(row).filter(([, value]) => value != null && value !== ''));
    unique.set(String(id), { ...previous, ...present });
  }
  // Always read the student's feed: it may contain new sessions missing from
  // the general lists, including when those lists are empty or forbidden.
  const results = await Promise.allSettled([
    liveClassService.dashboard(),
    dashboardApi.studentDashboard(),
  ]);
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const row of studentDashboardClasses(result.value)) {
      const id = row.liveClassId ?? row.classId ?? row.id;
      if (id == null) continue;
      const present = Object.fromEntries(Object.entries(row).filter(([, value]) => value != null && value !== ''));
      unique.set(String(id), { ...unique.get(String(id)), ...present });
    }
  }
  return normalizeLiveClassList([...unique.values()]);
}
