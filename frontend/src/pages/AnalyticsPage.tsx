import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart2, TrendingUp, Users, Brain, Activity,
  BarChart3, PieChart as PieIcon, Layers
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { analyticsApi } from '@/api/client'

const COLORS = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#ef4444']

export default function AnalyticsPage() {
  const { data: dashboard } = useQuery({ queryKey: ['analytics-dashboard'], queryFn: () => analyticsApi.getDashboard().then(r => r.data) })
  const { data: aiUsage }   = useQuery({ queryKey: ['ai-usage'], queryFn: () => analyticsApi.getAIUsage(14).then(r => r.data) })
  const { data: mlPerf }    = useQuery({ queryKey: ['ml-performance'], queryFn: () => analyticsApi.getMLPerformance().then(r => r.data) })

  const daily    = dashboard?.daily_activity || []
  const models   = dashboard?.model_usage || []
  const depts    = dashboard?.departments || []
  const aiData   = aiUsage?.usage || []
  const mlModels = mlPerf?.models || []

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time platform metrics and business intelligence</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',     value: dashboard?.kpis?.total_users ?? 0,      icon: Users,    color: 'from-indigo-600 to-purple-600' },
          { label: 'AI Messages',     value: dashboard?.kpis?.total_messages ?? 0,   icon: Brain,    color: 'from-purple-600 to-pink-600' },
          { label: 'RAG Queries',     value: dashboard?.top_metrics?.rag_queries_today ?? 0, icon: Activity, color: 'from-blue-600 to-cyan-600' },
          { label: 'Active Projects', value: dashboard?.top_metrics?.active_projects ?? 0,   icon: Layers,   color: 'from-emerald-600 to-teal-600' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="kpi-card">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-4`}>
              <k.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold text-white">{k.value.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 30-day activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Platform Activity — Last 30 Days</h3>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={daily}>
              <defs>
                {['chats','documents','users'].map((key, i) => (
                  <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="chats" name="AI Chats" stroke={COLORS[0]} fill="url(#grad_chats)" strokeWidth={2} />
              <Area type="monotone" dataKey="documents" name="Documents" stroke={COLORS[2]} fill="url(#grad_documents)" strokeWidth={2} />
              <Area type="monotone" dataKey="users" name="Active Users" stroke={COLORS[3]} fill="url(#grad_users)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Usage by model */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">AI Model Usage</h3>
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={models}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="model" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="usage" name="Queries" radius={[4, 4, 0, 0]}>
                {models.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Department Analytics</h3>
            <PieIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={depts} dataKey="ai_usage" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {depts.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ML Model Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" /> ML Model Performance
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mlModels.map((m: any) => (
            <div key={m.name} className="glass rounded-xl p-4">
              <div className="text-white text-sm font-semibold mb-1">{m.name}</div>
              <div className="text-muted-foreground text-xs mb-3">{m.algorithm}</div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Accuracy</span>
                <span className="text-emerald-400 text-sm font-bold">{(m.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${m.accuracy * 100}%` }} />
              </div>
              <div className="text-muted-foreground text-xs mt-2">{m.predictions.toLocaleString()} predictions</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Live Blockchain Audit Trail */}
      {dashboard?.recent_blockchain_events?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> Live Blockchain Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground">
                  <th className="py-2">Index</th>
                  <th>Block Hash</th>
                  <th>Action / Event</th>
                  <th>User / Committer</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_blockchain_events.map((b: any) => (
                  <tr key={b.index} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-2 text-cyan-400 font-mono">Block #{b.index}</td>
                    <td className="text-muted-foreground font-mono truncate max-w-[120px]">{b.hash}</td>
                    <td className="text-white font-medium">{b.description}</td>
                    <td className="text-muted-foreground">{b.issuer || 'System'}</td>
                    <td className="text-muted-foreground">{b.timestamp ? new Date(b.timestamp).toLocaleString() : 'N/A'}</td>
                    <td><span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">On-Chain</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
