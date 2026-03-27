import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconBulb } from '../components/Icons'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 🔥 СЛАЙДЫ
  const slides = [
    {
      img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80",
      title: "Твоя точка роста начинается здесь",
      text: "Действуй уже сегодня. Передавай опыт. Расти вместе с Tapim."
    },
    {
      img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80",
      title: "Найди работу быстрее",
      text: "Умные рекомендации и удобный поиск вакансий."
    },
    {
      img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80",
      title: "Развивай карьеру",
      text: "Аналитика навыков и рост вместе с платформой."
    }
  ]

  const [currentSlide, setCurrentSlide] = useState(0)

  // 🔄 Автопереключение
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  async function handleLogin() {
    if (!email || !password) {
      setError('Заполните все поля')
      return
    }

    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)

      if (user.role === 'recruiter') {
        navigate('/employer/profile')
      } else {
        navigate('/vacancies')
      }
    } catch (e) {
      setError(e.message || 'Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      
      {/* 🔥 ЛЕВАЯ ЧАСТЬ (СЛАЙДЕР) */}
      <div className={styles.left}>
        <div className={styles.slider}>
          
          {slides.map((slide, index) => (
            <img
              key={index}
              src={slide.img}
              alt=""
              className={`${styles.leftImg} ${index === currentSlide ? styles.activeSlide : ''}`}
            />
          ))}

          <div className={styles.leftOverlay} />
          <span className={styles.leftLogo}>tap.im</span>

          <div className={styles.leftCaption}>
            <span className={styles.bulb}><IconBulb size={22}/></span>
            <h2>{slides[currentSlide].title}</h2>
            <p>{slides[currentSlide].text}</p>

            <div className={styles.dots}>
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dot} ${i === currentSlide ? styles.active : ''}`}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ */}
      <div className={styles.right}>
        <button className={styles.backLink} onClick={() => navigate('/')}>
          ← На главную
        </button>

        <div className={styles.formWrap}>
          <h1>Добро пожаловать в Tapim!</h1>
          <p className={styles.sub}>Войдите для доступа к контенту и связи</p>

          <div className={styles.formGroup}>
            <label>Email<span className={styles.req}>*</span></label>
            <input
              type="email"
              placeholder="Ввести email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Пароль<span className={styles.req}>*</span></label>
            <input
              type="password"
              placeholder="Ввести пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.forgotRow}>
            <label className={styles.checkLabel}>
              <input type="checkbox" defaultChecked />
              Запомнить меня
            </label>

            <span className={styles.link} onClick={() => navigate('/forgot-password')}>
              Забыли пароль? <u>Восстановить</u>
            </span>
          </div>

          <button
            className={styles.btnPrimary}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>

          <div className={styles.switchRow}>
            <span
              className={styles.switchLink}
              onClick={() => navigate('/register')}
            >
              Создать аккаунт
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}