import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { createPortal } from 'react-dom'

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg: '#faf8f5',
  text: '#2b2b2b',
  accent: '#f46375',
  accentHover: '#d8465a',
  accentSoft: '#f9a3ae',
  pinkBg: '#fdeef0',
  pinkBorder: '#f9d7dd',
  muted: '#767676',
  faint: '#999',
  lighter: '#aaa',
  cardBorder: '#f3e9e9',
  line: '#eee',
}

// ── Data ───────────────────────────────────────────────────────────────────
const MANAGERS = [
  { id: 'mgr1', name: 'O O 매니저', role: '소개 매니저', bio: '이 매니저의 한 줄 소개가 들어갈 자리입니다.' },
  { id: 'mgr2', name: 'O O 매니저', role: '소개 매니저', bio: '이 매니저의 한 줄 소개가 들어갈 자리입니다.' },
  { id: 'mgr3', name: 'O O 팀장', role: '발굴팀', bio: '이 팀장의 한 줄 소개가 들어갈 자리입니다.' },
  { id: 'mgr4', name: 'O O 매니저', role: '서비스팀', bio: '이 매니저의 한 줄 소개가 들어갈 자리입니다.' },
]

const FEATURES = [
  { title: '남성만을 위한 전문 소개팅', desc: '남성 회원의 연애에 집중해 설계된 남성 전용 서비스입니다.', color: C.accent, icon: 'user' },
  { title: '매니저가 아닌 여자 사람 친구', desc: '형식적인 상담이 아니라, 진짜 연애를 도와주는 가까운 이성 친구처럼 함께합니다.', color: C.accentSoft, icon: 'chat' },
  { title: '여성들이 직접 운영하는 소개 시스템', desc: '소개 매니저부터 여성 회원을 발굴하는 전담팀까지 오직 여성 전문가들로 구성되어 있습니다.', color: C.accent, icon: 'group' },
  { title: '여성의 눈으로 검증한 매력적인 여성', desc: '외모뿐 아니라 분위기와 매력까지 종합적으로 검토해 직접 발굴하고 캐스팅합니다.', color: C.accentSoft, icon: 'eye' },
  { title: '여성의 시선으로 제공하는 현실적인 조언', desc: '스타일, 대화 방식, 첫인상 등 남성이 놓치기 쉬운 부분을 솔직하게 알려드립니다.', color: C.accent, icon: 'advice' },
  { title: '매력적인 여성 매니저와 함께하는 친근한 관리', desc: '딱딱한 상담원이 아닌, 편안하게 연애 고민을 나눌 수 있는 매력적인 매니저가 함께합니다.', color: C.accentSoft, icon: 'heart' },
]

const SWIPE_CARDS = [
  { id: 0, title: '남성 전용 소개팅', desc: '남성 회원의 연애에 집중해 설계', color: C.accent },
  { id: 1, title: '여성이 직접 운영', desc: '매니저·발굴팀 전원 여성 전문가', color: C.accentSoft },
  { id: 2, title: '현실적인 조언', desc: '스타일·대화·첫인상까지 솔직하게', color: C.accent },
  { id: 3, title: '친근한 매니저 관리', desc: '편하게 연애 고민 나누는 사이', color: C.accentSoft },
]

const CHIPS = [
  { label: '코디가 걱정돼요', reply: '과하지 않게, 깔끔한 인상을 주는 코디부터 같이 봐드릴게요.' },
  { label: '대화가 어려워요', reply: '자연스러운 대화 흐름은 연습으로 충분히 늘어요. 예시부터 드려볼게요.' },
  { label: '제 매력을 모르겠어요', reply: '본인은 못 보는 매력, 여성의 시선으로 솔직하게 짚어드릴게요.' },
]

const FAQ_ITEMS = [
  { q: '상담은 어떻게 진행되나요?', a: '답변 텍스트가 들어갈 자리입니다.' },
  { q: '비용은 얼마인가요?', a: '답변 텍스트가 들어갈 자리입니다.' },
  { q: '매칭까지 얼마나 걸리나요?', a: '답변 텍스트가 들어갈 자리입니다.' },
  { q: '꼭 오프라인에서 만나야 하나요?', a: '답변 텍스트가 들어갈 자리입니다.' },
]

const TESTIMONIALS = [
  { quote: '후기 텍스트가 들어갈 자리입니다. 실제 회원분의 생생한 경험담이 여기에 표시됩니다.', author: '김OO · 32세' },
  { quote: '후기 텍스트가 들어갈 자리입니다. 실제 회원분의 생생한 경험담이 여기에 표시됩니다.', author: '이OO · 29세' },
  { quote: '후기 텍스트가 들어갈 자리입니다. 실제 회원분의 생생한 경험담이 여기에 표시됩니다.', author: '박OO · 35세' },
]

const DUMMY_REVIEWS = Array.from({ length: 11 }, (_, i) => ({
  quote: '후기 텍스트가 들어갈 자리입니다.',
  author: `회원OO · ${26 + i}세`,
}))

const PILE = [
  { left: '-2%', bottom: '-95px', rotate: -8, w: 190, h: 140 },
  { left: '8%', bottom: '-135px', rotate: 6, w: 175, h: 132 },
  { left: '18%', bottom: '-100px', rotate: -5, w: 185, h: 138 },
  { left: '28%', bottom: '-140px', rotate: 8, w: 180, h: 134 },
  { left: '38%', bottom: '-108px', rotate: -10, w: 190, h: 140 },
  { left: '48%', bottom: '-125px', rotate: 5, w: 178, h: 133 },
  { left: '58%', bottom: '-92px', rotate: -7, w: 188, h: 138 },
  { left: '68%', bottom: '-130px', rotate: 9, w: 182, h: 135 },
  { left: '78%', bottom: '-102px', rotate: -4, w: 185, h: 138 },
  { left: '87%', bottom: '-138px', rotate: 7, w: 178, h: 132 },
  { left: '96%', bottom: '-98px', rotate: -6, w: 185, h: 136 },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function revealStyle(revealed: boolean, delay = 0): CSSProperties {
  return {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  }
}

// ── Hooks ──────────────────────────────────────────────────────────────────
function useReveal() {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setRevealed(true); io.disconnect() }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    const t = setTimeout(() => setRevealed(true), 2500)
    return () => { io.disconnect(); clearTimeout(t) }
  }, [])

  return { ref, revealed }
}

// ── ImageSlot ──────────────────────────────────────────────────────────────
function ImageSlot({ shape, style, label }: { shape: 'rounded' | 'circle' | 'rect'; style?: CSSProperties; label?: string }) {
  const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? '24px' : '8px'
  return (
    <div
      style={{
        borderRadius: radius,
        background: 'linear-gradient(135deg, #fdeef0 0%, #f3d0d8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      {label && (
        <span style={{ fontSize: '11px', color: '#c9a9ae', textAlign: 'center', padding: '8px', lineHeight: 1.4 }}>
          {label}
        </span>
      )}
    </div>
  )
}

// ── Feature Icon ───────────────────────────────────────────────────────────
function FIcon({ icon }: { icon: string }) {
  const p = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (icon) {
    case 'user': return <svg {...p}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19c1.2-3.5 3.8-5 6.5-5s5.3 1.5 6.5 5" /></svg>
    case 'chat': return <svg {...p}><path d="M4 12c0-3.9 3.6-7 8-7s8 3.1 8 7-3.6 7-8 7c-1 0-2-.15-2.9-.45L5 20l1-3.6C4.7 15.1 4 13.6 4 12z" /></svg>
    case 'group': return <svg {...p}><circle cx="8.5" cy="9.5" r="2.6" /><circle cx="15.5" cy="9.5" r="2.6" /><path d="M3 19c.8-2.7 2.6-4.1 5.5-4.1s4.7 1.4 5.5 4.1" /><path d="M10 19c.8-2.7 2.6-4.1 5.5-4.1s4.7 1.4 5.5 4.1" /></svg>
    case 'eye': return <svg {...p}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="2.6" /></svg>
    case 'advice': return <svg {...p}><path d="M4 5h16v10H8l-4 4V5z" /><path d="M8 9h8M8 12h5" /></svg>
    case 'heart': return <svg {...p}><path d="M12 20s-7-4.5-9.3-9C1.2 8 2.5 5 5.7 5c1.9 0 3.4 1 4.3 2.4C11 6 12.5 5 14.4 5c3.2 0 4.5 3 3 6-2.3 4.5-9.4 9-9.4 9z" /></svg>
    default: return null
  }
}

// ── Manager Card ───────────────────────────────────────────────────────────
function ManagerCard({
  manager,
  selected,
  onSelect,
}: {
  manager: (typeof MANAGERS)[0]
  selected: boolean
  onSelect: () => void
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [glow, setGlow] = useState({ x: -999, y: -999, active: false })

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    setTilt({ rx: (0.5 - py / rect.height) * 14, ry: (px / rect.width - 0.5) * 14 })
    setGlow({ x: px, y: py, active: true })
  }
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0 })
    setGlow({ x: -999, y: -999, active: false })
  }

  return (
    <div style={{ perspective: '900px' }}>
      <div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onSelect}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: 'transform .15s ease-out',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '260px',
            transformStyle: 'preserve-3d',
            transition: 'transform .6s cubic-bezier(.4,.2,.2,1)',
            transform: selected ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#fff', border: `1px solid ${C.cardBorder}`, borderRadius: '20px',
              padding: '20px', boxShadow: '0 8px 24px rgba(43,43,43,.06)',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(circle 150px at ${glow.x}px ${glow.y}px, rgba(244,99,117,.10), transparent 70%)`,
              opacity: glow.active ? 1 : 0, transition: 'opacity .3s ease',
            }} />
            <ImageSlot shape="circle" style={{ width: 90, height: 90, marginBottom: 14 }} label="사진" />
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{manager.name}</div>
            <div style={{ fontSize: 13, color: C.faint }}>{manager.role}</div>
          </div>

          {/* Back */}
          <div
            style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden', overflow: 'hidden',
              transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              background: C.pinkBg, border: `1px solid ${C.pinkBorder}`, borderRadius: '20px', padding: '22px 20px',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(circle 150px at ${glow.x}px ${glow.y}px, rgba(244,99,117,.10), transparent 70%)`,
              opacity: glow.active ? 1 : 0, transition: 'opacity .3s ease',
            }} />
            <div style={{ fontSize: 13.5, color: '#555', lineHeight: 1.7, marginBottom: 12 }}>{manager.bio}</div>
            <div style={{ fontSize: 11, color: '#c9707e' }}>← 탭하여 선택 해제</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Swipe Cards ────────────────────────────────────────────────────────────
function SwipeCards() {
  const [order, setOrder] = useState([0, 1, 2, 3])
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [exiting, setExiting] = useState<{ id: number; x: number; flying: boolean } | null>(null)
  const startX = useRef(0)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const finishSwipe = useCallback(() => {
    if (Math.abs(dragX) <= 80) { setDragX(0); setDragging(false); return }
    const dir = dragX > 0 ? 1 : -1
    const exitId = order[0]
    setOrder((o) => { const [first, ...rest] = o; return [...rest, first] })
    setDragging(false)
    setDragX(0)
    setExiting({ id: exitId, x: dragX, flying: false })
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setExiting((e) => e && e.id === exitId ? { ...e, x: dir * 480, flying: true } : e)
    }))
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    exitTimerRef.current = setTimeout(() => {
      setExiting((e) => e && e.id === exitId ? null : e)
    }, 380)
  }, [dragX, order])

  const byId = Object.fromEntries(SWIPE_CARDS.map((c) => [c.id, c]))
  const visible = order.slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 250, height: 230 }}>
        {visible.map((id, pos) => {
          const def = byId[id]
          const isTop = pos === 0
          return (
            <div
              key={id}
              onPointerDown={isTop ? (e) => { startX.current = e.clientX; setDragging(true); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } : undefined}
              onPointerMove={isTop ? (e) => { if (dragging) setDragX(e.clientX - startX.current) } : undefined}
              onPointerUp={isTop ? () => finishSwipe() : undefined}
              onPointerLeave={isTop ? () => finishSwipe() : undefined}
              style={{
                position: 'absolute', inset: 0, background: '#fff',
                border: `1px solid ${C.cardBorder}`, borderRadius: 18,
                boxShadow: '0 12px 28px rgba(43,43,43,.10)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 20, cursor: isTop ? 'grab' : 'default',
                transition: 'none', zIndex: 10 - pos,
                transform: isTop
                  ? `translateX(${dragX}px) rotate(${dragX / 18}deg) scale(1)`
                  : `translateY(${pos * 10}px) scale(${1 - pos * 0.05})`,
                opacity: isTop ? 1 : 1 - pos * 0.15,
                touchAction: 'none',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: def.color, marginBottom: 16 }} />
              <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{def.title}</div>
              <div style={{ fontSize: 12.5, color: C.muted, textAlign: 'center', lineHeight: 1.6 }}>{def.desc}</div>
            </div>
          )
        })}
        {exiting && (() => {
          const def = byId[exiting.id]
          return (
            <div
              style={{
                position: 'absolute', inset: 0, background: '#fff',
                border: `1px solid ${C.cardBorder}`, borderRadius: 18,
                boxShadow: '0 12px 28px rgba(43,43,43,.10)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 20, zIndex: 20, pointerEvents: 'none',
                transition: exiting.flying ? 'transform .35s ease, opacity .35s ease' : 'none',
                transform: `translateX(${exiting.x}px) rotate(${exiting.x / 18}deg)`,
                opacity: exiting.flying ? 0 : 1,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: def.color, marginBottom: 16 }} />
              <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{def.title}</div>
              <div style={{ fontSize: 12.5, color: C.muted, textAlign: 'center', lineHeight: 1.6 }}>{def.desc}</div>
            </div>
          )
        })()}
      </div>
      <div style={{ fontSize: 12, color: C.lighter, marginTop: 18 }}>← 카드를 밀어서 특징을 넘겨보세요 →</div>
    </div>
  )
}

// ── Chat Demo ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px', background: '#f0f0f0', borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#bbb',
          animation: 'typing-dot 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  )
}

function ChatDemo({ selectedId }: { selectedId: string | null }) {
  const [stage, setStage]   = useState(0)
  const [typing, setTyping] = useState(false)
  const [choice, setChoice] = useState<(typeof CHIPS)[0] | null>(null)
  const timers  = useRef<ReturnType<typeof setTimeout>[]>([])
  const scrollEl = useRef<HTMLDivElement>(null)

  const restartChat = useCallback(() => {
    timers.current.forEach(clearTimeout)
    setStage(0); setTyping(false); setChoice(null)
    timers.current = [
      setTimeout(() => setStage(1), 600),
      setTimeout(() => setTyping(true), 1400),
      setTimeout(() => { setTyping(false); setStage(2) }, 2600),
      setTimeout(() => setStage(3), 3200),
    ]
  }, [])

  useEffect(() => {
    if (selectedId) restartChat()
    else { timers.current.forEach(clearTimeout); setStage(0); setTyping(false); setChoice(null) }
    return () => timers.current.forEach(clearTimeout)
  }, [selectedId, restartChat])

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (scrollEl.current) scrollEl.current.scrollTop = scrollEl.current.scrollHeight
  }, [stage, typing, choice])

  const manager = selectedId ? MANAGERS.find((m) => m.id === selectedId) : null
  const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <div style={{
      flex: '1 1 300px', maxWidth: 360,
      background: '#ece5dd',
      borderRadius: 20, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 8px 32px rgba(43,43,43,.12)',
      minHeight: 420,
    }}>
      {/* ── App header ── */}
      <div style={{
        background: C.accent, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ImageSlot shape="circle" style={{ width: 38, height: 38 }} />
          {manager && (
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 10, height: 10, borderRadius: '50%',
              background: '#4ade80', border: '2px solid white',
            }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            {manager ? manager.name : 'buddyfit'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
            {manager ? `${manager.role} · 온라인` : '매니저를 선택해주세요'}
          </div>
        </div>
        {manager && (
          <div
            onClick={restartChat}
            title="대화 다시보기"
            style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, cursor: 'pointer', padding: '4px 6px', lineHeight: 1 }}
          >
            ↺
          </div>
        )}
      </div>

      {/* ── Message area ── */}
      <div
        ref={scrollEl}
        style={{
          flex: 1, overflowY: 'auto', padding: '16px 12px',
          display: 'flex', flexDirection: 'column', gap: 8,
          scrollBehavior: 'smooth',
        }}
      >
        {/* Placeholder */}
        {!manager && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#a0927e', fontSize: 12.5, lineHeight: 1.7, padding: '20px' }}>
            매니저 카드를 클릭하면<br />대화를 미리볼 수 있어요
          </div>
        )}

        {/* Date stamp */}
        {manager && (
          <div style={{ textAlign: 'center', fontSize: 11, color: '#a0927e', margin: '4px 0 8px', background: 'rgba(0,0,0,0.06)', borderRadius: 10, padding: '3px 10px', alignSelf: 'center' }}>
            오늘
          </div>
        )}

        {/* User message */}
        {manager && stage >= 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <div style={{
              background: '#f9e84e', color: '#2b2b2b',
              padding: '9px 13px', borderRadius: '16px 16px 4px 16px',
              fontSize: 13, lineHeight: 1.55, maxWidth: '78%',
              boxShadow: '0 1px 2px rgba(0,0,0,.10)',
            }}>
              소개팅 잘하고 싶은데 뭐부터 해야 할지 모르겠어요
            </div>
            <div style={{ fontSize: 10, color: '#a0927e', marginRight: 2 }}>{now} ✓✓</div>
          </div>
        )}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <ImageSlot shape="circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
            <TypingDots />
          </div>
        )}

        {/* Manager reply */}
        {manager && stage >= 2 && !typing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <ImageSlot shape="circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 11, color: '#7a6a5a', marginLeft: 2, marginBottom: 2 }}>{manager.name}</div>
              <div style={{
                background: '#fff', color: C.text,
                padding: '9px 13px', borderRadius: '16px 16px 16px 4px',
                fontSize: 13, lineHeight: 1.55, maxWidth: '78%',
                boxShadow: '0 1px 2px rgba(0,0,0,.10)',
              }}>
                그 마음이 제일 중요해요. 우선 첫인상부터 같이 점검해볼까요?
              </div>
              <div style={{ fontSize: 10, color: '#a0927e', marginLeft: 2 }}>{now}</div>
            </div>
          </div>
        )}

        {/* Chips */}
        {manager && stage >= 3 && !choice && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4, justifyContent: 'flex-end' }}>
            {CHIPS.map((c, i) => (
              <div
                key={i}
                onClick={() => setChoice(c)}
                style={{
                  padding: '7px 13px', border: `1.5px solid ${C.accent}`, color: C.accent,
                  borderRadius: 20, fontSize: 12, cursor: 'pointer', transition: 'all .2s ease',
                  background: '#fff', fontWeight: 500,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.pinkBg }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
              >
                {c.label}
              </div>
            ))}
          </div>
        )}

        {/* User chip selection echo */}
        {manager && choice && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <div style={{
              background: '#f9e84e', color: '#2b2b2b',
              padding: '9px 13px', borderRadius: '16px 16px 4px 16px',
              fontSize: 13, lineHeight: 1.55, maxWidth: '78%',
              boxShadow: '0 1px 2px rgba(0,0,0,.10)',
            }}>
              {choice.label}
            </div>
            <div style={{ fontSize: 10, color: '#a0927e', marginRight: 2 }}>{now} ✓✓</div>
          </div>
        )}

        {/* Manager final reply */}
        {manager && choice && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <ImageSlot shape="circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 11, color: '#7a6a5a', marginLeft: 2, marginBottom: 2 }}>{manager.name}</div>
              <div style={{
                background: '#fff', color: C.text,
                padding: '9px 13px', borderRadius: '16px 16px 16px 4px',
                fontSize: 13, lineHeight: 1.55, maxWidth: '78%',
                boxShadow: '0 1px 2px rgba(0,0,0,.10)',
              }}>
                {choice.reply}
              </div>
              <div style={{ fontSize: 10, color: '#a0927e', marginLeft: 2 }}>{now}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div style={{
        background: '#f0ebe3', padding: '8px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{
          flex: 1, background: '#fff', borderRadius: 20,
          padding: '8px 14px', fontSize: 13, color: '#bbb',
          boxShadow: '0 1px 2px rgba(0,0,0,.06)',
        }}>
          메시지를 입력하세요
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ── Section: Header ────────────────────────────────────────────────────────
function Header({ scrolled }: { scrolled: boolean }) {
  const [btnHover, setBtnHover] = useState(false)
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        maxWidth: 1200, margin: '0 auto', position: 'sticky', top: 0, zIndex: 50,
        transition: 'all .3s ease',
        padding: scrolled ? '14px clamp(20px,5vw,64px)' : '22px clamp(20px,5vw,64px)',
        background: scrolled ? 'rgba(250,248,245,0.85)' : C.bg,
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,.06)' : 'none',
      }}
    >
      <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: '-0.5px' }}>
        buddy<span style={{ color: C.accent }}>fit</span>
      </div>
      <div
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          padding: '11px 24px', borderRadius: 30, background: btnHover ? C.accentHover : C.accent,
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          transition: 'all .25s ease',
          transform: btnHover ? 'translateY(-1px)' : 'translateY(0)',
          boxShadow: btnHover ? '0 6px 16px rgba(244,99,117,.35)' : 'none',
        }}
      >
        무료 상담 신청
      </div>
    </div>
  )
}

// ── Section: Hero ──────────────────────────────────────────────────────────
function HeroSection() {
  const [btn1, setBtn1] = useState(false)
  const [btn2, setBtn2] = useState(false)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: 32, maxWidth: 1200, margin: '0 auto', padding: '16px clamp(20px,5vw,64px) 64px' }}>
      <div style={{ flex: '1 1 340px', minWidth: 260 }}>
        <div style={{ display: 'inline-block', padding: '7px 16px', borderRadius: 20, background: C.pinkBg, color: '#d8465a', fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
          남성 전문 소개팅
        </div>
        <div style={{ fontSize: 'clamp(30px,4.2vw,46px)', fontWeight: 900, lineHeight: 1.35, marginBottom: 20 }}>
          여자 사람 친구가<br />알려주는 <span style={{ color: C.accent }}>진짜 연애</span>
        </div>
        <div style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, marginBottom: 30 }}>
          소개부터 대화, 스타일, 이성에게 보이는 이미지까지<br />여성의 시선에서 솔직하고 현실적인 조언을 드립니다.
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div
            onMouseEnter={() => setBtn1(true)}
            onMouseLeave={() => setBtn1(false)}
            style={{
              padding: '15px 30px', borderRadius: 30, background: btn1 ? C.accentHover : C.accent,
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all .25s ease',
              transform: btn1 ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: btn1 ? '0 10px 24px rgba(244,99,117,.35)' : 'none',
            }}
          >
            무료 상담 신청하기
          </div>
          <div
            onMouseEnter={() => setBtn2(true)}
            onMouseLeave={() => setBtn2(false)}
            style={{
              padding: '15px 30px', borderRadius: 30,
              border: `2px solid ${C.text}`, color: btn2 ? '#fff' : C.text,
              fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all .25s ease',
              background: btn2 ? C.text : 'transparent',
            }}
          >
            버디핏 더 알아보기
          </div>
        </div>
      </div>
      <div style={{ flex: '1 1 340px', minWidth: 260 }}>
        <ImageSlot shape="rounded" style={{ width: '100%', height: 380, boxShadow: '0 20px 50px rgba(43,43,43,.12)' }} label="히어로 이미지 (매니저+회원 컷)" />
      </div>
    </div>
  )
}

// ── Section: Quote ─────────────────────────────────────────────────────────
function QuoteSection() {
  const { ref, revealed } = useReveal()
  return (
    <div ref={ref} style={{ background: C.pinkBg, padding: '48px clamp(20px,5vw,64px)', textAlign: 'center', ...revealStyle(revealed) }}>
      <div style={{ maxWidth: 720, margin: '0 auto', fontSize: 'clamp(17px,2vw,21px)', fontWeight: 700, lineHeight: 1.65 }}>
        "매니저가 아닌, 진짜 이성 친구처럼 —<br />여성의 시선으로 당신의 연애를 함께 고민합니다"
      </div>
    </div>
  )
}

// ── Section: Experience ────────────────────────────────────────────────────
function ExperienceSection() {
  const { ref, revealed } = useReveal()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const toggleManager = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  return (
    <div ref={ref} style={{ background: C.bg, padding: '76px clamp(20px,5vw,64px)', ...revealStyle(revealed) }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', marginBottom: 12 }}>TRY IT YOURSELF</div>
        <div style={{ textAlign: 'center', fontSize: 'clamp(24px,3vw,32px)', fontWeight: 900, marginBottom: 14 }}>버디핏을 직접 경험해보세요</div>
        <div style={{ textAlign: 'center', fontSize: 15, color: C.muted, marginBottom: 52 }}>마음에 드는 매니저를 선택하고, 대화를 미리 체험해보세요</div>

        {/* Manager cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 28, marginBottom: 60 }}>
          {MANAGERS.map((m) => (
            <ManagerCard
              key={m.id}
              manager={m}
              selected={selectedId === m.id}
              onSelect={() => toggleManager(m.id)}
            />
          ))}
        </div>

        {/* Swipe cards + Chat */}
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SwipeCards />
          </div>
          <ChatDemo selectedId={selectedId} />
        </div>
      </div>
    </div>
  )
}

// ── Section: Features ──────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '76px clamp(20px,5vw,64px) 40px' }}>
      <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', marginBottom: 12 }}>WHY BUDDYFIT</div>
      <div style={{ textAlign: 'center', fontSize: 'clamp(24px,3vw,32px)', fontWeight: 900, marginBottom: 60 }}>버디핏의 특징</div>
      {FEATURES.map((f, i) => (
        <FeatureRow key={i} feature={f} index={i} />
      ))}
    </div>
  )
}

function FeatureRow({ feature, index }: { feature: (typeof FEATURES)[0]; index: number }) {
  const { ref, revealed } = useReveal()
  const [hovered, setHovered] = useState(false)
  const reversed = index % 2 === 1

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: reversed ? 'row-reverse' : 'row', alignItems: 'center',
        gap: 28, flexWrap: 'wrap', padding: '28px 12px', borderRadius: 14,
        borderBottom: index < 5 ? `1px solid ${C.line}` : 'none',
        transition: 'opacity .6s ease, transform .6s ease, background .3s ease',
        background: hovered ? '#fdfaf8' : 'transparent',
        transform: hovered
          ? `${revealStyle(revealed).transform} translateX(${reversed ? '-4px' : '4px'})`
          : revealStyle(revealed).transform as string,
        opacity: revealStyle(revealed).opacity as number,
        transitionDelay: `${(index % 2) * 60}ms`,
      }}
    >
      <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: feature.color, transition: 'transform .3s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}>
        <FIcon icon={feature.icon} />
      </div>
      <div style={{ flex: '1 1 260px', textAlign: reversed ? 'right' : 'left' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{feature.title}</div>
        <div style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.6 }}>{feature.desc}</div>
      </div>
    </div>
  )
}

// ── Physics constants ──────────────────────────────────────────────────────
const GRAVITY        = 0.45
const AIR_DRAG       = 0.985
const FLOOR_BOUNCE   = 0.36
const FLOOR_FRICTION = 0.80
const MAX_VEL        = 24
const PILE_H         = 320

interface PileCard {
  id: number
  quote: string; author: string
  x: number; y: number
  rotate: number; zIndex: number
  w: number; h: number
  vx: number; vy: number
}

interface MainCard { id: number; quote: string; author: string }

// ── DraggablePile ──────────────────────────────────────────────────────────
function DraggablePile({
  cards, setCards, containerRef, onDrop, mainSlotRefs, onHoverSlot,
}: {
  cards: PileCard[]
  setCards: React.Dispatch<React.SetStateAction<PileCard[]>>
  containerRef: React.RefObject<HTMLDivElement>
  onDrop: (card: PileCard) => boolean
  mainSlotRefs: React.RefObject<(HTMLDivElement | null)[]>
  onHoverSlot: (index: number | null) => void
}) {
  const cardsRef       = useRef<PileCard[]>(cards)
  cardsRef.current     = cards

  const draggingRef    = useRef<{ id: number; startPx: number; startPy: number; startCx: number; startCy: number } | null>(null)
  const velSamples     = useRef<{ x: number; y: number; t: number }[]>([])
  const physicsIds     = useRef(new Set<number>())
  const rafRef         = useRef<number | null>(null)
  const topZ           = useRef(PILE.length + 10)
  const hoveredSlotRef = useRef<number | null>(null)

  const [draggingId, setDraggingId]   = useState<number | null>(null)
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)

  const runPhysics = useCallback(() => {
    if (physicsIds.current.size === 0) { rafRef.current = null; return }
    const cw = containerRef.current?.offsetWidth ?? window.innerWidth

    setCards((cs) =>
      cs.map((c) => {
        if (!physicsIds.current.has(c.id)) return c
        let { x, y, vx, vy } = c
        vy += GRAVITY; vx *= AIR_DRAG; x += vx; y += vy

        if (x < 0)        { x = 0;        vx =  Math.abs(vx) * 0.55 }
        if (x + c.w > cw) { x = cw - c.w; vx = -Math.abs(vx) * 0.55 }

        const floorY = PILE_H - c.h
        if (y >= floorY) {
          y = floorY; vy = -vy * FLOOR_BOUNCE; vx *= FLOOR_FRICTION
          if (Math.abs(vy) < 0.9) { vy = 0; if (Math.abs(vx) < 0.15) { vx = 0; physicsIds.current.delete(c.id) } }
        }
        return { ...c, x, y, vx, vy }
      })
    )
    rafRef.current = requestAnimationFrame(runPhysics)
  }, [containerRef, setCards])

  const kickPhysics = useCallback((id: number) => {
    physicsIds.current.add(id)
    if (!rafRef.current) rafRef.current = requestAnimationFrame(runPhysics)
  }, [runPhysics])

  useEffect(() => {
    cards.forEach((c) => physicsIds.current.add(c.id))
    rafRef.current = requestAnimationFrame(runPhysics)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const prevIds = useRef(new Set(cards.map((c) => c.id)))
  useEffect(() => {
    cards.forEach((c) => { if (!prevIds.current.has(c.id)) kickPhysics(c.id) })
    prevIds.current = new Set(cards.map((c) => c.id))
  }, [cards, kickPhysics])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  // ── detect which main slot the dragged card is hovering ──────────────────
  const checkHover = useCallback((cardX: number, cardY: number, cardW: number, cardH: number) => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return
    const cx = containerRect.left + cardX + cardW / 2
    const cy = containerRect.top  + cardY + cardH / 2
    let found: number | null = null
    mainSlotRefs.current?.forEach((el, i) => {
      if (found !== null || !el) return
      const sr = el.getBoundingClientRect()
      if (cx >= sr.left && cx <= sr.right && cy >= sr.top && cy <= sr.bottom) found = i
    })
    if (found !== hoveredSlotRef.current) {
      hoveredSlotRef.current = found
      setHoveredSlot(found)
      onHoverSlot(found)
    }
  }, [containerRef, mainSlotRefs, onHoverSlot])

  // ── pointer handlers ─────────────────────────────────────────────────────
  const onPointerDown = (id: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    physicsIds.current.delete(id)
    velSamples.current = []
    const card = cardsRef.current.find((c) => c.id === id)!
    topZ.current += 1
    draggingRef.current = { id, startPx: e.clientX, startPy: e.clientY, startCx: card.x, startCy: card.y }
    setDraggingId(id)
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, zIndex: topZ.current, vx: 0, vy: 0 } : c)))
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = draggingRef.current
    if (!d) return
    velSamples.current.push({ x: e.clientX, y: e.clientY, t: performance.now() })
    if (velSamples.current.length > 8) velSamples.current.shift()
    const newX = d.startCx + (e.clientX - d.startPx)
    const newY = d.startCy + (e.clientY - d.startPy)
    setCards((cs) => cs.map((c) => c.id === d.id ? { ...c, x: newX, y: newY } : c))
    const card = cardsRef.current.find((c) => c.id === d.id)
    if (card) checkHover(newX, newY, card.w, card.h)
  }

  const onPointerUp = () => {
    const d = draggingRef.current
    if (!d) return
    draggingRef.current = null
    setDraggingId(null)
    setHoveredSlot(null)
    hoveredSlotRef.current = null
    onHoverSlot(null)

    const cutoff = performance.now() - 80
    const recent = velSamples.current.filter((s) => s.t >= cutoff)
    let vx = 0, vy = 0
    if (recent.length >= 2) {
      const first = recent[0], last = recent[recent.length - 1]
      const dt = Math.max(1, last.t - first.t)
      vx = Math.max(-MAX_VEL, Math.min(MAX_VEL, ((last.x - first.x) / dt) * 16))
      vy = Math.max(-MAX_VEL, Math.min(MAX_VEL, ((last.y - first.y) / dt) * 16))
    }

    const card = cardsRef.current.find((c) => c.id === d.id)!
    const swapped = onDrop(card)
    if (swapped) return

    // If dragged above the container, snap to just above the top edge so it
    // falls back in cleanly rather than materialising behind the section
    const snapY = card.y < 0 ? -card.h : card.y
    const snapVy = card.y < 0 ? Math.max(vy, 0) : vy

    setCards((cs) => cs.map((c) => (c.id === d.id ? { ...c, y: snapY, vx, vy: snapVy } : c)))
    kickPhysics(d.id)
  }

  // ── card style helpers ───────────────────────────────────────────────────
  const cardStyle = (card: PileCard): CSSProperties => ({
    position: 'absolute', left: card.x, top: card.y,
    width: card.w, height: card.h, borderRadius: 12,
    background: 'linear-gradient(135deg,#fdeef0,#f3d0d8)',
    border: '1px solid #f0dfe1',
    boxShadow: '0 10px 20px rgba(43,43,43,.08)',
    transform: `rotate(${card.rotate}deg)`,
    zIndex: card.zIndex, cursor: 'grab', touchAction: 'none',
    willChange: 'left, top', overflow: 'hidden',
    // hide ghost while being dragged via portal
    opacity: card.id === draggingId ? 0 : 1,
  })

  const portalCardStyle = (card: PileCard): CSSProperties => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    const snap = hoveredSlot !== null
    return {
      position: 'fixed',
      left: (containerRect?.left ?? 0) + card.x,
      top:  (containerRect?.top  ?? 0) + card.y,
      width: card.w, height: card.h, borderRadius: 12,
      background: 'linear-gradient(135deg,#fdeef0,#f3d0d8)',
      border: snap ? `2px solid ${C.accent}` : '1px solid #f0dfe1',
      boxShadow: snap
        ? `0 0 0 4px rgba(244,99,117,.25), 0 20px 40px rgba(244,99,117,.30)`
        : '0 10px 20px rgba(43,43,43,.08)',
      transform: `rotate(${card.rotate}deg) scale(${snap ? 1.07 : 1})`,
      zIndex: 99999, cursor: 'grabbing', touchAction: 'none',
      overflow: 'hidden', pointerEvents: 'none',
      transition: 'transform .15s ease, box-shadow .15s ease, border .15s ease',
    }
  }

  const draggedCard = draggingId !== null ? cardsRef.current.find((c) => c.id === draggingId) : null

  return (
    <>
      <div
        ref={containerRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ position: 'relative', height: PILE_H, width: '100vw', left: '50%', marginLeft: '-50vw', marginTop: 56, overflow: 'hidden', zIndex: 10 }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onPointerDown={onPointerDown(card.id)}
            style={cardStyle(card)}
          />
        ))}
      </div>

      {/* Portal: dragged card rendered at body level, above everything */}
      {draggedCard && createPortal(
        <div style={portalCardStyle(draggedCard)} />,
        document.body
      )}
    </>
  )
}

// ── Section: Testimonials ──────────────────────────────────────────────────
function TestimonialsSection() {
  const { ref, revealed } = useReveal()
  const pileContainerRef = useRef<HTMLDivElement>(null)
  const mainSlotRefs     = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const nextId           = useRef(200)
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)

  const [mainCards, setMainCards] = useState<MainCard[]>(() =>
    TESTIMONIALS.map((t, i) => ({ ...t, id: i }))
  )

  const [pileCards, setPileCards] = useState<PileCard[]>(() =>
    PILE.map((p, i) => ({
      id: 100 + i,
      quote: DUMMY_REVIEWS[i].quote,
      author: DUMMY_REVIEWS[i].author,
      x: 60 + Math.random() * 800,
      y: -p.h * 0.5 + Math.random() * 60,
      rotate: p.rotate,
      zIndex: i,
      w: p.w, h: p.h,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * 4,
    }))
  )

  const handleDrop = useCallback((droppedCard: PileCard): boolean => {
    const containerEl = pileContainerRef.current
    if (!containerEl) return false
    const containerRect = containerEl.getBoundingClientRect()

    // Card center in client coords
    const cx = containerRect.left + droppedCard.x + droppedCard.w / 2
    const cy = containerRect.top  + droppedCard.y + droppedCard.h / 2

    for (let i = 0; i < mainSlotRefs.current.length; i++) {
      const slotEl = mainSlotRefs.current[i]
      if (!slotEl) continue
      const sr = slotEl.getBoundingClientRect()
      if (cx >= sr.left && cx <= sr.right && cy >= sr.top && cy <= sr.bottom) {
        const oldMain = mainCards[i]

        // Promote pile card to main slot
        setMainCards((ms) =>
          ms.map((m, idx) =>
            idx === i ? { id: droppedCard.id, quote: droppedCard.quote, author: droppedCard.author } : m
          )
        )

        // Eject old main card into pile — starts from above the pile container
        const ejectedX = sr.left + sr.width / 2 - containerRect.left - 95
        const ejectedY = sr.top - containerRect.top - 140
        const newId = nextId.current++
        setPileCards((cs) => [
          ...cs.filter((c) => c.id !== droppedCard.id),
          {
            id: newId,
            quote: oldMain.quote, author: oldMain.author,
            x: ejectedX, y: ejectedY,
            rotate: (Math.random() - 0.5) * 18,
            zIndex: nextId.current,
            w: 190, h: 140,
            vx: (Math.random() - 0.5) * 3,
            vy: 2,
          },
        ])
        return true
      }
    }
    return false
  }, [mainCards])

  return (
    <div ref={ref} style={{ background: '#fff', padding: '76px clamp(20px,5vw,64px) 0', ...revealStyle(revealed) }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 0 }}>
        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', marginBottom: 12 }}>REAL STORIES</div>
        <div style={{ textAlign: 'center', fontSize: 'clamp(24px,3vw,32px)', fontWeight: 900, marginBottom: 16 }}>실제 후기</div>
        <div style={{ textAlign: 'center', fontSize: 13.5, color: C.lighter, marginBottom: 52 }}>아래 카드를 끌어 올려 후기를 바꿔보세요</div>

        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center', padding: '0 clamp(0px,2vw,20px)' }}>
          {mainCards.map((t, i) => (
            <div
              key={t.id}
              ref={(el) => { mainSlotRefs.current[i] = el }}
              style={{
                flex: '1 1 280px', maxWidth: 320, background: '#fdfaf8', borderRadius: 20, overflow: 'hidden',
                border: hoveredSlot === i ? `2px solid ${C.accent}` : `1px solid ${C.cardBorder}`,
                boxShadow: hoveredSlot === i ? `0 0 0 4px rgba(244,99,117,.15)` : 'none',
                transform: hoveredSlot === i ? 'scale(0.97)' : 'scale(1)',
                opacity: hoveredSlot === i ? 0.85 : 1,
                transition: 'transform .2s ease, box-shadow .2s ease, border .2s ease, opacity .2s ease',
              }}
            >
              <ImageSlot shape="rect" style={{ width: '100%', height: 170, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} label="사진" />
              <div style={{ padding: 24 }}>
                <div style={{ color: C.accent, fontSize: 14, letterSpacing: '2px', marginBottom: 14 }}>★★★★★</div>
                <div style={{ fontSize: 13.5, color: '#555', lineHeight: 1.75, marginBottom: 20 }}>{t.quote}</div>
                <div style={{ fontSize: 12.5, color: C.faint, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>{t.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DraggablePile
        cards={pileCards}
        setCards={setPileCards}
        containerRef={pileContainerRef}
        onDrop={handleDrop}
        mainSlotRefs={mainSlotRefs}
        onHoverSlot={setHoveredSlot}
      />
    </div>
  )
}

// ── Section: Pricing ───────────────────────────────────────────────────────
function PricingSection() {
  const p1 = useReveal()
  const p2 = useReveal()
  const p3 = useReveal()
  const [h1, setH1] = useState(false)
  const [h2, setH2] = useState(false)
  const [h3, setH3] = useState(false)

  const cardBase: CSSProperties = {
    flex: '1 1 260px', maxWidth: 320, background: '#fff', borderRadius: 20,
    padding: '34px 28px', transition: 'opacity .6s ease, transform .3s ease, box-shadow .3s ease',
    position: 'relative',
  }

  return (
    <div style={{ padding: '76px clamp(20px,5vw,64px)', background: C.bg }}>
      <div style={{ maxWidth: 1020, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', marginBottom: 12 }}>MEMBERSHIP</div>
        <div style={{ textAlign: 'center', fontSize: 'clamp(24px,3vw,32px)', fontWeight: 900, marginBottom: 52 }}>가격 / 멤버십 안내</div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div ref={p1.ref} onMouseEnter={() => setH1(true)} onMouseLeave={() => setH1(false)}
            style={{ ...cardBase, border: `1px solid ${C.line}`, ...revealStyle(p1.revealed), transform: h1 ? 'translateY(-8px)' : revealStyle(p1.revealed).transform as string, boxShadow: h1 ? '0 16px 36px rgba(43,43,43,.10)' : 'none' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>라이트</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>가격 자리</div>
            <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 2 }}>구성 항목 자리<br />구성 항목 자리<br />구성 항목 자리</div>
          </div>

          <div ref={p2.ref} onMouseEnter={() => setH2(true)} onMouseLeave={() => setH2(false)}
            style={{ ...cardBase, border: `2px solid ${C.accent}`, ...revealStyle(p2.revealed, 100), transform: h2 ? 'translateY(-10px) scale(1.02)' : revealStyle(p2.revealed, 100).transform as string, boxShadow: h2 ? '0 20px 44px rgba(244,99,117,.28)' : 'none' }}>
            <div style={{ position: 'absolute', top: -14, left: 28, background: C.accent, color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20 }}>추천</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: C.accent }}>스탠다드</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>가격 자리</div>
            <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 2 }}>구성 항목 자리<br />구성 항목 자리<br />구성 항목 자리<br />구성 항목 자리</div>
          </div>

          <div ref={p3.ref} onMouseEnter={() => setH3(true)} onMouseLeave={() => setH3(false)}
            style={{ ...cardBase, border: `1px solid ${C.line}`, ...revealStyle(p3.revealed, 200), transform: h3 ? 'translateY(-8px)' : revealStyle(p3.revealed, 200).transform as string, boxShadow: h3 ? '0 16px 36px rgba(43,43,43,.10)' : 'none' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>프리미엄</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>가격 자리</div>
            <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 2 }}>구성 항목 자리<br />구성 항목 자리<br />구성 항목 자리<br />구성 항목 자리<br />구성 항목 자리</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section: FAQ ───────────────────────────────────────────────────────────
function FAQSection() {
  const { ref, revealed } = useReveal()
  const [openIdx, setOpenIdx] = useState(-1)

  return (
    <div ref={ref} style={{ padding: '76px clamp(20px,5vw,64px)', ...revealStyle(revealed) }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', marginBottom: 12 }}>FAQ</div>
        <div style={{ textAlign: 'center', fontSize: 'clamp(24px,3vw,32px)', fontWeight: 900, marginBottom: 44 }}>자주 묻는 질문</div>
        {FAQ_ITEMS.map((item, i) => (
          <FAQRow key={i} item={item} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
        ))}
      </div>
    </div>
  )
}

function FAQRow({ item, open, onToggle }: { item: (typeof FAQ_ITEMS)[0]; open: boolean; onToggle: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${C.line}` }}>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ padding: '20px 4px', cursor: 'pointer', borderRadius: 10, transition: 'background .2s ease', background: hov ? '#fdf9f8' : 'transparent' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700 }}>{item.q}</div>
          <div style={{ display: 'inline-block', fontSize: 18, color: C.accent, fontWeight: 700, transition: 'transform .3s ease', transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</div>
        </div>
      </div>
      <div style={{ maxHeight: open ? '240px' : '0px', overflow: 'hidden', opacity: open ? 1 : 0, transition: 'max-height .35s ease, opacity .25s ease' }}>
        <div style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.7, padding: '0 4px 20px 4px', paddingRight: 30 }}>{item.a}</div>
      </div>
    </div>
  )
}

// ── Section: CTA ───────────────────────────────────────────────────────────
function CTASection() {
  const { ref, revealed } = useReveal()
  const [hov, setHov] = useState(false)
  return (
    <div ref={ref} style={{ background: C.text, color: '#fff', textAlign: 'center', padding: '88px clamp(20px,5vw,64px)', ...revealStyle(revealed) }}>
      <div style={{ fontSize: 'clamp(24px,3.4vw,34px)', fontWeight: 900, marginBottom: 16 }}>지금, 여자 사람 친구에게 물어보세요</div>
      <div style={{ fontSize: 15, color: '#bbb', marginBottom: 32 }}>첫 상담은 무료입니다. 부담 없이 시작해보세요.</div>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'inline-block', padding: '16px 36px', borderRadius: 30,
          background: hov ? C.accentHover : C.accent,
          color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          transition: 'all .25s ease',
          transform: hov ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
          animation: hov ? 'none' : 'bf-pulse 2.6s ease-in-out infinite',
        }}
      >
        무료 상담 신청하기
      </div>
    </div>
  )
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(y > 10)
      setProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: C.bg, color: C.text, position: 'relative', isolation: 'isolate' }}>
      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: 3, width: `${progress}%`, background: 'linear-gradient(90deg,#f46375,#f9a3ae)', zIndex: 9999, transition: 'width .1s linear' }} />

      <Header scrolled={scrolled} />
      <HeroSection />
      <QuoteSection />
      <ExperienceSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />

      <div style={{ padding: 26, textAlign: 'center', fontSize: 12, color: C.faint }}>
        © buddyfit. All rights reserved.
      </div>
    </div>
  )
}
