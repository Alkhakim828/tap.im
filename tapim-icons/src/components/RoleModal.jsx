import { useNavigate } from 'react-router-dom'
import styles from './RoleModal.module.css'

export default function RoleModal({ onClose }) {
  const navigate = useNavigate()

  function choose(role) {
    onClose()
    // Pass role via URL so RegisterPage skips the role selection step
    navigate(`/register?role=${role}`)
  }

  function handleOverlay(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>×</button>
        <h2 className={styles.title}>Пожалуйста, выберите вашу роль</h2>
        <div className={styles.cards}>

          <div className={styles.card} onClick={() => choose('applicant')}>
            <div className={`${styles.iconWrap} ${styles.green}`}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#16a34a"/>
                <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#16a34a"/>
              </svg>
            </div>
            <h3>Я кандидат</h3>
            <p>Ищу работу и хочу откликаться на вакансии.</p>
          </div>

          <div className={styles.card} onClick={() => choose('recruiter')}>
            <div className={`${styles.iconWrap} ${styles.yellow}`}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" fill="#ca8a04"/>
                <rect x="7" y="8" width="10" height="2" rx="1" fill="#fff"/>
                <rect x="7" y="12" width="10" height="2" rx="1" fill="#fff"/>
                <rect x="7" y="16" width="6" height="2" rx="1" fill="#fff"/>
              </svg>
            </div>
            <h3>Я работодатель</h3>
            <p>Ищу сотрудников и хочу размещать вакансии.</p>
          </div>

        </div>
      </div>
    </div>
  )
}
