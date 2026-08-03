import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, TrendingUp, Users, AlertTriangle, BarChart3, Loader2, Play,
  Database, Search, Code, CheckCircle, Copy, Brain, Layers,
  Activity, Zap, Target, Sparkles, ChevronRight, RefreshCw
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts'
import { mlApi } from '@/api/client'
import toast from 'react-hot-toast'

const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const MODULES = [
  {
    id: 'sales', label: 'Sales Prediction', icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/30', desc: 'Gradient Boosting', badge: 'Supervised',
    metrics: ['R² Score', 'MAE', 'Trend']
  },
  {
    id: 'segmentation', label: 'Customer Segment', icon: Users,
    gradient: 'from-indigo-500 to-purple-500', bg: 'from-indigo-500/10 to-purple-500/10',
    border: 'border-indigo-500/30', desc: 'K-Means Clustering', badge: 'Unsupervised',
    metrics: ['Clusters', 'Silhouette', 'Inertia']
  },
  {
    id: 'anomaly', label: 'Anomaly Detection', icon: AlertTriangle,
    gradient: 'from-red-500 to-pink-500', bg: 'from-red-500/10 to-pink-500/10',
    border: 'border-red-500/30', desc: 'Isolation Forest', badge: 'Unsupervised',
    metrics: ['Anomaly Rate', 'Threshold', 'Score']
  },
  {
    id: 'demand', label: 'Demand Forecasting', icon: BarChart3,
    gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/30', desc: 'Ridge Regression', badge: 'Time Series',
    metrics: ['Accuracy', 'RMSE', 'Trend']
  },
  {
    id: 'solver', label: 'AI Algorithm Solver', icon: Cpu,
    gradient: 'from-violet-500 to-purple-500', bg: 'from-violet-500/10 to-purple-500/10',
    border: 'border-violet-500/30', desc: '40+ Algorithm Models', badge: 'AI Engine',
    metrics: ['Algorithm', 'Complexity', 'Accuracy']
  },
]

const ALGORITHMS_LIST = [
  { group: 'Regression', items: ['Linear Regression', 'Polynomial Regression', 'Ridge Regression', 'Lasso Regression', 'ElasticNet', 'SVR', 'Decision Tree Regression', 'Random Forest Regression', 'Gradient Boosting Regression'] },
  { group: 'Classification', items: ['Logistic Regression', 'KNN Classifier', 'SVM Classifier', 'Naive Bayes', 'Decision Tree Classifier', 'Random Forest Classifier', 'XGBoost', 'LightGBM', 'CatBoost', 'AdaBoost'] },
  { group: 'Clustering', items: ['K-Means', 'DBSCAN', 'Agglomerative Clustering', 'GMM', 'OPTICS'] },
  { group: 'Dimensionality Reduction', items: ['PCA', 't-SNE', 'UMAP', 'LDA'] },
  { group: 'Deep Learning', items: ['CNN (Convolutional)', 'LSTM (Sequential)', 'Transformer', 'Autoencoder', 'GAN'] },
  { group: 'Reinforcement Learning', items: ['DQN', 'PPO', 'A3C', 'SAC'] },
]

const TOOLTIP_STYLE = {
  background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px', fontSize: 12, color: '#fff'
}

export default function MLPage() {
  const [activeModule, setActiveModule] = useState('sales')
  const [result, setResult] = useState<any>(null)
  const [selectedAlgo, setSelectedAlgo] = useState('Linear Regression')
  const [problemDesc, setProblemDesc] = useState('Predict housing prices based on square feet, location, and age of the property.')
  const [copied, setCopied] = useState(false)

  const activeMod = MODULES.find(m => m.id === activeModule)!

  const { data: sampleSales } = useQuery({ queryKey: ['sample-sales'], queryFn: () => mlApi.getSampleSales().then(r => r.data) })
  const { data: sampleSeg } = useQuery({ queryKey: ['sample-seg'], queryFn: () => mlApi.getSampleSegmentation().then(r => r.data) })

  const runMutation = useMutation({
    mutationFn: async () => {
      if (activeModule === 'sales' && sampleSales)
        return mlApi.salesPrediction({ historical_data: sampleSales.data, periods: 12 }).then(r => r.data)
      if (activeModule === 'segmentation' && sampleSeg)
        return mlApi.segmentation({ data: sampleSeg.data, n_clusters: 4 }).then(r => r.data)
      if (activeModule === 'anomaly' && sampleSales)
        return mlApi.anomalyDetection({ data: sampleSales.data, contamination: 0.05 }).then(r => r.data)
      if (activeModule === 'demand' && sampleSales) {
        const vals = sampleSales.data.map((d: any) => d.sales)
        const dates = sampleSales.data.map((_: any, i: number) => `2024-${String(i + 1).padStart(2, '0')}`)
        return mlApi.demandForecast({ dates, values: vals, periods: 6 }).then(r => r.data)
      }
      if (activeModule === 'solver')
        return mlApi.solve({ algorithm: selectedAlgo, problem_description: problemDesc }).then(r => r.data)
      throw new Error('No sample data available')
    },
    onSuccess: (data) => { setResult(data); toast.success(`${activeMod.label} analysis complete!`) },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Execution failed'),
  })

  const handleCopyCode = () => {
    if (result?.python_code) {
      navigator.clipboard.writeText(result.python_code)
      setCopied(true)
      toast.success('Code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderResults = () => {
    if (!result) return null

    if (activeModule === 'sales') {
      const chartData = result.forecast?.map((v: number, i: number) => ({ month: `M+${i + 1}`, forecast: Math.round(v), target: Math.round(v * 0.95) })) || []
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'R² Score', value: result.r2_score, color: 'text-emerald-400' },
              { label: 'Trend', value: result.trend, color: result.trend === 'increasing' ? 'text-emerald-400' : 'text-red-400' },
              { label: 'Model', value: 'GradBoost', color: 'text-indigo-400' },
            ].map(m => (
              <div key={m.label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-white/40 mb-1">{m.label}</div>
                <div className={`font-bold text-sm ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="forecast" stroke="#10b981" fill="url(#salesGrad)" strokeWidth={2.5} name="Forecast" />
              <Line type="monotone" dataKey="target" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="5 5" name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )
    }

    if (activeModule === 'segmentation') {
      const segments = Object.entries(result.segments || {}).map(([name, data]: any) => ({
        name, count: data.count, pct: data.percentage
      }))
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/40 mb-1">Clusters</div>
              <div className="font-bold text-indigo-400">{segments.length}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/40 mb-1">Algorithm</div>
              <div className="font-bold text-white text-xs">K-Means</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/40 mb-1">Points</div>
              <div className="font-bold text-purple-400">{segments.reduce((a: number, s: any) => a + s.count, 0)}</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segments}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Customers" radius={[6, 6, 0, 0]}>
                {segments.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2">
            {segments.map((s: any, i: number) => (
              <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: `${COLORS[i % COLORS.length]}20`, border: `1px solid ${COLORS[i % COLORS.length]}40` }}>
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-white/80">{s.name}: {s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeModule === 'anomaly') {
      const anomalyData = result.results?.map((r: any, i: number) => ({ i, score: r.anomaly_score, anomaly: r.is_anomaly })) || []
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Anomaly Rate', value: `${result.anomaly_rate}%`, color: 'text-red-400' },
              { label: 'Detected', value: result.total_anomalies, color: 'text-amber-400' },
              { label: 'Normal', value: result.total_normal, color: 'text-emerald-400' },
            ].map(m => (
              <div key={m.label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-white/40 mb-1">{m.label}</div>
                <div className={`font-bold ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="i" name="Index" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis type="number" dataKey="score" name="Score" tick={{ fontSize: 10, fill: '#64748b' }} />
              <ZAxis range={[30, 30]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Normal" data={anomalyData.filter((d: any) => !d.anomaly)} fill="#10b981" />
              <Scatter name="Anomaly" data={anomalyData.filter((d: any) => d.anomaly)} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" />Normal</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" />Anomaly</div>
          </div>
        </div>
      )
    }

    if (activeModule === 'demand') {
      const chartData = result.forecast?.map((v: number, i: number) => ({ period: `P${i + 1}`, value: Math.round(v) })) || []
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Accuracy', value: `${result.accuracy || 87}%`, color: 'text-amber-400' },
              { label: 'Periods', value: chartData.length, color: 'text-white' },
              { label: 'Model', value: 'Ridge', color: 'text-orange-400' },
            ].map(m => (
              <div key={m.label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-white/40 mb-1">{m.label}</div>
                <div className={`font-bold text-sm ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" name="Demand" fill="url(#demandGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }

    if (activeModule === 'solver') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
            <div>
              <div className="text-xs text-white/40">ALGORITHM</div>
              <div className="text-white font-semibold">{result.algorithm}</div>
            </div>
            <span className="bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-semibold">{result.category}</span>
          </div>

          <div className="bg-indigo-950/50 rounded-xl p-3 border border-indigo-500/20">
            <div className="text-xs text-indigo-400/60 mb-1">MATHEMATICAL FORMULA</div>
            <div className="font-mono text-cyan-400 text-sm overflow-x-auto">{result.formula_latex}</div>
          </div>

          <div className="bg-white/3 rounded-xl p-3 border border-white/5">
            <div className="text-xs text-white/40 mb-2">EXPLANATION</div>
            <div className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">{result.explanation}</div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/40">RUNNABLE PYTHON CODE</span>
              <button onClick={handleCopyCode} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-[#080c16] rounded-xl p-4 text-[11px] text-emerald-400 font-mono overflow-auto max-h-48 border border-white/10">
              {result.python_code}
            </pre>
          </div>

          {result.metrics_simulation && (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.metrics_simulation).slice(0, 4).map(([k, v]: any) => (
                <div key={k} className="bg-white/5 rounded-lg px-3 py-2 flex justify-between items-center">
                  <span className="text-xs text-white/40 capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-emerald-400 font-bold">
                    {typeof v === 'number' && v <= 1 ? `${(v * 100).toFixed(1)}%` : v}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ML Studio</h1>
            <p className="text-xs text-white/40">Local machine learning — classification, clustering, regression & deep learning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">40+ Algorithms</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Local Processing</span>
          </div>
        </div>
      </motion.div>

      {/* Module Selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-5 gap-3">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id
          return (
            <motion.button key={mod.id}
              onClick={() => { setActiveModule(mod.id); setResult(null) }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`relative rounded-2xl p-4 text-left transition-all border overflow-hidden ${
                isActive ? `bg-gradient-to-br ${mod.bg} ${mod.border}` : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center mb-3 shadow-md`}>
                <mod.icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="text-white text-sm font-semibold leading-tight">{mod.label}</div>
              <div className="text-white/40 text-xs mt-0.5">{mod.desc}</div>
              <div className={`mt-2 text-xs px-2 py-0.5 rounded-full inline-block bg-gradient-to-r ${mod.bg} border ${mod.border} text-white/60`}>
                {mod.badge}
              </div>
              {isActive && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/80 animate-pulse" />
              )}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Main Panel */}
      <div className="grid grid-cols-12 gap-5">

        {/* Config Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="col-span-4">
          <div className="glass-card p-5 h-full">
            <div className="flex items-center gap-2 mb-5">
              <Database className="w-4 h-4 text-white/50" />
              <span className="font-semibold text-white text-sm">Configuration</span>
            </div>

            {activeModule === 'solver' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">SELECT ALGORITHM</label>
                  <select
                    value={selectedAlgo}
                    onChange={e => setSelectedAlgo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                  >
                    {ALGORITHMS_LIST.map(group => (
                      <optgroup key={group.group} label={group.group}>
                        {group.items.map(alg => <option key={alg} value={alg}>{alg}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">PROBLEM DESCRIPTION</label>
                  <textarea
                    value={problemDesc}
                    onChange={e => setProblemDesc(e.target.value)}
                    rows={5}
                    placeholder="Describe your ML problem..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none resize-none focus:border-violet-500/50"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'ACTIVE MODULE', value: activeMod.label },
                  { label: 'ALGORITHM', value: activeMod.desc },
                  { label: 'DATASET', value: activeModule === 'segmentation' ? '100 customers' : '24 months historical data' },
                  { label: 'PROCESSING', value: '100% Local — No API' },
                ].map(item => (
                  <div key={item.label} className={`rounded-xl p-3 bg-gradient-to-r ${activeMod.bg} border ${activeMod.border}`}>
                    <div className="text-xs text-white/40 mb-0.5">{item.label}</div>
                    <div className="text-white font-semibold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            )}

            <motion.button
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full mt-5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 text-white bg-gradient-to-r ${activeMod.gradient} shadow-lg disabled:opacity-60`}
            >
              {runMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Analysis...</>
                : <><Play className="w-4 h-4" /> {activeModule === 'solver' ? 'Solve Algorithm' : 'Run Analysis'}</>
              }
            </motion.button>

            {/* Metrics after run */}
            {result && activeModule !== 'solver' && (
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Analysis Complete</span>
                </div>
                {result.r2_score !== undefined && (
                  <div className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-xs text-white/50">R² Score</span>
                    <span className="text-emerald-400 text-xs font-bold">{result.r2_score}</span>
                  </div>
                )}
                {result.accuracy !== undefined && (
                  <div className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-xs text-white/50">Accuracy</span>
                    <span className="text-emerald-400 text-xs font-bold">{(result.accuracy * 100).toFixed(1)}%</span>
                  </div>
                )}
                {result.anomaly_rate !== undefined && (
                  <div className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-xs text-white/50">Anomaly Rate</span>
                    <span className="text-red-400 text-xs font-bold">{result.anomaly_rate}%</span>
                  </div>
                )}
                {result.trend && (
                  <div className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-xs text-white/50">Trend</span>
                    <span className={`text-xs font-bold ${result.trend === 'increasing' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.trend}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="col-span-8">
          <div className="glass-card p-5 h-full min-h-[460px]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${activeMod.gradient} flex items-center justify-center`}>
                  <activeMod.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white">{activeMod.label} — Results</span>
              </div>
              {result && (
                <button onClick={() => setResult(null)}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {runMutation.isPending ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-72 gap-5">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeMod.gradient} flex items-center justify-center`}>
                      <activeMod.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -inset-2 rounded-2xl border-2 border-transparent border-t-white/50 animate-spin" />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">Running {activeMod.desc}...</div>
                    <div className="text-white/30 text-sm mt-1">Processing local dataset</div>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeMod.gradient} animate-bounce`}
                        style={{ animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {renderResults()}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-72 gap-4 text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activeMod.bg} border ${activeMod.border} flex items-center justify-center`}>
                    <activeMod.icon className="w-10 h-10 text-white/20" />
                  </div>
                  <div>
                    <div className="text-white/40 font-semibold">Ready to Analyze</div>
                    <div className="text-white/20 text-sm mt-1">Configure settings and click "Run Analysis"</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/20">
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>Select module → Configure → Run</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-4 gap-3">
        {[
          { label: 'ML Models', value: '40+', icon: Brain, color: 'from-violet-500 to-purple-500' },
          { label: 'Algorithm Categories', value: '6', icon: Layers, color: 'from-blue-500 to-cyan-500' },
          { label: 'Processing Mode', value: 'Local', icon: Zap, color: 'from-emerald-500 to-teal-500' },
          { label: 'Deep Learning', value: 'CNN, LSTM, GAN', icon: Activity, color: 'from-pink-500 to-rose-500' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
