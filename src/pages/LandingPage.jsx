import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RoleModal from '../components/RoleModal'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <span className={styles.logo}>tap.im</span>
        <div className={styles.navActions}>
          <button
            className={styles.btnOutline}
            onClick={() => setModalOpen(true)}
          >
            Зарегистрироваться
          </button>
          <button
            className={styles.btnSolid}
            onClick={() => navigate('/login')}
          >
            Войти
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>business.tapim</h1>
          <p className={styles.heroDesc}>
            Tapim — это удобная онлайн-платформа для поиска
            работы и сотрудников. Мы объединяем кандидатов
            и работодателей в одном пространстве, где можно
            быстро находить подходящие вакансии или
            профессионалов для своей команды.
          </p>
          <div className={styles.heroBtns}>
            <button
              className={styles.btnTry}
              onClick={() => navigate('/login')}
            >
              Попробовать →
            </button>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>500+</span>
              <span className={styles.statLabel}>Вакансий</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>1 200+</span>
              <span className={styles.statLabel}>Кандидатов</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>98%</span>
              <span className={styles.statLabel}>Довольных</span>
            </div>
          </div>
        </div>

        <div className={styles.heroImageWrap}>
          <img src="/customer-question.png" alt="tapim hero" className={styles.heroImg} />
        </div>

        {/* Floating decorative dots */}
        <div className={styles.floatingDot1} />
        <div className={styles.floatingDot2} />
        <div className={styles.floatingDot3} />
      </div>

      {/* ROLE MODAL */}
      {modalOpen && <RoleModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
