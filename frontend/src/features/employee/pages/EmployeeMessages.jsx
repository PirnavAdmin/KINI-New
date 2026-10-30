import { useState } from 'react'
import { Search, Send, MessageSquare, Trash2, Reply, Paperclip, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_CONVOS = [
  { id: 1, name: 'Sarah Chen', role: 'Mentor', avatar: 'SC', lastMsg: 'Great progress on your React project!', time: '2 hours ago', unread: 1, online: true },
  { id: 2, name: 'John Doe', role: 'Instructor', avatar: 'JD', lastMsg: 'Please review the assignment feedback', time: '5 hours ago', unread: 0, online: false },
  { id: 3, name: 'HR Team', role: 'HR', avatar: 'HR', lastMsg: 'Reminder: Q1 Review submissions', time: 'Yesterday', unread: 2, online: false },
  { id: 4, name: 'Anna Lee', role: 'Mentor', avatar: 'AL', lastMsg: 'Check the new TypeScript module', time: '2 days ago', unread: 0, online: true },
]

const MOCK_MESSAGES = [
  { id: 1, sender: 'them', text: 'Great progress on your React project!', time: '2:30 PM' },
  { id: 2, sender: 'me', text: 'Thank you! The hooks section was very helpful.', time: '2:32 PM' },
  { id: 3, sender: 'them', text: 'Glad to hear that. Are you ready for the live session today?', time: '2:33 PM' },
  { id: 4, sender: 'me', text: 'Yes, I have completed the prerequisite modules.', time: '2:35 PM' },
]

export default function EmployeeMessages() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChat, setSelectedChat] = useState(1)
  const [messageText, setMessageText] = useState('')
  const [convos, setConvos] = useState(MOCK_CONVOS)
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filteredConvos = convos.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSend = () => {
    if (!messageText.trim()) return
    const newMsg = { id: messages.length + 1, sender: 'me', text: messageText, time: 'Just now' }
    setMessages(prev => [...prev, newMsg])
    setConvos(prev => prev.map(c => c.id === selectedChat ? { ...c, lastMsg: messageText, time: 'Just now' } : c))
    setMessageText('')
    toast.success('Message sent')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleReply = () => {
    toast.success('Reply ready')
  }

  const handleAttachFile = () => {
    toast.success('File picker opened (demo)')
  }

  const handleDeleteConversation = () => {
    if (!deleteConfirm) return
    setConvos(prev => prev.filter(c => c.id !== deleteConfirm))
    if (selectedChat === deleteConfirm) {
      const remaining = convos.filter(c => c.id !== deleteConfirm)
      setSelectedChat(remaining.length > 0 ? remaining[0].id : null)
    }
    setDeleteConfirm(null)
    toast.success('Conversation deleted')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Messages</h1>
      <p className="text-sm text-slate-500 mb-6">Chat with mentors and instructors</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '500px' }}>
        {/* Conversations List */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 flex flex-col">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search conversations..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30 overflow-y-auto flex-1">
            {filteredConvos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">No conversations found</p>
              </div>
            ) : (
              filteredConvos.map((c) => (
                <button key={c.id} onClick={() => setSelectedChat(c.id)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${selectedChat === c.id ? 'bg-blue-50 dark:bg-blue-500/5' : ''}`}>
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">{c.avatar}</div>
                    {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.name}</p><span className="text-[10px] text-slate-400">{c.time}</span></div>
                    <p className="text-xs text-slate-400 truncate">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center">{c.unread}</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 flex flex-col">
          {selectedChat ? (
            <>
              <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {convos.find(c => c.id === selectedChat)?.avatar || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{convos.find(c => c.id === selectedChat)?.name}</p>
                    <p className="text-[10px] text-emerald-500">{convos.find(c => c.id === selectedChat)?.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleReply} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors" title="Reply">
                    <Reply className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(selectedChat)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: '400px' }}>
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.sender === 'me' ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-br-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'}`}>
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.sender === 'me' ? 'text-white/60' : 'text-slate-400'}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-slate-100 dark:border-slate-700/30">
                <div className="flex items-center gap-2">
                  <button onClick={handleAttachFile} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" title="Attach File">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input type="text" placeholder="Type a message..." value={messageText}
                    onChange={(e) => setMessageText(e.target.value)} onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  <button onClick={handleSend} disabled={!messageText.trim()}
                    className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1">Choose a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="flex-1"><h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Conversation</h3><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This action cannot be undone.</p></div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleDeleteConversation} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
