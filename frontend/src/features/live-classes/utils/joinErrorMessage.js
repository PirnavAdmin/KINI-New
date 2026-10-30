import { getApiErrorMessage, readableApiMessage } from '@shared/services/apiServices'

// A backend message is shown only when it reads like a sentence for the user,
// never an HTML error page or a stack trace.
const safeServerMessage = (error) => {
  const message = readableApiMessage(error?.response?.data)
  return message && message.length <= 200 && !/[<>{}]|\n|exception|\bat\s+\S+\(/i.test(message) ? message : ''
}

// The join requests opt out of the global logout on 401 while the token is
// still valid (apiClient skipAuthRedirect: 'unless-expired'), so a 401 that
// reaches this page is the server rejecting the sign-in for this class, not
// an expired session — the generic "session has expired" text would be wrong.
export const joinErrorMessage = (error, fallback) => {
  const status = error?.response?.status
  if (!error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error' || error?.code === 'ECONNABORTED')) {
    return "We couldn't reach the class server. Check your connection and try again."
  }
  if (status === 401) return "The class server didn't accept your sign-in for this class. You're still signed in — try again, or contact support if this keeps happening."
  if (status === 403) return safeServerMessage(error) || "You don't have access to this class. It may not be part of your enrolled batch."
  if (status === 404) return safeServerMessage(error) || "This class, or your enrollment for it, wasn't found."
  if (status >= 500) return 'The class server ran into a problem. Please try again in a moment.'
  return getApiErrorMessage(error, fallback)
}
