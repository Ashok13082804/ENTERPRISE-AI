import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText, Pin, Star, Brain, Clock, BarChart3, Tag,
  TrendingUp, Edit3, Plus, ArrowRight, Zap, Calendar,
  BookOpen, Sparkles, Target
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { notesApi, tagsApi } from '@/api/client'

const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b']

export default function NotesDashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['notes-stats'],
    queryFn: () => notesApi.stats().then(r => r.data),
    staleTime: 60_000,
  })

  const { data: tagCloud } = useQuery({
    queryKey: ['tag-cloud'],
    queryFn: () => tagsApi.cloud().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => notesApi.create({ title: 'Untitled Note', content: '' }).then(r => r.data),
    onSuccess: (note: any) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      navigate(`/notes/${note.id}`)
    },
  })

  const KPICard = ({ icon: Icon, label, value, color, gradient, glow, onClick }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      onClick={onClick}
      className={`kpi-card cursor-pointer ${glow}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center ${glow}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-white">{isLoading ? '—' : value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  )

  const recentNotes = stats?.recent_notes || []
  const topTags = (tagCloud || []).slice(0, 8)

  // Fake weekly writing data for visualization
  const weeklyData = [
    { day: 'Mon', words: 320, notes: 2 },
    { day: 'Tue', words: 540, notes: 3 },
    { day: 'Wed', words: 280, notes: 1 },
    { day: 'Thu', words: 890, notes: 5 },
    { day: 'Fri', words: 420, notes: 3 },
    { day: 'Sat', words: 650, notes: 4 },
    { day: 'Sun', words: 180, notes: 1 },
  ]

  const pieData = [
    { name: 'AI Notes', value: stats?.ai_notes || 0 },
    { name: 'Pinned', value: stats?.pinned_notes || 0 },
    { name: 'Favorites', value: stats?.favorite_notes || 0 },
    { name: 'Archived', value: stats?.archived_notes || 0 },
  ].filter(d => d.value > 0)

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Notes <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your personal knowledge base overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notes')}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> All Notes
          </button>
          <button
            onClick={() => createMutation.mutate()}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={FileText} label="Total Notes" value={stats?.total_notes || 0} gradient="from-indigo-600 to-purple-600" glow="neon-indigo" onClick={() => navigate('/notes')} />
        <KPICard icon={Brain} label="AI Generated" value={stats?.ai_notes || 0} gradient="from-purple-600 to-pink-600" glow="neon-purple" />
        <KPICard icon={BookOpen} label="Total Words" value={stats?.total_words?.toLocaleString() || 0} gradient="from-cyan-600 to-blue-600" glow="neon-cyan" />
        <KPICard icon={Clock} label="Avg Read Time" value={`${stats?.avg_reading_time || 0}m`} gradient="from-emerald-600 to-teal-600" glow="neon-emerald" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Writing Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Writing Activity</h3>
              <p className="text-muted-foreground text-xs mt-0.5">This week</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="gWords" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 12 }} />
              <Area type="monotone" dataKey="words" name="Words Written" stroke="#6366f1" fill="url(#gWords)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Notes Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Notes Breakdown</h3>
              <p className="text-muted-foreground text-xs">By category</p>
            </div>
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="text-white font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-xs">No data yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent Notes + Tag Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-400" /> Recent Notes
            </h3>
            <button onClick={() => navigate('/notes')} className="text-xs text-muted-foreground hover:text-indigo-400 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentNotes.length === 0 ? (
              <p className="text-muted-foreground text-xs text-center py-8">No notes yet. Create your first note!</p>
            ) : recentNotes.map((note: any) => (
              <button
                key={note.id}
                onClick={() => navigate(`/notes/${note.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  note.color !== 'default' ? `bg-${note.color}-500/20` : 'bg-white/5'
                }`}>
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{note.title || 'Untitled'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(note.updated_at).toLocaleDateString()}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tag Cloud + Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" /> Tag Cloud
            </h3>
          </div>
          {topTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topTags.map((t: any, i: number) => (
                <button
                  key={t.name}
                  onClick={() => navigate(`/notes?tag=${t.name}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
                  style={{
                    background: `${COLORS[i % COLORS.length]}20`,
                    color: COLORS[i % COLORS.length],
                    border: `1px solid ${COLORS[i % COLORS.length]}40`,
                    fontSize: `${Math.max(10, Math.min(14, 10 + t.count))}px`,
                  }}
                >
                  #{t.name}
                  <span className="opacity-60">({t.count})</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs text-center py-8">Add tags to your notes to see the cloud</p>
          )}

          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
            {[
              { icon: Pin, label: 'Pinned', value: stats?.pinned_notes, color: 'text-yellow-400' },
              { icon: Star, label: 'Favorites', value: stats?.favorite_notes, color: 'text-amber-400' },
              { icon: Calendar, label: 'Today', value: stats?.today_notes, color: 'text-emerald-400' },
              { icon: Sparkles, label: 'AI Notes', value: stats?.ai_notes, color: 'text-purple-400' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <div>
                  <div className="text-sm font-bold text-white">{isLoading ? '—' : stat.value || 0}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '📝 New Note', action: () => createMutation.mutate(), primary: true },
            { label: '⭐ Favorites', action: () => navigate('/notes?filter=favorites') },
            { label: '📌 Pinned', action: () => navigate('/notes?filter=pinned') },
            { label: '🤖 AI Chat', action: () => navigate('/chat') },
            { label: '📄 RAG Docs', action: () => navigate('/rag') },
            { label: '🗄️ Archived', action: () => navigate('/notes?filter=archived') },
            { label: '🗑️ Trash', action: () => navigate('/notes?filter=trash') },
            { label: '📊 Analytics', action: () => navigate('/analytics') },
          ].map(action => (
            <button
              key={action.label}
              onClick={action.action}
              className={`${action.primary ? 'btn-primary' : 'btn-secondary'} text-xs py-2.5 text-center`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
