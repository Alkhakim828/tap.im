import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../api/index.js'
import { IconBulb } from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setRole, setRegName, setRegCompany } = useAuth()

  // If role passed via URL (?role=applicant or ?role=recruiter) — skip role step
  const urlRole = searchParams.get('role')
  const [step, setStep] = useState(() => {
    if (urlRole === 'applicant') return 'applicant'
    if (urlRole === 'recruiter') return 'recruiter1'
    return 'role'
  })
  const [userId, setUserId] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Applicant fields
  const [aEmail, setAEmail] = useState('')
  const [aPassword, setAPassword] = useState('')
  const [aConfirm, setAConfirm] = useState('')
  const [aName, setAName] = useState('')
  const [aCity, setACity] = useState('')

  // Recruiter step1 fields
  const [rEmail, setREmail] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [rConfirm, setRConfirm] = useState('')
  const [rName, setRName] = useState('')

  // Recruiter step2 fields
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('small')
  const [companySite, setCompanySite] = useState('')
  const [userRoleInCompany, setUserRoleInCompany] = useState('')

  // Verify
  const [code, setCode] = useState('')

  async function handleApplicantRegister() {
    if (!aEmail || !aPassword || !aConfirm || !aName || !aCity) {
      setError('Заполните все поля'); return
    }
    if (aPassword !== aConfirm) {
      setError('Пароли не совпадают'); return
    }
    setError(''); setLoading(true)
    try {
      const data = await authAPI.registerApplicant({
        email: aEmail,
        password: aPassword,
        confirm_password: aConfirm,
        first_name: aName,
        city: aCity,
      })
      setUserId(data.user_id)
      setRole('applicant')
      setRegName(aName)
      localStorage.setItem('pending_email', aEmail)
      navigate('/login')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleRecruiterStep1() {
    if (!rEmail || !rPassword || !rConfirm || !rName) {
      setError('Заполните все поля'); return
    }
    if (rPassword !== rConfirm) {
      setError('Пароли не совпадают'); return
    }
    setError(''); setLoading(true)
    try {
      const data = await authAPI.registerRecruiterStep1({
        email: rEmail,
        password: rPassword,
        confirm_password: rConfirm,
        first_name: rName,
      })
      setUserId(data.user_id)
      setRegName(rName)
      localStorage.setItem('pending_email', rEmail)
      setStep('recruiter2')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleRecruiterStep2() {
    if (!companyName || !userRoleInCompany) {
      setError('Заполните все обязательные поля'); return
    }
    setError(''); setLoading(true)
    try {
      await authAPI.registerRecruiterStep2({
        user_id: userId,
        company_name: companyName,
        company_size: companySize,
        company_site: companySite || undefined,
        user_role_in_company: userRoleInCompany,
      })
      setRole('recruiter')
      setRegCompany(companyName)
      navigate('/login')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleVerify() {
    if (!code || code.length !== 6) {
      setError('Введите 6-значный код'); return
    }
    setError(''); setLoading(true)
    try {
      await authAPI.verifyEmail({ user_id: userId, code })
      navigate('/login')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const leftImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80'

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <img src={leftImage} alt="team" className={styles.leftImg} />
        <div className={styles.leftOverlay} />
        <span className={styles.leftLogo}>tap.im</span>
        <div className={styles.leftCaption}>
          <span className={styles.bulb}><IconBulb size={22}/></span>
          <h2>Твоя точка роста начинается здесь</h2>
          <p>Действуй уже сегодня. Передавай опыт. Расти вместе с Tapim.</p>
          <div className={styles.dots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={`${styles.dot} ${styles.active}`} />
          </div>
        </div>
      </div>

      <div className={`${styles.right} ${styles.rightScroll}`}>
        <button className={styles.backLink} onClick={() => navigate('/')}>← На главную</button>

        <div className={`${styles.formWrap} ${styles.formWrapRegister}`}>

          {/* STEP: choose role */}
          {step === 'role' && (
            <>
              <h1>Создать аккаунт</h1>
              <p className={styles.sub}>Выберите вашу роль</p>
              <div className={styles.roleCards}>
                <div className={styles.roleCard} onClick={() => { setSelectedRole('applicant'); setStep('applicant') }}>
                  <div className={`${styles.roleIcon} ${styles.green}`}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#16a34a"/>
                      <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#16a34a"/>
                    </svg>
                  </div>
                  <h3>Я кандидат</h3>
                  <p>Ищу работу и хочу откликаться на вакансии.</p>
                </div>
                <div className={styles.roleCard} onClick={() => { setSelectedRole('recruiter'); setStep('recruiter1') }}>
                  <div className={`${styles.roleIcon} ${styles.yellow}`}>
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
              <div className={styles.switchRow}>
                Уже есть аккаунт? <span className={styles.switchLink} onClick={() => navigate('/login')}>Войти</span>
              </div>
            </>
          )}

          {/* STEP: applicant form */}
          {step === 'applicant' && (
            <>
              <h1>Регистрация</h1>
              <p className={styles.sub}>Создайте аккаунт кандидата</p>
              {error && <div className={styles.errorMsg}>{error}</div>}
              <div className={styles.formGroup}>
                <label>Email<span className={styles.req}>*</span></label>
                <input type="email" placeholder="Ввести email" value={aEmail} onChange={e => setAEmail(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Ваше имя<span className={styles.req}>*</span></label>
                <input type="text" placeholder="Ввести имя" value={aName} onChange={e => setAName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Ваш город<span className={styles.req}>*</span></label>
                <div className={styles.selectWrap}>
                  <select value={aCity} onChange={e => setACity(e.target.value)}>
                    <option value="">Выбрать город</option>
                    <option>Алматы</option>
                    <option>Астана</option>
                    <option>Шымкент</option>
                    <option>Москва</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Пароль<span className={styles.req}>*</span></label>
                <input type="password" placeholder="Минимум 6 символов" value={aPassword} onChange={e => setAPassword(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Подтверждение пароля<span className={styles.req}>*</span></label>
                <input type="password" placeholder="Повторить пароль" value={aConfirm} onChange={e => setAConfirm(e.target.value)} />
              </div>
              <button className={styles.btnPrimary} onClick={handleApplicantRegister} disabled={loading}>
                {loading ? 'Регистрируем...' : 'Создать аккаунт'}
              </button>
              <div className={styles.switchRow}>
                <span className={styles.switchLink} onClick={() => { setStep('role'); setError('') }}>← Назад</span>
              </div>
            </>
          )}

          {/* STEP: recruiter step 1 */}
          {step === 'recruiter1' && (
            <>
              <h1>Регистрация</h1>
              <p className={styles.sub}>Шаг 1 из 2 — личная информация</p>
              {error && <div className={styles.errorMsg}>{error}</div>}
              <div className={styles.formGroup}>
                <label>Email<span className={styles.req}>*</span></label>
                <input type="email" placeholder="Ввести email" value={rEmail} onChange={e => setREmail(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Ваше имя<span className={styles.req}>*</span></label>
                <input type="text" placeholder="Ввести имя" value={rName} onChange={e => setRName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Пароль<span className={styles.req}>*</span></label>
                <input type="password" placeholder="Минимум 6 символов" value={rPassword} onChange={e => setRPassword(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Подтверждение пароля<span className={styles.req}>*</span></label>
                <input type="password" placeholder="Повторить пароль" value={rConfirm} onChange={e => setRConfirm(e.target.value)} />
              </div>
              <button className={styles.btnPrimary} onClick={handleRecruiterStep1} disabled={loading}>
                {loading ? 'Далее...' : 'Далее →'}
              </button>
              <div className={styles.switchRow}>
                <span className={styles.switchLink} onClick={() => { setStep('role'); setError('') }}>← Назад</span>
              </div>
            </>
          )}

          {/* STEP: recruiter step 2 */}
          {step === 'recruiter2' && (
            <>
              <h1>О компании</h1>
              <p className={styles.sub}>Шаг 2 из 2 — информация о компании</p>
              {error && <div className={styles.errorMsg}>{error}</div>}
              <div className={styles.formGroup}>
                <label>Название компании<span className={styles.req}>*</span></label>
                <input type="text" placeholder="Название компании" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Ваша должность<span className={styles.req}>*</span></label>
                <input type="text" placeholder="Например: HR Manager" value={userRoleInCompany} onChange={e => setUserRoleInCompany(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Размер компании<span className={styles.req}>*</span></label>
                <div className={styles.selectWrap}>
                  <select value={companySize} onChange={e => setCompanySize(e.target.value)}>
                    <option value="small">Маленькая (до 50)</option>
                    <option value="medium">Средняя (50–200)</option>
                    <option value="big">Крупная (200+)</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Сайт компании</label>
                <input type="text" placeholder="https://company.com (необязательно)" value={companySite} onChange={e => setCompanySite(e.target.value)} />
              </div>
              <button className={styles.btnPrimary} onClick={handleRecruiterStep2} disabled={loading}>
                {loading ? 'Сохраняем...' : 'Завершить регистрацию'}
              </button>
            </>
          )}

          {/* STEP: verify email */}
          {step === 'verify' && (
            <>
              <h1>Подтвердите email</h1>
              <p className={styles.sub}>Мы отправили 6-значный код на вашу почту</p>
              {error && <div className={styles.errorMsg}>{error}</div>}
              <div className={styles.formGroup}>
                <label>Код подтверждения<span className={styles.req}>*</span></label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  style={{ letterSpacing: '0.3em', fontSize: '20px', textAlign: 'center' }}
                />
              </div>
              <button className={styles.btnPrimary} onClick={handleVerify} disabled={loading}>
                {loading ? 'Проверяем...' : 'Подтвердить'}
              </button>
              <div className={styles.switchRow} style={{ color: '#6b7280', fontSize: '13px' }}>
                После подтверждения вы будете перенаправлены на страницу входа
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
