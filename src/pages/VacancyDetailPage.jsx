import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { vacanciesAPI, favoritesAPI } from '../api/index.js'
import { useAuth } from '../context/AuthContext'
import styles from './VacancyDetailPage.module.css'
import { IconHourglass, IconX, IconPin, IconBuilding, IconMoney, IconCalendar, IconBookmark, IconUser, IconPhone, IconUsers, IconChat, IconClipboard } from '../components/Icons'

export default function VacancyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [vacancy, setVacancy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [isFav,   setIsFav]   = useState(false)
  const [toast,   setToast]   = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2000) }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    vacanciesAPI.getById(id)
      .then(data => { setVacancy(data); setLoading(false) })
      .catch(() => { setError('Не удалось загрузить вакансию'); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!user?.userId) return
    favoritesAPI.getFavorites(user.userId)
      .then(data => {
        const ids = (data || []).map(f => String(f.vacancy_id || f.id || f))
        setIsFav(ids.includes(String(id)))
      })
      .catch(() => {})
  }, [user?.userId, id])

  async function toggleFav() {
    if (!user?.userId) return
    try {
      if (isFav) {
        await favoritesAPI.removeFavorite(user.userId, id)
        setIsFav(false)
        showToast('Удалено из избранного')
      } else {
        await favoritesAPI.addFavorite(user.userId, id)
        setIsFav(true)
        showToast('✅ Добавлено в избранное')
      }
    } catch (e) { showToast('❌ ' + e.message) }
  }

  // Определяем откуда пришли — кандидат или работодатель
  const isEmployer = user?.role === 'recruiter'
  const backPath   = isEmployer ? '/employer/candidates' : '/vacancies'

  function goBack() { navigate(-1) }

  if (loading) return (
    <div className={styles.page}>
      <Nav isEmployer={isEmployer} navigate={navigate} />
      <div className={styles.center}><IconHourglass size={16}/> Загружаем вакансию...</div>
    </div>
  )

  if (error || !vacancy) return (
    <div className={styles.page}>
      <Nav isEmployer={isEmployer} navigate={navigate} />
      <div className={styles.center}><IconX size={16}/> {error || 'Вакансия не найдена'}</div>
    </div>
  )

  const salary = vacancy.salary_min && vacancy.salary_max
    ? `${Number(vacancy.salary_min).toLocaleString('ru')} – ${Number(vacancy.salary_max).toLocaleString('ru')} ${vacancy.salary_currency || 'KZT'}`
    : vacancy.salary_min
      ? `от ${Number(vacancy.salary_min).toLocaleString('ru')} ${vacancy.salary_currency || 'KZT'}`
      : 'Не указана'

  const tags = (vacancy.tags || []).filter(t =>
    t && typeof t === 'string' && t.length < 30 &&
    !t.toLowerCase().includes('зарплат') && !t.toLowerCase().includes('указан')
  )

  return (
    <div className={styles.page}>
      <Nav isEmployer={isEmployer} navigate={navigate} />
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.container}>
        <button className={styles.backBtn} onClick={goBack}>← Назад</button>

        {/* HEADER CARD */}
        <div className={styles.card}>
          <div className={styles.headerRow}>
            <div className={styles.logoWrap}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="10" fill="#e8edf8"/>
                <circle cx="28" cy="21" r="9" fill="#9aa8c8"/>
                <path d="M10 50c0-9.941 8.059-18 18-18s18 8.059 18 18" fill="#b8c4d8"/>
              </svg>
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>{vacancy.position_name || '—'}</h1>
              <div className={styles.company}>{vacancy.company_name || '—'}</div>
              <div className={styles.metaRow}>
                {vacancy.location    && <span className={styles.meta}><IconPin size={12}/> {vacancy.location}</span>}
                {vacancy.specialization && <span className={styles.meta}><IconBuilding size={12}/> {vacancy.specialization}</span>}
                <span className={styles.meta}><IconMoney size={12}/> {salary}</span>
                {vacancy.salary_type && <span className={styles.meta}><IconCalendar size={12}/> {vacancy.salary_type === 'monthly' ? 'В месяц' : vacancy.salary_type}</span>}
              </div>
              {tags.length > 0 && (
                <div className={styles.tags}>
                  {tags.map((t, i) => (
                    <span key={i} className={`${styles.tag} ${i === 0 ? styles.tagPink : styles.tagBlue}`}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            {!isEmployer && (
              <button
                className={`${styles.favBtn} ${isFav ? styles.favActive : ''}`}
                onClick={toggleFav}
                title={isFav ? 'Удалить из избранного' : 'В избранное'}
              >
                <IconBookmark size={16}/>
              </button>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        {vacancy.vacancy_description && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Описание вакансии</h2>
            <p className={styles.description}>{vacancy.vacancy_description}</p>
          </div>
        )}

        {/* CONTACT */}
        {(vacancy.contact_name || vacancy.contact_phone) && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Контакты</h2>
            <div className={styles.contactList}>
              {vacancy.contact_name  && <div className={styles.contactRow}><IconUser size={13}/> {vacancy.contact_name}</div>}
              {vacancy.contact_phone && <div className={styles.contactRow}><IconPhone size={13}/> {vacancy.contact_phone}</div>}
            </div>
          </div>
        )}

        {/* APPLY BUTTON (only for candidates) */}
        {!isEmployer && (
          <button className={styles.applyBtn}>
            Откликнуться на вакансию
          </button>
        )}
      </div>
    </div>
  )
}

function Nav({ isEmployer, navigate }) {
  if (isEmployer) {
    // Импортируем EmployerNav динамически через lazy не подходит, делаем inline
    return (
      <nav className={styles.nav}>
        <span className={styles.logo} onClick={() => navigate('/employer/profile')}>tap.im</span>
        <div className={styles.navLinks}>
          <button className={`${styles.navBtn} ${styles.active}`} onClick={() => navigate('/employer/candidates')}><IconUsers size={14}/> Анкеты</button>
          <button className={styles.navBtn} onClick={() => navigate('/employer/chat')}><IconChat size={14}/> Сообщения</button>
          <button className={styles.navBtn} onClick={() => navigate('/employer/guide')}><IconClipboard size={14}/> Quick Guide</button>
          <button className={styles.navBtn} onClick={() => navigate('/employer/profile')}><IconBuilding size={14}/> Профиль</button>
        </div>
      </nav>
    )
  }
  return (
    <nav className={styles.nav}>
      <span className={styles.logo} onClick={() => navigate('/')}>tap.im</span>
      <div className={styles.navLinks}>
        <button className={`${styles.navBtn} ${styles.active}`} onClick={() => navigate('/vacancies')}><IconBuilding size={14}/> Вакансии</button>
        <button className={styles.navBtn} onClick={() => navigate('/chat')}><IconChat size={14}/> Сообщения</button>
        <button className={styles.navBtn} onClick={() => navigate('/guide')}><IconClipboard size={14}/> Quick Guide</button>
        <button className={styles.navBtn} onClick={() => navigate('/profile')}><IconUser size={14}/> Профиль</button>
      </div>
    </nav>
  )
}
