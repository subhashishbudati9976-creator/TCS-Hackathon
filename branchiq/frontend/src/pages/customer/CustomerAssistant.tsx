import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  User,
  Clock,
  Layers,
  HelpCircle,
  FileText,
  Building2,
  CheckCircle2,
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
      text: "Hello! I am your AVENUE Banking Assistant. I can check current branch crowding, list required paperwork for any service, or guide you to self-service digital options. How can I assist you today?",
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
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "I apologize, but I could not connect to our knowledge service. Please try asking again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsSending(false)
    }
  }

  const suggestedQuestions = [
    "What documents do I need for Account Opening?",
    "Can I complete KYC online without visiting a branch?",
    "Which branch currently has the lowest waiting time?",
    "What is the average duration for a Loan Application?",
  ]

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-7">
        {/* Page Header */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                <Bot className="w-3.5 h-3.5" />
                <span>Grounded Knowledge Concierge</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                AVENUE Banking Assistant
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Grounded advice on branch services, operating hours, documentation, and queue minimization
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono bg-[#090d16] px-3 py-1.5 rounded-md border border-[#1e293b]">
              Knowledge Grounding: <strong className="text-emerald-400">Deterministic</strong>
            </div>
          </div>
        </div>

        {/* 12-Column Chat Layout: 8-col Conversation Panel + 4-col Guidance Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7">
          {/* Main Conversation Container (8 Columns) */}
          <div className="lg:col-span-8 bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-col h-[640px] shadow-sm overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs sm:text-sm ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-xl p-4 leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-[#090d16] border border-[#1e293b] text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <div
                      className={`text-[10px] mt-2 ${
                        m.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-500'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex gap-3 text-xs sm:text-sm items-center text-slate-400 pl-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-[#090d16] border border-[#1e293b] rounded-xl px-4 py-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse delay-150" />
                    <span className="text-xs text-slate-400 ml-1">Checking operational knowledge...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#0b101b] border-t border-[#1e293b]">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Ask a question about branch wait times, required documents, or digital options..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-[#090d16] border border-[#1e293b] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSending}
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Guidance & Suggested Inquiries (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Frequently Asked Questions</span>
              </h2>
              <p className="text-xs text-slate-400 mb-4">Click any prompt to instantly query the assistant:</p>

              <div className="space-y-2.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-3 rounded-lg bg-[#090d16] border border-[#1e293b] hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition-all cursor-pointer leading-snug"
                  >
                    &ldquo;{q}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Preparation Tips Box */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Customer Preparation Tips
              </h2>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Always bring one government photo ID and address proof for all account updates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Routine statement requests and address modifications can be completed on the mobile banking app.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Optimal walk-in arrival times are typically between 10:00 &mdash; 11:30 AM before afternoon counter peak.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerAssistant
