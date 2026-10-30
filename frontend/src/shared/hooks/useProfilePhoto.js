import { useEffect, useMemo, useState } from 'react'
import {
  PROFILE_PHOTO_CHANGED_EVENT,
  getCachedProfilePhoto,
  profilePhotoService,
  toProfileId,
} from '@shared/services/profilePhotoService'

/**
 * One person's photo via GET /api/v1/profile/photo/{profileType}/{profileId}.
 * Returns { photoUrl, loading }. photoUrl is '' when there is no photo or the
 * request failed, so callers always have an initials fallback to show.
 */
export function useProfilePhoto(profileType, profileId, { enabled = true } = {}) {
  const id = toProfileId(profileId)
  const key = enabled && profileType && id ? `${profileType}:${id}` : null
  const [result, setResult] = useState({ key: null, photoUrl: '' })

  useEffect(() => {
    if (!key || getCachedProfilePhoto(profileType, id) !== undefined) return undefined
    let cancelled = false
    profilePhotoService.getPhoto(profileType, id)
      .then((photoUrl) => { if (!cancelled) setResult({ key, photoUrl }) })
      .catch(() => { if (!cancelled) setResult({ key, photoUrl: '' }) })
    return () => { cancelled = true }
  }, [key, profileType, id])

  if (!key) return { photoUrl: '', loading: false }
  const cached = getCachedProfilePhoto(profileType, id)
  if (cached !== undefined) return { photoUrl: cached, loading: false }
  if (result.key === key) return { photoUrl: result.photoUrl, loading: false }
  return { photoUrl: '', loading: true }
}

/**
 * Photos for a list of people of one type in a single
 * GET /api/v1/profile/photo/batch request. Returns { photos, loading } where
 * photos is { [profileId]: src }. Ids that aren't positive integers are skipped.
 */
export function useProfilePhotos(profileType, profileIds, { enabled = true } = {}) {
  const idsKey = useMemo(
    () => [...new Set((profileIds || []).map(toProfileId).filter(Boolean))].sort((a, b) => a - b).join(','),
    [profileIds],
  )
  const key = enabled && profileType && idsKey ? `${profileType}|${idsKey}` : null
  const [result, setResult] = useState({ key: null, photos: {} })

  useEffect(() => {
    if (!key) return undefined
    let cancelled = false
    profilePhotoService.getPhotosBatch(profileType, idsKey.split(','))
      .then((photos) => { if (!cancelled) setResult({ key, photos }) })
      .catch(() => { if (!cancelled) setResult({ key, photos: {} }) })
    return () => { cancelled = true }
  }, [key, profileType, idsKey])

  if (!key) return { photos: {}, loading: false }
  if (result.key === key) return { photos: result.photos, loading: false }
  // While a new id set loads, keep showing whatever is already cached.
  const photos = {}
  idsKey.split(',').forEach((id) => {
    const cached = getCachedProfilePhoto(profileType, id)
    if (cached) photos[id] = cached
  })
  return { photos, loading: true }
}

/**
 * Photos for a mixed list in ONE GET /api/v1/profile/photo/batch request.
 * ids: { employeeIds, studentIds, mentorIds }. Returns { photos, loading } with
 * photos keyed `${type}-${id}` ('employee-9', 'mentor-2'); '' means no photo.
 */
export function useProfilePhotoLookup({ employeeIds = [], studentIds = [], mentorIds = [] } = {}) {
  const clean = (list) => [...new Set(list.map(toProfileId).filter(Boolean))].sort((a, b) => a - b).join(',')
  const key = [clean(employeeIds), clean(studentIds), clean(mentorIds)].join('|')
  const [result, setResult] = useState({ key: null, photos: {} })

  useEffect(() => {
    if (key === '||') return undefined
    let cancelled = false
    const [employees, students, mentors] = key.split('|').map((part) => (part ? part.split(',') : []))
    profilePhotoService.getProfilePhotosBatch({ employeeIds: employees, studentIds: students, mentorIds: mentors })
      .then((photos) => { if (!cancelled) setResult({ key, photos }) })
      .catch(() => { if (!cancelled) setResult({ key, photos: {} }) })
    return () => { cancelled = true }
  }, [key])

  return result.key === key ? { photos: result.photos, loading: false } : { photos: {}, loading: key !== '||' }
}

/**
 * The signed-in user's own photo via GET /api/v1/profile/photo, kept in step
 * with uploads/removals. '' when there is none or `enabled` is false (roles
 * without a photo profile, e.g. OrganizationAdmin).
 */
export function useCurrentUserPhoto({ enabled = true } = {}) {
  const [photoUrl, setPhotoUrl] = useState('')

  useEffect(() => {
    if (!enabled) return undefined
    let active = true
    const load = () => profilePhotoService.getOwnPhoto()
      .then((url) => { if (active) setPhotoUrl(url) })
      .catch(() => {})
    load()
    const handleChanged = (event) => {
      const { photoUrl: url, removed } = event.detail || {}
      if (removed) setPhotoUrl('')
      else if (url) setPhotoUrl(url)
      else load()
    }
    window.addEventListener(PROFILE_PHOTO_CHANGED_EVENT, handleChanged)
    return () => {
      active = false
      window.removeEventListener(PROFILE_PHOTO_CHANGED_EVENT, handleChanged)
    }
  }, [enabled])

  return enabled ? photoUrl : ''
}

export default useProfilePhoto
