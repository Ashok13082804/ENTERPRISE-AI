import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Code2, Brain, BookOpen, BarChart2, Zap, TrendingUp,
  Loader2, CheckCircle, Award, Terminal, Layers, GitBranch,
  Search, ChevronRight, Copy, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

const TABS = [
  { id: 'overview',  label: 'Overview',      icon: BarChart2 },
  { id: 'tutor',     label: 'AI Tutor',      icon: Brain },
  { id: 'codegen',   label: 'Code Lab',      icon: Code2 },
  { id: 'dsa',       label: 'DSA Explorer',  icon: Layers },
  { id: 'quiz',      label: 'Quiz',          icon: Award },
  { id: 'analytics', label: 'Analytics',     icon: TrendingUp },
]

const SUBJECT_COLORS: Record<string, string> = {
  'Programming Languages': 'from-amber-500 to-orange-600',
  'Data Structures':       'from-blue-500 to-cyan-600',
  'Algorithms':            'from-violet-500 to-purple-600',
  'Operating Systems':     'from-red-500 to-rose-600',
  'Database Systems':      'from-teal-500 to-emerald-600',
  'Computer Networks':     'from-sky-500 to-blue-600',
  'Machine Learning':      'from-fuchsia-500 to-violet-600',
  'Data Science':          'from-emerald-500 to-teal-600',
  'Cybersecurity':         'from-red-600 to-orange-600',
  'Blockchain':            'from-yellow-500 to-amber-600',
  'Cloud & DevOps':        'from-indigo-500 to-blue-600',
  'Web Development':       'from-pink-500 to-rose-600',
  'Software Engineering':  'from-lime-500 to-green-600',
  'Theory of Computation': 'from-slate-500 to-blue-600',
  'Compiler Design':       'from-orange-500 to-amber-600',
  'Discrete Mathematics':  'from-cyan-500 to-teal-600',
  'Competitive Programming': 'from-yellow-600 to-orange-600',
}

const LANG_ICONS: Record<string, string> = {
  python: '🐍', javascript: '🌐', java: '☕', cpp: '⚡', c: '🔧',
  go: '🐹', rust: '🦀', typescript: '🔷', kotlin: '🎯', sql: '🗄️'
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-t-xl border-b border-white/5">
        <span className="text-xs text-muted-foreground font-mono">{LANG_ICONS[language.toLowerCase()] || '💻'} {language}</span>
        <button onClick={copy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 bg-black/30 rounded-b-xl overflow-x-auto text-xs text-emerald-300 font-mono leading-relaxed max-h-96">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function CSVersePage() {
  const [activeTab, setActiveTab] = useState<string>('overview')
  // Tutor
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState('Data Structures')
  const [tutorResult, setTutorResult] = useState<any>(null)
  // Code Lab
  const [codeTask, setCodeTask] = useState('')
  const [codeLang, setCodeLang] = useState('python')
  const [codeResult, setCodeResult] = useState<any>(null)
  const [explainCode, setExplainCode] = useState('')
  const [explainResult, setExplainResult] = useState<any>(null)
  const [codeMode, setCodeMode] = useState<'generate' | 'explain'>('generate')
  // DSA
  const [dsaTopic, setDsaTopic] = useState('binary_tree')
  const [dsaLang, setDsaLang] = useState('python')
  const [dsaResult, setDsaResult] = useState<any>(null)
  // Quiz
  const [quizSubject, setQuizSubject] = useState('algorithms')
  const [quizResult, setQuizResult] = useState<any>(null)

  const { data: stats } = useQuery({ queryKey: ['cs-stats'], queryFn: () => axios.get(`${API}/csverse/stats`).then(r => r.data) })
  const { data: topicsData } = useQuery({ queryKey: ['cs-topics'], queryFn: () => axios.get(`${API}/csverse/topics`).then(r => r.data), enabled: activeTab === 'overview' })
  const { data: langsData } = useQuery({ queryKey: ['cs-langs'], queryFn: () => axios.get(`${API}/csverse/languages`).then(r => r.data), enabled: activeTab === 'overview' })
  const { data: analyticsData } = useQuery({ queryKey: ['cs-analytics'], queryFn: () => axios.get(`${API}/csverse/analytics`).then(r => r.data), enabled: activeTab === 'analytics' })

  const tutorMutation = useMutation({
    mutationFn: () => axios.post(`${API}/csverse/solve`, { question, subject, level: 'undergraduate' }).then(r => r.data),
    onSuccess: d => { setTutorResult(d); toast.success('Answer ready! ✓') },
    onError: () => toast.error('AI Tutor error'),
  })

  const codeGenMutation = useMutation({
    mutationFn: () => axios.post(`${API}/csverse/code/generate`, { task: codeTask, language: codeLang, include_comments: true, include_complexity: true }).then(r => r.data),
    onSuccess: d => { setCodeResult(d); toast.success('Code generated!') },
    onError: () => toast.error('Code generation error'),
  })

  const codeExplainMutation = useMutation({
    mutationFn: () => axios.post(`${API}/csverse/code/explain`, { code: explainCode, language: codeLang, explain_complexity: true }).then(r => r.data),
    onSuccess: d => { setExplainResult(d); toast.success('Code explained!') },
    onError: () => toast.error('Explanation error'),
  })

  const dsaMutation = useMutation({
    mutationFn: () => axios.post(`${API}/csverse/dsa/explain`, { topic: dsaTopic, language: dsaLang }).then(r => r.data),
    onSuccess: d => { setDsaResult(d); toast.success('DSA loaded!') },
    onError: () => toast.error('DSA error'),
  })

  const quizMutation = useMutation({
    mutationFn: () => axios.post(`${API}/csverse/quiz/generate`, { subject: quizSubject, difficulty: 'medium', num_questions: 5 }).then(r => r.data),
    onSuccess: d => { setQuizResult(d); toast.success('Quiz generated!') },
    onError: () => toast.error('Quiz error'),
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Code2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">CSVerse AI</h1>
          <p className="text-sm text-muted-foreground">Offline AI-Powered Computer Science Learning, Coding & Research Platform</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="badge badge-info text-xs px-2 py-1">CodeLlama</span>
          <span className="badge badge-success text-xs px-2 py-1">Offline</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Questions Answered', value: stats?.total_questions_answered?.toLocaleString(), icon: Brain, color: 'from-amber-500 to-orange-600' },
              { label: 'Code Generated', value: stats?.code_generated?.toLocaleString(), icon: Code2, color: 'from-blue-500 to-cyan-600' },
              { label: 'Languages', value: stats?.languages_supported, icon: Terminal, color: 'from-violet-500 to-purple-600' },
              { label: 'Accuracy', value: `${stats?.accuracy_rate}%`, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-white/5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{s.value ?? '—'}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Terminal className="w-4 h-4 text-amber-400" /> Supported Languages</h3>
            <div className="flex flex-wrap gap-2">
              {(langsData?.languages || []).map((lang: any) => (
                <motion.div key={lang.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl px-3 py-2 border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all group">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">{lang.name}</div>
                      <div className="text-[10px] text-muted-foreground">{lang.use}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-amber-400" /> CS Subjects</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(topicsData?.subjects || {}).map(([sub, topics]: any) => (
                <motion.div key={sub} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-4 border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all group">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${SUBJECT_COLORS[sub] || 'from-amber-500 to-orange-600'} flex items-center justify-center mb-2`}>
                    <Code2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">{sub}</div>
                  <div className="text-xs text-muted-foreground mt-1">{(topics as string[]).length} topics</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI TUTOR ──────────────────────────────────────── */}
      {activeTab === 'tutor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-400" /> AI CS Tutor
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50">
                {Object.keys(SUBJECT_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Question</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={5}
                placeholder="Ask any CS question...&#10;Example: Explain time complexity of QuickSort&#10;Example: What is a deadlock in OS?&#10;Example: How does HTTPS work?"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none" />
            </div>
            <button onClick={() => tutorMutation.mutate()} disabled={!question || tutorMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {tutorMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Ask AI Tutor
            </button>
            <div className="flex flex-wrap gap-2">
              {['Explain Big-O notation', 'What is TCP vs UDP?', 'How does SQL indexing work?', 'Explain Git branching'].map(ex => (
                <button key={ex} onClick={() => setQuestion(ex)}
                  className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors">
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {tutorResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Answer</h3>
                <span className="text-xs text-amber-400 font-bold">{(tutorResult.answer?.confidence_score * 100).toFixed(1)}% confidence</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="text-sm text-white">{tutorResult.answer?.summary}</div>
              </div>

              {tutorResult.explanation?.key_points && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Key Points</div>
                  <div className="space-y-2">
                    {tutorResult.explanation.key_points.map((pt: string, i: number) => (
                      <div key={i} className="flex gap-2 items-start">
                        <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-foreground">{pt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tutorResult.explanation?.example && (
                <div className="p-3 bg-white/3 rounded-xl">
                  <div className="text-xs text-amber-400 mb-1">Example</div>
                  <div className="text-sm text-foreground">{tutorResult.explanation.example}</div>
                </div>
              )}

              {tutorResult.interview_tips?.length > 0 && (
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                  <div className="text-xs text-amber-400 font-medium mb-2">🎯 Interview Tips</div>
                  {tutorResult.interview_tips.map((tip: string, i: number) => (
                    <div key={i} className="text-xs text-muted-foreground py-0.5">• {tip}</div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {tutorResult.rag_sources?.map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md">{s}</span>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Brain className="w-16 h-16 text-amber-400/30" />
              <div className="text-white font-medium">AI CS Tutor</div>
              <div className="text-sm text-muted-foreground max-w-xs">Ask any CS question across 17 subjects — from DSA to AI/ML, Networks to Blockchain</div>
            </div>
          )}
        </div>
      )}

      {/* ── CODE LAB ──────────────────────────────────────── */}
      {activeTab === 'codegen' && (
        <div className="space-y-4">
          {/* Mode selector */}
          <div className="flex gap-2">
            {(['generate', 'explain'] as const).map(mode => (
              <button key={mode} onClick={() => setCodeMode(mode)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${codeMode === mode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'glass text-muted-foreground border border-white/5'}`}>
                {mode === 'generate' ? '⚡ Generate Code' : '🔍 Explain Code'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" /> {codeMode === 'generate' ? 'Code Generator' : 'Code Explainer'}
              </h3>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Language</label>
                <select value={codeLang} onChange={e => setCodeLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50">
                  {['python', 'java', 'cpp', 'javascript', 'c', 'go', 'rust', 'typescript', 'sql', 'kotlin'].map(l => (
                    <option key={l} value={l}>{LANG_ICONS[l]} {l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </div>
              {codeMode === 'generate' ? (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Task Description</label>
                    <textarea value={codeTask} onChange={e => setCodeTask(e.target.value)} rows={4}
                      placeholder="Describe what code to generate...&#10;Example: binary search algorithm&#10;Example: linked list with insert and delete&#10;Example: fibonacci using dynamic programming"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['binary search', 'linked list', 'merge sort', 'fibonacci dp', 'binary tree'].map(ex => (
                      <button key={ex} onClick={() => setCodeTask(ex)}
                        className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors">
                        {ex}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => codeGenMutation.mutate()} disabled={!codeTask || codeGenMutation.isPending}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                    {codeGenMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />}
                    Generate Code
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Paste Code</label>
                    <textarea value={explainCode} onChange={e => setExplainCode(e.target.value)} rows={8}
                      placeholder="Paste your code here to get an AI explanation..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none" />
                  </div>
                  <button onClick={() => codeExplainMutation.mutate()} disabled={!explainCode || codeExplainMutation.isPending}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                    {codeExplainMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Explain Code
                  </button>
                </>
              )}
            </div>

            {/* Results */}
            {codeMode === 'generate' && codeResult ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <CodeBlock code={codeResult.code} language={codeResult.language} />
                {codeResult.complexity && (
                  <div className="glass rounded-2xl p-4 border border-white/5 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/3 rounded-xl text-center">
                      <div className="text-sm font-bold text-amber-400">{codeResult.complexity.time}</div>
                      <div className="text-xs text-muted-foreground">Time Complexity</div>
                    </div>
                    <div className="p-3 bg-white/3 rounded-xl text-center">
                      <div className="text-sm font-bold text-blue-400">{codeResult.complexity.space}</div>
                      <div className="text-xs text-muted-foreground">Space Complexity</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : codeMode === 'explain' && explainResult ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[550px]">
                <h3 className="text-base font-semibold text-white">Code Explanation</h3>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div className="text-sm text-foreground">{explainResult.explanation?.overview}</div>
                </div>
                {explainResult.explanation?.line_by_line && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Line-by-Line</div>
                    <div className="space-y-2">
                      {explainResult.explanation.line_by_line.map((l: any, i: number) => (
                        <div key={i} className="flex gap-3 p-2 bg-white/3 rounded-lg">
                          <span className="text-xs text-amber-400 font-mono w-16 flex-shrink-0">Lines {l.lines}</span>
                          <span className="text-xs text-foreground">{l.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {explainResult.complexity && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/3 rounded-xl text-center">
                      <div className="text-sm font-bold text-amber-400">{explainResult.complexity.time}</div>
                      <div className="text-xs text-muted-foreground">Time</div>
                    </div>
                    <div className="p-3 bg-white/3 rounded-xl text-center">
                      <div className="text-sm font-bold text-blue-400">{explainResult.complexity.space}</div>
                      <div className="text-xs text-muted-foreground">Space</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
                <Terminal className="w-16 h-16 text-amber-400/30" />
                <div className="text-white font-medium">{codeMode === 'generate' ? 'Code Generator' : 'Code Explainer'}</div>
                <div className="text-sm text-muted-foreground max-w-xs">Powered by Ollama + CodeLlama / DeepSeek-Coder running fully offline</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DSA EXPLORER ──────────────────────────────────── */}
      {activeTab === 'dsa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" /> DSA Explorer
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Topic</label>
                <select value={dsaTopic} onChange={e => setDsaTopic(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50">
                  {['arrays', 'binary_tree', 'linked_list', 'graph', 'heap', 'hash_table', 'trie'].map(t => (
                    <option key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Language</label>
                <select value={dsaLang} onChange={e => setDsaLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50">
                  {['python', 'java', 'cpp', 'javascript'].map(l => (
                    <option key={l} value={l} className="capitalize">{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={() => dsaMutation.mutate()} disabled={dsaMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {dsaMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              Explore Topic
            </button>

            {/* DSA topic quick tiles */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['arrays', 'binary_tree', 'linked_list', 'graph', 'heap', 'hash_table'].map(t => (
                <button key={t} onClick={() => setDsaTopic(t)}
                  className={`p-2 rounded-xl text-xs font-medium transition-all capitalize ${dsaTopic === t ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'glass text-muted-foreground border border-white/5 hover:text-foreground'}`}>
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {dsaResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 overflow-y-auto max-h-[600px]">
              <div className="glass rounded-2xl p-5 border border-white/5">
                <div className="text-base font-semibold text-white capitalize mb-1">{dsaResult.topic?.replace(/_/g, ' ')}</div>
                <div className="text-sm text-muted-foreground">{dsaResult.description}</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(dsaResult.time_complexity || {}).map(([op, tc]: any) => (
                    <div key={op} className="p-2 bg-white/3 rounded-lg flex justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{op}</span>
                      <span className="text-amber-400 font-mono">{tc}</span>
                    </div>
                  ))}
                </div>
                {dsaResult.space && (
                  <div className="mt-2 p-2 bg-white/3 rounded-lg flex justify-between text-xs">
                    <span className="text-muted-foreground">Space</span>
                    <span className="text-blue-400 font-mono">{dsaResult.space}</span>
                  </div>
                )}
              </div>
              {dsaResult.code_example && (
                <CodeBlock code={dsaResult.code_example} language={dsaLang} />
              )}
              {dsaResult.interview_questions && (
                <div className="glass rounded-2xl p-4 border border-white/5">
                  <div className="text-xs text-muted-foreground mb-2">Interview Questions</div>
                  {dsaResult.interview_questions.map((q: string, i: number) => (
                    <div key={i} className="text-xs text-foreground py-1 flex gap-2">
                      <span className="text-amber-400">Q{i + 1}.</span>{q}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <GitBranch className="w-16 h-16 text-amber-400/30" />
              <div className="text-white font-medium">DSA Explorer</div>
              <div className="text-sm text-muted-foreground max-w-xs">Get detailed explanations, code implementations, complexity analysis and interview questions for any data structure</div>
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ ──────────────────────────────────────────── */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> CS Quiz / Mock Interview
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
              <select value={quizSubject} onChange={e => setQuizSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50">
                {['algorithms', 'databases', 'networks', 'python', 'operating_systems', 'machine_learning', 'cybersecurity'].map(s => (
                  <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                ))}
              </select>
            </div>
            <button onClick={() => quizMutation.mutate()} disabled={quizMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {quizMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              Generate Quiz
            </button>
          </div>

          {quizResult ? (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white capitalize">{quizResult.subject?.replace(/_/g, ' ')} Quiz</div>
                  <div className="text-xs text-muted-foreground">{quizResult.total_questions} questions · {quizResult.time_limit_minutes} min</div>
                </div>
                {quizResult.interview_mode && <span className="badge badge-warning text-xs">Interview Mode</span>}
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[450px]">
                {quizResult.questions?.map((q: any, i: number) => (
                  <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-amber-400 font-medium">Q{i + 1}</div>
                    <div className="text-sm text-white font-medium">{q.q}</div>
                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt: string, j: number) => (
                          <div key={j} className={`text-xs px-3 py-2 rounded-lg ${opt === q.answer ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/3 text-muted-foreground'}`}>
                            {String.fromCharCode(65 + j)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-orange-400 pt-1">💡 {q.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Award className="w-16 h-16 text-amber-400/30" />
              <div className="text-white font-medium">CS Quiz Generator</div>
              <div className="text-sm text-muted-foreground">Practice MCQs, interview questions from GATE, LeetCode patterns, and university textbooks</div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS ─────────────────────────────────────── */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Subject Popularity</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.subject_popularity || {}).map(([sub, pct]: any) => (
                <div key={sub} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground truncate">{sub}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{pct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Code by Language</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.code_generation_by_language || {}).map(([lang, pct]: any) => (
                <div key={lang} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground">{lang}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{pct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Accuracy by Subject</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.avg_accuracy_by_subject || {}).map(([sub, acc]: any) => (
                <div key={sub} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground truncate">{sub}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className={`h-2 rounded-full ${acc >= 90 ? 'bg-emerald-500' : acc >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${acc}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{acc}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Platform Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Questions Answered', value: stats?.total_questions_answered?.toLocaleString(), color: 'text-amber-400' },
                { label: 'Code Generated', value: stats?.code_generated?.toLocaleString(), color: 'text-blue-400' },
                { label: 'Quiz Completion', value: `${analyticsData.quiz_completion_rate}%`, color: 'text-emerald-400' },
                { label: 'Accuracy', value: `${stats?.accuracy_rate}%`, color: 'text-violet-400' },
              ].map(s => (
                <div key={s.label} className="p-3 bg-white/3 rounded-xl text-center">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value ?? '—'}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
