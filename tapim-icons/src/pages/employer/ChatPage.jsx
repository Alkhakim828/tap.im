import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { chatAPI } from '../../api/index.js'
import EmployerNav from './EmployerNav'
import { IconSearch, IconChat, IconSend } from '../../components/Icons'
import styles from './ChatPage.module.css'

export default function ChatPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const storageKey = `employer_conversations_${user?.userId}`

  // Загружаем список диалогов из localStorage
  const loadConversations = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') }
    catch { return [] }
  }

  const [conversations, setConversations] = useState(loadConversations)
  const [activeConv, setActiveConv]       = useState(null)
  const [messages, setMessages]           = useState([])
  const [input, setInput]                 = useState('')
  const [wsConnected, setWsConnected]     = useState(false)
  const [search, setSearch]               = useState('')

  const wsRef          = useRef(null)
  const messagesEndRef = useRef(null)

  // Сохраняем список диалогов при каждом изменении
  function saveConversations(updated) {
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setConversations(updated)
  }

  // Если пришли со страницы кандидатов — добавляем диалог
  useEffect(() => {
    if (location.state?.chatWith) {
      const c = location.state.chatWith
      setActiveConv(c)
      setConversations(prev => {
        if (prev.find(p => p.userId === c.userId)) return prev
        const updated = [{ ...c, lastMessage: '', unread: 0 }, ...prev]
        localStorage.setItem(storageKey, JSON.stringify(updated))
        return updated
      })
      // Очищаем state чтобы не дублировалось при повторном рендере
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // Подключение WebSocket
  useEffect(() => {
    if (!user?.userId) return

    const ws = chatAPI.connectWS(user.userId)
    wsRef.current = ws

    ws.onopen  = () => { setWsConnected(true);  console.log('✅ WebSocket connected') }
    ws.onclose = () => { setWsConnected(false); console.log('❌ WebSocket disconnected') }
    ws.onerror = (e) => console.error('WS error:', e)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.error || data.info) return

        if (data.sender_id !== undefined) {
          const msg = {
            id: Date.now(),
            senderId: data.sender_id,
            content: data.content,
            createdAt: new Date().toISOString(),
            isMine: false,
          }
          setMessages(prev => [...prev, msg])

          // Если диалога с этим пользователем ещё нет — создаём
          setConversations(prev => {
            const exists = prev.find(c => c.userId === data.sender_id)
            let updated
            if (exists) {
              updated = prev.map(c =>
                c.userId === data.sender_id
                  ? { ...c, lastMessage: data.content, unread: (c.unread || 0) + 1 }
                  : c
              )
            } else {
              updated = [
                { userId: data.sender_id, name: `Пользователь #${data.sender_id}`, role: '', lastMessage: data.content, unread: 1 },
                ...prev,
              ]
            }
            localStorage.setItem(storageKey, JSON.stringify(updated))
            return updated
          })
        }
      } catch (e) {
        console.error('WS parse error:', e)
      }
    }

    return () => ws.close()
  }, [user?.userId])

  // Загружаем историю при выборе диалога
  useEffect(() => {
    if (!activeConv || !user?.userId) return

    chatAPI.getHistory(user.userId, activeConv.userId)
      .then(data => {
        const msgs = (data || []).map(m => ({
          id: m.id,
          senderId: m.sender_id,
          content: m.content,
          createdAt: m.created_at,
          isMine: m.sender_id === user.userId,
        }))
        setMessages(msgs)
        chatAPI.markAsRead(activeConv.userId, user.userId).catch(() => {})
        setConversations(prev => {
          const updated = prev.map(c =>
            c.userId === activeConv.userId ? { ...c, unread: 0 } : c
          )
          localStorage.setItem(storageKey, JSON.stringify(updated))
          return updated
        })
      })
      .catch(e => {
        console.error('History load error:', e)
        setMessages([])
      })
  }, [activeConv?.userId])

  // Автоскролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    const text = input.trim()
    if (!text || !activeConv || !wsRef.current) return
    if (wsRef.current.readyState !== WebSocket.OPEN) return

    wsRef.current.send(JSON.stringify({ receiver_id: activeConv.userId, content: text }))

    const msg = {
      id: Date.now(),
      senderId: user.userId,
      content: text,
      createdAt: new Date().toISOString(),
      isMine: true,
    }
    setMessages(prev => [...prev, msg])
    setConversations(prev => {
      const updated = prev.map(c =>
        c.userId === activeConv.userId ? { ...c, lastMessage: text } : c
      )
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
    setInput('')
  }

  function formatTime(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
  }

  const filtered = conversations.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      <EmployerNav />

      <div className={styles.chatLayout}>
        {/* LEFT — список диалогов */}
        <div className={styles.sidebar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><IconSearch size={14}/></span>
            <input
              className={styles.searchInput}
              placeholder="Поиск по имени..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 && (
            <div className={styles.emptyConvs}>
              <p>Нет диалогов</p>
              <span>Напишите кандидату из раздела Анкеты</span>
            </div>
          )}

          {filtered.map(c => (
            <div
              key={c.userId}
              className={`${styles.convItem} ${activeConv?.userId === c.userId ? styles.convActive : ''}`}
              onClick={() => setActiveConv(c)}
            >
              <div className={styles.convAvatar}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="20" fill="#e2e8f5"/>
                  <circle cx="20" cy="15" r="7" fill="#94a3c8"/>
                  <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="#b0bdd8"/>
                </svg>
                {c.unread > 0 && <span className={styles.badge}>{c.unread}</span>}
              </div>
              <div className={styles.convInfo}>
                <div className={styles.convName}>{c.name}</div>
                <div className={styles.convRole}>{c.role}</div>
                {c.lastMessage && (
                  <div className={styles.convLast}>{c.lastMessage}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT — окно чата */}
        <div className={styles.chatWindow}>
          {!activeConv ? (
            <div className={styles.emptyChat}>
              <div className={styles.emptyChatIcon}><IconChat size={40}/></div>
              <h3>Выберите диалог</h3>
              <p>Выберите кандидата из списка слева или начните разговор из раздела «Анкеты»</p>
            </div>
          ) : (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderAvatar}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="20" fill="#e2e8f5"/>
                    <circle cx="20" cy="15" r="7" fill="#94a3c8"/>
                    <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="#b0bdd8"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.chatHeaderName}>{activeConv.name}</div>
                  <div className={styles.chatHeaderRole}>{activeConv.role}</div>
                </div>
                <div className={`${styles.wsStatus} ${wsConnected ? styles.wsOnline : styles.wsOffline}`}>
                  {wsConnected ? '● онлайн' : '● офлайн'}
                </div>
              </div>

              <div className={styles.messages}>
                {messages.length === 0 && (
                  <div className={styles.emptyMessages}>Начните диалог — напишите первое сообщение</div>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`${styles.msgWrap} ${m.isMine ? styles.msgRight : styles.msgLeft}`}>
                    <div className={`${styles.bubble} ${m.isMine ? styles.bubbleMine : styles.bubbleOther}`}>
                      <p className={styles.bubbleText}>{m.content}</p>
                      <span className={styles.bubbleTime}>{formatTime(m.createdAt)}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputArea}>
                <input
                  className={styles.messageInput}
                  placeholder="Написать сообщение..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button
                  className={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={!input.trim() || !wsConnected}
                >
                  <IconSend size={16}/>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
