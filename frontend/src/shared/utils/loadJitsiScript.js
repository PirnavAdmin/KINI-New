const SCRIPT_ID = 'jitsi-external-api-script'

let loadPromise = null

// The Jitsi Meet IFrame/External API has no npm package — it's loaded as a
// plain <script> from the target Jitsi deployment (window.JitsiMeetExternalAPI).
// Cached so joining a second class in the same session never injects a
// duplicate <script> tag or re-downloads it.
export function loadJitsiScript(domain) {
  if (typeof window !== 'undefined' && window.JitsiMeetExternalAPI) {
    return Promise.resolve(window.JitsiMeetExternalAPI)
  }
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.JitsiMeetExternalAPI))
      existing.addEventListener('error', () => reject(new Error('Failed to load the Jitsi Meet script.')))
      return
    }
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://${domain}/external_api.js`
    script.async = true
    script.onload = () => resolve(window.JitsiMeetExternalAPI)
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load the Jitsi Meet script.'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

export default loadJitsiScript
