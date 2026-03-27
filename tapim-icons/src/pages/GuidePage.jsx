import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EmployerNav from './employer/EmployerNav'
import styles from './GuidePage.module.css'
import { IconBuilding, IconChat, IconClipboard, IconUser, IconBook, IconUsers, IconStore } from '../components/Icons'

const CANDIDATE_STEPS = [
  { n: 1, title: 'Создайте профиль', desc: 'Заполните информацию о себе, опыте работы и навыках' },
  { n: 2, title: 'Ищите вакансии', desc: 'Используйте фильтры для поиска подходящих вакансий' },
  { n: 3, title: 'Сохраняйте интересное', desc: 'Добавляйте понравившиеся вакансии в избранное' },
  { n: 4, title: 'Откликайтесь', desc: 'Отправляйте отклики на вакансии напрямую через платформу' },
]

const EMPLOYER_STEPS = [
  { n: 1, title: 'Создайте профиль компании', desc: 'Расскажите о вашей компании и технологиях' },
  { n: 2, title: 'Размещайте вакансии', desc: 'Опубликуйте открытые позиции с подробным описанием' },
  { n: 3, title: 'Ищите кандидатов', desc: 'Используйте поиск и фильтры для поиска специалистов' },
  { n: 4, title: 'Связывайтесь', desc: 'Приглашайте подходящих кандидатов на собеседование' },
]

export default function GuidePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Определяем роль по маршруту или по user
  const isEmployer = location.pathname.startsWith('/employer') || user?.role === 'recruiter'

  return (
    <div className={styles.page}>
      {/* NAV — зависит от роли */}
      {isEmployer ? (
        <EmployerNav />
      ) : (
        <nav className={styles.nav}>
          <span className={styles.logo} onClick={() => navigate('/')}>tap.im</span>
          <div className={styles.navLinks}>
            <button className={styles.navBtn} onClick={() => navigate('/vacancies')}>
              <IconBuilding size={15}/> Вакансии
            </button>
            <button className={styles.navBtn} onClick={() => navigate('/chat')}>
              <IconChat size={15}/> Сообщения
            </button>
            <button className={`${styles.navBtn} ${styles.active}`} onClick={() => navigate('/guide')}>
              <IconClipboard size={15}/> Quick Guide
            </button>
            <button className={styles.navBtn} onClick={() => navigate('/profile')}>
              <IconUser size={15}/> Профиль
            </button>
          </div>
        </nav>
      )}

      <div className={styles.content}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}><IconBook size={18}/> Быстрый старт</h2>
          <p className={styles.cardDesc}>
            Добро пожаловать на tap.im — платформу для поиска работы и талантов.
            Выберите свою роль и следуйте простым шагам для начала работы.
          </p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}><IconUsers size={18} className={styles.iconBlue}/> Для кандидатов</h2>
          <div className={styles.steps}>
            {CANDIDATE_STEPS.map(s => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <div>
                  <div className={styles.stepTitle}>{s.title}</div>
                  <div className={styles.stepDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}><IconStore size={18} className={styles.iconBlue}/> Для работодателей</h2>
          <div className={styles.steps}>
            {EMPLOYER_STEPS.map(s => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <div>
                  <div className={styles.stepTitle}>{s.title}</div>
                  <div className={styles.stepDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
