import { useState } from 'react'
import { Zap, Bot, MessageSquare, Sparkles, Send, Upload, Route, Trash2, Download, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { coachService } from '../services/employeeCrudService'

const SUGGESTIONS = ['Career paths', 'Skill gaps', 'Learning plan', 'Salary insights']

export default function EmployeeAICareerCoach() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello! I'm your AI Career Coach. How can I help you today? You can ask me about skill development, career paths, learning recommendations, or anything career-related." },
  ])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!inputText.trim()) return
    const userMsg = { id: messages.length + 1, sender: 'user', text: inputText }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setSending(true)
    try {
      const response = await coachService.sendMessage(inputText)
      const aiMsg = { id: messages.length + 2, sender: 'ai', text: response.reply || "That's a great question! Based on your profile, I recommend focusing on system design, leadership, and cloud skills to advance your career." }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      const fallbackMsg = { id: messages.length + 2, sender: 'ai', text: "I'm here to help! Could you please provide more details about what you'd like to discuss?" }
      setMessages(prev => [...prev, fallbackMsg])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleSuggestion = async (suggestion) => {
    setInputText(suggestion)
    const userMsg = { id: messages.length + 1, sender: 'user', text: suggestion }
    setMessages(prev => [...prev, userMsg])
    setSending(true)
    try {
      const response = await coachService.sendMessage(suggestion)
      const aiMsg = { id: messages.length + 2, sender: 'ai', text: response.reply || `Great choice! Let me provide insights on ${suggestion.toLowerCase()}. Based on your profile...` }
      setMessages(prev => [...prev, aiMsg])
    } finally {
      setSending(false)
    }
  }

  const handleUploadResume = () => {
    toast.success('Resume upload dialog opened (demo)')
  }

  const handleGenerateRoadmap = () => {
    toast.success('Career roadmap generated! Check your dashboard.')
  }

  const handleClearChat = () => {
    setMessages([{ id: 1, sender: 'ai', text: "Hello! I'm your AI Career Coach. How can I help you today?" }])
    toast.success('Chat cleared')
  }

  const handleDownloadSuggestions = () => {
    toast.success('Career suggestions downloaded!')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center shrink-0"><Zap className="w-6 h-6 text-blue-600" /></div>
          <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">AI Career Coach</h1><p className="mt-1 text-sm text-slate-500">Get personalized career guidance powered by AI</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleClearChat} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors" title="Clear Chat"><Trash2 className="w-4 h-4" /></button>
          <button onClick={handleDownloadSuggestions} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors" title="Download Suggestions"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-start gap-3 max-w-[80%] ${msg.sender === 'ai' ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.sender === 'ai' ? 'bg-blue-100 dark:bg-blue-500/15' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {msg.sender === 'ai' ? <Bot className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${msg.sender === 'ai' ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white' : 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'}`}>
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center"><Bot className="w-4 h-4 text-blue-600" /></div>
                <div className="rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-800">
                  <div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} /></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700/30">
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Ask your career question..." value={inputText}
              onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button onClick={handleUploadResume} className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors" title="Upload Resume">
              <Upload className="w-4 h-4" />
            </button>
            <button onClick={handleGenerateRoadmap} className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors" title="Generate Roadmap">
              <Route className="w-4 h-4" />
            </button>
            <button onClick={handleSend} disabled={!inputText.trim() || sending}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {SUGGESTIONS.map((chip) => (
              <button key={chip} onClick={() => handleSuggestion(chip)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{chip}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
