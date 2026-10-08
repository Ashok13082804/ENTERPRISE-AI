import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users, FileText, MessageSquare, TrendingUp, Brain, Shield, Cpu, Link2,
  Activity, ArrowUpRight, ArrowDownRight, Zap, BarChart3, Database, Eye, Wand2, Gamepad2
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { analyticsApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'

const CARD_COLORS = [
  { gradient: 'from-indigo-600 to-purple-600', icon: Users,       glow: 'neon-indigo' },
  { gradient: 'from-emerald-600 to-teal-600',  icon: FileText,     glow: 'neon-emerald' },
  { gradient: 'from-purple-600 to-pink-600',   icon: MessageSquare, glow: 'neon-purple' },
  { gradient: 'from-blue-600 to-cyan-600',     icon: TrendingUp,   glow: 'neon-cyan' },
]

const MODULES = [
  { icon: Wand2,    label: 'AI Studio',      value: '30 Categories', color: 'text-violet-400', path: '/image-studio' },
  { icon: Brain,    label: 'AI Chat',        value: 'Llama3',    color: 'text-indigo-400', path: '/chat' },
  { icon: Database, label: 'RAG Pipeline',   value: 'ChromaDB',  color: 'text-blue-400',   path: '/rag' },
  { icon: Cpu,      label: 'ML Studio',      value: '6 Models',  color: 'text-amber-400',  path: '/ml' },
  { icon: Eye,      label: 'Vision AI',      value: 'OpenCV',    color: 'text-pink-400',   path: '/vision' },
  { icon: Gamepad2, label: '432 Game Hub',   value: '432 Games', color: 'text-rose-400',   path: '/game-hub' },
  { icon: Link2,    label: 'Blockchain',     value: 'Local',     color: 'text-cyan-400',   path: '/blockchain' },
  { icon: Shield,   label: 'Security',       value: 'JWT+AES',   color: 'text-red-400',    path: '/security' },
]

const PIE_COLORS = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b']

export default function DashboardHome() {
  const { user } = useAuthStore()
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsApi.getDashboard().then(r => r.data),
    staleTime: 60_000,
  })

  const kpis = analytics?.kpis || {}
  const dailyActivity = analytics?.daily_activity || []
  const modelUsage = analytics?.model_usage || []
  const departments = analytics?.departments || []

  const KPI_CARDS = [
    { label: 'Total Users',      value: kpis.total_users ?? '—',     delta: '+12%', up: true },
    { label: 'Documents',        value: kpis.total_documents ?? '—', delta: '+28%', up: true },
    { label: 'AI Messages',      value: kpis.total_messages ?? '—',  delta: '+45%', up: true },
    { label: 'AI Response Time', value: kpis.avg_response_time ?? '1.2s', delta: '-8%', up: false },
  ]

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
          <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your AI platform today.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => {
          const C = CARD_COLORS[i]
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="kpi-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${C.gradient} flex items-center justify-center ${C.glow}`}>
                  <C.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? 'metric-up' : 'metric-down'}`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.delta}
                </span>
              </div>
              <div className="text-3xl font-bold text-white">{kpi.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{kpi.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Platform Activity</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Last 30 days</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyActivity.slice(-14)}>
              <defs>
                <linearGradient id="gradChat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDocs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 12 }} />
              <Area type="monotone" dataKey="chats" name="AI Chats" stroke="#6366f1" fill="url(#gradChat)" strokeWidth={2} />
              <Area type="monotone" dataKey="documents" name="Documents" stroke="#10b981" fill="url(#gradDocs)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Model Usage Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">AI Model Usage</h3>
              <p className="text-muted-foreground text-xs mt-0.5">By queries</p>
            </div>
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={modelUsage} dataKey="usage" nameKey="model" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                {modelUsage.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {modelUsage.map((m: any, i: number) => (
              <div key={m.model} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground capitalize">{m.model}</span>
                </div>
                <span className="text-white font-medium">{m.usage}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modules Grid + Dept Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Module Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> Quick Access
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MODULES.map((mod) => (
              <a
                key={mod.label}
                href={mod.path}
                className="glass rounded-xl p-3 hover:bg-white/10 transition-all group cursor-pointer"
              >
                <mod.icon className={`w-5 h-5 ${mod.color} mb-2 group-hover:scale-110 transition-transform`} />
                <div className="text-white text-xs font-semibold">{mod.label}</div>
                <div className="text-muted-foreground text-[10px]">{mod.value}</div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Department Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Department AI Usage</h3>
              <p className="text-muted-foreground text-xs">Queries per department</p>
            </div>
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={departments} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={70} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="ai_usage" name="AI Queries" radius={[0, 4, 4, 0]}>
                {departments.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* System status bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-4 flex flex-wrap items-center gap-4"
      >
        <span className="text-muted-foreground text-xs font-medium">SYSTEM STATUS</span>
        {[
          { label: 'FastAPI Backend', status: 'operational' },
          { label: 'Ollama AI',       status: 'check' },
          { label: 'ChromaDB RAG',    status: 'operational' },
          { label: 'SQLite DB',       status: 'operational' },
          { label: 'Blockchain',      status: 'operational' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'operational' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">
          🚀 <span className="text-indigo-400">Start Ollama:</span> <code className="text-emerald-400 font-mono">ollama serve</code>
        </div>
      </motion.div>
    </div>
  )
}
