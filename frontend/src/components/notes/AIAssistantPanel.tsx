import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, X, Loader2, Copy, Check, ChevronDown,
  Sparkles, FileText, AlignLeft, HelpCircle, List,
  Zap, Languages, BookOpen, Target, MessageSquare
} from 'lucide-react'
import { notesAiApi } from '@/api/client'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'

interface AIAssistantPanelProps {
  noteId?: number
  content: string
  title?: string
  model: string
  onApply?: (text: string) => void
  onClose: () => void
}

const AI_TOOLS = [
  {
    category: 'Writing',
    icon: Sparkles,
    color: 'text-purple-400',
    tools: [
      { id: 'summarize_concise', label: 'Summarize (Concise)', fn: 'summarize', mode: 'concise' },
      { id: 'summarize_bullet', label: 'Summarize (Bullets)', fn: 'summarize', mode: 'bullet' },
      { id: 'improve', label: 'Improve Writing', fn: 'improve', mode: 'improve' },
      { id: 'fix_grammar', label: 'Fix Grammar', fn: 'improve', mode: 'fix_grammar' },
      { id: 'make_formal', label: 'Make Formal', fn: 'improve', mode: 'formal' },
      { id: 'make_casual', label: 'Make Casual', fn: 'improve', mode: 'casual' },
      { id: 'make_shorter', label: 'Make Shorter', fn: 'improve', mode: 'shorter' },
      { id: 'expand', label: 'Expand Content', fn: 'improve', mode: 'expand' },
      { id: 'simplify', label: 'Simplify', fn: 'improve', mode: 'simplify' },
      { id: 'bullets', label: 'Convert to Bullets', fn: 'improve', mode: 'bullets' },
    ]
  },
  {
    category: 'Study',
    icon: BookOpen,
    color: 'text-cyan-400',
    tools: [
      { id: 'flashcards', label: 'Generate Flashcards', fn: 'flashcards', mode: null },
      { id: 'quiz', label: 'Generate Quiz (MCQ)', fn: 'quiz', mode: null },
      { id: 'interview', label: 'Interview Questions', fn: 'interview', mode: null },
      { id: 'todo', label: 'Extract To-Dos', fn: 'todo', mode: null },
      { id: 'keywords', label: 'Extract Keywords', fn: 'keywords', mode: null },
    ]
  },
  {
    category: 'Analysis',
    icon: Target,
    color: 'text-emerald-400',
    tools: [
      { id: 'sentiment', label: 'Sentiment Analysis', fn: 'sentiment', mode: null },
      { id: 'mindmap', label: 'Generate Mind Map', fn: 'mindmap', mode: null },
      { id: 'auto_tags', label: 'Auto-Generate Tags', fn: 'tags', mode: null },
    ]
  },
]

const GENERATE_TYPES = [
  { value: 'note', label: '📝 Note' },
  { value: 'blog', label: '✍️ Blog Post' },
  { value: 'essay', label: '📄 Essay' },
  { value: 'email', label: '📧 Email' },
  { value: 'report', label: '📊 Report' },
  { value: 'meeting', label: '🤝 Meeting Notes' },
  { value: 'documentation', label: '📚 Documentation' },
  { value: 'todo', label: '✅ To-Do List' },
  { value: 'flashcards', label: '🎴 Flashcards' },
  { value: 'study_notes', label: '🎓 Study Notes' },
  { value: 'readme', label: '📋 README' },
  { value: 'linkedin', label: '💼 LinkedIn Post' },
]

type ResultType = string | object | any[]

export default function AIAssistantPanel({
  noteId, content, title = '', model, onApply, onClose
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'generate' | 'ask'>('tools')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultType | null>(null)
  const [resultType, setResultType] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [generatePrompt, setGeneratePrompt] = useState('')
  const [generateType, setGenerateType] = useState('note')
  const [question, setQuestion] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string>('Writing')

  const runTool = async (tool: { id: string; label: string; fn: string; mode: string | null }) => {
    if (!content.trim() && tool.fn !== 'generate') {
      toast.error('Note content is empty')
      return
    }
    setLoading(true)
    setResult(null)
    setResultType(tool.id)
    try {
      const payload = { content, title, note_id: noteId, model, mode: tool.mode, count: 10 }
      let res
      switch (tool.fn) {
        case 'summarize': res = await notesAiApi.summarize(payload); break
        case 'improve':   res = await notesAiApi.improve(payload); break
        case 'flashcards':res = await notesAiApi.flashcards(payload); break
        case 'quiz':      res = await notesAiApi.quiz(payload); break
        case 'todo':      res = await notesAiApi.todo(payload); break
        case 'keywords':  res = await notesAiApi.keywords(payload); break
        case 'sentiment': res = await notesAiApi.sentiment(payload); break
        case 'mindmap':   res = await notesAiApi.mindmap(payload); break
        case 'tags':      res = await notesAiApi.generateTags(payload); break
        case 'interview': res = await notesAiApi.interviewQuestions(payload); break
        default:          res = await notesAiApi.analyze(payload)
      }
      setResult(res.data)
    } catch {
      toast.error('AI request failed. Make sure Ollama is running.')
    } finally {
      setLoading(false)
    }
  }

  const runGenerate = async () => {
    if (!generatePrompt.trim()) { toast.error('Enter a prompt'); return }
    setLoading(true)
    setResult(null)
    setResultType('generate')
    try {
      const res = await notesAiApi.generate({ prompt: generatePrompt, note_type: generateType, model })
      setResult(res.data)
    } catch { toast.error('Generation failed. Make sure Ollama is running.') }
    finally { setLoading(false) }
  }

  const runAsk = async () => {
    if (!question.trim()) { toast.error('Enter a question'); return }
    setLoading(true)
    setResult(null)
    setResultType('answer')
    try {
      const res = await notesAiApi.answer({ content, note_id: noteId, model, prompt: question })
      setResult(res.data)
    } catch { toast.error('Q&A failed. Make sure Ollama is running.') }
    finally { setLoading(false) }
  }

  const copyResult = () => {
    const text = getResultText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const applyResult = () => {
    const text = getResultText()
    onApply?.(text)
    toast.success('Applied to note!')
  }

  const getResultText = (): string => {
    if (!result) return ''
    if (typeof result === 'string') return result
    if (result && typeof result === 'object' && 'result' in result) return String((result as any).result)
    if (result && typeof result === 'object' && 'answer' in result) return String((result as any).answer)
    return JSON.stringify(result, null, 2)
  }

  const renderResult = () => {
    if (!result) return null
    const r = result as any

    // Flashcards
    if (resultType === 'flashcards' && r.flashcards) {
      return (
        <div className="space-y-2">
          {r.flashcards.map((card: any, i: number) => (
            <div key={i} className="glass rounded-xl p-3 border border-white/10">
              <p className="text-xs font-semibold text-indigo-400 mb-1">Q: {card.question}</p>
              <p className="text-xs text-muted-foreground">A: {card.answer}</p>
            </div>
          ))}
        </div>
      )
    }

    // Quiz
    if (resultType === 'quiz' && r.quiz) {
      return (
        <div className="space-y-3">
          {r.quiz.map((q: any, i: number) => (
            <div key={i} className="glass rounded-xl p-3 border border-white/10">
              <p className="text-xs font-semibold text-white mb-2">{i+1}. {q.question}</p>
              {q.options?.map((opt: string, j: number) => (
                <p key={j} className={`text-xs px-2 py-1 rounded mb-1 ${opt.startsWith(q.answer) ? 'bg-emerald-500/20 text-emerald-300' : 'text-muted-foreground'}`}>{opt}</p>
              ))}
              {q.explanation && <p className="text-[10px] text-muted-foreground mt-2 italic">💡 {q.explanation}</p>}
            </div>
          ))}
        </div>
      )
    }

    // Todo
    if (resultType === 'todo' && r.todos) {
      return (
        <div className="space-y-1.5">
          {r.todos.map((todo: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs text-foreground">
              <span className="text-emerald-400 mt-0.5">☐</span> {todo}
            </div>
          ))}
        </div>
      )
    }

    // Tags
    if (resultType === 'auto_tags' && r.tags) {
      return (
        <div className="flex flex-wrap gap-2">
          {r.tags.map((tag: string, i: number) => (
            <span key={i} className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/30">#{tag}</span>
          ))}
        </div>
      )
    }

    // Keywords
    if (resultType === 'keywords' && r.keywords) {
      return (
        <div className="flex flex-wrap gap-2">
          {r.keywords.map((kw: string, i: number) => (
            <span key={i} className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs">{kw}</span>
          ))}
        </div>
      )
    }

    // Sentiment
    if (resultType === 'sentiment') {
      const sentimentColor = r.sentiment === 'positive' ? 'text-emerald-400' : r.sentiment === 'negative' ? 'text-red-400' : 'text-amber-400'
      return (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Sentiment:</span>
            <span className={`font-semibold capitalize ${sentimentColor}`}>{r.sentiment}</span>
          </div>
          {r.score !== undefined && <div className="flex items-center gap-2"><span className="text-muted-foreground text-xs">Score:</span><span className="text-white text-xs">{(r.score * 100).toFixed(0)}%</span></div>}
          {r.tone && <div className="flex items-center gap-2"><span className="text-muted-foreground text-xs">Tone:</span><span className="text-white text-xs capitalize">{r.tone}</span></div>}
          {r.emotions?.length > 0 && <div className="flex flex-wrap gap-1">{r.emotions.map((e: string, i: number) => <span key={i} className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{e}</span>)}</div>}
          {r.summary && <p className="text-xs text-muted-foreground italic">{r.summary}</p>}
        </div>
      )
    }

    // Mind map
    if (resultType === 'mindmap' && r.central_topic) {
      return (
        <div className="space-y-2 text-xs">
          <div className="text-center font-bold text-indigo-400 py-2 glass rounded-lg">{r.central_topic}</div>
          {r.branches?.map((branch: any, i: number) => (
            <div key={i} className="glass rounded-lg p-2 border border-white/5">
              <p className="font-semibold text-purple-300 mb-1">● {branch.topic}</p>
              {branch.subtopics?.map((sub: string, j: number) => (
                <p key={j} className="text-muted-foreground ml-3">  ↳ {sub}</p>
              ))}
            </div>
          ))}
        </div>
      )
    }

    // Text result (summarize, improve, generate, answer)
    const text = getResultText()
    return (
      <div className="prose-dark text-xs leading-relaxed">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    )
  }

  const canApply = result && ['summarize_concise', 'summarize_bullet', 'improve', 'fix_grammar', 'make_formal', 'make_casual', 'make_shorter', 'expand', 'simplify', 'bullets', 'generate'].includes(resultType)

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed right-0 top-0 h-full w-96 glass border-l border-white/10 z-50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center neon-purple">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Assistant</h3>
            <p className="text-[10px] text-muted-foreground">{model} · Offline</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { key: 'tools', label: 'Tools', icon: Zap },
          { key: 'generate', label: 'Generate', icon: Sparkles },
          { key: 'ask', label: 'Ask', icon: MessageSquare },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-3">
            {AI_TOOLS.map(category => (
              <div key={category.category} className="glass rounded-xl border border-white/5">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.category ? '' : category.category)}
                  className="w-full flex items-center justify-between px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <category.icon className={`w-3.5 h-3.5 ${category.color}`} />
                    <span className="text-xs font-semibold text-foreground">{category.category}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedCategory === category.category ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === category.category && (
                  <div className="px-2 pb-2 space-y-1">
                    {category.tools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => runTool(tool)}
                        disabled={loading}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                      >
                        {tool.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-3">
            <select
              value={generateType}
              onChange={e => setGenerateType(e.target.value)}
              className="enterprise-input text-xs"
            >
              {GENERATE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <textarea
              value={generatePrompt}
              onChange={e => setGeneratePrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              rows={4}
              className="enterprise-input text-xs resize-none"
            />
            <button
              onClick={runGenerate}
              disabled={loading || !generatePrompt.trim()}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate
            </button>
          </div>
        )}

        {/* Ask Tab */}
        {activeTab === 'ask' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Ask any question based on your note content.</p>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="What does this note say about...?"
              rows={3}
              className="enterprise-input text-xs resize-none"
            />
            <button
              onClick={runAsk}
              disabled={loading || !question.trim()}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HelpCircle className="w-3.5 h-3.5" />}
              Ask AI
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
              <Brain className="w-5 h-5 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xs text-muted-foreground">AI is thinking...</p>
          </div>
        )}

        {/* Result */}
        {!loading && result && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl border border-white/10 p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Result</span>
                <div className="flex items-center gap-2">
                  {canApply && onApply && (
                    <button onClick={applyResult} className="text-[10px] flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
                      <Check className="w-3 h-3" /> Apply
                    </button>
                  )}
                  <button onClick={copyResult} className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {renderResult()}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
