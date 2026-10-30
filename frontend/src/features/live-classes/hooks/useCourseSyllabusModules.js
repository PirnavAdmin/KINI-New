import { useEffect, useState } from 'react';
import { courseService } from '@/shared/services/courseService';

// Module options for the Schedule Live Class form, from the selected course's
// syllabus: GET /api/v1/organization/courses/{courseId}/syllabus → data.modules.
// (There is no /courses/{courseId}/modules route on this backend.)
//
// The option value is the syllabus moduleId — never moduleNumber. A module
// without a moduleId is left out rather than given an invented one.
const MAX_TITLE_LENGTH = 60;

// Syllabi imported from PDF can store the description glued onto the module
// name ("Node.js FundamentalsIntroduction to Node.js…"). Cut it off when the
// name ends with the description (whitespace ignored, since the import also
// drops spaces at line breaks), then keep the title short for the dropdown.
export const moduleTitleOf = (moduleName, description) => {
  const name = String(moduleName ?? '').trim();
  const desc = String(description ?? '').trim();
  let title = name;
  const squash = (text) => text.replace(/\s+/g, '');
  const nameChars = squash(name);
  const descChars = squash(desc);
  if (descChars.length >= 12 && nameChars.length > descChars.length && nameChars.endsWith(descChars)) {
    // Walk to the character where the description starts in the original name.
    let keep = nameChars.length - descChars.length;
    let cut = 0;
    while (keep > 0 && cut < name.length) {
      if (!/\s/.test(name[cut])) keep -= 1;
      cut += 1;
    }
    title = name.slice(0, cut).trim();
  }
  if (title.length > MAX_TITLE_LENGTH) {
    const short = title.slice(0, MAX_TITLE_LENGTH);
    title = `${short.slice(0, Math.max(short.lastIndexOf(' '), 40)).trim()}…`;
  }
  return title || 'Untitled module';
};

// Batches in which a module is fully completed. Read only from explicit,
// batch-tagged records (module.batchProgress: [{ batchId, isCompleted }]).
// Today's syllabus API sends no such records, so this is empty and no module
// is treated as completed. Course-level, topic-level or per-student progress
// is never used: it cannot say a module is done for a whole batch.
// Verified against the live API (2026-10-25): syllabus modules carry only
// moduleId, moduleNumber, moduleName, description and topics, so no batch is
// tracked yet and the dialog reports completion as unverified.
const progressEntriesOf = (module) => (Array.isArray(module?.batchProgress) ? module.batchProgress : [])
  .filter((entry) => entry?.batchId != null && entry.batchId !== ''
    && (typeof entry.isCompleted === 'boolean' || typeof entry.status === 'string'));
const isCompletedEntry = (entry) => entry.isCompleted === true || String(entry.status ?? '').toLowerCase() === 'completed';
// Batches with an explicit record (completed or not) — completion is known there.
const trackedBatchIdsOf = (module) => progressEntriesOf(module).map((entry) => String(entry.batchId));
const completedBatchIdsOf = (module) => progressEntriesOf(module).filter(isCompletedEntry).map((entry) => String(entry.batchId));

export const toSyllabusModuleOptions = (syllabus) => (Array.isArray(syllabus?.modules) ? syllabus.modules : [])
  .filter((module) => module?.moduleId != null && module.moduleId !== '')
  .map((module, index) => {
    const description = String(module.description ?? '').trim();
    const completedBatchIds = completedBatchIdsOf(module);
    const trackedBatchIds = trackedBatchIdsOf(module);
    return {
      value: String(module.moduleId),
      label: `Module ${module.moduleNumber ?? index + 1} — ${moduleTitleOf(module.moduleName, description)}`,
      // Shown under the dropdown for the selected module, not in the option.
      ...(description ? { description } : {}),
      ...(completedBatchIds.length ? { completedBatchIds } : {}),
      ...(trackedBatchIds.length ? { trackedBatchIds } : {}),
    };
  });

const IDLE = { courseId: '', status: 'idle', options: [], error: '' };

export default function useCourseSyllabusModules(courseId, enabled = true) {
  const [state, setState] = useState(IDLE);
  const key = enabled && courseId ? String(courseId) : '';

  useEffect(() => {
    if (!key) return undefined;
    let active = true;
    // Load this course's modules; a response for a course that is no longer
    // selected is discarded, so options never mix two courses.
    Promise.resolve()
      .then(() => {
        if (active) setState({ courseId: key, status: 'loading', options: [], error: '' });
        return courseService.getSyllabus(key);
      })
      .then((syllabus) => {
        if (active) setState({ courseId: key, status: 'ready', options: toSyllabusModuleOptions(syllabus), error: '' });
      })
      .catch((error) => {
        if (!active) return;
        // The syllabus API answers 404 for a course with no syllabus yet.
        if (error?.response?.status === 404) setState({ courseId: key, status: 'ready', options: [], error: '' });
        else setState({ courseId: key, status: 'error', options: [], error: 'Unable to load syllabus modules for this course.' });
      });
    return () => { active = false; };
  }, [key]);

  // Until the current course's request resolves, report loading with no
  // options — never the previous course's modules.
  if (!key) return IDLE;
  if (state.courseId !== key) return { courseId: key, status: 'loading', options: [], error: '' };
  return state;
}
