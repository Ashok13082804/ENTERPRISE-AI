import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { setupStandaloneMock, getStandaloneMockActive, setStandaloneMockActive, getMockResponse } from './mockEngine'

export { getStandaloneMockActive, setStandaloneMockActive }

// Initialize Standalone UI/UX Mock interceptor for all Axios requests
setupStandaloneMock()

// Auto-detect live backend on initialization
if (typeof window !== 'undefined') {
  fetch('/api/v1/chat/models', { method: 'GET' })
    .then((r) => {
      if (r.ok) {
        setStandaloneMockActive(false)
      }
    })
    .catch(() => {})
}

// Attach default interceptor for direct page imports of axios
axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Intercept with mock adapter only in standalone mock mode AND not for live chat/send
  if (getStandaloneMockActive() && !config.url?.includes('/chat/send')) {
    config.adapter = async (cfg) => {
      await new Promise((res) => setTimeout(res, 80))
      const mockData = await getMockResponse(cfg)
      return {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: cfg,
      } as any
    }
  }
  return config
})

// Response interceptor: handle 401 & offline fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    // If backend is offline, gracefully return simulated response
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.response?.status >= 400
    ) {
      const mockData = await getMockResponse(error.config || {})
      return Promise.resolve({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: error.config,
      })
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string, remember_me = false) =>
    api.post('/auth/login', { email, password, remember_me }),
  register: (data: object) => api.post('/auth/register', data),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/users/me'),
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chatApi = {
  getSessions: () => api.get('/chat/sessions'),
  createSession: (data: object) => api.post('/chat/sessions', data),
  getMessages: (sessionId: number) => api.get(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (data: object) => api.post('/chat/send', data),
  getModels: () => api.get('/chat/models'),
  deleteSession: (id: number) => api.delete(`/chat/sessions/${id}`),
  clearSessions: () => api.delete('/chat/sessions/clear-all'),
  export: (sessionId: number, format: string) =>
    api.get(`/chat/sessions/${sessionId}/export`, { params: { format }, responseType: 'blob' }),
}

// ─── RAG ──────────────────────────────────────────────────────────────────────
export const ragApi = {
  upload: (formData: FormData) =>
    api.post('/rag/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  query: (data: object) => api.post('/rag/query', data),
  listCollections: () => api.get('/rag/collections'),
  listDocuments: (collection?: string) =>
    api.get('/rag/documents', { params: { collection } }),
  deleteCollection: (name: string) => api.delete(`/rag/collections/${name}`),
}

// ─── Documents ────────────────────────────────────────────────────────────────
export const documentsApi = {
  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: (params?: object) => api.get('/documents/', { params }),
  get: (id: number) => api.get(`/documents/${id}`),
  delete: (id: number) => api.delete(`/documents/${id}`),
  download: (id: number) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  unlock: (id: number, data: object) => api.post(`/documents/${id}/unlock`, data),
  correct: (id: number, data: object) => api.post(`/documents/${id}/correct`, data),
  corrections: (id: number) => api.get(`/documents/${id}/corrections`),
  convert: (id: number, data: object) => api.post(`/documents/${id}/convert`, data, { responseType: 'blob' }),
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getAIUsage: (days?: number) => api.get('/analytics/ai-usage', { params: { days } }),
  getMLPerformance: () => api.get('/analytics/ml-performance'),
}

// ─── ML ───────────────────────────────────────────────────────────────────────
export const mlApi = {
  segmentation: (data: object) => api.post('/ml/segmentation', data),
  salesPrediction: (data: object) => api.post('/ml/sales-prediction', data),
  anomalyDetection: (data: object) => api.post('/ml/anomaly-detection', data),
  classification: (data: object) => api.post('/ml/classification', data),
  clustering: (data: object) => api.post('/ml/clustering', data),
  solve: (data: object) => api.post('/ml/solver', data),
  demandForecast: (data: object) => api.post('/ml/demand-forecast', data),
  getSampleSegmentation: () => api.get('/ml/sample-data/segmentation'),
  getSampleSales: () => api.get('/ml/sample-data/sales'),
}

// ─── NLP ──────────────────────────────────────────────────────────────────────
export const nlpApi = {
  generateEmail: (data: object) => api.post('/nlp/email', data),
  summarize: (data: object) => api.post('/nlp/summarize', data),
  meetingMinutes: (data: object) => api.post('/nlp/meeting-minutes', data),
  generateProposal: (data: object) => api.post('/nlp/proposal', data),
  analyzeResume: (data: object) => api.post('/nlp/resume-analyze', data),
  checkGrammar: (data: object) => api.post('/nlp/grammar', data),
  optimizePrompt: (data: object) => api.post('/nlp/prompt-optimize', data),
  generateCode: (data: object) => api.post('/nlp/code', data),
  generateSQL: (data: object) => api.post('/nlp/sql', data),
  translate: (data: object) => api.post('/nlp/translate', data),
  sentiment: (text: string, model?: string) => api.post('/nlp/sentiment', null, { params: { text, model } }),
  insights: (data: object) => api.post('/nlp/insights', data),
}

// ─── Vision ───────────────────────────────────────────────────────────────────
export const visionApi = {
  ocr: (formData: FormData) =>
    api.post('/vision/ocr', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  detectObjects: (formData: FormData) =>
    api.post('/vision/detect-objects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  detectFaces: (formData: FormData) =>
    api.post('/vision/face-detect', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  detectQR: (formData: FormData) =>
    api.post('/vision/qr-detect', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  classifyImage: (formData: FormData) =>
    api.post('/vision/image-classify', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStatus: () => api.get('/vision/status'),
}

// ─── Blockchain ───────────────────────────────────────────────────────────────
export const blockchainApi = {
  getChain: () => api.get('/blockchain/chain'),
  issueCertificate: (data: object) => api.post('/blockchain/certificate', data),
  bulkCertificate: (data: object) => api.post('/blockchain/certificate/bulk', data),
  addTransaction: (data: object) => api.post('/blockchain/transaction', data),
  deployContract: (data: object) => api.post('/blockchain/smart-contract', data),
  registerDocument: (data: object) => api.post('/blockchain/document/register', data),
  verifyHash: (data: object) => api.post('/blockchain/verify/hash', data),
  verify: (hash: string) => api.get(`/blockchain/verify/${hash}`),
  getAnalytics: () => api.get('/blockchain/analytics'),
  addAuditTrail: (description: string, metadata?: object) => api.post('/blockchain/audit-trail', { description, metadata }),
}


// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  list: () => api.get('/projects/'),
  create: (data: object) => api.post('/projects/', data),
  updateStatus: (id: number, status: string) =>
    api.put(`/projects/${id}/status`, null, { params: { status } }),
  delete: (id: number) => api.delete(`/projects/${id}`),
  getFiles: (id: number) => api.get(`/projects/${id}/files`),
  readFile: (id: number, path: string) => api.get(`/projects/${id}/files/read`, { params: { path } }),
  writeFile: (id: number, data: object) => api.post(`/projects/${id}/files/write`, data),
  run: (id: number, data: object) => api.post(`/projects/${id}/run`, data),
  aiAssist: (id: number, data: object) => api.post(`/projects/${id}/ai-assist`, data),
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasksApi = {
  list: (params?: object) => api.get('/tasks/', { params }),
  create: (data: object) => api.post('/tasks/', data),
  updateStatus: (id: number, status: string) =>
    api.put(`/tasks/${id}/status`, null, { params: { status } }),
  update: (id: number, data: object) => api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (unread_only?: boolean) => api.get('/notifications/', { params: { unread_only } }),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (q: string) => api.get('/search/', { params: { q } }),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: object) => api.put('/users/me', data),
  list: (params?: object) => api.get('/users/', { params }),
  getLoginHistory: () => api.get('/users/me/login-history'),
}

// ─── Cybersecurity ────────────────────────────────────────────────────────────
export const cybersecurityApi = {
  upload: (formData: FormData, title: string, password: string) =>
    api.post(`/cybersecurity/upload?title=${encodeURIComponent(title)}&password=${encodeURIComponent(password)}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: () => api.get('/cybersecurity/list'),
  read: (id: string, data: object) => api.post(`/cybersecurity/file/${id}/read`, data),
  write: (id: string, data: object) => api.post(`/cybersecurity/file/${id}/write`, data),
  download: (id: string, data: object) => api.post(`/cybersecurity/file/${id}/download`, data, { responseType: 'blob' }),
  convert: (id: string, data: object) => api.post(`/cybersecurity/file/${id}/convert`, data),
  share: (id: string, data: object) => api.post(`/cybersecurity/file/${id}/share`, data),
  rag: (id: string, data: object) => api.post(`/cybersecurity/file/${id}/rag`, data),
}

// ─── Smart Notes ──────────────────────────────────────────────────────────────
export const notesApi = {
  list: (params?: object) => api.get('/notes/', { params }),
  get: (id: number) => api.get(`/notes/${id}`),
  create: (data: object) => api.post('/notes/', data),
  update: (id: number, data: object) => api.put(`/notes/${id}`, data),
  delete: (id: number, permanent = false) => api.delete(`/notes/${id}`, { params: { permanent } }),
  restore: (id: number) => api.post(`/notes/${id}/restore`),
  duplicate: (id: number) => api.post(`/notes/${id}/duplicate`),
  search: (q: string, limit = 20) => api.get('/notes/search/q', { params: { q, limit } }),
  stats: () => api.get('/notes/stats/overview'),
  emptyTrash: () => api.delete('/notes/trash/empty'),
  bulk: (data: object) => api.post('/notes/bulk', data),
  getVersions: (id: number) => api.get(`/notes/${id}/versions`),
  restoreVersion: (noteId: number, versionId: number) => api.post(`/notes/${noteId}/versions/${versionId}/restore`),
  export: (id: number, format: string) =>
    api.get(`/notes/${id}/export`, { params: { format }, responseType: 'blob' }),
}

// ─── Notes AI ────────────────────────────────────────────────────────────────
export const notesAiApi = {
  summarize: (data: object) => api.post('/notes/ai/summarize', data),
  improve: (data: object) => api.post('/notes/ai/improve', data),
  generate: (data: object) => api.post('/notes/ai/generate', data),
  generateTags: (data: object) => api.post('/notes/ai/tags', data),
  flashcards: (data: object) => api.post('/notes/ai/flashcards', data),
  quiz: (data: object) => api.post('/notes/ai/quiz', data),
  answer: (data: object) => api.post('/notes/ai/answer', data),
  todo: (data: object) => api.post('/notes/ai/todo', data),
  analyze: (data: object) => api.post('/notes/ai/analyze', data),
  sentiment: (data: object) => api.post('/notes/ai/sentiment', data),
  keywords: (data: object) => api.post('/notes/ai/keywords', data),
  translate: (data: object) => api.post('/notes/ai/translate', data),
  interviewQuestions: (data: object) => api.post('/notes/ai/interview-questions', data),
  mindmap: (data: object) => api.post('/notes/ai/mindmap', data),
  explain: (data: object) => api.post('/notes/ai/explain', data),
}

// ─── Folders ─────────────────────────────────────────────────────────────────
export const foldersApi = {
  list: () => api.get('/folders/'),
  create: (data: object) => api.post('/folders/', data),
  update: (id: number, data: object) => api.put(`/folders/${id}`, data),
  delete: (id: number, moveNotesTo?: number) =>
    api.delete(`/folders/${id}`, { params: { move_notes_to: moveNotesTo } }),
  getNotes: (id: number) => api.get(`/folders/${id}/notes`),
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const tagsApi = {
  list: () => api.get('/tags/'),
  create: (data: object) => api.post('/tags/', data),
  update: (id: number, data: object) => api.put(`/tags/${id}`, data),
  delete: (id: number) => api.delete(`/tags/${id}`),
  cloud: () => api.get('/tags/cloud'),
}
