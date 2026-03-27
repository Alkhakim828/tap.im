import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vacanciesAPI, favoritesAPI, decodeToken } from '../api/index.js'
import styles from './VacanciesPage.module.css'
import { IconBuilding, IconChat, IconClipboard, IconUser, IconSearch, IconHourglass, IconPin, IconMoney, IconCalendar, IconBookmark } from '../components/Icons'

const LEVELS = ['Intern', 'Junior', 'Middle', 'Senior', 'Lead']
const FORMATS = ['Удаленно', 'В офисе', 'Гибрид']
const EMPLOYMENT = ['Полная занятость', 'Частичная занятость', 'Стажировка']
const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Москва', 'Санкт-Петербург']
const STATIC_SKILLS = [
  'React', 'TypeScript', 'Python', 'Photoshop', 'Figma', 'Excel',
  'Node.js', 'Docker', 'AWS', 'Vue.js', 'Angular', 'PostgreSQL',
  'MongoDB', 'Redis', 'Kubernetes', 'Git', 'Java', 'C++',
  'Swift', 'Kotlin', 'PowerPoint', 'Illustrator', 'SQL', 'Django',
  'Flask', 'GraphQL', 'REST API', 'Linux', 'After Effects',
]

function normalize(v) {
  const rawTags = v.tags || []
  const cleanTags = rawTags.filter(t => {
    if (!t || typeof t !== 'string') return false
    const lower = t.toLowerCase()
    if (lower.includes('зарплат') || lower.includes('указан')) return false
    if (CITIES.some(c => c.toLowerCase() === lower)) return false
    if (t.length > 30) return false
    return true
  })
  return {
    id: v.id,
    title: v.position_name || '—',
    company: v.company_name || '—',
    city: v.location || '',
    salary: v.salary_min && v.salary_max
      ? `${Number(v.salary_min).toLocaleString('ru')}–${Number(v.salary_max).toLocaleString('ru')} ${v.salary_currency || 'KZT'}`
      : v.salary_min
        ? `от ${Number(v.salary_min).toLocaleString('ru')} ${v.salary_currency || 'KZT'}`
        : 'Не указана',
    salaryMin: v.salary_min ? Number(v.salary_min) : 0,
    salaryMax: v.salary_max ? Number(v.salary_max) : 0,
    tags: cleanTags,
    specialization: v.specialization || '',
    type: 'Полная занятость',
    createdAt: v.created_at || '',
  }
}

export default function VacanciesPage() {
  const navigate = useNavigate()

  const [allVacancies, setAllVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Самые новые')

  // ─── Избранное ───────────────────────────────────────────────────
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [currentUserId, setCurrentUserId] = useState(null)

  // Pending filter state
  const [pendingTags, setPendingTags] = useState([])
  const [pendingLevels, setPendingLevels] = useState([])
  const [pendingFormats, setPendingFormats] = useState([])
  const [pendingEmployment, setPendingEmployment] = useState([])
  const [pendingCity, setPendingCity] = useState('')
  const [pendingIndustry, setPendingIndustry] = useState('')
  const [pendingSalaryFrom, setPendingSalaryFrom] = useState('')
  const [pendingSalaryTo, setPendingSalaryTo] = useState('')

  // Applied filter state
  const [appliedTags, setAppliedTags] = useState([])
  const [appliedLevels, setAppliedLevels] = useState([])
  const [appliedFormats, setAppliedFormats] = useState([])
  const [appliedEmployment, setAppliedEmployment] = useState([])
  const [appliedCity, setAppliedCity] = useState('')
  const [appliedIndustry, setAppliedIndustry] = useState('')
  const [appliedSalaryFrom, setAppliedSalaryFrom] = useState('')
  const [appliedSalaryTo, setAppliedSalaryTo] = useState('')

  function toggle(val, list, setList) {
    setList(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])
  }

  // ─── Получаем userId из JWT при маунте ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      const decoded = decodeToken(token)
      if (decoded?.userId) setCurrentUserId(decoded.userId)
    }
  }, [])

  // ─── Загружаем список избранных когда userId известен ────────────
  useEffect(() => {
    if (!currentUserId) return
    favoritesAPI.getFavorites(currentUserId)
      .then(data => {
        // Бэк может вернуть массив строк, объектов с vacancy_id или просто id
        // Адаптируем под любой формат
        const ids = Array.isArray(data)
          ? new Set(data.map(item =>
              typeof item === 'string' || typeof item === 'number'
                ? String(item)
                : String(item.vacancy_id ?? item.id ?? item)
            ))
          : new Set()
        setFavoriteIds(ids)
      })
      .catch(() => {
        // Тихая ошибка — не блокируем страницу если избранное не загрузилось
      })
  }, [currentUserId])

  // ─── Toggle избранного с оптимистичным обновлением UI ────────────
  async function toggleFavorite(e, vacancyId) {
    e.stopPropagation() // не открываем карточку при клике на кнопку
    if (!currentUserId) return

    const id = String(vacancyId)
    const isFav = favoriteIds.has(id)

    // Сразу обновляем UI — не ждём ответа сервера
    setFavoriteIds(prev => {
      const next = new Set(prev)
      isFav ? next.delete(id) : next.add(id)
      return next
    })

    try {
      if (isFav) {
        await favoritesAPI.removeFavorite(currentUserId, vacancyId)
      } else {
        await favoritesAPI.addFavorite(currentUserId, vacancyId)
      }
    } catch {
      // Откатываем UI если запрос упал
      setFavoriteIds(prev => {
        const next = new Set(prev)
        isFav ? next.add(id) : next.delete(id)
        return next
      })
    }
  }

  useEffect(() => { loadVacancies() }, [])

  async function loadVacancies() {
    setLoading(true); setApiError('')
    try {
      const data = await vacanciesAPI.getAll()
      setAllVacancies(data.map(normalize))
    } catch (e) {
      setApiError('Не удалось загрузить вакансии. Проверьте соединение.')
    } finally { setLoading(false) }
  }

  function applyFilters() {
    setAppliedTags(pendingTags)
    setAppliedLevels(pendingLevels)
    setAppliedFormats(pendingFormats)
    setAppliedEmployment(pendingEmployment)
    setAppliedCity(pendingCity)
    setAppliedIndustry(pendingIndustry)
    setAppliedSalaryFrom(pendingSalaryFrom)
    setAppliedSalaryTo(pendingSalaryTo)
  }

  function reset() {
    setPendingTags([]); setPendingLevels([]); setPendingFormats([])
    setPendingEmployment([]); setPendingCity(''); setPendingIndustry('')
    setPendingSalaryFrom(''); setPendingSalaryTo('')
    setAppliedTags([]); setAppliedLevels([]); setAppliedFormats([])
    setAppliedEmployment([]); setAppliedCity(''); setAppliedIndustry('')
    setAppliedSalaryFrom(''); setAppliedSalaryTo('')
    setSearch('')
  }

  // Основная логика фильтрации
  const vacancies = allVacancies.filter(v => {
    // 1. Поиск
    if (search) {
      const q = search.toLowerCase()
      const inTitle = v.title.toLowerCase().includes(q)
      const inCompany = v.company.toLowerCase().includes(q)
      const inTags = v.tags.some(t => t.toLowerCase().includes(q))
      if (!inTitle && !inCompany && !inTags) return false
    }

    // 2. Город
    if (appliedCity && v.city !== appliedCity) return false

    // 3. Навыки (Tags)
    if (appliedTags.length > 0) {
      const hasTag = appliedTags.some(t => v.tags.includes(t))
      if (!hasTag) return false
    }

    // 4. Зарплата "От"
    if (appliedSalaryFrom) {
      const from = Number(appliedSalaryFrom)
      if (v.salaryMax > 0 && v.salaryMax < from) return false
    }

    // 5. Зарплата "До"
    if (appliedSalaryTo) {
      const to = Number(appliedSalaryTo)
      if (v.salaryMin > 0 && v.salaryMin > to) return false
    }

    return true
  }).sort((a, b) => {
    if (sort === 'По зарплате (убыв.)') return b.salaryMax - a.salaryMax
    if (sort === 'По зарплате (возр.)') return a.salaryMin - b.salaryMin
    return 0
  })

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.logo} onClick={() => navigate('/')}>tap.im</span>
        <div className={styles.navLinks}>
          <button className={`${styles.navBtn} ${styles.active}`} onClick={() => navigate('/vacancies')}>
            <IconBuilding size={15}/> Вакансии
          </button>
          <button className={styles.navBtn} onClick={() => navigate('/chat')}>
            <IconChat size={15}/> Сообщения
          </button>
          <button className={styles.navBtn} onClick={() => navigate('/guide')}>
            <IconClipboard size={15}/> Quick Guide
          </button>
          <button className={styles.navBtn} onClick={() => navigate('/profile')}>
            <IconUser size={15}/> Профиль
          </button>
        </div>
      </nav>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h3 className={styles.sideTitle}>Фильтры</h3>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>Индустрия</div>
            <select className={styles.select} value={pendingIndustry} onChange={e => setPendingIndustry(e.target.value)}>
              <option value="">Все индустрии</option>
              <option value="IT">IT</option>
              <option value="Маркетинг">Маркетинг</option>
              <option value="Финансы">Финансы</option>
              <option value="Дизайн">Дизайн</option>
            </select>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>Навыки</div>
            <div className={styles.skillsScroll}>
              {STATIC_SKILLS.map(s => (
                <label key={s} className={styles.checkRow}>
                  <input type="checkbox" checked={pendingTags.includes(s)}
                    onChange={() => toggle(s, pendingTags, setPendingTags)} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>Уровень</div>
            {LEVELS.map(l => (
              <label key={l} className={styles.checkRow}>
                <input type="checkbox" checked={pendingLevels.includes(l)}
                  onChange={() => toggle(l, pendingLevels, setPendingLevels)} />
                {l}
              </label>
            ))}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>Город</div>
            <select className={styles.select} value={pendingCity} onChange={e => setPendingCity(e.target.value)}>
              <option value="">Все города</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>Формат работы</div>
            {FORMATS.map(f => (
              <label key={f} className={styles.checkRow}>
                <input type="checkbox" checked={pendingFormats.includes(f)}
                  onChange={() => toggle(f, pendingFormats, setPendingFormats)} />
                {f}
              </label>
            ))}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>Вид трудоустройства</div>
            {EMPLOYMENT.map(e => (
              <label key={e} className={styles.checkRow}>
                <input type="checkbox" checked={pendingEmployment.includes(e)}
                  onChange={() => toggle(e, pendingEmployment, setPendingEmployment)} />
                {e}
              </label>
            ))}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>Зарплата (KZT)</div>
            <div className={styles.salaryRow}>
              <span className={styles.salaryLbl}>От</span>
              <input className={styles.salaryInput} placeholder="0"
                value={pendingSalaryFrom} onChange={e => setPendingSalaryFrom(e.target.value)} />
            </div>
            <div className={styles.salaryRow}>
              <span className={styles.salaryLbl}>До</span>
              <input className={styles.salaryInput} placeholder="500 000"
                value={pendingSalaryTo} onChange={e => setPendingSalaryTo(e.target.value)} />
            </div>
          </div>

          <button className={styles.salaryApplyBtn} onClick={applyFilters}>
            Применить фильтры
          </button>
          <button className={styles.resetBtn} onClick={reset}>Сбросить</button>
        </aside>

        <main className={styles.main}>
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrap}>
              <span className={styles.searchIcon}><IconSearch size={14}/></span>
              <input
                className={styles.searchInput}
                placeholder="Поиск по названию вакансии или навыкам..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.sortWrap}>
              <span className={styles.sortLabel}>Сортировка:</span>
              <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
                <option>Самые новые</option>
                <option>По зарплате (убыв.)</option>
                <option>По зарплате (возр.)</option>
              </select>
            </div>
          </div>

          {loading && <div className={styles.stateMsg}><IconHourglass size={14}/> Загружаем вакансии...</div>}
          {apiError && <div className={styles.stateError}>{apiError}</div>}

          {!loading && !apiError && (
            <>
              <div className={styles.countRow}>Найдено вакансий: {vacancies.length}</div>
              <div className={styles.cards}>
                {vacancies.length === 0 && (
                  <div className={styles.stateMsg}>По вашему запросу ничего не найдено</div>
                )}
                {vacancies.map(v => {
                  const isFav = favoriteIds.has(String(v.id))
                  return (
                    <div key={v.id} className={styles.card}>
                      <div className={styles.cardLeft}>
                        <div className={styles.companyLogo}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="8" fill="#e8edf8"/>
                            <circle cx="20" cy="15" r="6" fill="#9aa8c8"/>
                            <path d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#b8c4d8"/>
                          </svg>
                        </div>
                        <div className={styles.cardInfo}>
                          <h3 className={styles.cardTitle}>{v.title}</h3>
                          <div className={styles.cardCompany}>{v.company}</div>
                          <div className={styles.cardMeta}>
                            {v.city && <span><IconPin size={12}/> {v.city}</span>}
                            {v.specialization && <span><IconBuilding size={12}/> {v.specialization}</span>}
                            <span><IconMoney size={12}/> {v.salary}</span>
                            <span><IconCalendar size={12}/> {v.type}</span>
                          </div>
                          <div className={styles.tags}>
                            {v.tags.map((t, i) => (
                              <span key={i} className={`${styles.tag} ${i === 0 ? styles.tagPink : styles.tagBlue}`}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className={styles.cardActions}>
                        {/* ─── Кнопка избранного ─── */}
                        <button
                          className={`${styles.bookmarkBtn} ${isFav ? styles.bookmarkActive : ''}`}
                          onClick={e => toggleFavorite(e, v.id)}
                          title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                        >
                          {isFav ? <IconBookmark size={16}/> : <IconBookmark size={16}/>}
                        </button>
                        <button className={styles.detailBtn} onClick={() => navigate(`/vacancies/${v.id}`)}>Подробнее →</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
