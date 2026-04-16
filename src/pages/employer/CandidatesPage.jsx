import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileAPI, favoriteProfilesAPI, extractFavoriteIds } from '../../api/index.js'
import { useAuth } from '../../context/AuthContext'
import EmployerNav from './EmployerNav'
import styles from './CandidatesPage.module.css'
import { IconHourglass, IconPin, IconBookmark, IconMail } from '../../components/Icons'

const SKILLS = ['React', 'TypeScript', 'Python', 'Node.js', 'Docker', 'AWS',
  'Vue.js', 'Angular', 'PostgreSQL', 'MongoDB', 'Kubernetes', 'Git',
  'Java', 'C++', 'SQL', 'Django', 'Figma', 'Photoshop']
const LEVELS = ['Intern', 'Junior', 'Middle', 'Senior', 'Lead']

export default function CandidatesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [allCandidates, setAllCandidates] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [apiError, setApiError] = useState('')
  const [search,   setSearch]   = useState('')
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [favBusy,  setFavBusy]  = useState(new Set())
  const [toast,    setToast]    = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2000) }

  // Pending (до нажатия Применить)
  const [pendingSkills,      setPendingSkills]      = useState([])
  const [pendingLevels,      setPendingLevels]      = useState([])
  const [pendingCity,        setPendingCity]        = useState('')
  const [pendingSalaryFrom,  setPendingSalaryFrom]  = useState('')
  const [pendingSalaryTo,    setPendingSalaryTo]    = useState('')

  // Applied (после нажатия Применить)
  const [appliedSkills,      setAppliedSkills]      = useState([])
  const [appliedLevels,      setAppliedLevels]      = useState([])
  const [appliedCity,        setAppliedCity]        = useState('')
  const [appliedSalaryFrom,  setAppliedSalaryFrom]  = useState('')
  const [appliedSalaryTo,    setAppliedSalaryTo]    = useState('')

  function toggle(val, list, setList) {
    setList(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])
  }

  function applyFilters() {
    setAppliedSkills(pendingSkills)
    setAppliedLevels(pendingLevels)
    setAppliedCity(pendingCity)
    setAppliedSalaryFrom(pendingSalaryFrom)
    setAppliedSalaryTo(pendingSalaryTo)
  }

  function reset() {
    setPendingSkills([]); setPendingLevels([]); setPendingCity('')
    setPendingSalaryFrom(''); setPendingSalaryTo('')
    setAppliedSkills([]); setAppliedLevels([]); setAppliedCity('')
    setAppliedSalaryFrom(''); setAppliedSalaryTo('')
    setSearch('')
  }

  useEffect(() => {
    setLoading(true)
    profileAPI.getAllProfiles()
      .then(data => setAllCandidates(data || []))
      .catch(() => setApiError('Не удалось загрузить анкеты'))
      .finally(() => setLoading(false))
  }, [])

  // Загружаем избранных кандидатов (по умолчанию при открытии страницы)
  useEffect(() => {
    if (!user?.userId) return
    favoriteProfilesAPI.getFavoriteProfiles(user.userId)
      .then(data => {
        const ids = extractFavoriteIds(data)
        console.log('⭐ Loaded favorite profiles:', Array.from(ids))
        setFavoriteIds(ids)
      })
      .catch(err => {
        // 404 = ничего не сохранено. Всё остальное логируем.
        if (!/404|not found/i.test(err.message)) {
          console.error('Failed to load favorites:', err)
        }
        setFavoriteIds(new Set())
      })
  }, [user?.userId])

  async function toggleFavorite(candidateId) {
    if (!user?.userId || candidateId == null) return
    const id = String(candidateId)
    if (favBusy.has(id)) return

    setFavBusy(prev => { const next = new Set(prev); next.add(id); return next })
    const isFav = favoriteIds.has(id)

    // Оптимистичный апдейт
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (isFav) next.delete(id); else next.add(id)
      return next
    })

    try {
      if (isFav) {
        await favoriteProfilesAPI.removeFavoriteProfile(user.userId, candidateId)
        showToast('Удалено из избранного')
      } else {
        await favoriteProfilesAPI.addFavoriteProfile(user.userId, candidateId)
        showToast('✅ Добавлено в избранное')
      }
    } catch (e) {
      // Откатываем при ошибке
      setFavoriteIds(prev => {
        const next = new Set(prev)
        if (isFav) next.add(id); else next.delete(id)
        return next
      })
      showToast('❌ ' + e.message)
    } finally {
      setFavBusy(prev => { const next = new Set(prev); next.delete(id); return next })
    }
  }

  const candidates = allCandidates.filter(c => {
    if (search) {
      const q = search.toLowerCase()
      const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase()
      if (!fullName.includes(q) &&
          !c.specialization?.toLowerCase().includes(q) &&
          !(c.skills || []).some(s => s.toLowerCase().includes(q))) return false
    }
    if (appliedCity && c.city && !c.city.toLowerCase().includes(appliedCity.toLowerCase())) return false
    if (appliedLevels.length && !appliedLevels.map(l => l.toLowerCase()).includes((c.level || '').toLowerCase())) return false
    if (appliedSkills.length && !appliedSkills.some(s => (c.skills || []).includes(s))) return false
    // Исправленная логика зарплаты:
    // salaryFrom — кандидат хочет НЕ МЕНЬШЕ чем указано (его salary_min >= наш From)
    if (appliedSalaryFrom && c.salary_min && c.salary_min < Number(appliedSalaryFrom)) return false
    // salaryTo — кандидат хочет НЕ БОЛЬШЕ чем указано (его salary_min <= наш To)
    if (appliedSalaryTo && c.salary_min && c.salary_min > Number(appliedSalaryTo)) return false
    return true
  })

  return (
    <div className={styles.page}>
      <EmployerNav />
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h3 className={styles.sideTitle}>Фильтры</h3>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>Навыки</div>
            <div className={styles.skillsScroll}>
              {SKILLS.map(s => (
                <label key={s} className={styles.checkRow}>
                  <input type="checkbox" checked={pendingSkills.includes(s)}
                    onChange={() => toggle(s, pendingSkills, setPendingSkills)} />
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
              <option value="Алматы">Алматы</option>
              <option value="Астана">Астана</option>
              <option value="Шымкент">Шымкент</option>
              <option value="Almaty">Almaty</option>
            </select>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>Зарплатные ожидания (KZT)</div>
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
            <input className={styles.searchInput}
              placeholder="Поиск по имени, специализации или навыкам..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <div className={styles.sortWrap}>
              <span className={styles.sortLabel}>Сортировка:</span>
              <select className={styles.sortSelect}>
                <option>Самые новые</option>
                <option>По заполненности</option>
              </select>
            </div>
          </div>

          {loading && <div className={styles.stateMsg}><IconHourglass size={14}/> Загружаем анкеты...</div>}
          {apiError && <div className={styles.stateError}>{apiError}</div>}

          {!loading && !apiError && (
            <>
              <div className={styles.countRow}>Найдено кандидатов: {candidates.length}</div>
              {candidates.length === 0 && (
                <div className={styles.stateMsg}>По вашему запросу никого не найдено</div>
              )}
              <div className={styles.grid}>
                {candidates.map(c => (
                  <div key={c.user_id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardAvatarWrap}>
                        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                          <rect width="52" height="52" rx="8" fill="#e8edf8"/>
                          <circle cx="26" cy="19" r="8" fill="#9aa8c8"/>
                          <path d="M8 48c0-9.941 8.059-18 18-18s18 8.059 18 18" fill="#b8c4d8"/>
                        </svg>
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardName}>
                          {[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Имя не указано'}
                        </h3>
                        <div className={styles.cardRole}>
                          {c.specialization || <span style={{color:'#d1d5db'}}>Специализация не указана</span>}
                        </div>
                        <div className={styles.cardMeta}>
                          {c.city && <span><IconPin size={12}/> {c.city}</span>}
                          {c.level && <span className={styles.levelPill}>{c.level}</span>}
                        </div>
                      </div>
                      <button
                        className={`${styles.bookmarkBtn} ${favoriteIds.has(String(c.user_id)) ? styles.bookmarkActive : ''}`}
                        onClick={() => toggleFavorite(c.user_id)}
                        disabled={favBusy.has(String(c.user_id))}
                        title={favoriteIds.has(String(c.user_id)) ? 'В избранном' : 'Добавить в избранное'}
                      >
                        <IconBookmark size={14}/>
                      </button>
                    </div>

                    {(c.skills || []).length > 0 && (
                      <div className={styles.tags}>
                        {(c.skills || []).slice(0, 4).map(t => (
                          <span key={t} className={styles.tag}>{t}</span>
                        ))}
                      </div>
                    )}

                    {(c.salary_min || c.salary_max) && (
                      <div className={styles.salary}>
                        {c.salary_min && c.salary_max
                          ? `${Number(c.salary_min).toLocaleString('ru')} - ${Number(c.salary_max).toLocaleString('ru')} KZT`
                          : c.salary_min
                            ? `от ${Number(c.salary_min).toLocaleString('ru')} KZT`
                            : `до ${Number(c.salary_max).toLocaleString('ru')} KZT`}
                      </div>
                    )}

                    <div className={styles.divider} />
                    <div className={styles.cardActions}>
                      <button className={styles.profileBtn} onClick={() => navigate(`/employer/candidates/${c.user_id}`)}>Открыть профиль</button>
                      <button className={styles.iconBtn}
                        title="Написать сообщение"
                        onClick={() => navigate('/employer/chat', {
                          state: {
                            chatWith: {
                              userId: c.user_id,
                              name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Кандидат',
                              role: c.specialization || '',
                            }
                          }
                        })}>
                        <IconMail size={15}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
