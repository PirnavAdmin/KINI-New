const FALLBACK_LABELS = {
  students: 'Student',
  mentors: 'Mentor',
  employees: 'Employee',
  users: 'User',
}

const toText = (value) => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const getNestedValue = (source, path) => {
  if (!source || typeof source !== 'object') return undefined
  return path.split('.').reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), source)
}

const pickFirst = (source, paths = []) => {
  for (const path of paths) {
    const value = getNestedValue(source, path)
    if (value !== undefined && value !== null && String(value).trim() !== '') return value
  }
  return undefined
}

const toTimestamp = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

const formatDeletedDate = (value) => {
  if (!value) return 'Not Available'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return toText(value) || 'Not Available'

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)

  const formattedTime = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  return `${formattedDate} • ${formattedTime}`
}

const getInitials = (name) => {
  const value = toText(name)
  if (!value) return 'RB'

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'RB'
}

const joinName = (...parts) => parts.map(toText).filter(Boolean).join(' ').trim()

export const normalizeRecycleBinItem = (entity, item = {}) => {
  const id = item.id ?? item.studentId ?? item.mentorId ?? item.employeeId ?? item.userId
  const name = joinName(
    item.fullName,
    item.name,
    item.displayName,
    item.firstName,
    item.lastName,
  ) || item.studentName || item.mentorName || item.employeeName || item.userName || item.email || '-'

  const email = item.email ?? item.emailAddress ?? item.primaryEmail ?? '-'
  const role = item.role ?? item.roleName ?? item.designation ?? item.jobTitle ?? FALLBACK_LABELS[entity] ?? '-'
  const department = item.departmentName
    ?? item.department?.name
    ?? item.department
    ?? item.teamName
    ?? item.branchName
    ?? item.organizationName
    ?? '-'

  const deletedAt = pickFirst(item, [
    'deletedAt',
    'deletedDate',
    'deletedOn',
    'deletedDateTime',
    'deletedTimestamp',
    'removedAt',
    'removedDate',
    'archivedAt',
    'archivedOn',
    'metadata.deletedAt',
    'metadata.deletedDate',
    'metadata.deletedOn',
    'metadata.deletedDateTime',
    'metadata.removedAt',
    'audit.deletedAt',
    'audit.deletedDate',
    'audit.deletedOn',
    'deletedInfo.deletedAt',
    'deletedInfo.deletedDate',
    'deletedInfo.deletedOn',
  ])

  const deletedAtTimestamp = toTimestamp(deletedAt)
  const deletedDate = formatDeletedDate(deletedAt)

  const deletedBy = item.deletedByName
    ?? item.deletedBy
    ?? item.removedByName
    ?? item.removedBy
    ?? item.updatedBy
    ?? '-'

  const avatar = item.avatarUrl
    ?? item.avatar
    ?? item.profileImage
    ?? item.photoUrl
    ?? item.imageUrl
    ?? ''

  const searchIndex = [name, email, role].join(' ').toLowerCase()

  return {
    ...item,
    id,
    entity,
    entityLabel: FALLBACK_LABELS[entity] || 'Record',
    name,
    email,
    role,
    department,
    deletedAt,
    deletedAtTimestamp,
    deletedDate,
    deletedBy,
    status: toText(item.status) || 'Deleted',
    avatar,
    initials: getInitials(name),
    searchIndex,
  }
}

export const normalizeRecycleBinList = (entity, list = []) => (
  Array.isArray(list)
    ? list
      .map((item) => normalizeRecycleBinItem(entity, item))
      .sort((a, b) => {
        const aTime = Number(a.deletedAtTimestamp ?? -1)
        const bTime = Number(b.deletedAtTimestamp ?? -1)
        if (aTime === bTime) return String(a.name || '').localeCompare(String(b.name || ''))
        if (aTime === -1) return 1
        if (bTime === -1) return -1
        return bTime - aTime
      })
    : []
)

export const RECYCLE_BIN_TABS = ['students', 'mentors', 'employees', 'users']

export const RECYCLE_BIN_TAB_META = {
  students: { label: 'Students' },
  mentors: { label: 'Mentors' },
  employees: { label: 'Employees' },
  users: { label: 'Users' },
}

export const RECYCLE_BIN_STATS = {
  students: { label: 'Deleted Students' },
  mentors: { label: 'Deleted Mentors' },
  employees: { label: 'Deleted Employees' },
  users: { label: 'Deleted Users' },
}
