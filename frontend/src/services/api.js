// En développement, Vite transmet /api à Flask : le navigateur reste sur la même origine.
const BASE = import.meta.env.VITE_API_URL || '/api'

async function call(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options })
  if (response.status === 204) return null
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Erreur du serveur')
  return data
}

export const api = {
  list: (module, params = {}) => call(`/${module}?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))}`),
  destinations: () => call('/destinations'),
  question: (question) => call('/nlp/query', { method: 'POST', body: JSON.stringify({ question }) }),
  register: (email, password, profile = {}) => call('/auth/register', { method: 'POST', body: JSON.stringify({ ...profile, email, password }) }),
  login: (email, password) => call('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => call('/auth/logout', { method: 'POST' }),
  person: (id) => call(`/personnes/${encodeURIComponent(id)}`),
  updatePerson: (id, profile) => call(`/personnes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(profile) }),
  deletePerson: (id) => call(`/personnes/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  preferences: () => call('/preferences'),
  createPreference: (preference) => call('/preferences', { method: 'POST', body: JSON.stringify(preference) }),
  updatePreference: (id, preference) => call(`/preferences/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(preference) }),
  deletePreference: (id) => call(`/preferences/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
