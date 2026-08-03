import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Calculator, Brain, BookOpen, BarChart2, Search, TrendingUp,
  Loader2, ChevronRight, Sigma, Infinity, FlaskConical, Award,
  Zap, CheckCircle, AlertCircle, Download, LineChart
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

const TABS = [
  { id: 'overview',   label: 'Overview',        icon: BarChart2 },
  { id: 'solver',     label: 'AI Solver',        icon: Sigma },
  { id: 'graph',      label: 'Graph Plotter',    icon: LineChart },
  { id: 'formulas',   label: 'Formula Explorer', icon: BookOpen },
  { id: 'quiz',       label: 'Quiz',             icon: Brain },
  { id: 'analytics',  label: 'Analytics',        icon: TrendingUp },
]

const TOPIC_COLORS: Record<string, string> = {
  'Arithmetic':            'from-blue-500 to-cyan-600',
  'Algebra':               'from-violet-500 to-purple-600',
  'Geometry':              'from-pink-500 to-rose-600',
  'Trigonometry':          'from-amber-500 to-orange-600',
  'Calculus':              'from-emerald-500 to-teal-600',
  'Linear Algebra':        'from-indigo-500 to-blue-600',
  'Probability & Statistics': 'from-red-500 to-pink-600',
  'Discrete Mathematics':  'from-lime-500 to-green-600',
  'Number Theory':         'from-sky-500 to-blue-600',
  'Complex Analysis':      'from-fuchsia-500 to-violet-600',
  'Differential Equations':'from-cyan-500 to-teal-600',
  'Optimization':          'from-orange-500 to-amber-600',
  'Competitive Math':      'from-yellow-500 to-amber-600',
}

export default function MathVersePage() {
  const [activeTab, setActiveTab] = useState<string>('overview')
  // Solver
  const [problem, setProblem] = useState('')
  const [topic, setTopic] = useState('Calculus')
  const [solveResult, setSolveResult] = useState<any>(null)
  // Graph
  const [expr, setExpr] = useState('x**2 - 4')
  const [graphData, setGraphData] = useState<any>(null)
  // Formula search
  const [formulaQuery, setFormulaQuery] = useState('')
  const [formulaResults, setFormulaResults] = useState<any[]>([])
  // Quiz
  const [quizTopic, setQuizTopic] = useState('Calculus')
  const [quizResult, setQuizResult] = useState<any>(null)

  const { data: stats } = useQuery({
    queryKey: ['math-stats'],
    queryFn: () => axios.get(`${API}/math/stats`).then(r => r.data),
  })

  const { data: topicsData } = useQuery({
    queryKey: ['math-topics'],
    queryFn: () => axios.get(`${API}/math/topics`).then(r => r.data),
    enabled: activeTab === 'overview',
  })

  const { data: analyticsData } = useQuery({
    queryKey: ['math-analytics'],
    queryFn: () => axios.get(`${API}/math/analytics`).then(r => r.data),
    enabled: activeTab === 'analytics',
  })

  const solveMutation = useMutation({
    mutationFn: () => axios.post(`${API}/math/solve`, { problem, topic, show_steps: true }).then(r => r.data),
    onSuccess: d => { setSolveResult(d); toast.success('Problem solved! ✓') },
    onError: () => toast.error('Solver error'),
  })

  const graphMutation = useMutation({
    mutationFn: () => axios.post(`${API}/math/graph`, { expression: expr, x_min: -10, x_max: 10, points: 200 }).then(r => r.data),
    onSuccess: d => { setGraphData(d); toast.success('Graph plotted!') },
    onError: () => toast.error('Graph error'),
  })

  const formulaMutation = useMutation({
    mutationFn: () => axios.post(`${API}/math/formula/search`, { query: formulaQuery }).then(r => r.data),
    onSuccess: d => setFormulaResults(d.formulas || []),
    onError: () => toast.error('Search error'),
  })

  const quizMutation = useMutation({
    mutationFn: () => axios.post(`${API}/math/quiz/generate`, { topic: quizTopic, difficulty: 'medium', num_questions: 5 }).then(r => r.data),
    onSuccess: d => { setQuizResult(d); toast.success('Quiz generated!') },
    onError: () => toast.error('Quiz error'),
  })

  // Simple SVG graph renderer
  const renderGraph = () => {
    if (!graphData?.data) return null
    const { x, y } = graphData.data
    const validPoints = x.map((xi: number, i: number) => ({ x: xi, y: y[i] })).filter((p: any) => p.y !== null && isFinite(p.y))
    if (validPoints.length < 2) return <p className="text-muted-foreground text-sm text-center">No valid points to plot</p>

    const W = 560, H = 260, pad = 40
    const xs = validPoints.map((p: any) => p.x)
    const ys = validPoints.map((p: any) => p.y)
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const rangeY = maxY - minY || 1

    const toSvgX = (v: number) => pad + ((v - minX) / (maxX - minX)) * (W - 2 * pad)
    const toSvgY = (v: number) => H - pad - ((v - minY) / rangeY) * (H - 2 * pad)

    const pathD = validPoints.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(2)} ${toSvgY(p.y).toFixed(2)}`).join(' ')
    const zeroY = toSvgY(0)
    const zeroX = toSvgX(0)

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {/* Axes */}
        {zeroY >= pad && zeroY <= H - pad && <line x1={pad} y1={zeroY} x2={W - pad} y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />}
        {zeroX >= pad && zeroX <= W - pad && <line x1={zeroX} y1={pad} x2={zeroX} y2={H - pad} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />}
        {/* Grid */}
        {[0.25, 0.5, 0.75].map(t => (
          <g key={t}>
            <line x1={pad + t * (W - 2 * pad)} y1={pad} x2={pad + t * (W - 2 * pad)} y2={H - pad} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4" />
            <line x1={pad} y1={pad + t * (H - 2 * pad)} x2={W - pad} y2={pad + t * (H - 2 * pad)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4" />
          </g>
        ))}
        {/* Curve */}
        <path d={pathD} fill="none" stroke="url(#mathGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Labels */}
        <text x={pad} y={H - 8} fill="rgba(255,255,255,0.4)" fontSize="10">{minX.toFixed(1)}</text>
        <text x={W - pad - 20} y={H - 8} fill="rgba(255,255,255,0.4)" fontSize="10">{maxX.toFixed(1)}</text>
        <text x={4} y={pad + 4} fill="rgba(255,255,255,0.4)" fontSize="10">{maxY.toFixed(1)}</text>
        <text x={4} y={H - pad} fill="rgba(255,255,255,0.4)" fontSize="10">{minY.toFixed(1)}</text>
        <defs>
          <linearGradient id="mathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Sigma className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">MathVerse AI</h1>
          <p className="text-sm text-muted-foreground">Offline AI-Powered Mathematics Learning, Solving & Teaching Platform</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="badge badge-info text-xs px-2 py-1">SymPy Verified</span>
          <span className="badge badge-success text-xs px-2 py-1">Offline</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-violet-500/20 text-violet-400' : 'text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Problems Solved', value: stats?.total_problems_solved?.toLocaleString(), icon: Sigma, color: 'from-violet-500 to-indigo-600' },
              { label: 'Topics Covered', value: stats?.topics_covered, icon: BookOpen, color: 'from-blue-500 to-cyan-600' },
              { label: 'Accuracy Rate', value: `${stats?.accuracy_rate}%`, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
              { label: 'Formulas', value: stats?.formulas_in_library, icon: Infinity, color: 'from-amber-500 to-orange-600' },
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'SymPy Verified', value: stats?.sympy_verified_solutions?.toLocaleString(), color: 'text-violet-400' },
              { label: 'Quizzes Generated', value: stats?.quizzes_generated?.toLocaleString(), color: 'text-blue-400' },
              { label: 'Avg Response', value: `${stats?.avg_response_ms}ms`, color: 'text-emerald-400' },
              { label: 'RAG Docs', value: stats?.rag_documents?.toLocaleString(), color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-4 border border-white/5 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value ?? '—'}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Topics Grid */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-violet-400" /> Mathematics Topics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(topicsData?.topics || {}).map(([branch, subtopics]: any) => (
                <motion.div key={branch} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-4 border border-white/5 hover:border-violet-500/30 cursor-pointer transition-all group">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${TOPIC_COLORS[branch] || 'from-violet-500 to-indigo-600'} flex items-center justify-center mb-2`}>
                    <Sigma className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">{branch}</div>
                  <div className="text-xs text-muted-foreground mt-1">{(subtopics as string[]).length} topics</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(subtopics as string[]).slice(0, 2).map((t: string) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded-md">{t}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI SOLVER ─────────────────────────────────────── */}
      {activeTab === 'solver' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sigma className="w-5 h-5 text-violet-400" /> AI Math Solver
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Topic</label>
              <select value={topic} onChange={e => setTopic(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50">
                {['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Linear Algebra', 'Probability & Statistics', 'Discrete Mathematics', 'Number Theory', 'Optimization'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Problem / Equation</label>
              <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={5}
                placeholder="Type your math problem here...&#10;Example: Solve x² - 5x + 6 = 0&#10;Example: Find ∫x²dx&#10;Example: Differentiate sin(x)·cos(x)"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50 resize-none font-mono" />
            </div>
            <button onClick={() => solveMutation.mutate()} disabled={!problem || solveMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity">
              {solveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Solve with AI + SymPy
            </button>
            <div className="flex gap-2">
              {['Solve x²-5x+6=0', '∫sin(x)dx', 'd/dx(x³)', 'lim x→0 sin(x)/x'].map(ex => (
                <button key={ex} onClick={() => setProblem(ex)}
                  className="text-xs px-2 py-1 bg-violet-500/10 text-violet-400 rounded-lg hover:bg-violet-500/20 transition-colors truncate">
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {solveResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Solution</h3>
                <div className="flex items-center gap-2">
                  {solveResult.solution?.verified_by_sympy && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3 h-3" /> SymPy Verified</span>
                  )}
                  <span className="text-xs text-muted-foreground">Confidence: <span className="text-violet-400 font-bold">{(solveResult.solution?.confidence_score * 100).toFixed(1)}%</span></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                <div className="text-xs text-muted-foreground mb-1">Answer</div>
                <div className="text-lg font-bold text-white font-mono">{solveResult.solution?.answer}</div>
                <div className="text-sm text-violet-300 mt-1">{solveResult.solution?.symbolic_result}</div>
              </div>

              {solveResult.steps?.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Step-by-Step Solution</div>
                  <div className="space-y-2">
                    {solveResult.steps.map((step: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                        <div className="text-sm text-foreground">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {solveResult.explanation?.common_mistakes && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div className="text-xs text-amber-400 font-medium mb-1">⚠ Common Mistakes</div>
                  {solveResult.explanation.common_mistakes.map((m: string, i: number) => (
                    <div key={i} className="text-xs text-muted-foreground">• {m}</div>
                  ))}
                </div>
              )}

              <div className="p-3 bg-white/3 rounded-xl">
                <div className="text-xs text-muted-foreground mb-1">Sources</div>
                <div className="flex flex-wrap gap-1">
                  {solveResult.rag_sources?.map((s: string) => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Sigma className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">AI Math Solver</div>
              <div className="text-sm text-muted-foreground max-w-xs">Enter any math problem — equations, integrals, derivatives, matrices — and get verified step-by-step solutions</div>
            </div>
          )}
        </div>
      )}

      {/* ── GRAPH PLOTTER ─────────────────────────────────── */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-violet-400" /> Function Graph Plotter
            </h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">f(x) = </label>
                <input value={expr} onChange={e => setExpr(e.target.value)}
                  placeholder="e.g. x**2 - 4 | sin(x) | x**3 - 3*x"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
              </div>
              <button onClick={() => graphMutation.mutate()} disabled={!expr || graphMutation.isPending}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 disabled:opacity-50">
                {graphMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LineChart className="w-4 h-4" />} Plot
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['x**2', 'sin(x)', 'cos(x)', 'x**3 - 3*x', 'exp(-x**2)', 'log(abs(x) + 0.01)', '1/x'].map(ex => (
                <button key={ex} onClick={() => setExpr(ex)}
                  className="text-xs px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-lg hover:bg-violet-500/20 transition-colors font-mono">
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {graphData ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-white">f(x) = <span className="text-violet-400 font-mono">{graphData.expression}</span></div>
                <div className="text-xs text-muted-foreground">{graphData.points} points computed</div>
              </div>
              {renderGraph()}
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span>Range: [{graphData.x_range?.[0]}, {graphData.x_range?.[1]}]</span>
                <span>Engine: {graphData.computed_by}</span>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-12 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <LineChart className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Graph will appear here</div>
              <div className="text-sm text-muted-foreground">Enter a mathematical expression and click Plot</div>
            </div>
          )}
        </div>
      )}

      {/* ── FORMULA EXPLORER ──────────────────────────────── */}
      {activeTab === 'formulas' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={formulaQuery} onChange={e => setFormulaQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && formulaMutation.mutate()}
                placeholder="Search formulas — e.g. derivative, bayes, fourier..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
            </div>
            <button onClick={() => formulaMutation.mutate()} disabled={!formulaQuery || formulaMutation.isPending}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm rounded-xl flex items-center gap-2 disabled:opacity-50">
              {formulaMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
            </button>
          </div>

          {formulaResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formulaResults.map((f: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 border border-white/5 hover:border-violet-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{f.name}</div>
                      <div className="text-xs text-violet-400 mt-0.5">{f.branch}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-md">{f.branch}</span>
                  </div>
                  <div className="p-3 bg-violet-500/5 rounded-xl font-mono text-violet-300 text-base mb-2 text-center">{f.formula}</div>
                  <div className="text-xs text-muted-foreground">{f.description}</div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <BookOpen className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Formula Library</div>
              <div className="text-sm text-muted-foreground">Search across 500+ mathematical formulas from Calculus, Algebra, Statistics, Linear Algebra and more</div>
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ ──────────────────────────────────────────── */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" /> AI Quiz Generator
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Topic</label>
              <select value={quizTopic} onChange={e => setQuizTopic(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50">
                {['Calculus', 'Algebra', 'Statistics', 'Geometry', 'Trigonometry', 'Linear Algebra', 'Number Theory', 'Discrete Mathematics'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button onClick={() => quizMutation.mutate()} disabled={quizMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {quizMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Generate Quiz
            </button>
          </div>

          {quizResult ? (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{quizResult.topic} Quiz</div>
                  <div className="text-xs text-muted-foreground">{quizResult.total_questions} questions · {quizResult.time_limit_minutes} min</div>
                </div>
                <span className="badge badge-info text-xs">{quizResult.difficulty}</span>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[450px]">
                {quizResult.questions?.map((q: any, i: number) => (
                  <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-violet-400 font-medium">Q{i + 1}</div>
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
                    <div className="text-xs text-indigo-400 pt-1">💡 {q.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Award className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">AI-Powered Quiz</div>
              <div className="text-sm text-muted-foreground">Generate topic-specific MCQs with SymPy-verified answers from NCERT, JEE, and MIT OCW sources</div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS ─────────────────────────────────────── */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Topic Popularity</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.topic_popularity || {}).map(([topic, pct]: any) => (
                  <div key={topic} className="flex items-center gap-3">
                    <div className="w-32 text-xs text-muted-foreground truncate">{topic}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-white w-8 text-right">{pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Accuracy by Topic</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.avg_accuracy_by_topic || {}).map(([topic, acc]: any) => (
                  <div key={topic} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-muted-foreground truncate">{topic}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-2">
                      <div className={`h-2 rounded-full ${acc >= 90 ? 'bg-emerald-500' : acc >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${acc}%` }} />
                    </div>
                    <div className="text-xs text-white w-8 text-right">{acc}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Difficulty Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.difficulty_distribution || {}).map(([d, pct]: any) => (
                  <div key={d} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-muted-foreground">{d}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-3">
                      <div className={`h-3 rounded-full ${d === 'Easy' ? 'bg-emerald-500' : d === 'Medium' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-white w-8 text-right">{pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Platform Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'SymPy Verify Rate', value: `${analyticsData.sympy_verification_rate}%`, color: 'text-violet-400' },
                  { label: 'Avg Solve Time', value: `${analyticsData.avg_solve_time_ms}ms`, color: 'text-blue-400' },
                  { label: 'Quiz Completion', value: `${analyticsData.quiz_completion_rate}%`, color: 'text-emerald-400' },
                  { label: 'Total Problems', value: stats?.total_problems_solved?.toLocaleString(), color: 'text-amber-400' },
                ].map(s => (
                  <div key={s.label} className="p-3 bg-white/3 rounded-xl text-center">
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
