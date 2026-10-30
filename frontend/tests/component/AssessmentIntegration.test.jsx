import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import service, { toAssessmentScheduleTimestamp, toQuestionPayload } from '@/services/assessmentService';
import { toAssessmentPayload } from '@shared/services/apiServices';
import apiClient from '@shared/services/apiClient';
import CreateAssessment from '@/pages/assessments/CreateAssessment';

vi.mock('@shared/services/apiClient', () => ({ default: {
  get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(),
} }));

beforeEach(() => {
  vi.clearAllMocks(); cleanup();
  HTMLElement.prototype.scrollTo = vi.fn();
});

describe('Assessment API integration', () => {
  it.each([
    ['09:30 AM', '2026-09-11T09:30'],
    ['02:15 PM', '2026-09-11T14:15'],
    ['07:45 PM', '2026-09-11T19:45'],
    ['midnight', '2026-09-11T00:00'],
    ['noon', '2026-09-11T12:00'],
  ])('serializes %s as the selected local schedule with an explicit offset', (_label, localDateTime) => {
    const value = toAssessmentScheduleTimestamp(localDateTime);
    const date = new Date(value);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(11);
    expect(date.getHours()).toBe(Number(localDateTime.slice(11, 13)));
    expect(date.getMinutes()).toBe(Number(localDateTime.slice(14, 16)));
    expect(value).toMatch(/[+-]\d{2}:\d{2}$/);
  });

  it('rejects invalid or missing assessment schedule values', () => {
    expect(() => toAssessmentScheduleTimestamp('')).toThrow('valid assessment date and time');
    expect(() => toAssessmentScheduleTimestamp('2026-02-30T09:30')).toThrow('valid assessment date and time');
  });

  it('uses the exact assessment fields and numeric IDs', async () => {
    const input = { title: 'Quiz', description: 'Practice', courseId: '17', batchId: '29', totalMarks: '10', passingMarks: '5', durationMinutes: '20', assessmentType: 'Quiz', startDate: '2026-09-11T10:00:00Z', endDate: '2026-09-11T11:00:00Z', status: 'Draft', courseName: 'ignored' };
    const expected = { title: 'Quiz', description: 'Practice', courseId: 17, batchId: 29, totalMarks: 10, passingMarks: 5, durationMinutes: 20, assessmentType: 'Quiz', startDate: input.startDate, endDate: input.endDate };
    expect(toAssessmentPayload(input)).toEqual(expected);
    apiClient.post.mockResolvedValue({ data: { assessmentId: 31 } });
    await service.createAssessment(input);
    expect(apiClient.post).toHaveBeenCalledWith('/api/Assessment', expected);
    apiClient.put.mockResolvedValue({ data: {} });
    await service.updateAssessment(31, input);
    expect(apiClient.put).toHaveBeenCalledWith('/api/Assessment/31', expected);
  });

  it.each([
    ['getAssessments', [], 'get', '/api/Assessment'],
    ['getAssessmentById', [31], 'get', '/api/Assessment/31'],
    ['deleteAssessment', [31], 'delete', '/api/Assessment/31'],
    ['publishAssessment', [31], 'post', '/api/Assessment/31/publish'],
    ['getQuestions', [31], 'get', '/api/AssessmentQuestion/assessment/31'],
    ['getQuestion', [7], 'get', '/api/AssessmentQuestion/7'],
    ['createQuestion', [{ assessmentId: 31 }], 'post', '/api/AssessmentQuestion'],
    ['updateQuestion', [7, { assessmentId: 31 }], 'put', '/api/AssessmentQuestion/7'],
    ['deleteQuestion', [7], 'delete', '/api/AssessmentQuestion/7'],
    ['getAvailableAssessments', [], 'get', '/api/StudentAssessment/available'],
    ['startAttempt', [{ assessmentId: 31 }], 'post', '/api/StudentAssessment/start'],
    ['getAttempt', [53], 'get', '/api/StudentAssessment/53'],
    ['submitAttempt', [{ studentAssessmentId: 53, answers: [{ questionId: 7, selectedOptionId: 81 }] }], 'post', '/api/StudentAssessment/submit'],
    ['getResult', [53], 'get', '/api/StudentAssessment/result/53'],
  ])('%s uses its documented method and path', async (method, args, verb, path) => {
    apiClient[verb].mockResolvedValue({ data: { id: 53 } });
    await service[method](...args);
    const payload = args.find((arg) => typeof arg === 'object');
    expect(apiClient[verb]).toHaveBeenCalledWith(...(payload ? [path, payload] : [path]));
  });

  it('maps difficulty, order, answers and True/False options', () => {
    expect(toQuestionPayload('31', { text: 'True?', type: 'TrueFalse', difficulty: 'Easy', marks: '2', answer: 'False' }, 3)).toEqual({ assessmentId: 31, questionText: 'True?', questionType: 'TrueFalse', difficulty: 'Easy', marks: 2, correctAnswer: 'False', orderNo: 4, options: [{ optionText: 'True', isCorrect: false }, { optionText: 'False', isCorrect: true }] });
    const mcq = toQuestionPayload(31, { text: 'Pick', type: 'MCQ', marks: 3, options: ['A', 'B'], correct: 1 }, 0);
    expect(mcq.correctAnswer).toBe('B');
    expect(mcq.options[1].isCorrect).toBe(true);
  });

  it('normalizes nested lists and rejects empty detail responses', async () => {
    apiClient.get.mockResolvedValue({ data: { success: true, data: [{ assessmentId: 31, title: 'Quiz' }] } });
    expect(await service.getAssessments()).toEqual([expect.objectContaining({ id: 31, title: 'Quiz' })]);
    apiClient.get.mockResolvedValue({ data: '' });
    await expect(service.getAttempt(53)).rejects.toThrow('empty response');
  });

  it.each([400, 401, 403, 404, 500, undefined])('propagates errors without bypassing authentication (%s)', async (status) => {
    const error = status ? { response: { status } } : new Error('Network Error');
    apiClient.post.mockRejectedValue(error);
    await expect(service.publishAssessment(31)).rejects.toBe(error);
  });

  it('edits and reorders existing questions without replacing their backend IDs', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    apiClient.get.mockResolvedValue({ data: { questionId: 7, questionText: 'Original' } });
    const question = { id: 7, apiQuestionId: 7, text: 'Original', type: 'MCQ', difficulty: 'Easy', marks: 5, options: ['A', 'B', 'C', 'D'], correct: 0, answer: 'A' };
    render(<CreateAssessment open onClose={() => {}} onSave={onSave} batches={[{ id: '29', name: 'Batch', courseId: 17 }]} courses={[{ courseId: 17, courseName: 'Course' }]} initialData={{ id: 31, name: 'Quiz', courseId: 17, batchId: '29', start: '2026-09-11T10:00', end: '2026-09-11T11:00', duration: 20, total: 10, pass: 5, questions: [question, { ...question, id: 8, apiQuestionId: 8, text: 'Second' }] }} />);
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getAllByText('Edit', { exact: true })[0]);
    await waitFor(() => expect(screen.getByPlaceholderText('Question text')).toHaveValue('Original'));
    fireEvent.change(screen.getByPlaceholderText('Question text'), { target: { value: 'Revised' } });
    fireEvent.click(screen.getByText('Update question'));
    fireEvent.click(screen.getByLabelText('Move question 1 down'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Save changes'));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].questions.map((q) => [q.apiQuestionId, q.text])).toEqual([[8, 'Second'], [7, 'Revised']]);
  });
});
