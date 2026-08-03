import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FlaskConical, Brain, BookOpen, BarChart2, Zap, TrendingUp,
  Loader2, CheckCircle, Award, TestTube, Atom, Beaker
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

const TABS = [
  { id: 'overview',   label: 'Overview',         icon: BarChart2 },
  { id: 'solver',     label: 'AI Solver',         icon: FlaskConical },
  { id: 'balance',    label: 'Eq. Balancer',      icon: Zap },
  { id: 'molecule',   label: 'Molecule Viewer',   icon: Atom },
  { id: 'quiz',       label: 'Quiz',              icon: Brain },
  { id: 'analytics',  label: 'Analytics',         icon: TrendingUp },
]

const BRANCH_COLORS: Record<string, string> = {
  'Physical Chemistry':   'from-blue-500 to-cyan-600',
  'Organic Chemistry':    'from-emerald-500 to-teal-600',
  'Inorganic Chemistry':  'from-violet-500 to-purple-600',
  'Analytical Chemistry': 'from-amber-500 to-orange-600',
  'Biochemistry':         'from-pink-500 to-rose-600',
  'Quantum Chemistry':    'from-fuchsia-500 to-violet-600',
  'Electrochemistry':     'from-lime-500 to-green-600',
  'Environmental Chemistry': 'from-sky-500 to-blue-600',
  'Nuclear Chemistry':    'from-red-500 to-pink-600',
  'Competitive Exams':    'from-yellow-500 to-amber-600',
}

// Simple 2D molecule SVG renderer
function MoleculeViewer({ mol }: { mol: any }) {
  if (!mol?.atoms?.length) return (
    <div className="p-8 text-center text-muted-foreground text-sm">No structural data available</div>
  )
  const W = 300, H = 200, cx = W / 2, cy = H / 2, scale = 60
  const ELEM_COLORS: Record<string, string> = {
    C: '#4ade80', H: '#60a5fa', O: '#f87171', N: '#a78bfa', S: '#fbbf24', Cl: '#34d399'
  }

  const atoms = mol.atoms.map((a: any) => ({
    ...a,
    svgX: cx + a.x * scale,
    svgY: cy + a.y * scale,
    color: ELEM_COLORS[a.element] || '#94a3b8',
  }))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
      {(mol.bonds || []).map((bond: any, i: number) => {
        const a1 = atoms[bond[0]], a2 = atoms[bond[1]]
        const type = bond[2]
        const offset = type === 'double' ? 3 : 0
        return (
          <g key={i}>
            <line x1={a1.svgX} y1={a1.svgY} x2={a2.svgX} y2={a2.svgY} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            {type === 'double' && <line x1={a1.svgX + offset} y1={a1.svgY + offset} x2={a2.svgX + offset} y2={a2.svgY + offset} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />}
          </g>
        )
      })}
      {atoms.map((a: any, i: number) => (
        <g key={i}>
          <circle cx={a.svgX} cy={a.svgY} r={14} fill={a.color} fillOpacity="0.2" stroke={a.color} strokeWidth="1.5" />
          <text x={a.svgX} y={a.svgY + 4} textAnchor="middle" fill={a.color} fontSize="11" fontWeight="bold">{a.element}</text>
        </g>
      ))}
    </svg>
  )
}

export default function ChemVersePage() {
  const [activeTab, setActiveTab] = useState<string>('overview')
  // Solver
  const [problem, setProblem] = useState('')
  const [branch, setBranch] = useState('Physical Chemistry')
  const [solveResult, setSolveResult] = useState<any>(null)
  // Balancer
  const [equation, setEquation] = useState('H2+O2->H2O')
  const [balanceResult, setBalanceResult] = useState<any>(null)
  // Molecule
  const [molFormula, setMolFormula] = useState('H2O')
  const [molData, setMolData] = useState<any>(null)
  // Quiz
  const [quizBranch, setQuizBranch] = useState('organic')
  const [quizResult, setQuizResult] = useState<any>(null)

  const { data: stats } = useQuery({ queryKey: ['chem-stats'], queryFn: () => axios.get(`${API}/chemistry/stats`).then(r => r.data) })
  const { data: topicsData } = useQuery({ queryKey: ['chem-topics'], queryFn: () => axios.get(`${API}/chemistry/topics`).then(r => r.data), enabled: activeTab === 'overview' })
  const { data: analyticsData } = useQuery({ queryKey: ['chem-analytics'], queryFn: () => axios.get(`${API}/chemistry/analytics`).then(r => r.data), enabled: activeTab === 'analytics' })

  const solveMutation = useMutation({
    mutationFn: () => axios.post(`${API}/chemistry/solve`, { problem, branch, show_mechanism: true }).then(r => r.data),
    onSuccess: d => { setSolveResult(d); toast.success('Problem solved! ✓') },
    onError: () => toast.error('Solver error'),
  })

  const balanceMutation = useMutation({
    mutationFn: () => axios.post(`${API}/chemistry/balance`, { equation }).then(r => r.data),
    onSuccess: d => { setBalanceResult(d); toast.success('Equation balanced!') },
    onError: () => toast.error('Balance error'),
  })

  const molMutation = useMutation({
    mutationFn: () => axios.post(`${API}/chemistry/molecule`, { formula: molFormula }).then(r => r.data),
    onSuccess: d => { setMolData(d); toast.success('Molecule loaded!') },
    onError: () => toast.error('Molecule error'),
  })

  const quizMutation = useMutation({
    mutationFn: () => axios.post(`${API}/chemistry/quiz/generate`, { branch: quizBranch, difficulty: 'medium', num_questions: 5 }).then(r => r.data),
    onSuccess: d => { setQuizResult(d); toast.success('Quiz generated!') },
    onError: () => toast.error('Quiz error'),
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <FlaskConical className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">ChemVerse AI</h1>
          <p className="text-sm text-muted-foreground">Offline AI-Powered Chemistry Learning, Lab Simulation & Problem Solving Platform</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="badge badge-info text-xs px-2 py-1">RDKit Verified</span>
          <span className="badge badge-success text-xs px-2 py-1">Offline</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Problems Solved', value: stats?.total_problems_solved?.toLocaleString(), icon: FlaskConical, color: 'from-emerald-500 to-teal-600' },
              { label: 'Equations Balanced', value: stats?.equations_balanced?.toLocaleString(), icon: Zap, color: 'from-blue-500 to-cyan-600' },
              { label: 'Molecules Viewed', value: stats?.molecules_visualized?.toLocaleString(), icon: Atom, color: 'from-violet-500 to-purple-600' },
              { label: 'Lab Simulations', value: stats?.lab_simulations_run?.toLocaleString(), icon: TestTube, color: 'from-amber-500 to-orange-600' },
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
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-emerald-400" /> Chemistry Branches</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(topicsData?.topics || {}).map(([br, subtopics]: any) => (
                <motion.div key={br} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all group">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${BRANCH_COLORS[br] || 'from-emerald-500 to-teal-600'} flex items-center justify-center mb-2`}>
                    <FlaskConical className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{br}</div>
                  <div className="text-xs text-muted-foreground mt-1">{(subtopics as string[]).length} topics</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(subtopics as string[]).slice(0, 2).map((t: string) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md">{t}</span>
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
              <FlaskConical className="w-5 h-5 text-emerald-400" /> AI Chemistry Solver
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Branch</label>
              <select value={branch} onChange={e => setBranch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
                {Object.keys(BRANCH_COLORS).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Problem</label>
              <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={5}
                placeholder="Describe your chemistry problem...&#10;Example: Calculate the pH of 0.1M HCl&#10;Example: Explain the mechanism of SN2 reaction&#10;Example: Balance and find enthalpy: H2 + O2 → H2O"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none" />
            </div>
            <button onClick={() => solveMutation.mutate()} disabled={!problem || solveMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {solveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Solve with AI + RDKit
            </button>
          </div>

          {solveResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Solution</h3>
                <span className="text-xs text-emerald-400 font-bold">{(solveResult.solution?.confidence_score * 100).toFixed(1)}% confidence</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="text-xs text-muted-foreground mb-1">Answer</div>
                <div className="text-base font-bold text-white">{solveResult.solution?.answer}</div>
                <div className="text-sm text-emerald-300 mt-1">{solveResult.solution?.numeric_result}</div>
              </div>

              {solveResult.mechanism?.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Reaction Mechanism</div>
                  <div className="space-y-2">
                    {solveResult.mechanism.map((step: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">{i + 1}</div>
                        <div className="text-sm text-foreground">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {solveResult.theory?.safety_note && (
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <div className="text-xs text-red-400 font-medium mb-1">⚠ Safety</div>
                  <div className="text-xs text-muted-foreground">{solveResult.theory.safety_note}</div>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {solveResult.rag_sources?.map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md">{s}</span>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <FlaskConical className="w-16 h-16 text-emerald-400/30" />
              <div className="text-white font-medium">AI Chemistry Solver</div>
              <div className="text-sm text-muted-foreground max-w-xs">Solve stoichiometry, equilibrium, pH, mechanisms, spectroscopy and more — all offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── EQUATION BALANCER ─────────────────────────────── */}
      {activeTab === 'balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" /> Chemical Equation Balancer
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Equation</label>
              <input value={equation} onChange={e => setEquation(e.target.value)}
                placeholder="e.g. H2+O2->H2O | Fe+O2->Fe2O3"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['H2+O2->H2O', 'Fe+O2->Fe2O3', 'NaOH+HCl->NaCl+H2O'].map(ex => (
                <button key={ex} onClick={() => setEquation(ex)}
                  className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors font-mono">
                  {ex}
                </button>
              ))}
            </div>
            <button onClick={() => balanceMutation.mutate()} disabled={!equation || balanceMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {balanceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Balance Equation
            </button>
          </div>

          {balanceResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Balanced Result</h3>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center">
                <div className="text-xs text-muted-foreground mb-2">Balanced Equation</div>
                <div className="text-xl font-bold text-emerald-300 font-mono">{balanceResult.balanced_equation}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Reaction Type', value: balanceResult.reaction_type, color: 'text-blue-400' },
                  { label: 'Enthalpy (ΔH)', value: balanceResult.enthalpy || 'N/A', color: 'text-amber-400' },
                  { label: 'Method', value: balanceResult.method || 'Algebraic', color: 'text-teal-400' },
                  { label: 'Verified', value: balanceResult.verified ? '✓ Yes' : '✗ No', color: balanceResult.verified ? 'text-emerald-400' : 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="p-3 bg-white/3 rounded-xl">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className={`text-sm font-semibold ${s.color} mt-0.5`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Zap className="w-16 h-16 text-emerald-400/30" />
              <div className="text-white font-medium">Equation Balancer</div>
              <div className="text-sm text-muted-foreground">Enter any chemical equation and balance it using the algebraic method offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── MOLECULE VIEWER ───────────────────────────────── */}
      {activeTab === 'molecule' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Atom className="w-5 h-5 text-emerald-400" /> Molecule Viewer
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Molecular Formula</label>
              <input value={molFormula} onChange={e => setMolFormula(e.target.value.toUpperCase())}
                placeholder="e.g. H2O, CH4, CO2, NH3, C6H6"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['H2O', 'CH4', 'CO2', 'NH3', 'NaCl'].map(f => (
                <button key={f} onClick={() => setMolFormula(f)}
                  className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors font-mono">
                  {f}
                </button>
              ))}
            </div>
            <button onClick={() => molMutation.mutate()} disabled={!molFormula || molMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {molMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Atom className="w-4 h-4" />}
              Visualize Molecule
            </button>
          </div>

          {molData ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-white">{molData.name}</div>
                  <div className="text-xs text-emerald-400 font-mono">{molData.formula}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{molData.molar_mass?.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">g/mol</div>
                </div>
              </div>

              <MoleculeViewer mol={molData} />

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Geometry', value: molData.geometry },
                  { label: 'Bond Angle', value: molData.bond_angle ? `${molData.bond_angle}°` : 'N/A' },
                  { label: 'Hybridization', value: molData.hybridization },
                  { label: 'Polarity', value: molData.polarity },
                ].map(s => (
                  <div key={s.label} className="p-2.5 bg-white/3 rounded-xl">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="text-sm font-medium text-white mt-0.5">{s.value || 'N/A'}</div>
                  </div>
                ))}
              </div>

              {molData.properties && (
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <div className="text-xs text-muted-foreground mb-1">Physical Properties</div>
                  {Object.entries(molData.properties).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between text-xs py-0.5">
                      <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                      <span className="text-emerald-400">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Atom className="w-16 h-16 text-emerald-400/30" />
              <div className="text-white font-medium">Molecular Visualizer</div>
              <div className="text-sm text-muted-foreground">Enter a molecular formula to view 2D structure, geometry, hybridization and properties</div>
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ ──────────────────────────────────────────── */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-400" /> Chemistry Quiz Generator
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Branch</label>
              <select value={quizBranch} onChange={e => setQuizBranch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
                {['organic', 'physical', 'inorganic', 'analytical', 'biochemistry', 'electrochemistry'].map(b => (
                  <option key={b} value={b} className="capitalize">{b.charAt(0).toUpperCase() + b.slice(1)} Chemistry</option>
                ))}
              </select>
            </div>
            <button onClick={() => quizMutation.mutate()} disabled={quizMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {quizMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Generate Quiz
            </button>
          </div>

          {quizResult ? (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <div className="text-sm font-semibold text-white">{quizResult.branch} Quiz</div>
                <div className="text-xs text-muted-foreground">{quizResult.total_questions} questions · {quizResult.time_limit_minutes} min</div>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[450px]">
                {quizResult.questions?.map((q: any, i: number) => (
                  <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-emerald-400 font-medium">Q{i + 1}</div>
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
                    <div className="text-xs text-teal-400 pt-1">💡 {q.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Award className="w-16 h-16 text-emerald-400/30" />
              <div className="text-white font-medium">Chemistry Quiz</div>
              <div className="text-sm text-muted-foreground">MCQs from NCERT, JEE, NEET chemistry sources with RDKit-verified answers</div>
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
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pct}%` }} />
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
                  <div className="w-28 text-xs text-muted-foreground truncate">{br}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className={`h-2 rounded-full ${acc >= 85 ? 'bg-emerald-500' : acc >= 78 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${acc}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{acc}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5 md:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-4">Platform Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Problems Solved', value: stats?.total_problems_solved?.toLocaleString(), color: 'text-emerald-400' },
                { label: 'Equations Balanced', value: stats?.equations_balanced?.toLocaleString(), color: 'text-blue-400' },
                { label: 'Accuracy Rate', value: `${stats?.accuracy_rate}%`, color: 'text-teal-400' },
                { label: 'Lab Simulations', value: stats?.lab_simulations_run?.toLocaleString(), color: 'text-amber-400' },
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
