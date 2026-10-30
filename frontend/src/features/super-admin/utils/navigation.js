export const navigateBackOrFallback = (navigate, fallback) => {
  if (window.history.length > 1) {
    navigate(-1)
    return
  }
  navigate(fallback)
}
