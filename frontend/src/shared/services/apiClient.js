import axios from 'axios'

let authRedirectInProgress = false

const PUBLIC_AUTH_PATHS = [
  '/api/Auth/login', '/api/Auth/register', '/api/Auth/send-otp', '/api/Auth/verify-otp',
  '/api/Auth/forgot-password', '/api/Auth/reset-password', '/api/v1/organization/login', '/api/v1/SuperAdmin/login',
  '/api/GetInTouch', '/api/Register',
  '/api/v1/students/google-login', '/api/v1/employees/google-login', '/api/v1/organization/google-login',
]

// Public pages may request optional content (for example the landing-page
// course list). A 401 for that content must not turn a visitor's home page
// into the login screen.
const isPublicAppPage = (pathname) => [
  '/', '/home', '/courses', '/career', '/about', '/contact', '/features',
  '/blog', '/mentors', '/enroll', '/admissions', '/alumni', '/upskill-program',
  // Guest checkout: a visitor buys courses before they have an account.
  '/enrollment', '/cart', '/activate-account',
].some((path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)))

const AUTH_STORAGE_KEYS = [
  'organizationToken', 'auth_token', 'user_role', 'remember_me', 'organization_id', 'organization_name',
  'organizationEmail', 'user_email', 'token_expiration', 'tokenExpiration', 'accessToken', 'token',
  'refreshToken', 'user', 'userId', 'role', 'organizationId', 'orgId', 'organization', 'organizationName',
  'isAuthenticated', 'isLoggedIn', 'userRole', 'selectedRole', 'rememberMe', 'expiresIn', 'superAdmin', 'mentorId', 'employeeId',
  'isDemo', 'demo_permissions', 'studentId',
]

export const clearAuthentication = () => AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))

// The bearer token the request interceptor attaches. Exported so the rare
// request that can't go through Axios (a keepalive fetch fired while the page
// is unloading) authenticates exactly the same way.
export const getStoredAuthToken = () => {
  const pathname = window.location.pathname
  const isOrganizationApp = pathname === '/organization' || pathname.startsWith('/organization/')
  return isOrganizationApp
    ? localStorage.getItem('organizationToken') || localStorage.getItem('auth_token') || localStorage.getItem('accessToken') || localStorage.getItem('token')
    : localStorage.getItem('auth_token') || localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('organizationToken')
}

const readJwtExpiry = (token) => {
  try {
    const payload = String(token || '').split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const exp = Number(JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='))).exp)
    return Number.isFinite(exp) ? exp * 1000 : null
  } catch {
    return null
  }
}

// True only when the stored session has provably run out: the token's own
// `exp` claim or the expiration saved at login is in the past. Without a
// refresh endpoint such a token can never authenticate again.
export const isStoredSessionExpired = () => {
  const now = Date.now()
  const jwtExpiry = readJwtExpiry(getStoredAuthToken())
  if (jwtExpiry !== null && jwtExpiry <= now) return true
  const storedExpiry = Date.parse(localStorage.getItem('token_expiration') || localStorage.getItem('tokenExpiration') || '')
  return !Number.isNaN(storedExpiry) && storedExpiry <= now
}

// ngrok's free tunnel answers browser requests with an HTML warning page
// (ERR_NGROK_6024, HTTP 200) unless this header is sent. Only added for an
// ngrok host so a production backend's CORS rules are not affected; the
// backend's CORS already allows the header from the dev origin.
const isNgrokUrl = (url) => {
  try { return /\.ngrok(-free)?\.(app|dev|io)$/i.test(new URL(url).hostname) } catch { return false }
}
export const NGROK_HEADERS = isNgrokUrl(import.meta.env.VITE_API_BASE_URL) ? { 'ngrok-skip-browser-warning': 'true' } : {}

// An HTML page where JSON was expected (ngrok's warning or offline page, a
// proxy error) must fail loudly, not be read as an empty list.
const isHtmlBody = (response) => typeof response?.data === 'string'
  && /^\s*<(!doctype|html)/i.test(response.data)
  && !['blob', 'arraybuffer', 'text', 'document'].includes(response.config?.responseType)

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...NGROK_HEADERS },
})

apiClient.interceptors.request.use((config) => {
  // FormData requests need the browser-generated multipart boundary. The
  // client default is JSON, so remove it before Axios prepares the upload.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers?.delete?.('Content-Type')
    if (config.headers) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }
  }
  const token = getStoredAuthToken()
  const requestPath = String(config.url || '').split('?')[0]
  // skipAuth: true sends the request anonymously, for public reads on an
  // endpoint that is otherwise token-scoped (the public course catalogue).
  const isPublicAuthRequest = config.skipAuth === true || PUBLIC_AUTH_PATHS.some((path) => requestPath.endsWith(path))

  if (token && !isPublicAuthRequest) config.headers.Authorization = `Bearer ${token}`
  else if (isPublicAuthRequest) delete config.headers.Authorization

  if (import.meta.env.DEV && (requestPath.startsWith('/api/Permission/') || requestPath.startsWith('/api/EmployeeAttendance'))) {
    console.group(requestPath.startsWith('/api/Permission/') ? '[Permission Request Debug]' : '[EmployeeAttendance Request Debug]')
    console.log('Request:', config.method?.toUpperCase(), `${config.baseURL || ''}${config.url || ''}`)
    console.log('Params:', config.params)
    console.log('Authorization header attached:', Boolean(config.headers?.Authorization))
    console.groupEnd()
  }

  if (import.meta.env.DEV && requestPath.endsWith('/api/v1/organization/login')) {
    const body = config.data && typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    console.debug('Organization login request', {
      url: `${config.baseURL || ''}${requestPath}`,
      method: config.method?.toUpperCase(),
      email: body?.email,
      passwordLength: typeof body?.password === 'string' ? body.password.length : 0,
      hasAuthorization: Boolean(config.headers?.Authorization),
      contentType: config.headers?.['Content-Type'],
    })
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (isHtmlBody(response)) {
      const error = new axios.AxiosError(
        `Expected JSON from ${response.config?.url} but received an HTML page (ngrok warning or offline page, or a proxy error).`,
        'ERR_UNEXPECTED_HTML', response.config, response.request, response,
      )
      console.error('[API] HTML instead of JSON', { url: `${response.config?.baseURL || ''}${response.config?.url || ''}`, status: response.status })
      return Promise.reject(error)
    }
    return response
  },
  (error) => {
    const requestPath = String(error.config?.url || '').split('?')[0]
    if (import.meta.env.DEV && (requestPath.startsWith('/api/Permission/') || requestPath.startsWith('/api/EmployeeAttendance'))) {
      console.group(requestPath.startsWith('/api/Permission/') ? '[Permission API Error]' : '[EmployeeAttendance API Error]')
      console.log('Status:', error.response?.status)
      console.log('Response:', error.response?.data)
      console.log('Request URL:', error.config?.url)
      console.log('Params:', error.config?.params)
      console.log('Authorization attached:', Boolean(error.config?.headers?.Authorization))
      console.groupEnd()
    }
    const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => requestPath.endsWith(path))
    // skipAuthRedirect: true never redirects. 'unless-expired' is for action
    // endpoints (joining a live class) whose 401 can be a refusal for that
    // one action: the session is ended only if the token itself has expired,
    // otherwise the caller shows the error and the student stays signed in.
    const authRedirectMode = error.config?.skipAuthRedirect
    const skipAuthRedirect = authRedirectMode === 'unless-expired' ? !isStoredSessionExpired() : Boolean(authRedirectMode)
    const pathname = window.location.pathname
    const isLoginPage = pathname === '/login' || pathname.endsWith('/login') || pathname.endsWith('/register') || pathname === '/signup' || pathname.startsWith('/forgot-password') || pathname.startsWith('/otp-verification') || pathname.startsWith('/reset-password')
    const visitorIsOnPublicPage = isPublicAppPage(pathname)
    const isOrganizationApp = pathname === '/organization' || pathname.startsWith('/organization/')
    const storedToken = isOrganizationApp
      ? localStorage.getItem('organizationToken') || localStorage.getItem('auth_token') || localStorage.getItem('accessToken') || localStorage.getItem('token')
      : localStorage.getItem('auth_token') || localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('organizationToken')
    const isDemoSession = localStorage.getItem('isDemo') === 'true' || storedToken === 'demo-token'

    // No refresh endpoint exists in this client. A protected 401 therefore means the
    // current client session cannot recover and must be cleared before redirecting.
    if (error.response?.status === 401 && !isDemoSession && !skipAuthRedirect && !isPublicAuthRequest && !isLoginPage && !visitorIsOnPublicPage && !authRedirectInProgress) {
      authRedirectInProgress = true
      clearAuthentication()
      window.location.replace(pathname.startsWith('/organization') ? '/organization/login' : '/login')
    }

    return Promise.reject(error)
  }
)

const unwrap = (response) => response.data
export const apiGet = (url, config) => apiClient.get(url, config).then(unwrap)
export const apiPost = (url, body, config) => apiClient.post(url, body, config).then(unwrap)
export const apiPut = (url, body, config) => apiClient.put(url, body, config).then(unwrap)
export const apiDelete = (url, config) => apiClient.delete(url, config).then(unwrap)

export const createCancellable = (promise) => {
  let cancel = false
  const wrapped = new Promise((resolve, reject) => promise.then((result) => { if (!cancel) resolve(result) }, (err) => { if (!cancel) reject(err) }))
  wrapped.cancel = () => { cancel = true }
  return wrapped
}

export default apiClient
