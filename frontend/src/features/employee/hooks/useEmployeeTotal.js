import { useEffect, useState } from 'react'
import { hrField, hrRequest } from '@features/hr/services/hrApi'

export default function useEmployeeTotal(revision = 0) {
  const [result, setResult] = useState(null)
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await hrRequest('GET', '/api/hr/employees/summary', { signal: controller.signal })
        const raw = hrField(response?.summary ?? response, 'totalEmployees', 'employeeCount', 'total')
        const count = (typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== '')) ? Number(raw) : NaN
        if (!controller.signal.aborted) setResult({ revision, count: Number.isSafeInteger(count) && count >= 0 ? count : null })
      } catch {
        if (!controller.signal.aborted) setResult({ revision, count: null })
      }
    }
    load()
    return () => controller.abort()
  }, [revision])
  return result?.revision === revision ? { loading: false, count: result.count } : { loading: true, count: null }
}
