import { useNavigate, useLocation } from 'react-router-dom'
import styles from './EmployerNav.module.css'
import { IconUsers, IconChat, IconClipboard, IconBuilding } from '../../components/Icons'

export default function EmployerNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const p = location.pathname

  return (
    <nav className={styles.nav}>
      <span className={styles.logo} onClick={() => navigate('/employer/profile')}>tap.im</span>
      <div className={styles.navLinks}>
        <button className={`${styles.navBtn} ${p === '/employer/candidates' ? styles.active : ''}`}
          onClick={() => navigate('/employer/candidates')}>
          <IconUsers size={15}/> Анкеты
        </button>
        <button className={`${styles.navBtn} ${p === '/employer/chat' ? styles.active : ''}`}
          onClick={() => navigate('/employer/chat')}>
          <IconChat size={15}/> Сообщения
        </button>
        <button className={`${styles.navBtn} ${p === '/employer/guide' ? styles.active : ''}`}
          onClick={() => navigate('/employer/guide')}>
          <IconClipboard size={15}/> Quick Guide
        </button>
        <button className={`${styles.navBtn} ${p.startsWith('/employer/profile') ? styles.active : ''}`}
          onClick={() => navigate('/employer/profile')}>
          <IconBuilding size={15}/> Профиль
        </button>
      </div>
    </nav>
  )
}
