import apiClient from '@shared/services/apiClient'
import { getListPayload, getPayload } from '@shared/services/apiServices'
import { API_ENDPOINTS } from '@/api/endpoints'

const ENTITY_ENDPOINTS = Object.fromEntries(
  ['students', 'mentors', 'employees', 'users'].map((entity) => [entity, API_ENDPOINTS.recycleBin.list(entity)]),
)

const getEndpoint = (entity) => ENTITY_ENDPOINTS[entity] || ENTITY_ENDPOINTS.students

export const recycleBinService = {
  getEndpoint,
  list: (entity) => apiClient.get(getEndpoint(entity)).then(getListPayload),
  restore: (entity, id) => apiClient.put(API_ENDPOINTS.recycleBin.restore(entity, id)).then(getPayload),
  permanentDelete: (entity, id) => apiClient.delete(API_ENDPOINTS.recycleBin.permanent(entity, id)).then(getPayload),
}

export default recycleBinService
