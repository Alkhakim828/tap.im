import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileAPI, favoritesAPI, vacanciesAPI, decodeToken } from '../api/index.js'
import styles from './ProfilePage.module.css'
import { IconBuilding, IconChat, IconClipboard, IconUser, IconEdit, IconPin, IconClock, IconMail, IconPhone, IconLink, IconGraduation, IconBookmark, IconHourglass, IconMoney, IconTrash } from '../components/Icons'

const TABS = ['Основные', 'Сохраненные вакансии']
const ALL_SKILLS = [
  'React','TypeScript','Node.js','Python','PostgreSQL','Docker',
  'AWS','Vue.js','Angular','MongoDB','Redis','Kubernetes','Git',
  'Java','C++','Swift','Kotlin','SQL','Django','Flask','GraphQL',
  'Figma','Photoshop','Illustrator','Excel','PowerPoint',
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('Основные')

  // Получаем userId из JWT
  const [currentUserId, setCurrentUserId] = useState(null)
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      const decoded = decodeToken(token)
      if (decoded?.userId) setCurrentUserId(decoded.userId)
    }
  }, [])

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.logo} onClick={() => navigate('/')}>tap.im</span>
        <div className={styles.navLinks}>
          <button className={styles.navBtn} onClick={() => navigate('/vacancies')}><IconBuilding size={15}/> Вакансии</button>
          <button className={styles.navBtn} onClick={() => navigate('/chat')}><IconChat size={15}/> Сообщения</button>
          <button className={styles.navBtn} onClick={() => navigate('/guide')}><IconClipboard size={15}/> Quick Guide</button>
          <button className={`${styles.navBtn} ${styles.active}`}><IconUser size={15}/> Профиль</button>
        </div>
      </nav>

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
          {tab === 'Сохраненные вакансии' && <SavedTab userId={currentUserId} navigate={navigate} />}
        </div>
      </div>
    </div>
  )
}

// ── Reusable card with pencil edit toggle ─────────────────────────
function Section({ title, children, onSave, saving }) {
  const [editing, setEditing] = useState(false)

  async function handleSave() {
    if (onSave) {
      await onSave()
    }
    setEditing(false)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        {title && <h3 className={styles.sectionTitle}>{title}</h3>}
        <button className={styles.editBtn} onClick={() => setEditing(e => !e)}><IconEdit size={14}/></button>
      </div>
      {children(editing, () => setEditing(false))}
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

// ── MAIN TAB ──────────────────────────────────────────────────────
function MainTab({ user }) {
  const userId = user?.userId

  // Profile fields
  const [name, setName] = useState(user?.name || '')
  const [lastName, setLastName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [city, setCity] = useState('')
  const [level, setLevel] = useState('')
  const [workFormat, setWorkFormat] = useState('')

  // Contacts
  const [phone, setPhone] = useState('')
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')

  // Bio
  const [bio, setBio] = useState('')

  // Skills — store as array of skill objects {id, name} from API
  const [availableSkills, setAvailableSkills] = useState([])
  const [selectedSkillIds, setSelectedSkillIds] = useState([])

  // Experience & Education
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])

  // Saving states per section
  const [savingMain, setSavingMain] = useState(false)
  const [savingContacts, setSavingContacts] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [savingSkills, setSavingSkills] = useState(false)
  const [savingExp, setSavingExp] = useState(false)
  const [savingEdu, setSavingEdu] = useState(false)

  const [toast, setToast] = useState('')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // Load profile from API on mount
  useEffect(() => {
    if (!userId) return

    // Load available skills list
    profileAPI.getAllSkills()
      .then(data => setAvailableSkills(data || []))
      .catch(e => console.error('Skills load error:', e))

    // Load existing profile
    profileAPI.getProfile(userId)
      .then(data => {
        const p = data.profile || {}
        setName(p.first_name || user?.name || '')
        setLastName(p.last_name || '')
        setSpecialization(p.specialization || '')
        setCity(p.city || '')
        setLevel(p.level || '')
        setWorkFormat(p.work_format || '')
        setPhone(p.phone || '')
        setGithub(p.github_url || '')
        setLinkedin(p.linkedin_url || '')
        setBio(p.bio || '')
        // Skills come as [{id, name}]
        const ids = (data.skills || []).map(s => s.id)
        setSelectedSkillIds(ids)
        // Experience
        setExperience((data.experience || []).map(e => ({
          id: e.id,
          backendId: e.id,
          position: e.position || '',
          company: e.company_name || '',
          startDate: e.start_date ? e.start_date.slice(0, 10) : '',
          endDate: e.end_date ? e.end_date.slice(0, 10) : '',
          description: e.description || '',
          isNew: false,
        })))
        // Education
        setEducation((data.education || []).map(e => ({
          id: e.id,
          backendId: e.id,
          specialization: e.specialization || '',
          university: e.university || '',
          startDate: e.start_date ? e.start_date.slice(0, 10) : '',
          endDate: e.end_date ? e.end_date.slice(0, 10) : '',
          isNew: false,
        })))
      })
      .catch(e => console.warn('Profile load:', e.message))
  }, [userId])

  // ── SAVE HANDLERS ──────────────────────────────────────────────

  async function saveMainInfo() {
    setSavingMain(true)
    try {
      await profileAPI.updateProfile(userId, {
        first_name: name,
        last_name: lastName,
        specialization,
        city,
        level: level || undefined,
        work_format: workFormat || undefined,
      })
      showToast('✅ Основная информация сохранена')
    } catch (e) {
      showToast('❌ ' + e.message)
    } finally { setSavingMain(false) }
  }

  async function saveContacts() {
    setSavingContacts(true)
    try {
      await profileAPI.updateContacts(userId, {
        phone: phone || undefined,
        github_url: github || undefined,
        linkedin_url: linkedin || undefined,
      })
      showToast('✅ Контакты сохранены')
    } catch (e) {
      showToast('❌ ' + e.message)
    } finally { setSavingContacts(false) }
  }

  async function saveBio() {
    setSavingBio(true)
    try {
      await profileAPI.updateBio(userId, bio)
      showToast('✅ О себе сохранено')
    } catch (e) {
      showToast('❌ ' + e.message)
    } finally { setSavingBio(false) }
  }

  async function saveSkills() {
    setSavingSkills(true)
    try {
      await profileAPI.updateSkills(userId, selectedSkillIds)
      showToast('✅ Навыки сохранены')
    } catch (e) {
      showToast('❌ ' + e.message)
    } finally { setSavingSkills(false) }
  }

  async function saveExperience() {
    setSavingExp(true)
    try {
      // Add new entries to backend
      for (const e of experience) {
        if (e.isNew) {
          await profileAPI.addExperience(userId, {
            position: e.position,
            company_name: e.company,
            start_date: e.startDate ? e.startDate + 'T00:00:00' : null,
            end_date: e.endDate ? e.endDate + 'T00:00:00' : null,
            description: e.description || undefined,
          })
        }
      }
      showToast('✅ Опыт работы сохранён')
      // Reload to get backend IDs
      const data = await profileAPI.getProfile(userId)
      setExperience((data.experience || []).map(e => ({
        id: e.id, backendId: e.id,
        position: e.position || '', company: e.company_name || '',
        startDate: e.start_date ? e.start_date.slice(0, 10) : '',
        endDate: e.end_date ? e.end_date.slice(0, 10) : '',
        description: e.description || '', isNew: false,
      })))
    } catch (e) {
      showToast('❌ ' + e.message)
    } finally { setSavingExp(false) }
  }

  async function saveEducation() {
    setSavingEdu(true)
    try {
      for (const e of education) {
        if (e.isNew) {
          await profileAPI.addEducation(userId, {
            specialization: e.specialization,
            university: e.university,
            start_date: e.startDate ? e.startDate + 'T00:00:00' : null,
            end_date: e.endDate ? e.endDate + 'T00:00:00' : null,
          })
        }
      }
      showToast('✅ Образование сохранено')
      const data = await profileAPI.getProfile(userId)
      setEducation((data.education || []).map(e => ({
        id: e.id, backendId: e.id,
        specialization: e.specialization || '', university: e.university || '',
        startDate: e.start_date ? e.start_date.slice(0, 10) : '',
        endDate: e.end_date ? e.end_date.slice(0, 10) : '',
        isNew: false,
      })))
    } catch (e) {
      showToast('❌ ' + e.message)
    } finally { setSavingEdu(false) }
  }

  async function deleteExp(item) {
    if (item.backendId) {
      try {
        await profileAPI.deleteExperience(userId, item.backendId)
      } catch (e) { showToast('❌ ' + e.message); return }
    }
    setExperience(prev => prev.filter(e => e.id !== item.id))
    showToast('✅ Запись удалена')
  }

  async function deleteEdu(item) {
    if (item.backendId) {
      try {
        await profileAPI.deleteEducation(userId, item.backendId)
      } catch (e) { showToast('❌ ' + e.message); return }
    }
    setEducation(prev => prev.filter(e => e.id !== item.id))
    showToast('✅ Запись удалена')
  }

  // Use available skills from API, fallback to static list
  const skillsList = availableSkills.length > 0
    ? availableSkills
    : ALL_SKILLS.map((name, i) => ({ id: i + 1, name }))

  function toggleSkill(id) {
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectedSkillNames = skillsList
    .filter(s => selectedSkillIds.includes(s.id))
    .map(s => s.name)

  return (
    <div className={styles.sections}>
      {/* TOAST */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* HERO */}
      <Section title="" onSave={saveMainInfo} saving={savingMain}>
        {(editing) => (
          <div className={styles.heroRow}>
            <div className={styles.avatar}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect width="80" height="80" rx="10" fill="#e2e8f5"/>
                <circle cx="40" cy="30" r="14" fill="#94a3c8"/>
                <path d="M14 72c0-14.36 11.64-26 26-26s26 11.64 26 26" fill="#b0bdd8"/>
              </svg>
            </div>
            <div className={styles.heroInfo}>
              {editing ? (
                <div className={styles.editGrid}>
                  <input className={styles.editInput} placeholder="Имя" value={name} onChange={e => setName(e.target.value)} />
                  <input className={styles.editInput} placeholder="Фамилия" value={lastName} onChange={e => setLastName(e.target.value)} />
                  <input className={styles.editInput} placeholder="Специализация" value={specialization} onChange={e => setSpecialization(e.target.value)} />
                  <input className={styles.editInput} placeholder="Город" value={city} onChange={e => setCity(e.target.value)} />
                  <select className={styles.editSelect} value={level} onChange={e => setLevel(e.target.value)}>
                    <option value="">Уровень</option>
                    <option value="junior">Junior</option>
                    <option value="middle">Middle</option>
                    <option value="senior">Senior</option>
                  </select>
                  <select className={styles.editSelect} value={workFormat} onChange={e => setWorkFormat(e.target.value)}>
                    <option value="">Формат работы</option>
                    <option value="remote">Удалённо</option>
                    <option value="hybrid">Гибрид</option>
                    <option value="fulltime">В офисе</option>
                  </select>
                </div>
              ) : (
                <>
                  <h2 className={styles.heroName}>
                    {name || lastName ? `${name} ${lastName}`.trim() : <span className={styles.empty}>Имя не указано</span>}
                  </h2>
                  <div className={styles.heroRole}>{specialization || <span className={styles.empty}>Специализация не указана</span>}</div>
                  <div className={styles.heroMeta}>
                    <span><IconPin size={12}/> {city || '—'}</span>
                    <span><IconClock size={12}/> {workFormat || '—'}</span>
                  </div>
                  {level && <span className={styles.levelBadge}>{level}</span>}
                </>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* CONTACTS */}
      <Section title="Контактная информация" onSave={saveContacts} saving={savingContacts}>
        {(editing) => editing ? (
          <div className={styles.editStack}>
            <div className={styles.editInputReadonly}>
              <span className={styles.readonlyLabel}>Email</span>
              <span className={styles.readonlyValue}>{user?.email || '—'}</span>
            </div>
            <input className={styles.editInput} placeholder="Телефон: +7 (999) 000-00-00" value={phone} onChange={e => setPhone(e.target.value)} />
            <input className={styles.editInput} placeholder="LinkedIn: linkedin.com/in/..." value={linkedin} onChange={e => setLinkedin(e.target.value)} />
            <input className={styles.editInput} placeholder="GitHub: github.com/..." value={github} onChange={e => setGithub(e.target.value)} />
          </div>
        ) : (
          <div className={styles.contactList}>
            <div className={styles.contactRow}><IconMail size={13}/> {user?.email || <span className={styles.empty}>Email не указан</span>}</div>
            {phone ? <div className={styles.contactRow}><IconPhone size={13}/> {phone}</div> : <div className={styles.contactEmpty}>Телефон не указан</div>}
            {linkedin ? <div className={styles.contactRow}><IconLink size={13}/> <a href={linkedin} target="_blank" rel="noreferrer">{linkedin}</a></div> : <div className={styles.contactEmpty}>LinkedIn не указан</div>}
            {github ? <div className={styles.contactRow}><IconLink size={13}/> <a href={github} target="_blank" rel="noreferrer">{github}</a></div> : <div className={styles.contactEmpty}>GitHub не указан</div>}
          </div>
        )}
      </Section>

      {/* BIO */}
      <Section title="О себе" onSave={saveBio} saving={savingBio}>
        {(editing) => editing ? (
          <textarea className={styles.editTextarea}
            placeholder="Расскажите о себе, опыте и целях..."
            value={bio} onChange={e => setBio(e.target.value)} rows={4} />
        ) : (
          <p className={bio ? styles.bioText : styles.emptyHint}>
            {bio || 'Нажмите на иконку редактирования, чтобы добавить информацию о себе'}
          </p>
        )}
      </Section>

      {/* SKILLS */}
      <Section title="Навыки" onSave={saveSkills} saving={savingSkills}>
        {(editing) => editing ? (
          <div className={styles.skillCheckGrid}>
            {skillsList.map(s => (
              <label key={s.id} className={styles.skillCheckRow}>
                <input type="checkbox"
                  checked={selectedSkillIds.includes(s.id)}
                  onChange={() => toggleSkill(s.id)} />
                {s.name}
              </label>
            ))}
          </div>
        ) : (
          selectedSkillNames.length > 0
            ? <div className={styles.skillTags}>
                {selectedSkillNames.map(s => <span key={s} className={styles.skillTag}>{s}</span>)}
              </div>
            : <p className={styles.emptyHint}>Навыки не добавлены</p>
        )}
      </Section>

      {/* EXPERIENCE */}
      <Section title="Опыт работы" onSave={saveExperience} saving={savingExp}>
        {(editing) => editing ? (
          <div className={styles.expEditList}>
            {experience.map(e => (
              <div key={e.id} className={styles.expEditItem}>
                <div className={styles.editGrid}>
                  <input className={styles.editInput} placeholder="Должность" value={e.position}
                    onChange={v => setExperience(prev => prev.map(x => x.id === e.id ? {...x, position: v.target.value} : x))} />
                  <input className={styles.editInput} placeholder="Компания" value={e.company}
                    onChange={v => setExperience(prev => prev.map(x => x.id === e.id ? {...x, company: v.target.value} : x))} />
                  <input className={styles.editInput} placeholder="Начало: 2022-01-01" value={e.startDate}
                    onChange={v => setExperience(prev => prev.map(x => x.id === e.id ? {...x, startDate: v.target.value} : x))} />
                  <input className={styles.editInput} placeholder="Конец (оставьте пустым если сейчас)" value={e.endDate}
                    onChange={v => setExperience(prev => prev.map(x => x.id === e.id ? {...x, endDate: v.target.value} : x))} />
                </div>
                <textarea className={styles.editTextarea} placeholder="Описание обязанностей" rows={2}
                  value={e.description}
                  onChange={v => setExperience(prev => prev.map(x => x.id === e.id ? {...x, description: v.target.value} : x))} />
                <button className={styles.removeBtn} onClick={() => deleteExp(e)}>✕ Удалить</button>
              </div>
            ))}
            <button className={styles.addBtn}
              onClick={() => setExperience(prev => [...prev, { id: Date.now(), backendId: null, position: '', company: '', startDate: '', endDate: '', description: '', isNew: true }])}>
              + Добавить место работы
            </button>
          </div>
        ) : (
          experience.length > 0
            ? <div className={styles.expList}>
                {experience.map(e => (
                  <div key={e.id} className={styles.expItem}>
                    <div className={styles.expBar} />
                    <div>
                      <div className={styles.expTitle}>{e.position}</div>
                      <div className={styles.expCompany}>{e.company}</div>
                      <div className={styles.expDates}>
                        {e.startDate}{e.endDate ? ` – ${e.endDate}` : ' – настоящее время'}
                      </div>
                      {e.description && <div className={styles.expDesc}>{e.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            : <p className={styles.emptyHint}>Опыт работы не добавлен</p>
        )}
      </Section>

      {/* EDUCATION */}
      <Section title="Образование" onSave={saveEducation} saving={savingEdu}>
        {(editing) => editing ? (
          <div className={styles.expEditList}>
            {education.map(e => (
              <div key={e.id} className={styles.expEditItem}>
                <div className={styles.editGrid}>
                  <input className={styles.editInput} placeholder="Специальность" value={e.specialization}
                    onChange={v => setEducation(prev => prev.map(x => x.id === e.id ? {...x, specialization: v.target.value} : x))} />
                  <input className={styles.editInput} placeholder="Университет" value={e.university}
                    onChange={v => setEducation(prev => prev.map(x => x.id === e.id ? {...x, university: v.target.value} : x))} />
                  <input className={styles.editInput} placeholder="Начало: 2019-09-01" value={e.startDate}
                    onChange={v => setEducation(prev => prev.map(x => x.id === e.id ? {...x, startDate: v.target.value} : x))} />
                  <input className={styles.editInput} placeholder="Конец (оставьте пустым если сейчас)" value={e.endDate}
                    onChange={v => setEducation(prev => prev.map(x => x.id === e.id ? {...x, endDate: v.target.value} : x))} />
                </div>
                <button className={styles.removeBtn} onClick={() => deleteEdu(e)}>✕ Удалить</button>
              </div>
            ))}
            <button className={styles.addBtn}
              onClick={() => setEducation(prev => [...prev, { id: Date.now(), backendId: null, specialization: '', university: '', startDate: '', endDate: '', isNew: true }])}>
              + Добавить образование
            </button>
          </div>
        ) : (
          education.length > 0
            ? <div className={styles.eduList}>
                {education.map(e => (
                  <div key={e.id} className={styles.eduItem}>
                    <div className={styles.eduIcon}><IconGraduation size={20}/></div>
                    <div>
                      <div className={styles.eduDegree}>{e.specialization}</div>
                      <div className={styles.eduUni}>{e.university}</div>
                      <div className={styles.eduYears}>{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            : <p className={styles.emptyHint}>Образование не добавлено</p>
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

// ── SAVED TAB ─────────────────────────────────────────────────────
function SavedTab({ userId, navigate }) {
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    if (!userId) return
    loadFavorites()
  }, [userId])

  async function loadFavorites() {
    setLoading(true)
    try {
      // Получаем список избранных ID
      const favData = await favoritesAPI.getFavorites(userId)

      if (!favData || favData.length === 0) {
        setVacancies([])
        setLoading(false)
        return
      }

      // Бэк может вернуть массив строк/чисел или объектов
      // Пробуем понять формат и достать ID
      const firstItem = favData[0]
      const isFullVacancy = typeof firstItem === 'object' && firstItem !== null && firstItem.position_name

      if (isFullVacancy) {
        // Бэк вернул полные объекты вакансий — используем напрямую
        setVacancies(favData.map(normalizeVacancy))
      } else {
        // Бэк вернул только ID — догружаем каждую вакансию
        const ids = favData.map(item =>
          typeof item === 'string' || typeof item === 'number'
            ? item
            : item.vacancy_id ?? item.id ?? item
        )
        const results = await Promise.allSettled(
          ids.map(id => vacanciesAPI.getById(id))
        )
        const loaded = results
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => normalizeVacancy(r.value))
        setVacancies(loaded)
      }
    } catch (e) {
      console.error('Favorites load error:', e)
      setVacancies([])
    } finally {
      setLoading(false)
    }
  }

  function normalizeVacancy(v) {
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
      tags: (v.tags || []).filter(t => t && typeof t === 'string' && t.length <= 30),
      specialization: v.specialization || '',
    }
  }

  async function removeFromFavorites(vacancyId) {
    setRemovingId(vacancyId)
    try {
      await favoritesAPI.removeFavorite(userId, vacancyId)
      // Убираем из списка после успешного удаления
      setVacancies(prev => prev.filter(v => v.id !== vacancyId))
    } catch (e) {
      console.error('Remove favorite error:', e)
    } finally {
      setRemovingId(null)
    }
  }

  if (!userId) {
    return (
      <div className={styles.emptyTabWrap}>
        <div className={styles.emptyIcon}><IconBookmark size={36}/></div>
        <h3 className={styles.emptyTabTitle}>Необходимо войти в аккаунт</h3>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.emptyTabWrap}>
        <div className={styles.emptyIcon}><IconHourglass size={36}/></div>
        <h3 className={styles.emptyTabTitle}>Загружаем сохранённые вакансии...</h3>
      </div>
    )
  }

  if (vacancies.length === 0) {
    return (
      <div className={styles.emptyTabWrap}>
        <div className={styles.emptyIcon}><IconBookmark size={36}/></div>
        <h3 className={styles.emptyTabTitle}>Нет сохранённых вакансий</h3>
        <p className={styles.emptyTabDesc}>Нажмите на иконку закладки в карточке вакансии, чтобы сохранить её здесь</p>
      </div>
    )
  }

  return (
    <div className={styles.savedList}>
      {vacancies.map(v => (
        <div key={v.id} className={styles.savedCard}>
          <div className={styles.savedCardLeft}>
            <div className={styles.companyLogo}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#e8edf8"/>
                <circle cx="20" cy="15" r="6" fill="#9aa8c8"/>
                <path d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#b8c4d8"/>
              </svg>
            </div>
            <div className={styles.savedCardInfo}>
              <h3 className={styles.savedCardTitle}>{v.title}</h3>
              <div className={styles.savedCardCompany}>{v.company}</div>
              <div className={styles.savedCardMeta}>
                {v.city && <span><IconPin size={12}/> {v.city}</span>}
                {v.specialization && <span><IconBuilding size={12}/> {v.specialization}</span>}
                <span><IconMoney size={12}/> {v.salary}</span>
              </div>
              {v.tags.length > 0 && (
                <div className={styles.tags}>
                  {v.tags.slice(0, 4).map((t, i) => (
                    <span key={i} className={`${styles.tag} ${i === 0 ? styles.tagPink : styles.tagBlue}`}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.savedCardActions}>
            <button
              className={styles.savedDetailBtn}
              onClick={() => navigate(`/vacancies/${v.id}`)}
            >
              Подробнее
            </button>
            <button
              className={styles.removeBookmarkBtn}
              onClick={() => removeFromFavorites(v.id)}
              disabled={removingId === v.id}
              title="Убрать из сохранённых"
            >
              {removingId === v.id ? '...' : <IconTrash size={15}/>}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
