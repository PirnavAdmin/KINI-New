import { useCallback, useEffect, useState } from 'react'
import { studentsApi } from '@/api/students'

export default function useStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // silent: refresh in place (no loading state), e.g. after an approval, so
  // the open review UI stays mounted.
  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const response = await studentsApi.list()
      setStudents(response.data)
      return response.data
    } catch (requestError) {
      if (silent) throw requestError
      setError(studentsApi.getErrorMessage(requestError))
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    queueMicrotask(() => { if (active) load() })
    return () => { active = false }
  }, [load])

  const removeStudent = async (id) => {
    await studentsApi.remove(id)
    setStudents((items) => items.filter((item) => item.id !== id))
  }

  const saveStudent = async (student, id) => {
    const response = id ? await studentsApi.update(id, student) : await studentsApi.create(student)
    if (response.data?.id != null) {
      setStudents((items) => id
        ? items.map((item) => String(item.id) === String(id) ? response.data : item)
        : [response.data, ...items.filter((item) => String(item.id) !== String(response.data.id))])
    }
    await load()
    window.dispatchEvent(new CustomEvent('kini:student-updated', { detail: { studentId: id ?? response.data?.id } }))
    return response.data
  }

  const deactivateStudent = async (studentOrId) => {
    const student = typeof studentOrId === 'object'
      ? studentOrId
      : students.find((item) => String(item.id) === String(studentOrId))
    const id = student?.id ?? studentOrId
    const response = await studentsApi.deactivate(id, student)
    await load()
    window.dispatchEvent(new CustomEvent('kini:student-updated', { detail: { studentId: id } }))
    return response.data
  }

  const getStudentById = async (id) => {
    const response = await studentsApi.getById(id)
    setStudents((items) => items.map((item) => item.id === id ? response.data : item))
    return response.data
  }

  // The list is reloaded from the backend rather than patched locally, so the
  // status shown is the one the backend actually stored.
  const approveStudent = async (id) => {
    const result = await studentsApi.approve(id)
    window.dispatchEvent(new CustomEvent('kini:student-updated', { detail: { studentId: id } }))
    try {
      await load({ silent: true })
      return { ...result, reloadError: null }
    } catch (reloadError) {
      // The approval itself succeeded; only the refreshed list is missing.
      return { ...result, reloadError: studentsApi.getErrorMessage(reloadError) }
    }
  }

  // Fresh roster from the backend without the page-level loading state.
  const refreshStudents = () => load({ silent: true })

  const rejectStudent = async (id, payload) => {
    await studentsApi.reject(id, payload)
    setStudents((items) => items.map((item) => item.id === id ? { ...item, status: 'Rejected', active: false } : item))
  }

  const patchStudents = (patches) => {
    setStudents((items) => items.map((item) => ({ ...item, ...(patches[item.id] || {}) })))
  }

  return { students, loading, error, retry: load, removeStudent, saveStudent, getStudentById, deactivateStudent, approveStudent, rejectStudent, refreshStudents, patchStudents }
}
