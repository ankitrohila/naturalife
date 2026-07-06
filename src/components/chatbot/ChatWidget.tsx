'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, X, Send, Mic, Volume2, VolumeX } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface ChatProduct { id: string; name: string; slug: string; image: string | null; price: number | null }
interface ChatMessage { role: 'user' | 'bot'; text: string; products?: ChatProduct[] }

function getSessionId() {
  if (typeof window === 'undefined') return 'anonymous'
  let id = sessionStorage.getItem('naturalife-chat-session')
  if (!id) {
    id = Math.random().toString(36).slice(2)
    sessionStorage.setItem('naturalife-chat-session', id)
  }
  return id
}

// Picks the best available Indian-English female voice from whatever the
// browser/OS ships (e.g. "Google हिन्दी", "Microsoft Heera/Neerja"). Voice
// lists load asynchronously in some browsers, so this is called lazily.
function pickIndianFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null

  const femaleNameHints = ['female', 'heera', 'neerja', 'veena', 'raveena', 'lekha', 'priya']
  const indianLangs = voices.filter((v) => /^(en-IN|hi-IN)/i.test(v.lang))

  const femaleIndian = indianLangs.find((v) => femaleNameHints.some((h) => v.name.toLowerCase().includes(h)))
  if (femaleIndian) return femaleIndian
  if (indianLangs.length > 0) return indianLangs[0]

  const anyFemale = voices.find((v) => femaleNameHints.some((h) => v.name.toLowerCase().includes(h)))
  return anyFemale ?? null
}

export function ChatWidget() {
  const router = useRouter()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: t('chatbot_greeting') },
  ])
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const recognitionRef = useRef<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Contact / lead-capture flow
  const [contactStage, setContactStage] = useState<'pending' | 'collected' | 'skipped'>('pending')
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '' })
  const leadIdRef = useRef<string | null>(null)
  const requirementLogRef = useRef<string[]>([])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    // Chrome loads voices asynchronously — this just warms the cache.
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
  }, [])

  const speak = (text: string) => {
    if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(text)
    const voice = pickIndianFemaleVoice()
    if (voice) utter.voice = voice
    utter.pitch = 1.05
    utter.rate = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  // Waits a little before showing the reply so it reads like a real person
  // typing rather than an instant IVR-style dump of text.
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const submitContactForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return
    try {
      const res = await fetch('/api/chatbot/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, requirement: requirementLogRef.current.join(' | '), sessionId: getSessionId() }),
      })
      const data = await res.json()
      leadIdRef.current = data.id ?? null
    } catch {
      // non-blocking — chat still works even if lead capture fails
    }
    setContactStage('collected')
    setMessages((m) => [...m, { role: 'bot', text: `Thanks, ${contactForm.name}! Our team can follow up if you'd like. Now — how can I help you today?` }])
  }

  const skipContactForm = () => {
    setContactStage('skipped')
    setMessages((m) => [...m, { role: 'bot', text: 'No problem! What can I help you with today?' }])
  }

  const syncRequirement = async () => {
    if (!leadIdRef.current) return
    await fetch('/api/chatbot/lead', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadIdRef.current, sessionId: getSessionId(), requirement: requirementLogRef.current.join(' | ') }),
    }).catch(() => {})
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')

    if (contactStage === 'pending') {
      if (/^skip$/i.test(text.trim())) { skipContactForm(); return }
      return // the inline contact form below handles submission; ignore free-typed text until then
    }

    requirementLogRef.current.push(text)
    syncRequirement()

    setSending(true)
    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: getSessionId() }),
      })
      const data = await res.json()

      setTyping(true)
      const typingDelay = Math.min(2200, Math.max(500, (data.reply?.length ?? 0) * 18))
      await wait(typingDelay)
      setTyping(false)

      setMessages((m) => [...m, { role: 'bot', text: data.reply, products: data.products }])
      speak(data.reply)
      if (data.action?.type === 'navigate') {
        setTimeout(() => router.push(data.action.path), 600)
      }
    } catch {
      setTyping(false)
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }])
    }
    setSending(false)
  }

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessages((m) => [...m, { role: 'bot', text: 'Voice input is not supported in this browser. Try Chrome on desktop or Android.' }])
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      sendMessage(transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat assistant"
        className="fixed bottom-4 right-4 z-[160] w-14 h-14 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: 'var(--green)' }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-[160] w-[340px] max-w-[90vw] h-[480px] bg-white border border-[var(--line)] shadow-2xl flex flex-col">
          <div className="px-4 py-3 text-white flex items-center justify-between" style={{ backgroundColor: 'var(--green)' }}>
            <p className="text-sm font-semibold">Naturalife Assistant</p>
            <button onClick={() => setVoiceOn((v) => !v)} aria-label="Toggle voice replies" className="text-white/90 hover:text-white">
              {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  <div
                    className={`px-3 py-2 text-sm ${m.role === 'user' ? 'text-white' : 'bg-[var(--surface)] text-[var(--ink)]'}`}
                    style={m.role === 'user' ? { backgroundColor: 'var(--green)' } : {}}
                  >
                    {m.text}
                  </div>
                  {m.products && m.products.length > 0 && (
                    <div className="mt-1.5 space-y-1.5">
                      {m.products.map((p) => (
                        <a
                          key={p.id}
                          href={`/shop/${p.slug}`}
                          className="flex items-center gap-2 bg-white border border-[var(--line)] p-2 hover:border-[var(--green)] transition-colors"
                        >
                          <div className="w-10 h-10 shrink-0 bg-[var(--surface)] overflow-hidden">
                            {p.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[var(--ink)] truncate">{p.name}</p>
                            {p.price != null && <p className="text-xs text-[var(--green)] font-semibold">₹{p.price.toLocaleString('en-IN')}</p>}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {contactStage === 'pending' && (
              <form onSubmit={submitContactForm} className="bg-[var(--surface)] p-3 space-y-2">
                <input
                  required
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-[var(--line)] px-2.5 py-1.5 text-xs focus:outline-none"
                />
                <input
                  required
                  placeholder="Phone number"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-[var(--line)] px-2.5 py-1.5 text-xs focus:outline-none"
                />
                <input
                  placeholder="Email (optional)"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-[var(--line)] px-2.5 py-1.5 text-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-1.5 text-white text-xs font-semibold" style={{ backgroundColor: 'var(--green)' }}>{t('chatbot_continue')}</button>
                  <button type="button" onClick={skipContactForm} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">{t('chatbot_skip')}</button>
                </div>
              </form>
            )}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-[var(--surface)] px-3 py-2.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
            className="flex items-center gap-1.5 p-2 border-t border-[var(--line)]"
          >
            <button type="button" onClick={startListening} aria-label="Speak" className={`w-9 h-9 flex items-center justify-center shrink-0 ${listening ? 'text-white' : 'text-gray-500'}`} style={listening ? { backgroundColor: 'var(--green)' } : {}}>
              <Mic size={16} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={contactStage === 'pending' ? 'Fill the form above, or type "skip"...' : t('chatbot_input_placeholder')}
              className="flex-1 border border-[var(--line)] px-3 py-2 text-sm focus:outline-none"
            />
            <button type="submit" aria-label="Send" className="w-9 h-9 flex items-center justify-center text-white shrink-0" style={{ backgroundColor: 'var(--green)' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
