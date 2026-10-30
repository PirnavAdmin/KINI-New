import { expect, it } from 'vitest';
import { countUniqueStudents, mentorRosterSummary } from '../../src/pages/trainers/trainerStudents';

it('counts a student shared by two batches once while retaining each batch count', () => {
  const summary = mentorRosterSummary([{ batchId: 1 }, { batchId: 2 }], new Map([
    ['1', { students: [{ studentId: 11 }, { studentId: 12 }] }],
    ['2', { students: [{ studentId: 12 }, { studentId: 13 }] }],
  ]));
  expect(summary.students).toBe(3);
  expect(summary.assignedBatches.map(batch => batch.studentCount)).toEqual([2, 2]);
});

it('does not present partial or failed roster counts as zero or a complete total', () => {
  const summary = mentorRosterSummary([{ batchId: 1 }, { batchId: 2 }], new Map([['1', { students: [{ studentId: 11 }] }]]));
  expect(summary.students).toBeNull();
  expect(summary.assignedBatches[1].studentCount).toBeNull();
});

it('distinguishes genuinely empty rosters from missing student identities', () => {
  expect(countUniqueStudents([])).toBe(0);
  expect(countUniqueStudents([{ name: 'No ID supplied' }])).toBeNull();
  expect(countUniqueStudents([{ studentId: 7 }, { studentId: '7' }])).toBe(1);
});
