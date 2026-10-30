/**
 * Employee CRUD Placeholder Service
 *
 * Provides mock implementations for all employee dashboard CRUD operations.
 * Replace with real API calls when backend becomes available.
 */

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))
const generateId = () => Date.now() + Math.floor(Math.random() * 1000)

export const dashboardService = {
  async refresh() { await delay(); return { success: true } },
  async export() { await delay(); return { success: true, url: '#' } },
}

export const courseService = {
  async list() { await delay(); return [] },
  async get(id) { await delay(); return null },
  async continue(id) { await delay(); return { success: true } },
}

export const liveClassService = {
  async list() { await delay(); return [] },
  async join(id) { await delay(); return { link: 'https://meet.example.com/' + id } },
  async getMeetingLink(id) { await delay(); return { link: 'https://meet.example.com/' + id } },
}

export const coachService = {
  async sendMessage(text) { await delay(); return { reply: 'Great question! Based on your profile...' } },
  async uploadResume() { await delay(); return { success: true } },
  async generateRoadmap() { await delay(); return { data: [] } },
  async clearChat() { await delay(); return { success: true } },
  async downloadSuggestions() { await delay(); return { url: '#' } },
}

export const assignmentService = {
  async list() { await delay(); return [] },
  async get(id) { await delay(); return null },
  async submit(id, data) { await delay(); return { ...data, id, status: 'submitted' } },
  async saveDraft(id, data) { await delay(); return { ...data, id, status: 'draft' } },
  async uploadFile() { await delay(); return { url: '#' } },
  async remove(id) { await delay(); return { success: true } },
}

export const assessmentService = {
  async list() { await delay(); return [] },
  async get(id) { await delay(); return null },
  async start(id) { await delay(); return { id, startedAt: new Date().toISOString() } },
  async resume(id) { await delay(); return { id, progress: 40 } },
  async submit(id, data) { await delay(); return { id, score: Math.floor(Math.random() * 30) + 70 } },
  async results(id) { await delay(); return { score: 85, total: 100 } },
}

export const attendanceService = {
  async list() { await delay(); return [] },
  async download() { await delay(); return { url: '#' } },
  async export() { await delay(); return { url: '#' } },
}

export const performanceService = {
  async refresh() { await delay(); return { data: [] } },
  async export() { await delay(); return { url: '#' } },
}

export const resourceService = {
  async list() { await delay(); return [] },
  async download(id) { await delay(); return { url: '#' } },
  async preview(id) { await delay(); return { url: '#' } },
}

export const messageService = {
  async send(conversationId, text) { await delay(); return { id: generateId(), text, sender: 'me' } },
  async reply(conversationId, text) { await delay(); return { id: generateId(), text } },
  async remove(id) { await delay(); return { success: true } },
}

export const announcementService = {
  async list() { await delay(); return [] },
  async markAsRead(id) { await delay(); return { success: true } },
}

export const calendarService = {
  async list() { await delay(); return [] },
  async create(data) { await delay(); return { ...data, id: generateId() } },
  async update(id, data) { await delay(); return { ...data, id } },
  async remove(id) { await delay(); return { success: true } },
}

export const certificateService = {
  async list() { await delay(); return [] },
  async download(id) { await delay(); return { url: '#' } },
  async share(id) { await delay(); return { link: 'https://verify.example.com/' + id } },
}

export const profileService = {
  async update(data) { await delay(); return { ...data } },
  async uploadPhoto() { await delay(); return { url: '#' } },
}

export const settingsService = {
  async save(data) { await delay(); return { ...data } },
  async reset() { await delay(); return { success: true } },
  async changePassword(data) { await delay(); return { success: true } },
}
