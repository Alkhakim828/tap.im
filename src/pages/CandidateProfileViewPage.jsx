import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { profileAPI, favoriteProfilesAPI, extractFavoriteIds } from '../api/index.js'
import { useAuth } from '../context/AuthContext'
import styles from './ProfilePage.module.css'
import navStyles from './employer/EmployerNav.module.css'
import { IconHourglass, IconX, IconMail, IconBookmark, IconPin, IconClock, IconMoney, IconPhone, IconLink, IconGraduation, IconUsers, IconChat, IconClipboard, IconBuilding } from '../components/Icons'

export default function CandidateProfileViewPage() {
  const { userId } = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const [profile, setProfile]   = useState(null)
  const [skills,  setSkills]    = useState([])
  const [exp,     setExp]       = useState([])
  const [edu,     setEdu]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState('')
  const [isFav,   setIsFav]     = useState(false)
  const [toast,   setToast]     = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2000) }

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    profileAPI.getProfile(userId)
      .then(data => {
        setProfile(data.profile || data || {})
        setSkills(data.skills || [])
        setExp(data.experience || [])
        setEdu(data.education || [])
        setLoading(false)
      })
      .catch(() => { setError('Не удалось загрузить профиль'); setLoading(false) })
  }, [userId])

  useEffect(() => {
    if (!user?.userId) return
    favoriteProfilesAPI.getFavoriteProfiles(user.userId)
      .then(data => {
        const ids = extractFavoriteIds(data)
        setIsFav(ids.has(String(userId)))
      })
      .catch(() => setIsFav(false))
  }, [user?.userId, userId])

  async function toggleFav() {
    if (!user?.userId) return
    try {
      if (isFav) {
        await favoriteProfilesAPI.removeFavoriteProfile(user.userId, userId)
        setIsFav(false)
        showToast('Удалено из избранного')
      } else {
        await favoriteProfilesAPI.addFavoriteProfile(user.userId, userId)
        setIsFav(true)
        showToast('✅ Добавлено в избранное')
      }
    } catch (e) { showToast('❌ ' + e.message) }
  }

  if (loading) return (
    <div className={styles.page}>
      <EmployerNavBar navigate={navigate} />
      <div style={{textAlign:'center',padding:'80px',color:'#6b7280'}}><IconHourglass size={16}/> Загружаем профиль...</div>
    </div>
  )

  if (error || !profile) return (
    <div className={styles.page}>
      <EmployerNavBar navigate={navigate} />
      <div style={{textAlign:'center',padding:'80px',color:'#ef4444'}}><IconX size={16}/> {error || 'Профиль не найден'}</div>
    </div>
  )

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  const skillNames = skills.map(s => s.name || s).filter(Boolean)

  return (
    <div className={styles.page}>
      <EmployerNavBar navigate={navigate} />
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.layout}>
        {/* Sidebar с кнопками действий */}
        <aside className={styles.sidebar} style={{gap:'8px'}}>
          <button className={styles.tabBtn} style={{color:'#2563eb',fontWeight:700}} onClick={() => navigate(-1)}>
            ← Назад
          </button>
          <button
            className={styles.tabBtn}
            style={{color:'#374151'}}
            onClick={() => navigate('/employer/chat', {
              state: {
                chatWith: {
                  userId: Number(userId),
                  name: fullName || 'Кандидат',
                  role: profile.specialization || '',
                }
              }
            })}
          >
            <IconMail size={14}/> Написать
          </button>
          <button
            className={`${styles.tabBtn} ${isFav ? styles.tabActive : ''}`}
            onClick={toggleFav}
          >
            <IconBookmark size={14}/> {isFav ? 'В избранном' : 'В избранное'}
          </button>
        </aside>

        <div className={styles.main}>
          <div className={styles.sections}>
            {/* HERO */}
            <div className={styles.card}>
              <div className={styles.heroRow}>
                <div className={styles.avatar}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <rect width="80" height="80" rx="10" fill="#e2e8f5"/>
                    <circle cx="40" cy="30" r="14" fill="#94a3c8"/>
                    <path d="M14 72c0-14.36 11.64-26 26-26s26 11.64 26 26" fill="#b0bdd8"/>
                  </svg>
                </div>
                <div className={styles.heroInfo}>
                  <h2 className={styles.heroName}>
                    {fullName || <span className={styles.empty}>Имя не указано</span>}
                  </h2>
                  <div className={styles.heroRole}>
                    {profile.specialization || <span className={styles.empty}>Специализация не указана</span>}
                  </div>
                  <div className={styles.heroMeta}>
                    <span><IconPin size={12}/> {profile.city || '—'}</span>
                    <span><IconClock size={12}/> {profile.work_format || '—'}</span>
                  </div>
                  {profile.level && <span className={styles.levelBadge}>{profile.level}</span>}
                  {(profile.salary_min || profile.salary_max) && (
                    <div style={{marginTop:'8px', fontSize:'14px', fontWeight:600, color:'#2563eb'}}>
                      <IconMoney size={13}/> {profile.salary_min && profile.salary_max
                        ? `${Number(profile.salary_min).toLocaleString('ru')} – ${Number(profile.salary_max).toLocaleString('ru')} KZT`
                        : profile.salary_min
                          ? `от ${Number(profile.salary_min).toLocaleString('ru')} KZT`
                          : `до ${Number(profile.salary_max).toLocaleString('ru')} KZT`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CONTACTS */}
            {(profile.phone || profile.linkedin_url || profile.github_url) && (
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Контактная информация</h3>
                <div className={styles.contactList}>
                  {profile.phone       && <div className={styles.contactRow}><IconPhone size={13}/> {profile.phone}</div>}
                  {profile.linkedin_url && <div className={styles.contactRow}><IconLink size={13}/> <a href={profile.linkedin_url} target="_blank" rel="noreferrer">{profile.linkedin_url}</a></div>}
                  {profile.github_url   && <div className={styles.contactRow}><IconLink size={13}/> <a href={profile.github_url} target="_blank" rel="noreferrer">{profile.github_url}</a></div>}
                </div>
              </div>
            )}

            {/* BIO */}
            {profile.bio && (
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>О себе</h3>
                <p className={styles.bioText}>{profile.bio}</p>
              </div>
            )}

            {/* SKILLS */}
            {skillNames.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Навыки</h3>
                <div className={styles.skillTags}>
                  {skillNames.map(s => <span key={s} className={styles.skillTag}>{s}</span>)}
                </div>
              </div>
            )}

            {/* EXPERIENCE */}
            {exp.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Опыт работы</h3>
                <div className={styles.expList}>
                  {exp.map((e, i) => (
                    <div key={e.id || i} className={styles.expItem}>
                      <div className={styles.expBar} />
                      <div>
                        <div className={styles.expTitle}>{e.position}</div>
                        <div className={styles.expCompany}>{e.company_name}</div>
                        <div className={styles.expDates}>
                          {e.start_date?.slice(0,10)}
                          {e.end_date ? ` – ${e.end_date.slice(0,10)}` : ' – настоящее время'}
                        </div>
                        {e.description && <div className={styles.expDesc}>{e.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {edu.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Образование</h3>
                <div className={styles.eduList}>
                  {edu.map((e, i) => (
                    <div key={e.id || i} className={styles.eduItem}>
                      <div className={styles.eduIcon}><IconGraduation size={20}/></div>
                      <div>
                        <div className={styles.eduDegree}>{e.specialization}</div>
                        <div className={styles.eduUni}>{e.university}</div>
                        <div className={styles.eduYears}>
                          {e.start_date?.slice(0,10)}{e.end_date ? ` – ${e.end_date.slice(0,10)}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmployerNavBar({ navigate }) {
  return (
    <nav style={{
      background:'#fff', borderBottom:'1px solid #e5e7eb',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 32px', height:'60px', position:'sticky', top:0, zIndex:100
    }}>
      <span style={{fontSize:'20px',fontWeight:800,color:'#111827',cursor:'pointer'}}
        onClick={() => navigate('/employer/profile')}>tap.im</span>
      <div style={{display:'flex',gap:'4px'}}>
        {[
          [<><IconUsers size={14}/> Анкеты</>,      '/employer/candidates'],
          [<><IconChat size={14}/> Сообщения</>,   '/employer/chat'],
          [<><IconClipboard size={14}/> Quick Guide</>, '/employer/guide'],
          [<><IconBuilding size={14}/> Профиль</>,     '/employer/profile'],
        ].map(([label, path]) => (
          <button key={path}
            onClick={() => navigate(path)}
            style={{
              background:'none', border:'none', padding:'8px 16px', borderRadius:'8px',
              fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'14px', fontWeight:500,
              color:'#374151', cursor:'pointer'
            }}
          >{label}</button>
        ))}
      </div>
    </nav>
  )
}
