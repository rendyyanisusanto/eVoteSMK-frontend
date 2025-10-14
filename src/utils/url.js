// Utility untuk menangani URL dinamis
export const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  // Remove /api from the end to get the base server URL
  return apiUrl.replace('/api', '')
}

export const getImageUrl = (filename) => {
  if (!filename) return null
  return `${getBaseURL()}/uploads/${filename}`
}

export const getDefaultAvatar = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIyNSIgeT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCI+Tm8gUGhvdG88L3RleHQ+PC9zdmc+'
}