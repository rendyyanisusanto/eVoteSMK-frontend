import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL
})

// Add token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken')
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default {
  // Public endpoints
  getCandidates() {
    return api.get('/candidates')
  },
  
  getPublicResults() {
    return api.get('/results')
  },
  
  validateVotingCode(votingCode) {
    return api.post('/validate-code', { votingCode })
  },
  
  vote(votingCode, candidateId) {
    return api.post('/vote', { votingCode, candidateId })
  },
  
  adminLogin(username, password) {
    return api.post('/admin/login', { username, password })
  },
  
  // Admin endpoints
  getResults() {
    return api.get('/admin/results')
  },
  
  addCandidate(formData) {
    return api.post('/admin/candidates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  updateCandidate(id, formData) {
    return api.put(`/admin/candidates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  deleteCandidate(id) {
    return api.delete(`/admin/candidates/${id}`)
  },
  
  generateVotingCodes(count) {
    return api.post('/admin/voting-codes', { count })
  },
  
  getVotingCodes() {
    return api.get('/admin/voting-codes')
  },
  
  resetVotingCodes() {
    return api.delete('/admin/voting-codes/reset')
  },
  
  resetIndividualCode(id) {
    return api.put(`/admin/voting-codes/${id}/reset`)
  }
}