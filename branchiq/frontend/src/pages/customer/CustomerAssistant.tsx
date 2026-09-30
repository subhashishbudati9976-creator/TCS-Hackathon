import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  FileText,
  Zap,
} from 'lucide-react'
import * as api from '../../api'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
}

export const CustomerAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Hello! I am your **AVENUE Banking Concierge**. I can help you check live branch wait times, verify required documents for account/loan services, and guide you to instant online self-service channels so you don't have to wait in line. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputValue, setInputValue] = useState<string>('')
  const [isSending, setIsSending] = useState<boolean>(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim()
    if (!query || isSending) return

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputValue('')
    setIsSending(true)

    try {
      const res = await api.sendCustomerChatMessage(query)
      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const errorMsg: Message = {
        id: `e_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I am having trouble connecting to the Avenue service. Please verify your connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsSending(false)
    }
  }

  const promptChips = [
    'Which branch has the shortest wait time right now?',
    'Can I open an account online without visiting a branch?',
    'What documents are required for a personal loan?',
    'How do I complete periodic KYC re-verification?',
  ]

  return (
    <div className="min-h-screen avenue-mesh-bg text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between relative">
      <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-4 relative z-10">
        {/* Assistant Header */}
        <div className="avenue-glass rounded-2xl p-4 sm:p-5 shadow-2xl flex items-center justify-between border border-cyan-500/25">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">AVENUE AI Concierge</h1>
                <span className="badge badge-normal font-mono">
                  Grounded • Real Data
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grounded banking operational guidance • Document checklists & digital queue bypass
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>TCS PS-5 Banking Standard</span>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 avenue-glass rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[420px] max-h-[560px] shadow-inner">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20'
                    : 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-xs'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-medium rounded-tr-none shadow-md shadow-cyan-600/20'
                    : 'bg-slate-900/90 border border-slate-700/80 text-slate-200 rounded-tl-none whitespace-pre-line shadow-sm'
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300 font-bold">$1</strong>') }} />
                <span className={`block text-[10px] mt-1.5 font-mono ${m.sender === 'user' ? 'text-cyan-100' : 'text-slate-500'}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Consulting live branch crowding & policy guidelines...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="flex flex-wrap gap-2">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2 avenue-glass rounded-2xl p-2 shadow-lg border border-slate-700/70"
        >
          <input
            type="text"
            placeholder="Ask about live wait times, required paperwork, or digital alternatives..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />

          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
