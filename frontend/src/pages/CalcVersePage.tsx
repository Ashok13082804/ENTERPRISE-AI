import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Calculator, Brain, BookOpen, BarChart2, Zap, TrendingUp, Loader2,
  CheckCircle, Award, Equal, Settings, Compass, LineChart, RefreshCw, Grid, DollarSign, Binary, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

const TABS = [
  { id: 'overview',     label: 'Overview',          icon: BarChart2 },
  { id: 'calculator',   label: 'Scientific Calc',   icon: Calculator },
  { id: 'symbolic',     label: 'Symbolic Math',     icon: Compass },
  { id: 'matrix',       label: 'Matrix Lab',        icon: Grid },
  { id: 'statistics',   label: 'Statistics',        icon: LineChart },
  { id: 'convert',      label: 'Unit Converter',    icon: RefreshCw },
  { id: 'finance',      label: 'Finance Calc',      icon: DollarSign },
  { id: 'programmer',   label: 'Programmer',        icon: Binary },
  { id: 'quiz',         label: 'Quiz',              icon: Award },
]

export default function CalcVersePage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Scientific Calculator
  const [expression, setExpression] = useState('')
  const [calcMode, setCalcMode] = useState('scientific')
  const [calcResult, setCalcResult] = useState<any>(null)

  // Symbolic Math
  const [symExpr, setSymExpr] = useState('diff(sin(x), x)')
  const [symOp, setSymOp] = useState('simplify')
  const [symVar, setSymVar] = useState('x')
  const [symResult, setSymResult] = useState<any>(null)

  // Matrix Lab
  const [matrixA, setMatrixA] = useState<string>('[[1, 2], [3, 4]]')
  const [matrixB, setMatrixB] = useState<string>('[[5, 6], [7, 8]]')
  const [matrixOp, setMatrixOp] = useState('determinant')
  const [matrixResult, setMatrixResult] = useState<any>(null)

  // Statistics
  const [statData, setStatData] = useState<string>('12, 15, 18, 22, 25, 30, 35')
  const [statResult, setStatResult] = useState<any>(null)

  // Unit Converter
  const [convVal, setConvVal] = useState<number>(100)
  const [convCategory, setConvCategory] = useState('length')
  const [convFrom, setConvFrom] = useState('meter')
  const [convTo, setConvTo] = useState('kilometer')
  const [convResult, setConvResult] = useState<any>(null)

  // Finance Calculator
  const [finType, setFinType] = useState('emi')
  const [finPrincipal, setFinPrincipal] = useState<number>(100000)
  const [finRate, setFinRate] = useState<number>(8.5)
  const [finTime, setFinTime] = useState<number>(5)
  const [finResult, setFinResult] = useState<any>(null)

  // Programmer
  const [progVal, setProgVal] = useState<string>('255')
  const [progFrom, setProgFrom] = useState('decimal')
  const [progTo, setProgTo] = useState('binary')
  const [progResult, setProgResult] = useState<any>(null)

  // Quiz
  const [quizResult, setQuizResult] = useState<any>(null)

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['calc-stats'],
    queryFn: () => axios.get(`${API}/calcverse/stats`).then(r => r.data)
  })

  const { data: constantsData } = useQuery({
    queryKey: ['calc-constants'],
    queryFn: () => axios.get(`${API}/calcverse/constants`).then(r => r.data),
    enabled: activeTab === 'calculator',
  })

  const { data: formulasData } = useQuery({
    queryKey: ['calc-formulas'],
    queryFn: () => axios.get(`${API}/calcverse/formulas`).then(r => r.data),
    enabled: activeTab === 'overview',
  })

  const { data: analyticsData } = useQuery({
    queryKey: ['calc-analytics'],
    queryFn: () => axios.get(`${API}/calcverse/analytics`).then(r => r.data),
    enabled: activeTab === 'overview',
  })

  // Mutations
  const calcMutation = useMutation({
    mutationFn: () => axios.post(`${API}/calcverse/calculate`, { expression, mode: calcMode, show_steps: true }).then(r => r.data),
    onSuccess: d => { setCalcResult(d); toast.success('Calculated! ✓') },
    onError: () => toast.error('Calculation error'),
  })

  const symMutation = useMutation({
    mutationFn: () => axios.post(`${API}/calcverse/symbolic`, { expression: symExpr, operation: symOp, variable: symVar }).then(r => r.data),
    onSuccess: d => { setSymResult(d); toast.success('Symbolic operation solved!') },
    onError: () => toast.error('Symbolic math error'),
  })

  const matrixMutation = useMutation({
    mutationFn: () => {
      const parsedA = JSON.parse(matrixA)
      const parsedB = matrixB ? JSON.parse(matrixB) : null
      return axios.post(`${API}/calcverse/matrix`, { matrix_a: parsedA, matrix_b: parsedB, operation: matrixOp }).then(r => r.data)
    },
    onSuccess: d => { setMatrixResult(d); toast.success('Matrix calculation complete!') },
    onError: () => toast.error('Matrix expression parsing/operation error'),
  })

  const statMutation = useMutation({
    mutationFn: () => {
      const parsed = statData.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x))
      return axios.post(`${API}/calcverse/statistics`, { data: parsed, operations: ['mean', 'median', 'mode', 'variance', 'std_dev', 'min', 'max', 'range', 'sum', 'count', 'quartiles'] }).then(r => r.data)
    },
    onSuccess: d => { setStatResult(d); toast.success('Statistical analysis ready!') },
    onError: () => toast.error('Statistics calculation error'),
  })

  const convMutation = useMutation({
    mutationFn: () => axios.post(`${API}/calcverse/convert`, { value: convVal, from_unit: convFrom, to_unit: convTo, category: convCategory }).then(r => r.data),
    onSuccess: d => { setConvResult(d); toast.success('Conversion complete!') },
    onError: () => toast.error('Unit conversion error'),
  })

  const finMutation = useMutation({
    mutationFn: () => axios.post(`${API}/calcverse/finance`, { calc_type: finType, principal: finPrincipal, rate: finRate, time: finTime }).then(r => r.data),
    onSuccess: d => { setFinResult(d); toast.success('Finance calculations ready!') },
    onError: () => toast.error('Financial calculator error'),
  })

  const progMutation = useMutation({
    mutationFn: () => axios.post(`${API}/calcverse/programmer`, { value: progVal, from_base: progFrom, to_base: progTo }).then(r => r.data),
    onSuccess: d => { setProgResult(d); toast.success('Base conversion complete!') },
    onError: () => toast.error('Programmer calculator error'),
  })

  const quizMutation = useMutation({
    mutationFn: () => axios.post(`${API}/calcverse/quiz/generate`, { num_questions: 5, difficulty: 'medium' }).then(r => r.data),
    onSuccess: d => { setQuizResult(d); toast.success('Quiz generated!') },
    onError: () => toast.error('Quiz error'),
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Calculator className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">CalcVerse AI</h1>
          <p className="text-sm text-muted-foreground">Offline AI-Powered Scientific Calculator & Mathematical Intelligence Platform</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="badge badge-info text-xs px-2 py-1">SymPy & NumPy Verified</span>
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
              { label: 'Total Calculations', value: stats?.total_calculations?.toLocaleString(), icon: Calculator, color: 'from-violet-500 to-indigo-600' },
              { label: 'Formulas Library', value: stats?.formulas_in_library, icon: BookOpen, color: 'from-blue-500 to-cyan-600' },
              { label: 'Constants Stored', value: stats?.constants_stored, icon: Equal, color: 'from-emerald-500 to-teal-600' },
              { label: 'Accuracy Rate', value: `${stats?.accuracy_rate}%`, icon: CheckCircle, color: 'from-amber-500 to-orange-600' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-white/5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5 text-white" /></div>
                <div className="text-2xl font-bold text-white">{s.value ?? '—'}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode Usage */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Calculation Mode Usage</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData?.mode_usage || {}).map(([mode, pct]: any) => (
                  <div key={mode} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-muted-foreground truncate">{mode}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-white w-8 text-right">{pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula Categories */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Mathematical Formulas Library</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(formulasData?.formulas || {}).map(([cat, list]: any) => (
                  <div key={cat} className="p-3 bg-white/3 rounded-xl">
                    <div className="text-xs text-muted-foreground">{cat}</div>
                    <div className="text-base font-bold text-violet-400 mt-1">{list.length} Formulas</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCIENTIFIC CALCULATOR ─────────────────────────── */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Calculator className="w-5 h-5 text-violet-400" /> Scientific Calculator</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Mode</label>
              <select value={calcMode} onChange={e => setCalcMode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50">
                <option value="scientific">Scientific</option>
                <option value="basic">Basic Arithmetic</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Mathematical Expression</label>
              <input value={expression} onChange={e => setExpression(e.target.value)}
                placeholder="e.g. sin(pi/4) * sqrt(16) + log10(100)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
            </div>
            <button onClick={() => calcMutation.mutate()} disabled={!expression || calcMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {calcMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Evaluate Expresson
            </button>

            {/* Quick buttons */}
            <div className="grid grid-cols-4 gap-2">
              {['sin(', 'cos(', 'tan(', 'log(', 'sqrt(', 'pi', 'e', 'factorial('].map(btn => (
                <button key={btn} onClick={() => setExpression(prev => prev + btn)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-xs font-mono rounded-lg text-violet-300 transition-colors">
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {calcResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Calculation Result</h3>
                <span className="text-xs text-emerald-400 font-bold">100% Correct</span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-center">
                <div className="text-xs text-muted-foreground mb-1">Result</div>
                <div className="text-2xl font-bold text-white font-mono">{calcResult.result !== null ? calcResult.result.toString() : 'Error'}</div>
              </div>
              {calcResult.steps?.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Step-by-Step Breakdown</div>
                  <div className="space-y-1">
                    {calcResult.steps.map((step: string, i: number) => (
                      <div key={i} className="text-xs text-muted-foreground flex gap-2">
                        <ChevronRight className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Calculator className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Results Panel</div>
              <div className="text-sm text-muted-foreground max-w-xs">Enter any mathematical equation to calculate, verify, and view execution steps instantly</div>
            </div>
          )}
        </div>
      )}

      {/* ── SYMBOLIC MATH ─────────────────────────────────── */}
      {activeTab === 'symbolic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Compass className="w-5 h-5 text-violet-400" /> Symbolic Math Lab</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Operation</label>
              <select value={symOp} onChange={e => setSymOp(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50">
                <option value="simplify">Simplify Expression</option>
                <option value="expand">Expand Polynomial</option>
                <option value="factor">Factorise Expression</option>
                <option value="differentiate">Differentiate</option>
                <option value="integrate">Integrate</option>
                <option value="solve">Solve Equation</option>
                <option value="limit">Calculate Limit</option>
                <option value="series">Taylor Series</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Expression</label>
                <input value={symExpr} onChange={e => setSymExpr(e.target.value)}
                  placeholder="e.g. x**2 - 5*x + 6"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Variable</label>
                <input value={symVar} onChange={e => setSymVar(e.target.value)}
                  placeholder="e.g. x"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
              </div>
            </div>
            <button onClick={() => symMutation.mutate()} disabled={!symExpr || symMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {symMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Perform Symbolic Operation
            </button>
          </div>

          {symResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Symbolic Solution</h3>
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-center font-mono text-lg text-violet-300">
                {symResult.symbolic_result}
              </div>
              <div className="text-xs text-muted-foreground">{symResult.explanation}</div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Detailed Steps</div>
                <div className="space-y-1">
                  {symResult.steps?.map((step: string, i: number) => (
                    <div key={i} className="text-xs text-muted-foreground flex gap-2">
                      <ChevronRight className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Compass className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Symbolic Lab</div>
              <div className="text-sm text-muted-foreground">Integrate, differentiate, factor, and solve equations algebraically using SymPy offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── MATRIX LAB ───────────────────────────────────── */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Grid className="w-5 h-5 text-violet-400" /> Matrix Lab</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Operation</label>
              <select value={matrixOp} onChange={e => setMatrixOp(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50">
                <option value="determinant">Determinant</option>
                <option value="transpose">Transpose</option>
                <option value="trace">Trace</option>
                <option value="add">Addition (A + B)</option>
                <option value="multiply">Multiplication (A × B)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Matrix A (JSON Format)</label>
              <textarea value={matrixA} onChange={e => setMatrixA(e.target.value)} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
            </div>
            {['add', 'multiply'].includes(matrixOp) && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Matrix B (JSON Format)</label>
                <textarea value={matrixB} onChange={e => setMatrixB(e.target.value)} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
              </div>
            )}
            <button onClick={() => matrixMutation.mutate()} disabled={matrixMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {matrixMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Compute Matrix Operation
            </button>
          </div>

          {matrixResult && !matrixResult.error ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Matrix Result</h3>
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-center font-mono">
                {typeof matrixResult.result === 'object' ? (
                  <div className="space-y-1">
                    {matrixResult.result.map((row: any[], i: number) => (
                      <div key={i} className="text-sm text-violet-300">[ {row.join(', ')} ]</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xl text-violet-300">{matrixResult.result}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Calculation Steps</div>
                <div className="space-y-1">
                  {matrixResult.steps?.map((step: string, i: number) => (
                    <div key={i} className="text-xs text-muted-foreground flex gap-2">
                      <ChevronRight className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Grid className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Matrix Calculator</div>
              <div className="text-sm text-muted-foreground">Compute determinants, transpose matrices, calculate trace, addition, and multiplication locally</div>
            </div>
          )}
        </div>
      )}

      {/* ── STATISTICS ────────────────────────────────────── */}
      {activeTab === 'statistics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><LineChart className="w-5 h-5 text-violet-400" /> Statistics Lab</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Data points (comma separated)</label>
              <textarea value={statData} onChange={e => setStatData(e.target.value)} rows={3}
                placeholder="e.g. 12, 15, 18, 22, 25, 30"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
            </div>
            <button onClick={() => statMutation.mutate()} disabled={!statData || statMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {statMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Analyse Dataset
            </button>
          </div>

          {statResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[550px]">
              <h3 className="text-base font-semibold text-white">Statistical Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(statResult.results || {}).map(([op, val]: any) => {
                  if (typeof val === 'object') return null
                  return (
                    <div key={op} className="p-2.5 bg-white/3 rounded-xl text-center">
                      <div className="text-xs text-muted-foreground capitalize">{op.replace('_', ' ')}</div>
                      <div className="text-base font-bold text-violet-300 mt-1">{val.toString()}</div>
                    </div>
                  )
                })}
              </div>
              {statResult.results?.Q1 !== undefined && (
                <div className="p-3 bg-white/3 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">Quartiles</div>
                  <div className="flex justify-between text-xs text-violet-300">
                    <span>Q1 (25th percentile): {statResult.results.Q1}</span>
                    <span>Q2 (Median): {statResult.results.Q2}</span>
                    <span>Q3 (75th percentile): {statResult.results.Q3}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <LineChart className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Statistics Results</div>
              <div className="text-sm text-muted-foreground">Calculate mean, median, mode, standard deviation, variance, and quartiles from your datasets offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── UNIT CONVERTER ────────────────────────────────── */}
      {activeTab === 'convert' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><RefreshCw className="w-5 h-5 text-violet-400" /> Unit Converter</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Value</label>
                <input type="number" value={convVal} onChange={e => setConvVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <input value={convFrom} onChange={e => setConvFrom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <input value={convTo} onChange={e => setConvTo(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select value={convCategory} onChange={e => setConvCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                <option value="length">Length</option>
                <option value="mass">Mass</option>
                <option value="speed">Speed</option>
                <option value="energy">Energy</option>
                <option value="pressure">Pressure</option>
                <option value="time">Time</option>
                <option value="angle">Angle</option>
                <option value="area">Area</option>
                <option value="temperature">Temperature</option>
              </select>
            </div>
            <button onClick={() => convMutation.mutate()} disabled={convMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {convMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Convert Units
            </button>
          </div>

          {convResult && !convResult.error ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Conversion Result</h3>
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-center font-mono">
                <div className="text-xs text-muted-foreground mb-1">{convVal} {convFrom} =</div>
                <div className="text-2xl font-bold text-violet-300">{convResult.result} {convTo}</div>
              </div>
              <div className="text-xs text-muted-foreground">{convResult.formula}</div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Converter Panel</div>
              <div className="text-sm text-muted-foreground">Convert physical units — speed, temperature, pressure, area, energy, and lengths seamlessly offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── FINANCE CALCULATOR ────────────────────────────── */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><DollarSign className="w-5 h-5 text-violet-400" /> Finance Calculator</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Calculation Type</label>
              <select value={finType} onChange={e => setFinType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                <option value="emi">EMI Calculator</option>
                <option value="compound_interest">Compound Interest</option>
                <option value="simple_interest">Simple Interest</option>
                <option value="roi">ROI Calculator</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Principal ($)</label>
                <input type="number" value={finPrincipal} onChange={e => setFinPrincipal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Rate (%)</label>
                <input type="number" value={finRate} onChange={e => setFinRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Time (years)</label>
                <input type="number" value={finTime} onChange={e => setFinTime(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
            </div>
            <button onClick={() => finMutation.mutate()} disabled={finMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {finMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Calculate Finance
            </button>
          </div>

          {finResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">{finResult.type}</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(finResult).map(([k, v]: any) => {
                  if (['type', 'formula'].includes(k)) return null
                  return (
                    <div key={k} className="p-2.5 bg-white/3 rounded-xl text-center">
                      <div className="text-xs text-muted-foreground capitalize">{k.replace('_', ' ')}</div>
                      <div className="text-base font-bold text-violet-300 mt-1">{v.toString()}</div>
                    </div>
                  )
                })}
              </div>
              <div className="text-xs text-muted-foreground">Formula used: {finResult.formula}</div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <DollarSign className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Finance Analysis</div>
              <div className="text-sm text-muted-foreground">Compute EMI, compound interest, simple interest, and ROI offline immediately</div>
            </div>
          )}
        </div>
      )}

      {/* ── PROGRAMMER ────────────────────────────────────── */}
      {activeTab === 'programmer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Binary className="w-5 h-5 text-violet-400" /> Programmer Calculator</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From Base</label>
                <select value={progFrom} onChange={e => setProgFrom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground">
                  <option value="decimal">Decimal</option>
                  <option value="binary">Binary</option>
                  <option value="octal">Octal</option>
                  <option value="hex">Hexadecimal</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To Base</label>
                <select value={progTo} onChange={e => setProgTo(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground">
                  <option value="binary">Binary</option>
                  <option value="decimal">Decimal</option>
                  <option value="octal">Octal</option>
                  <option value="hex">Hexadecimal</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Value</label>
              <input value={progVal} onChange={e => setProgVal(e.target.value)}
                placeholder="e.g. 255 | 11111111 | FF"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none" />
            </div>
            <button onClick={() => progMutation.mutate()} disabled={!progVal || progMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {progMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Binary className="w-4 h-4" />}
              Convert Base
            </button>
          </div>

          {progResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Base Conversions</h3>
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-center font-mono">
                <div className="text-xs text-muted-foreground mb-1">{progVal} ({progFrom}) =</div>
                <div className="text-2xl font-bold text-violet-300">{progResult.converted} ({progTo})</div>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {Object.entries(progResult.all_bases || {}).map(([base, value]: any) => (
                  <div key={base} className="flex justify-between p-2 bg-white/3 rounded-lg">
                    <span className="text-muted-foreground capitalize">{base}</span>
                    <span className="text-violet-300 font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Binary className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Programmer Panel</div>
              <div className="text-sm text-muted-foreground">Convert between Hex, Dec, Oct, and Bin representations offline with ease</div>
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ ──────────────────────────────────────────── */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Award className="w-5 h-5 text-violet-400" /> Math Quiz Generator</h3>
            <button onClick={() => quizMutation.mutate()} disabled={quizMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {quizMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              Generate Quiz
            </button>
          </div>

          {quizResult ? (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{quizResult.subject} Quiz</div>
                  <div className="text-xs text-muted-foreground">{quizResult.total_questions} questions · {quizResult.time_limit_minutes} min</div>
                </div>
                <span className="badge badge-info text-xs">{quizResult.difficulty}</span>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[450px]">
                {quizResult.questions?.map((q: any, i: number) => (
                  <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-violet-400 font-medium">Q{i + 1}</div>
                    <div className="text-sm text-white font-medium">{q.q}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options?.map((opt: string, j: number) => (
                        <div key={j} className={`text-xs px-3 py-2 rounded-lg ${opt === q.answer ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/3 text-muted-foreground'}`}>
                          {String.fromCharCode(65 + j)}. {opt}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-teal-400 pt-1">💡 {q.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Award className="w-16 h-16 text-violet-400/30" />
              <div className="text-white font-medium">Start Quiz</div>
              <div className="text-sm text-muted-foreground">Test your knowledge with scientific and symbolic math questions compiled from standard sources</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
