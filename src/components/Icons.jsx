// SVG icon components — replaces all emoji in the project
// Each icon accepts size (default 16) and style props

const ic = (path, viewBox = '0 0 24 24') =>
  ({ size = 16, style, className } = {}) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  )

// 🏢 Building / company / vacancies
export const IconBuilding = ic(<>
  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
</>)

// 👤 Person / profile
export const IconUser = ic(<>
  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
</>)

// 💬 Chat / messages
export const IconChat = ic(<>
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
</>)

// 📋 Clipboard / guide
export const IconClipboard = ic(<>
  <rect x="9" y="2" width="6" height="4" rx="1"/><rect x="3" y="6" width="18" height="16" rx="2"/>
  <path d="M9 6h6M8 12h8M8 16h5"/>
</>)

// 🔍 Search
export const IconSearch = ic(<>
  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
</>)

// 🔖 Bookmark
export const IconBookmark = ic(<>
  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
</>)

// ✉️ Mail / email
export const IconMail = ic(<>
  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
</>)

// 📞 Phone
export const IconPhone = ic(<>
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.06 3.27a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
</>)

// 🔗 Link
export const IconLink = ic(<>
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
</>)

// 📍 Pin / location
export const IconPin = ic(<>
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>
</>)

// 🕐 Clock / work format
export const IconClock = ic(<>
  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
</>)

// 💲 Money / salary
export const IconMoney = ic(<>
  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
</>)

// 📅 Calendar / employment type
export const IconCalendar = ic(<>
  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
</>)

// 📖 Book / quick start / guide
export const IconBook = ic(<>
  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
</>)

// 👥 Group / candidates
export const IconUsers = ic(<>
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
</>)

// 🏪 Store / for employers  
export const IconStore = ic(<>
  <path d="M3 9l1-5h16l1 5"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>
  <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/>
  <path d="M10 14h4v6h-4z"/>
</>)

// ✏️ Edit / pencil
export const IconEdit = ic(<>
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
</>)

// ⏳ Loading / spinner (static hourglass)
export const IconHourglass = ic(<>
  <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 1 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
</>)

// ❌ X / error / close
export const IconX = ic(<>
  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
</>)

// ✅ Check / success
export const IconCheck = ic(<>
  <polyline points="20 6 9 17 4 12"/>
</>)

// 🎓 Graduation / education
export const IconGraduation = ic(<>
  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
</>)

// 🗑️ Trash / delete
export const IconTrash = ic(<>
  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
</>)

// 💡 Bulb / idea / hint
export const IconBulb = ic(<>
  <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
</>)

// ➤ Send / arrow right (for chat send button)
export const IconSend = ic(<>
  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
</>)

// 📡 API / network
export const IconApi = ic(<>
  <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
</>)
