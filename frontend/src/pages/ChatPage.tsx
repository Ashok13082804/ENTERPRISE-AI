import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Plus, Bot, User, Loader2, Brain, Code, Database, FileText,
  Trash2, ChevronDown, Settings2, Copy, ThumbsUp, ThumbsDown, Zap,
  Download, Volume2, Mic, MicOff, Paperclip, Check, FileCheck
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { chatApi } from '@/api/client'
import toast from 'react-hot-toast'

const MODES = [
  { id: 'chat',     label: 'Chat',     icon: Bot,      color: 'text-indigo-400', desc: 'General AI assistant' },
  { id: 'rag',      label: 'RAG',      icon: Database, color: 'text-blue-400',   desc: 'Knowledge base Q&A' },
  { id: 'code',     label: 'Code',     icon: Code,     color: 'text-emerald-400', desc: 'Code generation' },
  { id: 'sql',      label: 'SQL',      icon: Database, color: 'text-amber-400',  desc: 'SQL query builder' },
  { id: 'document', label: 'Docs',     icon: FileText, color: 'text-cyan-400',   desc: 'Document analysis' },
]

const SUGGESTED_PROMPTS = [
  '📊 Analyze our Q4 sales data and provide insights',
  '📧 Draft a professional email for a client proposal',
  '🔍 Explain our RAG knowledge base architecture',
  '💻 Write a Python FastAPI endpoint for user authentication',
  '📋 Generate meeting minutes from this transcript',
  '🤖 What machine learning model is best for customer churn?',
]

export default function ChatPage() {
  const qc = useQueryClient()
  const [activeSession, setActiveSession] = useState<number | null>(null)
  const [message, setMessage]             = useState('')
  const [mode, setMode]                   = useState('chat')
  const [model, setModel]                 = useState('llama3')
  const [ragCollection, setRagCollection] = useState('default')
  const [messages, setMessages]           = useState<any[]>([])
  const [responding, setResponding]       = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: sessionsData } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => chatApi.getSessions().then(r => r.data),
  })

  const { data: modelsData } = useQuery({
    queryKey: ['ollama-models'],
    queryFn: () => chatApi.getModels().then(r => r.data),
    staleTime: 300_000,
  })

  const sessions = sessionsData || []
  const ollamaModels = modelsData?.models || []
  const ollamaAvailable = modelsData?.available ?? false

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: (data: object) => chatApi.sendMessage(data).then(r => r.data),
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        processing_time_ms: data.processing_time_ms,
        model: data.model,
      }])
      if (data.session_id && !activeSession) {
        setActiveSession(data.session_id)
        qc.invalidateQueries({ queryKey: ['chat-sessions'] })
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to send message')
    },
    onSettled: () => setResponding(false),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => chatApi.deleteSession(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat-sessions'] })
      setActiveSession(null)
      setMessages([])
      toast.success('Session deleted')
    },
  })

  const handleSend = async () => {
    const text = message.trim()
    if (!text && !attachedFile || responding) return

    let finalMessage = text
    if (attachedFile) {
      finalMessage += `\n\n[Uploaded File Attachment: ${attachedFile.name} (${(attachedFile.size / 1024).toFixed(1)} KB)]`
    }

    const userMsg = { role: 'user', content: finalMessage }
    setMessages(prev => [...prev, userMsg])
    setMessage('')
    setAttachedFile(null)
    setResponding(true)

    sendMutation.mutate({
      message: finalMessage,
      session_id: activeSession,
      model,
      mode,
      rag_collection: mode === 'rag' ? ragCollection : undefined,
      temperature: 0.7,
    })
  }

  const newChat = () => {
    setActiveSession(null)
    setMessages([])
  }

  const loadSession = async (id: number) => {
    setActiveSession(id)
    const res = await chatApi.getMessages(id)
    setMessages(res.data)
  }

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to delete/archive all chat history?')) return
    try {
      await chatApi.clearSessions()
      qc.invalidateQueries({ queryKey: ['chat-sessions'] })
      setActiveSession(null)
      setMessages([])
      toast.success('All history cleared')
    } catch (err) {
      toast.error('Failed to clear history')
    }
  }

  const handleExport = async (format: string) => {
    if (!activeSession) {
      toast.error('Start a chat session before exporting.')
      return
    }
    try {
      const res = await chatApi.export(activeSession, format)
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const extension = format === 'markdown' ? 'md' : format
      link.setAttribute('download', `Chat_Session_${activeSession}.${extension}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success(`Exported successfully as ${format.toUpperCase()}`)
      setShowExportMenu(false)
    } catch (err) {
      toast.error('Failed to export. Please try again.')
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const cleanText = text.replace(/[*#`_\-]/g, '') // remove markdown styling characters for cleaner speech
      const utterance = new SpeechSynthesisUtterance(cleanText)
      window.speechSynthesis.speak(utterance)
      toast.success('Reading message aloud...')
    } else {
      toast.error('Speech synthesis not supported in this browser.')
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        toast.error('Speech recognition not supported in this browser.')
        return
      }
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'
      rec.onstart = () => setIsRecording(true)
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript
        setMessage(prev => (prev ? prev + ' ' + text : text))
        toast.success('Speech transcribed!')
      }
      rec.onerror = (err: any) => {
        console.error(`Speech recognition error: ${err.error}`)
        setIsRecording(false)
      }
      rec.onend = () => setIsRecording(false)
      recognitionRef.current = rec
      rec.start()
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFile(file)
      toast.success(`Attached: ${file.name}`)
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sessions sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col bg-black/10">
        <div className="p-3 border-b border-white/5 space-y-2">
          <button onClick={newChat} className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm">
            <Plus className="w-4 h-4" /> New Chat
          </button>
          <button onClick={handleClearHistory} className="w-full flex items-center justify-center gap-2 py-1.5 text-xs bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 border border-white/10 rounded-lg transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Clear All History
          </button>
        </div>

        {/* Model selector */}
        <div className="px-3 pt-2 pb-1">
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="llama3">Llama 3</option>
            <option value="mistral">Mistral</option>
            <option value="phi3">Phi-3</option>
            <option value="gemma">Gemma</option>
            <option value="deepseek-r1">DeepSeek R1</option>
            {ollamaModels.map((m: any) => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Ollama status */}
        <div className="px-3 pb-2">
          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${ollamaAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${ollamaAvailable ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
            {ollamaAvailable ? 'Ollama Connected' : 'Ollama Offline'}
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No sessions yet</p>
          )}
          {sessions.map((s: any) => (
            <div
              key={s.id}
              onClick={() => loadSession(s.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all ${activeSession === s.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'}`}
            >
              <Bot className="w-3 h-3 flex-shrink-0" />
              <span className="flex-1 truncate">{s.title || 'Chat Session'}</span>
              <button
                onClick={e => { e.stopPropagation(); deleteMutation.mutate(s.id) }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Mode selector / Header */}
        <div className="border-b border-white/5 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === m.id ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                title={m.desc}
              >
                <m.icon className={`w-3 h-3 ${mode === m.id ? 'text-primary' : m.color}`} />
                {m.label}
              </button>
            ))}
            {mode === 'rag' && (
              <input
                value={ragCollection}
                onChange={e => setRagCollection(e.target.value)}
                placeholder="Collection name"
                className="ml-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            )}
          </div>

          {activeSession && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-foreground font-medium border border-white/10 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export Chat
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-[#121214] border border-white/10 rounded-xl shadow-2xl z-50 p-1 space-y-1">
                  {['pdf', 'docx', 'markdown', 'txt', 'json'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all capitalize"
                    >
                      As {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center neon-indigo animate-float">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-bold text-xl">Enterprise AI Assistant</h3>
                <p className="text-muted-foreground text-sm mt-1">Powered by local Ollama — 100% offline</p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-xl w-full">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setMessage(prompt)}
                    className="glass rounded-xl p-3 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {msg.role === 'assistant' ? (
                  <div className="prose-dark text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.processing_time_ms && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Zap className="w-3 h-3" />{msg.model}
                        </span>
                        <span className="text-xs text-muted-foreground">{msg.processing_time_ms}ms</span>
                        <button onClick={() => speakText(msg.content)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto">
                          <Volume2 className="w-3.5 h-3.5" /> Speak
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copied!') }}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                    )}
                    {msg.sources?.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-indigo-400 cursor-pointer">📚 {msg.sources.length} sources</summary>
                        <div className="mt-1 space-y-1">
                          {msg.sources.map((s: any) => (
                            <div key={s.index} className="text-xs bg-white/5 rounded-lg p-2">
                              <span className="text-indigo-400 font-medium">[{s.index}] {s.metadata?.document_title || 'Document'}</span>
                              <span className="text-muted-foreground ml-2">score: {s.score}</span>
                              <p className="text-muted-foreground mt-0.5 line-clamp-2">{s.text}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}

          {responding && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 space-y-2">
          {/* File Attachment Preview */}
          {attachedFile && (
            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-2 max-w-sm">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs truncate font-medium">{attachedFile.name}</p>
                <p className="text-muted-foreground text-[10px]">{(attachedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => setAttachedFile(null)} className="text-red-400 hover:text-red-300 text-xs px-1">Remove</button>
            </div>
          )}

          <div className="glass rounded-2xl p-2 flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.txt,.md,.png,.jpg,.jpeg,.gif,.mp4,.zip"
            />
            
            <button
              onClick={triggerFileSelect}
              className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
              title="Attach File (Image, Video, PDF, Word, etc.)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              onClick={toggleRecording}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'}`}
              title={isRecording ? 'Listening... click to stop' : 'Start Speech to Text'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={`Ask anything (${mode.toUpperCase()} mode) — Shift+Enter for new line`}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-36 min-h-[44px] py-2 px-2"
              rows={1}
            />
            
            <motion.button
              onClick={handleSend}
              disabled={(!message.trim() && !attachedFile) || responding}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center disabled:opacity-40 flex-shrink-0"
            >
              {responding ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </motion.button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Powered by local Ollama · No data leaves your machine
          </p>
        </div>
      </div>
    </div>
  )
}
