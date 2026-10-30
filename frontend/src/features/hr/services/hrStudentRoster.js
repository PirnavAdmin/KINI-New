import { hrField, hrList } from './hrApi'

// Read every page: a summary must never count just the ten visible rows.
async function readHrStudentRoster(api, params, signal) {
  const students = []
  const seen = new Set()
  const pageSize = 100
  for (let page = 1; page <= 10000; page++) {
    const result = await api.list({ ...params, PageNumber: page, PageSize: pageSize }, signal)
    const rows = hrList(result)
    let added = 0
    for (const row of rows) {
      const id = [hrField(row, 'studentId'), hrField(row, 'id')].find(value => value != null && String(value).trim() !== '')
      if (id == null) throw new Error('Student identifier missing')
      if (seen.has(String(id))) continue
      seen.add(String(id))
      students.push(row)
      added++
    }
    const total = hrField(result, 'totalCount', 'totalRecords', 'total')
    const pages = hrField(result, 'totalPages')
    const hasNext = hrField(result, 'hasNextPage', 'hasNext')
    if (total != null && students.length >= Number(total)) return students
    if (pages != null && page >= Number(pages)) {
      if (total != null && students.length < Number(total)) throw new Error('Incomplete student roster')
      return students
    }
    if (hasNext === false || (total == null && pages == null && hasNext !== true && rows.length < pageSize)) return students
    if (!added) throw new Error('Student pagination did not advance')
  }
  throw new Error('Student roster pagination limit exceeded')
}

const searchText = value => String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase()

export async function loadHrStudentRoster(api, params = {}, signal) {
  // Search locally after reading every page: the API's Search field does not
  // consistently include the displayed course, batch and mentor names.
  const { Search, ...filters } = params
  const students = await readHrStudentRoster(api, filters, signal)
  const query = searchText(Search)
  if (!query) return students
  return students.filter(student => {
    const fields = ['fullName', 'studentName', 'name', 'email', 'courseName', 'batchName', 'mentorName', 'assignedMentorName']
      .map(key => hrField(student, key))
    fields.push([hrField(student, 'firstName'), hrField(student, 'lastName')].filter(Boolean).join(' '))
    for (const key of ['course', 'batch', 'mentor']) {
      const related = hrField(student, key)
      fields.push(typeof related === 'string' ? related : hrField(related, `${key}Name`, 'fullName', 'name'))
    }
    return fields.some(value => searchText(value).includes(query))
  })
}

export function summarizeHrStudents(students) {
  const counts = { totalStudents: students.length, activeStudents: 0, pendingStudents: 0, inactiveStudents: 0, completedStudents: 0, otherStudents: 0 }
  for (const student of students) {
    const status = String(hrField(student, 'status') ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
    const category = status === 'active' ? 'activeStudents'
      : ['pending', 'pending approval', 'awaiting approval'].includes(status) ? 'pendingStudents'
      : ['inactive', 'disabled'].includes(status) ? 'inactiveStudents'
      : status === 'completed' ? 'completedStudents' : 'otherStudents'
    counts[category]++
  }
  return counts
}
