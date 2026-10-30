/**
 * Alumni API Service
 *
 * TODO: Replace mock data with actual API calls when the backend is ready.
 * This service provides a clean abstraction layer for all alumni data fetching.
 * Migrate to React Query or SWR for production caching and deduplication.
 */

// Axios-ready — import and configure base URL when backend is available
// Route real alumni endpoints through @shared/services/apiClient when available.

const BASE_DELAY = 300; // Simulated network delay (ms)

// ─── Simulated API helpers ─────────────────────────────────────────────────────

function simulateDelay(ms = BASE_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function simulateResponse(data, success = true) {
  return { success, data, error: null };
}

function simulateError(message = "An error occurred") {
  return { success: false, data: null, error: message };
}

// ─── API Endpoints ─────────────────────────────────────────────────────────────

/**
 * Fetch featured alumni list
 * GET /api/alumni?page=1&limit=10
 * @param {Object} params - { page, limit, search, filters }
 */
export async function getAlumni(params = {}) {
  try {
    await simulateDelay();
    const data = (await import("../constants/alumniData")).FEATURED_ALUMNI;
    // TODO: Replace with actual API call
    // const { data } = await api.get('/alumni', { params });
    // return simulateResponse(data);
    return simulateResponse(data);
  } catch (err) {
    return simulateError(err.message);
  }
}

/**
 * Fetch alumni statistics
 * GET /api/alumni/stats
 */
export async function getAlumniStats() {
  try {
    await simulateDelay();
    const data = (await import("../constants/alumniData")).ALUMNI_STATS;
    // TODO: Replace with actual API call
    // const { data } = await api.get('/alumni/stats');
    return simulateResponse(data);
  } catch (err) {
    return simulateError(err.message);
  }
}

/**
 * Fetch upcoming events
 * GET /api/alumni/events?page=1&limit=10
 * @param {Object} params - { page, limit, category }
 */
export async function getEvents(params = {}) {
  try {
    await simulateDelay();
    const data = (await import("../constants/alumniData")).UPCOMING_EVENTS;
    // TODO: Replace with actual API call
      return simulateResponse(data);
  } catch (err) {
    return simulateError(err.message);
  }
}

/**
 * Fetch featured mentors
 * GET /api/alumni/mentors?page=1&limit=10
 * @param {Object} params - { page, limit, skills }
 */
export async function getMentors(params = {}) {
  try {
    await simulateDelay();
    const data = (await import("../constants/alumniData")).FEATURED_MENTORS;
    // TODO: Replace with actual API call
    return simulateResponse(data);
  } catch (err) {
    return simulateError(err.message);
  }
}

/**
 * Fetch job listings shared by alumni
 * GET /api/alumni/jobs?page=1&limit=10
 * @param {Object} params - { page, limit, remote, location }
 */
export async function getJobs(params = {}) {
  try {
    await simulateDelay();
    const data = (await import("../constants/alumniData")).JOB_LISTINGS;
    // TODO: Replace with actual API call
    return simulateResponse(data);
  } catch (err) {
    return simulateError(err.message);
  }
}

/**
 * Fetch alumni testimonials
 * GET /api/alumni/testimonials
 */
export async function getTestimonials() {
  try {
    await simulateDelay();
    const data = (await import("../constants/alumniData")).TESTIMONIALS;
    // TODO: Replace with actual API call
    return simulateResponse(data);
  } catch (err) {
    return simulateError(err.message);
  }
}

/**
 * Submit alumni profile update
 * PUT /api/alumni/profile
 * @param {Object} profileData
 */
export async function updateProfile(profileData) {
  try {
    await simulateDelay(500);
    // TODO: Replace with actual API call
    // const { data } = await api.put('/alumni/profile', profileData);
    return simulateResponse({ message: "Profile updated successfully" });
  } catch (err) {
    return simulateError(err.message);
  }
}
