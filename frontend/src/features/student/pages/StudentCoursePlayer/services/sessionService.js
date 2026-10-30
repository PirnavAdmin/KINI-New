const STORAGE_KEY = 'kiniedx-live-sessions'

export const sessionService = {
  async list(fallback = []) {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || fallback } catch { return fallback }
  },
  async save(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    window.dispatchEvent(new CustomEvent('session_updated', { detail: sessions }))
    return sessions
  },
  subscribe(callback, fallback = []) {
    const update = (event) => callback(event.detail || fallback)
    window.addEventListener('session_updated', update)
    const poll = window.setInterval(() => this.list(fallback).then(callback), 15_000)
    return () => { window.removeEventListener('session_updated', update); window.clearInterval(poll) }
  },
}
