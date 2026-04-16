const BASE_URL = 'https://tapim.onrender.com'

// Get token from cookie or localStorage
function getToken() {
  // Try cookie first (server sets it as access_token cookie)
  const cookie = document.cookie.split(';').find(c => c.trim().startsWith('access_token='))
  if (cookie) return cookie.split('=')[1]
  // Fallback to localStorage
  return localStorage.getItem('access_token')
}

// Decode JWT to get user info
export function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      userId: parseInt(payload.sub),
      exp: payload.exp,
    }
  } catch {
    return null
  }
}

// Save token
export function saveToken(token) {
  localStorage.setItem('access_token', token)
}

// Remove token
export function removeToken() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('tapim_user')
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}

// Base fetch wrapper
async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const fullURL = `${BASE_URL}${path}`
  console.log(`📡 ${options.method || 'GET'} ${fullURL}`)

  let res
  try {
    res = await fetch(fullURL, {
      ...options,
      headers,
      credentials: 'include',
    })
  } catch (networkErr) {
    // Network error — CORS, сервер недоступен, нет интернета
    console.error('❌ Network error:', networkErr.message)
    console.error('URL:', fullURL)
    throw new Error(
      networkErr.message === 'Failed to fetch'
        ? 'Сервер недоступен. Проверь интернет или подожди — бэк на Render может спать (free tier просыпается ~30 сек)'
        : networkErr.message
    )
  }

  console.log(`✅ Response ${res.status} from ${fullURL}`)

  if (res.status === 401) {
    removeToken()
    window.location.href = '/login'
    return
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message =
      data?.detail?.[0]?.msg ||
      data?.detail ||
      data?.message ||
      'Что-то пошло не так'
    throw new Error(message)
  }

  return data
}

// ─── AUTH ────────────────────────────────────────────────────────────

export const authAPI = {
  // GET /auth/me — get current user info including role
  getMe() {
    return request('/auth/me')
  },

  // POST /auth/register/applicant
  registerApplicant(body) {
    return request('/auth/register/applicant', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  // POST /auth/register/recruiter/step1
  registerRecruiterStep1(body) {
    return request('/auth/register/recruiter/step1', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  // POST /auth/register/recruiter/step2
  registerRecruiterStep2(body) {
    return request('/auth/register/recruiter/step2', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  // POST /auth/verify-email
  verifyEmail(body) {
    return request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  // POST /auth/login
  login(body) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  // POST /auth/forgot-password
  forgotPassword(email) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  // POST /auth/reset-password
  resetPassword(body) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}

// ─── PROFILES ────────────────────────────────────────────────────────

export const profileAPI = {
  // GET /profiles/ — all profiles sorted by completeness
  getAllProfiles() {
    return request('/profiles/')
  },

  // GET /profiles/{user_id}
  getProfile(userId) {
    return request(`/profiles/${userId}`)
  },

  // PUT /profiles/{user_id}
  updateProfile(userId, body) {
    return request(`/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  // PUT /profiles/{user_id}/contacts
  updateContacts(userId, body) {
    return request(`/profiles/${userId}/contacts`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  // PUT /profiles/{user_id}/bio
  updateBio(userId, bio) {
    return request(`/profiles/${userId}/bio`, {
      method: 'PUT',
      body: JSON.stringify({ bio }),
    })
  },

  // GET /profiles/skills
  getAllSkills() {
    return request('/profiles/skills')
  },

  // PUT /profiles/{user_id}/skills
  updateSkills(userId, skillIds) {
    return request(`/profiles/${userId}/skills`, {
      method: 'PUT',
      body: JSON.stringify({ skill_ids: skillIds }),
    })
  },

  // POST /profiles/{user_id}/experience
  addExperience(userId, body) {
    return request(`/profiles/${userId}/experience`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  // DELETE /profiles/{user_id}/experience/{exp_id}
  deleteExperience(userId, expId) {
    return request(`/profiles/${userId}/experience/${expId}`, {
      method: 'DELETE',
    })
  },

  // POST /profiles/{user_id}/education
  addEducation(userId, body) {
    return request(`/profiles/${userId}/education`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  // DELETE /profiles/{user_id}/education/{edu_id}
  deleteEducation(userId, eduId) {
    return request(`/profiles/${userId}/education/${eduId}`, {
      method: 'DELETE',
    })
  },
}

// ─── VACANCIES ───────────────────────────────────────────────────────

export const vacanciesAPI = {
  // GET /vacancies/?user_id=...
  getAll(userId) {
    const qs = userId ? `?user_id=${userId}` : ''
    return request(`/vacancies/${qs}`)
  },

  // POST /vacancies/ — create vacancy (recruiter only)
  create(body) {
    return request('/vacancies/', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  // GET /vacancies/search?query=...&tags=...
  search({ query = '', tags = [] } = {}) {
    const params = new URLSearchParams()
    if (query) params.append('query', query)
    tags.forEach(t => params.append('tags', t))
    const qs = params.toString()
    return request(`/vacancies/search${qs ? '?' + qs : ''}`)
  },

  // GET /vacancies/salary?min_salary=...&max_salary=...
  getBySalary({ min_salary, max_salary } = {}) {
    const params = new URLSearchParams()
    if (min_salary) params.append('min_salary', min_salary)
    if (max_salary) params.append('max_salary', max_salary)
    return request(`/vacancies/salary?${params.toString()}`)
  },

  // GET /vacancies/this-week
  getThisWeek() {
    return request('/vacancies/this-week')
  },

  // GET /vacancies/{vacancy_id}
  getById(vacancyId) {
    return request(`/vacancies/${vacancyId}`)
  },
}

// ─── COMPANIES ───────────────────────────────────────────────────────

export const companiesAPI = {
  // GET /companies/{user_id}
  getCompany(userId) {
    return request(`/companies/${userId}`)
  },

  // PUT /companies/{user_id}
  updateCompany(userId, body) {
    return request(`/companies/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },
}

// ─── CHAT ────────────────────────────────────────────────────────────

export const chatAPI = {
  // GET /chat/history/{user_id}/{other_user_id}
  getHistory(userId, otherUserId) {
    return request(`/chat/history/${userId}/${otherUserId}`)
  },

  // PUT /chat/read/{sender_id}/{receiver_id}
  markAsRead(senderId, receiverId) {
    return request(`/chat/read/${senderId}/${receiverId}`, {
      method: 'PUT',
    })
  },

  // GET /chat/unread/{user_id}
  getUnreadCount(userId) {
    return request(`/chat/unread/${userId}`)
  },

  // GET /chat/conversations/{user_id} — список диалогов с бэкенда
  getConversations(userId) {
    return request(`/chat/conversations/${userId}`)
  },

  // WebSocket — идёт напрямую, не через proxy
  connectWS(userId) {
    return new WebSocket(`wss://tapim.onrender.com/chat/ws/${userId}`)
  },
}

// ─── FAVORITES ───────────────────────────────────────────────────────

export const favoritesAPI = {
  // GET /favorites/{user_id} — получить список избранных вакансий
  getFavorites(userId) {
    return request(`/favorites/${userId}`)
  },

  // POST /favorites/{user_id}/{vacancy_id} — добавить в избранное
  addFavorite(userId, vacancyId) {
    return request(`/favorites/${userId}/${vacancyId}`, {
      method: 'POST',
    })
  },

  // DELETE /favorites/{user_id}/{vacancy_id} — убрать из избранного
  removeFavorite(userId, vacancyId) {
    return request(`/favorites/${userId}/${vacancyId}`, {
      method: 'DELETE',
    })
  },
}

// ─── FAVORITE PROFILES (employer bookmarks candidates) ───────────────

// Универсальная нормализация ответа /favorite-profiles в Set<string> id.
// Бэк может вернуть:
//   [1, 2, 3]
//   [{profile_id: 1}, ...]
//   [{user_id: 1}, ...]
//   [{id: 1}, ...]
//   [{user_id: 1, first_name: '...', ...}]  ← полные профили
//   {favorites: [...]}, {data: [...]}, {items: [...]}
//   null / undefined / 404
export function extractFavoriteIds(raw) {
  if (!raw) return new Set()
  const list = Array.isArray(raw)
    ? raw
    : (raw.favorites || raw.data || raw.items || raw.profiles || [])
  if (!Array.isArray(list)) return new Set()
  return new Set(
    list
      .map(f => {
        if (f == null) return null
        if (typeof f === 'number' || typeof f === 'string') return String(f)
        return String(f.profile_id ?? f.user_id ?? f.id ?? '')
      })
      .filter(Boolean)
  )
}

export const favoriteProfilesAPI = {
  // GET /favorite-profiles/{user_id} — избранные кандидаты рекрутера
  getFavoriteProfiles(userId) {
    return request(`/favorite-profiles/${userId}`)
  },

  // POST /favorite-profiles/{user_id}/{profile_id} — добавить кандидата
  addFavoriteProfile(userId, profileId) {
    return request(`/favorite-profiles/${userId}/${profileId}`, {
      method: 'POST',
    })
  },

  // DELETE /favorite-profiles/{user_id}/{profile_id} — убрать кандидата
  removeFavoriteProfile(userId, profileId) {
    return request(`/favorite-profiles/${userId}/${profileId}`, {
      method: 'DELETE',
    })
  },
}
