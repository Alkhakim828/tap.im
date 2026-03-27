import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { vacanciesAPI, companiesAPI } from '../../api/index.js'
import EmployerNav from './EmployerNav'
import styles from './EmployerProfile.module.css'
import { IconEdit, IconHourglass, IconPin, IconUsers, IconLink, IconMail, IconPhone, IconClipboard, IconMoney, IconBookmark } from '../../components/Icons'

const TABS = ['Основные', 'Открытые вакансии', 'Сохраненные анкеты']

export default function EmployerProfilePage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Основные')

  return (
    <div className={styles.page}>
      <EmployerNav />
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {TABS.map(t => (
            <button key={t}
              className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
          <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/') }}>
            Выйти
          </button>
        </aside>
        <div className={styles.main}>
          {tab === 'Основные' && <MainTab user={user} />}
          {tab === 'Открытые вакансии' && <VacanciesTab user={user} />}
          {tab === 'Сохраненные анкеты' && <SavedTab />}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, onSave, saving }) {
  const [editing, setEditing] = useState(false)
  async function handleSave() {
    if (onSave) await onSave()
    setEditing(false)
  }
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        {title && <h3 className={styles.sectionTitle}>{title}</h3>}
        <button className={styles.editBtn} onClick={() => setEditing(e => !e)}><IconEdit size={14}/></button>
      </div>
      {children(editing)}
      {editing && (
        <div className={styles.editActions}>
          <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Отмена</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      )}
    </div>
  )
}

function MainTab({ user }) {
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [companySite, setCompanySite] = useState('')
  const [userRole,    setUserRole]    = useState('')
  const [city,        setCity]        = useState('')
  const [industry,    setIndustry]    = useState('')
  const [about,       setAbout]       = useState('')
  const [linkedin,    setLinkedin]    = useState('')
  const [phone,       setPhone]       = useState('')
  const [email,       setEmail]       = useState('')
  const [stack,       setStack]       = useState('')
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState('')
  const [loaded,      setLoaded]      = useState(false)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // Загружаем данные компании при монтировании
  useEffect(() => {
    if (!user?.userId) return
    companiesAPI.getCompany(user.userId)
      .then(data => {
        if (!data) return
        setCompanyName(data.company_name || '')
        setCompanySize(data.company_size || '')
        setCompanySite(data.company_site || '')
        setUserRole(data.user_role_in_company || '')
        setCity(data.city || '')
        setIndustry(data.industry || '')
        setAbout(data.about || '')
        setLinkedin(data.linkedin || '')
        setPhone(data.phone || '')
        setEmail(data.email || user?.email || '')
        setStack(data.stack || '')
        setLoaded(true)
      })
      .catch(() => {
        // Компания ещё не создана — просто используем дефолты
        setEmail(user?.email || '')
        setCompanyName(user?.company || '')
        setLoaded(true)
      })
  }, [user?.userId])

  async function saveAll() {
    if (!user?.userId) return
    setSaving(true)
    try {
      await companiesAPI.updateCompany(user.userId, {
        company_name: companyName,
        company_size: companySize,
        company_site: companySite || null,
        user_role_in_company: userRole,
        city: city || null,
        industry: industry || null,
        about: about || null,
        linkedin: linkedin || null,
        phone: phone || null,
        email: email || null,
        stack: stack || null,
      })
      showToast('✅ Сохранено')
    } catch (e) {
      showToast('❌ ' + e.message)
    } finally { setSaving(false) }
  }

  if (!loaded) return <div style={{padding:'40px',textAlign:'center'}}><IconHourglass size={16}/> Загружаем профиль...</div>

  return (
    <div className={styles.sections}>
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* COMPANY HERO */}
      <Section title="" onSave={saveAll} saving={saving}>
        {(editing) => (
          <div className={styles.heroRow}>
            <div className={styles.companyLogoWrap}>
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                <rect width="90" height="90" rx="12" fill="#f3f4f6"/>
                <text x="45" y="28" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="700">COMPANY</text>
                <rect x="30" y="50" width="8" height="16" fill="#d1d5db"/>
                <rect x="41" y="42" width="8" height="24" fill="#d1d5db"/>
                <rect x="52" y="56" width="8" height="10" fill="#d1d5db"/>
              </svg>
            </div>
            <div className={styles.heroInfo}>
              {editing ? (
                <div className={styles.editGrid}>
                  <input className={styles.editInput} placeholder="Название компании" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                  <input className={styles.editInput} placeholder="Ваша должность (HR Manager...)" value={userRole} onChange={e => setUserRole(e.target.value)} />
                  <input className={styles.editInput} placeholder="Индустрия (FinTech, IT...)" value={industry} onChange={e => setIndustry(e.target.value)} />
                  <input className={styles.editInput} placeholder="Город" value={city} onChange={e => setCity(e.target.value)} />
                  <select className={styles.editSelect} value={companySize} onChange={e => setCompanySize(e.target.value)}>
                    <option value="">Размер компании</option>
                    <option value="small">Маленькая (до 50)</option>
                    <option value="medium">Средняя (50–200)</option>
                    <option value="big">Крупная (200+)</option>
                  </select>
                </div>
              ) : (
                <>
                  <h2 className={styles.companyName}>
                    {companyName || <span className={styles.empty}>Название компании не указано</span>}
                  </h2>
                  {userRole && <div className={styles.companyType}>{userRole}</div>}
                  <div className={styles.companyType}>
                    {industry || <span className={styles.empty}>Индустрия не указана</span>}
                  </div>
                  <div className={styles.companyMeta}>
                    {city && <span><IconPin size={12}/> {city}</span>}
                    {companySize && <span><IconUsers size={12}/> {companySize === 'small' ? 'до 50' : companySize === 'medium' ? '50–200' : '200+'} сотрудников</span>}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ABOUT */}
      <Section title="О компании" onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <textarea className={styles.editTextarea}
            placeholder="Расскажите о вашей компании, миссии и продуктах..."
            value={about} onChange={e => setAbout(e.target.value)} rows={4} />
        ) : (
          <p className={about ? styles.aboutText : styles.emptyHint}>
            {about || 'Нажмите на иконку редактирования, чтобы добавить описание компании'}
          </p>
        )}
      </Section>

      {/* CONTACTS */}
      <Section title="Контактная информация" onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <div className={styles.editStack}>
            <input className={styles.editInput} placeholder="Сайт: https://company.com" value={companySite} onChange={e => setCompanySite(e.target.value)} />
            <input className={styles.editInput} placeholder="LinkedIn: linkedin.com/company/..." value={linkedin} onChange={e => setLinkedin(e.target.value)} />
            <input className={styles.editInput} placeholder="Email: hr@company.com" value={email} onChange={e => setEmail(e.target.value)} />
            <input className={styles.editInput} placeholder="Телефон: +7 (999) 000-00-00" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        ) : (
          <div className={styles.contactList}>
            {companySite ? <div className={styles.contactRow}><IconLink size={13}/> <a href={companySite} target="_blank" rel="noreferrer">{companySite}</a></div> : <div className={styles.contactEmpty}>Сайт не указан</div>}
            {linkedin    ? <div className={styles.contactRow}><IconLink size={13}/> <a href={linkedin} target="_blank" rel="noreferrer">{linkedin}</a></div>    : <div className={styles.contactEmpty}>LinkedIn не указан</div>}
            {email       ? <div className={styles.contactRow}><IconMail size={13}/> {email}</div>  : <div className={styles.contactEmpty}>Email не указан</div>}
            {phone       ? <div className={styles.contactRow}><IconPhone size={13}/> {phone}</div>  : <div className={styles.contactEmpty}>Телефон не указан</div>}
          </div>
        )}
      </Section>

      {/* STACK */}
      <Section title="Технологии компании" onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <input className={styles.editInput}
            placeholder="React, Node.js, PostgreSQL, Docker..."
            value={stack} onChange={e => setStack(e.target.value)} />
        ) : (
          stack
            ? <div className={styles.contactRow}>{stack}</div>
            : <p className={styles.emptyHint}>Технологии не добавлены</p>
        )}
      </Section>

      {/* SECURITY */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Безопасность</h3>
        <button className={styles.changePassBtn}>Изменить пароль</button>
      </div>
    </div>
  )
}

function VacanciesTab({ user }) {
  const storageKey = `employer_vacancies_${user?.userId}`
  const loadVacancies = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') }
    catch { return [] }
  }

  const [vacancies, setVacancies] = useState(loadVacancies)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState('')
  const [positionName,   setPositionName]   = useState('')
  const [location,       setLocation]       = useState('')
  const [specialization, setSpecialization] = useState('')
  const [description,    setDescription]    = useState('')
  const [salaryMin,      setSalaryMin]      = useState('')
  const [salaryMax,      setSalaryMax]      = useState('')
  const [currency,       setCurrency]       = useState('KZT')
  const [contactName,    setContactName]    = useState('')
  const [contactPhone,   setContactPhone]   = useState('')
  const [tags,           setTags]           = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500) }
  function resetForm() {
    setPositionName(''); setLocation(''); setSpecialization('')
    setDescription(''); setSalaryMin(''); setSalaryMax('')
    setCurrency('KZT'); setContactName(''); setContactPhone(''); setTags('')
  }

  async function handleCreate() {
    if (!positionName) { showToast('❌ Укажите название должности'); return }
    setSaving(true)
    try {
      await vacanciesAPI.create({
        company_name: user?.company || '',
        position_name: positionName,
        location: location || undefined,
        specialization: specialization || undefined,
        vacancy_description: description || undefined,
        salary_min: salaryMin ? Number(salaryMin) : undefined,
        salary_max: salaryMax ? Number(salaryMax) : undefined,
        salary_currency: currency,
        salary_type: 'monthly',
        contact_name: contactName || undefined,
        contact_phone: contactPhone || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      })
      showToast('✅ Вакансия создана!')
      const newVacancy = {
        id: Date.now(),
        title: positionName,
        location,
        salary: salaryMin && salaryMax
          ? `${Number(salaryMin).toLocaleString('ru')}–${Number(salaryMax).toLocaleString('ru')} ${currency}`
          : '',
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      setVacancies(prev => {
        const updated = [...prev, newVacancy]
        localStorage.setItem(storageKey, JSON.stringify(updated))
        return updated
      })
      resetForm()
      setShowForm(false)
    } catch (e) {
      showToast('❌ ' + e.message)
    } finally { setSaving(false) }
  }

  function handleDelete(id) {
    setVacancies(prev => {
      const updated = prev.filter(v => v.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <div className={styles.vacanciesSection}>
      {toast && <div className={styles.toast}>{toast}</div>}
      <div className={styles.vacanciesHeader}>
        <h2 className={styles.vacanciesTitle}>Открытые вакансии</h2>
        <button className={styles.addVacancyBtn} onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Отмена' : '+ Добавить вакансию'}
        </button>
      </div>

      {showForm && (
        <div className={styles.vacancyForm}>
          <h3 className={styles.formTitle}>Новая вакансия</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Название должности <span className={styles.req}>*</span></label>
              <input className={styles.formInput} placeholder="Frontend Developer" value={positionName} onChange={e => setPositionName(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Специализация</label>
              <input className={styles.formInput} placeholder="IT, Маркетинг..." value={specialization} onChange={e => setSpecialization(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Город</label>
              <input className={styles.formInput} placeholder="Алматы" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Валюта</label>
              <select className={styles.formInput} value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="KZT">KZT</option>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Зарплата от</label>
              <input className={styles.formInput} placeholder="300000" type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Зарплата до</label>
              <input className={styles.formInput} placeholder="600000" type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Контактное лицо</label>
              <input className={styles.formInput} placeholder="HR Manager" value={contactName} onChange={e => setContactName(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Телефон для связи</label>
              <input className={styles.formInput} placeholder="+7 (999) 000-00-00" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Описание вакансии</label>
            <textarea className={styles.formTextarea} placeholder="Опишите обязанности, требования и условия..." rows={4} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Навыки / теги (через запятую)</label>
            <input className={styles.formInput} placeholder="React, TypeScript, Node.js" value={tags} onChange={e => setTags(e.target.value)} />
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => { setShowForm(false); resetForm() }}>Отмена</button>
            <button className={styles.saveBtn} onClick={handleCreate} disabled={saving}>
              {saving ? 'Создаём...' : 'Опубликовать вакансию'}
            </button>
          </div>
        </div>
      )}

      {vacancies.length === 0 && !showForm && (
        <div className={styles.emptyTabWrap}>
          <div className={styles.emptyIcon}><IconClipboard size={36}/></div>
          <h3 className={styles.emptyTabTitle}>Нет открытых вакансий</h3>
          <p className={styles.emptyTabDesc}>Нажмите «+ Добавить вакансию» чтобы разместить первую вакансию</p>
        </div>
      )}

      <div className={styles.vacancyCards}>
        {vacancies.map(v => (
          <div key={v.id} className={styles.vacancyCard}>
            <div className={styles.vacancyCardInner}>
              <h3 className={styles.vacancyTitle}>{v.title}</h3>
              <div className={styles.vacancyMeta}>
                {v.location && <span><IconPin size={12}/> {v.location}</span>}
                {v.salary && <span><IconMoney size={12}/> {v.salary}</span>}
              </div>
              {v.tags.length > 0 && (
                <div className={styles.vacancyTags}>
                  {v.tags.map(t => <span key={t} className={styles.vacancyTag}>{t}</span>)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={styles.editVacancyBtn}>Редактировать →</button>
              <button className={styles.cancelBtn} onClick={() => handleDelete(v.id)} style={{ fontSize: '12px' }}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SavedTab() {
  return (
    <div className={styles.emptyTabWrap}>
      <div className={styles.emptyIcon}><IconBookmark size={36}/></div>
      <h3 className={styles.emptyTabTitle}>Нет сохранённых анкет</h3>
      <p className={styles.emptyTabDesc}>Нажмите на иконку закладки в карточке кандидата, чтобы сохранить его анкету здесь</p>
    </div>
  )
}
