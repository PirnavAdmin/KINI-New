// The generic getPayload helper unwraps `results`, which would discard this
// endpoint's student identity and summary. Unwrap transport envelopes only.
const envelope = response => response?.data?.data ?? response?.data ?? response
const numeric = value => typeof value === 'number' && Number.isFinite(value) ? value : null
export const displayValue = value => value == null || value === '' ? '—' : String(value)
export const performanceSummaryFields = [
  ['totalAssessmentsAssigned', 'Total Assigned'], ['assessmentsTaken', 'Assessments Taken'],
  ['totalAttempts', 'Total Attempts'], ['completedAttempts', 'Completed'], ['inProgressAttempts', 'In Progress'],
  ['passedAssessments', 'Passed'], ['failedAssessments', 'Failed'], ['averagePercentage', 'Average Percentage'],
]
export function resultState(result, status) {
  const key = String(result ?? '').trim().toLowerCase()
  if (['pass', 'passed'].includes(key)) return 'Pass'
  if (['fail', 'failed'].includes(key)) return 'Fail'
  const state = String(status ?? '').trim().toLowerCase().replace(/[ _-]/g, '')
  return ({ pass: 'Pass', passed: 'Pass', fail: 'Fail', failed: 'Fail', pendingevaluation: 'Pending evaluation', submitted: 'Submitted', unavailable: 'Unavailable', inprogress: 'In progress', absent: 'Absent' })[state] ?? (status || 'Unavailable')
}
export function scoreDistribution(results) {
  const counts = [0, 0, 0, 0, 0]
  results.forEach(row => {
    const value = numeric(row.percentage)
    if (value == null || value < 0 || value > 100) return
    counts[value <= 20 ? 0 : value <= 40 ? 1 : value <= 60 ? 2 : value <= 80 ? 3 : 4]++
  })
  return ['0–20', '21–40', '41–60', '61–80', '81–100'].map((label, index) => ({ label, count: counts[index] }))
}
export function normalizeAssessmentStudentResults(response, assessmentId) {
  const value = envelope(response)
  if (!value || String(value.assessmentId) !== String(assessmentId) || !Array.isArray(value.students)) throw new Error('The results response does not match the selected assessment contract.')
  for (const key of ['totalStudents', 'pageNumber', 'pageSize', 'totalPages']) if (!Number.isInteger(value[key]) || value[key] < (['pageNumber', 'pageSize'].includes(key) ? 1 : 0)) throw new Error('The results response has invalid pagination.')
  return { ...value, students: value.students.map(row => ({
    ...row, id: row.studentId, name: row.studentName ?? '—', email: row.email ?? '—', at: row.attemptedAt,
    score: numeric(row.score), percentage: numeric(row.percentage), attempts: numeric(row.attempts),
    state: resultState(row.result, row.status),
  })) }
}
export function normalizeStudentPerformance(response, studentId) {
  const value = envelope(response)
  if (!value || String(value.studentId) !== String(studentId) || !Array.isArray(value.results)) throw new Error('The performance response does not match the selected student contract.')
  return {
    student: { id: value.studentId, name: value.studentName, email: value.email, profilePhotoUrl: value.profilePhotoUrl, courseName: value.courseName, batchName: value.batchName },
    summary: Object.fromEntries(performanceSummaryFields.map(([key]) => [key, numeric(value[key])])),
    results: value.results.map(row => ({ ...row, score: numeric(row.score), totalMarks: numeric(row.totalMarks), percentage: numeric(row.percentage), state: resultState(row.result, row.status) })),
  }
}
