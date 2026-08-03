import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Atom, Brain, BookOpen, BarChart2, Zap, TrendingUp,
  Loader2, CheckCircle, Award, Play, FlaskConical, Activity
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

const TABS = [
  { id: 'overview',    label: 'Overview',       icon: BarChart2 },
  { id: 'solver',      label: 'AI Solver',      icon: Atom },
  { id: 'simulate',    label: 'Simulations',    icon: Play },
  { id: 'formulas',    label: 'Formula Library', icon: BookOpen },
  { id: 'quiz',        label: 'Quiz',           icon: Brain },
  { id: 'analytics',   label: 'Analytics',      icon: TrendingUp },
]

const BRANCH_COLORS: Record<string, string> = {
  'Classical Mechanics': 'from-blue-500 to-cyan-600',
  'Waves & Oscillations': 'from-teal-500 to-emerald-600',
  'Thermodynamics': 'from-orange-500 to-amber-600',
  'Electrostatics': 'from-yellow-500 to-amber-600',
  'Current Electricity': 'from-violet-500 to-purple-600',
  'Magnetism': 'from-pink-500 to-rose-600',
  'Optics': 'from-sky-500 to-blue-600',
  'Modern Physics': 'from-indigo-500 to-blue-600',
  'Quantum Mechanics': 'from-fuchsia-500 to-violet-600',
  'Relativity': 'from-red-500 to-pink-600',
  'Astrophysics': 'from-slate-500 to-blue-600',
  'Competitive Exams': 'from-lime-500 to-green-600',
}

export default function PhysicsVersePage() {
  const [activeTab, setActiveTab] = useState<string>('overview')
  // Solver
  const [problem, setProblem] = useState('')
  const [branch, setBranch] = useState('Classical Mechanics')
  const [solveResult, setSolveResult] = useState<any>(null)
  // Simulate
  const [simType, setSimType] = useState('projectile')
  const [simParams, setSimParams] = useState<Record<string, number>>({ initial_velocity: 20, launch_angle: 45, gravity: 9.8 })
  const [simResult, setSimResult] = useState<any>(null)
  // Quiz
  const [quizBranch, setQuizBranch] = useState('mechanics')
  const [quizResult, setQuizResult] = useState<any>(null)

  const { data: stats } = useQuery({ queryKey: ['physics-stats'], queryFn: () => axios.get(`${API}/physics/stats`).then(r => r.data) })
  const { data: topicsData } = useQuery({ queryKey: ['physics-topics'], queryFn: () => axios.get(`${API}/physics/topics`).then(r => r.data), enabled: activeTab === 'overview' })
  const { data: formulasData } = useQuery({ queryKey: ['physics-formulas'], queryFn: () => axios.get(`${API}/physics/formulas`).then(r => r.data), enabled: activeTab === 'formulas' })
  const { data: analyticsData } = useQuery({ queryKey: ['physics-analytics'], queryFn: () => axios.get(`${API}/physics/analytics`).then(r => r.data), enabled: activeTab === 'analytics' })

  const solveMutation = useMutation({
    mutationFn: () => axios.post(`${API}/physics/solve`, { problem, branch, show_derivation: true, verify_units: true }).then(r => r.data),
    onSuccess: d => { setSolveResult(d); toast.success('Problem solved! ✓') },
    onError: () => toast.error('Solver error'),
  })

  const simMutation = useMutation({
    mutationFn: () => axios.post(`${API}/physics/simulate`, { simulation_type: simType, parameters: simParams }).then(r => r.data),
    onSuccess: d => { setSimResult(d); toast.success('Simulation complete!') },
    onError: () => toast.error('Simulation error'),
  })

  const quizMutation = useMutation({
    mutationFn: () => axios.post(`${API}/physics/quiz/generate`, { branch: quizBranch, difficulty: 'medium', num_questions: 5 }).then(r => r.data),
    onSuccess: d => { setQuizResult(d); toast.success('Quiz generated!') },
    onError: () => toast.error('Quiz error'),
  })

  // Simple projectile SVG renderer
  const renderProjectile = () => {
    if (!simResult?.results?.trajectory) return null
    const { x, y } = simResult.results.trajectory
    const W = 560, H = 220, pad = 40
    const maxX = Math.max(...x), maxY = Math.max(...y)
    const toSX = (v: number) => pad + (v / maxX) * (W - 2 * pad)
    const toSY = (v: number) => H - pad - (v / (maxY || 1)) * (H - 2 * pad)
    const validPts = x.map((xi: number, i: number) => ({ x: xi, y: y[i] })).filter((p: any) => p.y >= -0.5)
    const pathD = validPts.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${toSX(p.x).toFixed(1)} ${toSY(p.y).toFixed(1)}`).join(' ')

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <path d={pathD} fill="none" stroke="url(#physGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <text x={W / 2} y={H - 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">Range: {simResult.results.range?.toFixed(1)}m</text>
        <text x={pad + 5} y={pad + 15} fill="rgba(255,255,255,0.4)" fontSize="10">H: {simResult.results.max_height?.toFixed(1)}m</text>
        <defs>
          <linearGradient id="physGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  const renderPendulum = () => {
    if (!simResult?.results?.angle_vs_time) return null
    const { t, theta } = simResult.results.angle_vs_time
    const W = 560, H = 200, pad = 40
    const minT = 0, maxT = Math.max(...t)
    const minA = Math.min(...theta), maxA = Math.max(...theta)
    const rangeA = maxA - minA || 1
    const toSX = (v: number) => pad + (v / maxT) * (W - 2 * pad)
    const toSY = (v: number) => H / 2 - (v / rangeA) * (H / 2 - pad)
    const pathD = t.map((ti: number, i: number) => `${i === 0 ? 'M' : 'L'} ${toSX(ti).toFixed(1)} ${toSY(theta[i]).toFixed(1)}`).join(' ')
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4" />
        <path d={pathD} fill="none" stroke="url(#physGrad2)" strokeWidth="2.5" />
        <text x={W / 2} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">Period: {simResult.results.period?.toFixed(3)}s | f: {simResult.results.frequency?.toFixed(3)}Hz</text>
        <defs>
          <linearGradient id="physGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Atom className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">PhysicsVerse AI</h1>
          <p className="text-sm text-muted-foreground">Offline AI-Powered Physics Learning, Theory & Problem Solving Platform</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="badge badge-info text-xs px-2 py-1">Unit Verified</span>
          <span className="badge badge-success text-xs px-2 py-1">Offline</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400' : 'text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Problems Solved', value: stats?.total_problems_solved?.toLocaleString(), icon: Atom, color: 'from-blue-500 to-cyan-600' },
              { label: 'Topics Covered', value: stats?.topics_covered, icon: BookOpen, color: 'from-teal-500 to-emerald-600' },
              { label: 'Accuracy Rate', value: `${stats?.accuracy_rate}%`, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
              { label: 'Simulations Run', value: stats?.simulations_run?.toLocaleString(), icon: Play, color: 'from-violet-500 to-purple-600' },
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

          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Atom className="w-4 h-4 text-blue-400" /> Physics Branches</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(topicsData?.topics || {}).map(([br, subtopics]: any) => (
                <motion.div key={br} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-4 border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all group">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${BRANCH_COLORS[br] || 'from-blue-500 to-cyan-600'} flex items-center justify-center mb-2`}>
                    <Atom className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{br}</div>
                  <div className="text-xs text-muted-foreground mt-1">{(subtopics as string[]).length} topics</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(subtopics as string[]).slice(0, 2).map((t: string) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-md">{t}</span>
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
              <Atom className="w-5 h-5 text-blue-400" /> AI Physics Solver
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Branch</label>
              <select value={branch} onChange={e => setBranch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                {Object.keys(BRANCH_COLORS).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Problem</label>
              <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={5}
                placeholder="Describe your physics problem...&#10;Example: A ball is thrown at 20 m/s at 45°. Find range.&#10;Example: Calculate the time period of a 1m pendulum.&#10;Example: Derive the equation of motion for SHM."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none" />
            </div>
            <button onClick={() => solveMutation.mutate()} disabled={!problem || solveMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {solveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Solve with AI + SciPy
            </button>
          </div>

          {solveResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Solution</h3>
                <div className="flex items-center gap-2">
                  {solveResult.solution?.verified_by_sympy && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3 h-3" /> Verified</span>}
                  <span className="text-xs text-blue-400 font-bold">{(solveResult.solution?.confidence_score * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="text-xs text-muted-foreground mb-1">Answer</div>
                <div className="text-lg font-bold text-white">{solveResult.solution?.numeric_result}</div>
                {solveResult.solution?.units && <div className="text-xs text-blue-300 mt-1">{solveResult.solution.units}</div>}
                {solveResult.solution?.dimensional_analysis && (
                  <div className="text-xs text-emerald-400 mt-1">✓ {solveResult.solution.dimensional_analysis}</div>
                )}
              </div>

              {solveResult.derivation?.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Derivation Steps</div>
                  <div className="space-y-2">
                    {solveResult.derivation.map((step: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">{i + 1}</div>
                        <div className="text-sm text-foreground">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {solveResult.theory && (
                <div className="p-3 bg-white/3 rounded-xl space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">Theory</div>
                  <div className="text-xs text-foreground">{solveResult.theory.physical_intuition}</div>
                  <div className="text-xs text-blue-400">{solveResult.theory.formula}</div>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {solveResult.rag_sources?.map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md">{s}</span>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Atom className="w-16 h-16 text-blue-400/30" />
              <div className="text-white font-medium">AI Physics Solver</div>
              <div className="text-sm text-muted-foreground max-w-xs">Solve numerical problems, derive equations, verify units, and get dimensional analysis — all offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── SIMULATIONS ───────────────────────────────────── */}
      {activeTab === 'simulate' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-400" /> Physics Simulation Engine
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['projectile', 'pendulum', 'shm', 'wave'].map(s => (
                <button key={s} onClick={() => {
                  setSimType(s)
                  setSimParams(
                    s === 'projectile' ? { initial_velocity: 20, launch_angle: 45, gravity: 9.8 } :
                    s === 'pendulum' ? { length: 1.0, initial_angle: 15, gravity: 9.8 } :
                    s === 'shm' ? { mass: 1.0, spring_constant: 10, amplitude: 0.1 } :
                    { amplitude: 1.0, wavelength: 2.0, frequency: 1.0 }
                  )
                }}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all capitalize ${simType === s ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'glass text-muted-foreground hover:text-foreground border border-white/5'}`}>
                  {s === 'projectile' ? '🎯 Projectile' : s === 'pendulum' ? '🔘 Pendulum' : s === 'shm' ? '🌀 SHM' : '🌊 Wave'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(simParams).map(([k, v]) => (
                <div key={k}>
                  <label className="text-xs text-muted-foreground mb-1 block capitalize">{k.replace(/_/g, ' ')}</label>
                  <input type="number" value={v} onChange={e => setSimParams(prev => ({ ...prev, [k]: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                </div>
              ))}
            </div>
            <button onClick={() => simMutation.mutate()} disabled={simMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {simMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Simulation
            </button>
          </div>

          {simResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">{simResult.name}</div>
                <span className="text-xs text-muted-foreground">{simResult.engine}</span>
              </div>
              {simType === 'projectile' && renderProjectile()}
              {simType === 'pendulum' && renderPendulum()}
              {simType === 'shm' && simResult.results?.displacement && (
                <div className="p-3 bg-white/3 rounded-xl text-sm text-center text-foreground">
                  SHM Period: <span className="text-blue-400 font-bold">{simResult.results.period?.toFixed(3)}s</span> — Displacement plot ready
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(simResult.results || {}).filter(([k]) => typeof simResult.results[k] === 'number').map(([k, v]: any) => (
                  <div key={k} className="p-3 bg-white/3 rounded-xl text-center">
                    <div className="text-base font-bold text-blue-400">{v.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ── FORMULA LIBRARY ───────────────────────────────── */}
      {activeTab === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(formulasData?.formulas || []).map((f: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl p-5 border border-white/5 hover:border-blue-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-white">{f.name}</div>
                  <div className="text-xs text-blue-400">{f.branch}</div>
                </div>
                {f.units && <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md">{f.units}</span>}
              </div>
              <div className="p-3 bg-blue-500/5 rounded-xl font-mono text-blue-300 text-base text-center mb-2">{f.formula}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── QUIZ ──────────────────────────────────────────── */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" /> AI Physics Quiz
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Branch</label>
              <select value={quizBranch} onChange={e => setQuizBranch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                {['mechanics', 'electrostatics', 'optics', 'thermodynamics', 'modern', 'quantum'].map(b => (
                  <option key={b} value={b} className="capitalize">{b.charAt(0).toUpperCase() + b.slice(1)}</option>
                ))}
              </select>
            </div>
            <button onClick={() => quizMutation.mutate()} disabled={quizMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {quizMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Generate Quiz
            </button>
          </div>

          {quizResult ? (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <div className="text-sm font-semibold text-white">{quizResult.branch} Physics Quiz</div>
                <div className="text-xs text-muted-foreground">{quizResult.total_questions} questions · {quizResult.time_limit_minutes} min</div>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[450px]">
                {quizResult.questions?.map((q: any, i: number) => (
                  <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-blue-400 font-medium">Q{i + 1}</div>
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
                    <div className="text-xs text-cyan-400 pt-1">💡 {q.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Award className="w-16 h-16 text-blue-400/30" />
              <div className="text-white font-medium">Physics Quiz Generator</div>
              <div className="text-sm text-muted-foreground">MCQs from NCERT, JEE, NEET and university-level physics sources</div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS ─────────────────────────────────────── */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Branch Popularity</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.branch_popularity || {}).map(([br, pct]: any) => (
                <div key={br} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-muted-foreground truncate">{br}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{pct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Accuracy by Branch</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.avg_accuracy_by_branch || {}).map(([br, acc]: any) => (
                <div key={br} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-muted-foreground truncate">{br}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className={`h-2 rounded-full ${acc >= 88 ? 'bg-emerald-500' : acc >= 78 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${acc}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{acc}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Simulations by Type</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.simulations_by_type || {}).map(([sim, pct]: any) => (
                <div key={sim} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground">{sim}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{pct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Platform Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Problems Solved', value: stats?.total_problems_solved?.toLocaleString(), color: 'text-blue-400' },
                { label: 'Simulations', value: stats?.simulations_run?.toLocaleString(), color: 'text-cyan-400' },
                { label: 'Accuracy', value: `${stats?.accuracy_rate}%`, color: 'text-emerald-400' },
                { label: 'Avg Response', value: `${stats?.avg_response_ms}ms`, color: 'text-amber-400' },
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
