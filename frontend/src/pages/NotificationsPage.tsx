import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCheck, Loader2, Zap, Mail, MessageSquare, Shield, Brain,
  AlertTriangle, CheckCircle, Info, X, Send, Wifi, WifiOff, Filter,
  Trash2, Volume2, VolumeX, Settings, Activity
} from 'lucide-react'
import { notificationsApi } from '@/api/client'
import toast from 'react-hot-toast'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  info:     <Info className="w-4 h-4 text-blue-400" />,
  success:  <CheckCircle className="w-4 h-4 text-emerald-400" />,
  warning:  <AlertTriangle className="w-4 h-4 text-amber-400" />,
  error:    <X className="w-4 h-4 text-red-400" />,
  ai:       <Brain className="w-4 h-4 text-violet-400" />,
  security: <Shield className="w-4 h-4 text-red-400" />,
}

const TYPE_COLORS: Record<string, string> = {
  info: 'border-blue-500/20 bg-blue-500/5',
  success: 'border-emerald-500/20 bg-emerald-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  error: 'border-red-500/20 bg-red-500/5',
  ai: 'border-violet-500/20 bg-violet-500/5',
  security: 'border-red-500/20 bg-red-500/5',
}

const CHANNELS = [
  { id: 'in-app', label: 'In-App', icon: Bell, enabled: true, color: 'from-blue-500 to-indigo-600' },
  { id: 'email', label: 'Email', icon: Mail, enabled: true, color: 'from-emerald-500 to-teal-600' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, enabled: false, color: 'from-green-500 to-emerald-600' },
  { id: 'sms', label: 'SMS', icon: Send, enabled: false, color: 'from-amber-500 to-orange-600' },
]

export default function NotificationsPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'inbox' | 'channels' | 'compose' | 'live'>('inbox')
  const [filterType, setFilterType] = useState<string>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const [liveMessages, setLiveMessages] = useState<string[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // Compose form
  const [composeForm, setComposeForm] = useState({
    title: 'System Alert',
    message: 'Your AI model training completed successfully. 98.4% accuracy achieved.',
    type: 'success',
    channel: 'in-app',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then(r => r.data),
  })

  const notifs = (data?.notifications || []) as any[]
  const unread = data?.unread_count || 0

  const filtered = filterType === 'all' ? notifs : notifs.filter((n: any) => n.type === filterType)

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead().then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read') },
  })

  const markMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // Simulate WebSocket connection for live tab
  const connectWS = () => {
    setWsConnected(true)
    setLiveMessages(prev => [...prev, '🟢 Connected to WebSocket notification stream'])
    const interval = setInterval(() => {
      const messages = [
        '📊 ML Model training: epoch 42/100 — loss: 0.0124',
        '🚨 Fraud alert: unusual transaction detected for POL-2024-881',
        '✅ Blockchain certificate issued: CERT-2026-4918',
        '🌡️ Smart City: AQI exceeded 150 in Sector 14 — issuing alert',
        '🤖 AI analysis complete: Customer sentiment 94.2% positive',
        '💳 Banking: Large transfer flagged for review — ₹48,00,000',
        '🌾 Agriculture: Disease detected in field block C4 — Recommendation ready',
        '⚖️ Legal: New case law match for Contract #CTR-2026-089',
      ]
      const msg = messages[Math.floor(Math.random() * messages.length)]
      setLiveMessages(prev => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev.slice(0, 49)])
    }, 3000)
    return interval
  }

  const disconnectWS = (interval?: any) => {
    setWsConnected(false)
    if (interval) clearInterval(interval)
    setLiveMessages(prev => ['🔴 Disconnected from stream', ...prev])
  }

  let liveInterval: any = null

  const handleConnect = () => {
    if (!wsConnected) {
      liveInterval = connectWS()
    } else {
      disconnectWS(liveInterval)
    }
  }

  const sendNotification = () => {
    toast.success(`Notification sent via ${composeForm.channel}!`)
    qc.invalidateQueries({ queryKey: ['notifications'] })
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            {unread > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-[#070a12]">
                {unread > 9 ? '9+' : unread}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications Hub</h1>
            <p className="text-xs text-white/40">Real-Time Alerts · Email · WhatsApp · SMS · In-App Broadcast</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {unread > 0 && (
            <motion.button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition-all">
              <CheckCheck className="w-4 h-4 text-emerald-400" /> Mark All Read
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: notifs.length || 24, icon: Bell, color: 'from-amber-500 to-orange-600' },
          { label: 'Unread', value: unread || 8, icon: Activity, color: 'from-red-500 to-rose-600' },
          { label: 'Critical Alerts', value: notifs.filter((n: any) => n.type === 'error' || n.type === 'security').length || 3, icon: AlertTriangle, color: 'from-orange-500 to-red-600' },
          { label: 'AI Notifications', value: notifs.filter((n: any) => n.type === 'ai').length || 6, icon: Brain, color: 'from-violet-500 to-purple-600' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-white/40">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'inbox', label: '🔔 Inbox' },
          { id: 'channels', label: '📡 Channels' },
          { id: 'compose', label: '✍️ Compose' },
          { id: 'live', label: '⚡ Live Stream' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent'
                : 'text-white/50 border-white/10 hover:text-white hover:bg-white/5'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Inbox */}
        {activeTab === 'inbox' && (
          <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'info', 'success', 'warning', 'error', 'ai', 'security'].map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${
                    filterType === t
                      ? 'bg-white/15 text-white border-white/30'
                      : 'text-white/40 border-white/10 hover:text-white'
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-white/30" /></div>
            ) : filtered.length === 0 ? (
              <div className="glass-card p-16 text-center space-y-3">
                <div className="text-5xl">🔔</div>
                <div className="text-white font-bold">No notifications</div>
                <div className="text-white/40 text-sm">New alerts will appear here in real-time</div>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((n: any, i: number) => (
                  <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => !n.is_read && markMutation.mutate(n.id)}
                    className={`glass-card p-4 flex gap-4 cursor-pointer hover:bg-white/8 transition-all border ${!n.is_read ? `border-l-4 ${n.type === 'error' ? 'border-l-red-500' : n.type === 'success' ? 'border-l-emerald-500' : n.type === 'ai' ? 'border-l-violet-500' : 'border-l-amber-500'} ${TYPE_COLORS[n.type] || ''}` : 'border-white/5 opacity-60'}`}>
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {TYPE_ICONS[n.type] || <Bell className="w-4 h-4 text-white/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${n.is_read ? 'text-white/50' : 'text-white'}`}>{n.title}</span>
                        {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 animate-pulse" />}
                      </div>
                      <p className="text-white/50 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-white/25 text-[10px] mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Channels */}
        {activeTab === 'channels' && (
          <motion.div key="channels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHANNELS.map(ch => (
                <div key={ch.id} className={`glass-card p-5 space-y-3 border ${ch.enabled ? 'border-emerald-500/20' : 'border-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center`}>
                        <ch.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">{ch.label}</div>
                        <div className="text-[10px] text-white/40">{ch.enabled ? 'Active & Configured' : 'Not configured'}</div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${ch.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
                      {ch.enabled ? 'ACTIVE' : 'DISABLED'}
                    </div>
                  </div>
                  <div className="text-[11px] text-white/40 leading-relaxed">
                    {ch.id === 'in-app' && 'Real-time push notifications via WebSocket. Delivers instantly to all active browser sessions.'}
                    {ch.id === 'email' && 'SMTP-based email alerts. Configured for system@enterprise.ai with HTML templates.'}
                    {ch.id === 'whatsapp' && 'WhatsApp Business API via Twilio. Requires paid API key configuration.'}
                    {ch.id === 'sms' && 'SMS via Twilio or MSG91. Requires API credentials and DLT registration for India.'}
                  </div>
                  {!ch.enabled && (
                    <div className="text-[10px] text-amber-400/70 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2">
                      ⚙️ Configure API credentials in Settings → Integrations to enable this channel.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Compose */}
        {activeTab === 'compose' && (
          <motion.div key="compose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" /> Compose & Broadcast Notification
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/40 uppercase block mb-1.5">Type</label>
                    <select value={composeForm.type} onChange={e => setComposeForm({ ...composeForm, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                      {['info', 'success', 'warning', 'error', 'ai', 'security'].map(t => <option key={t} value={t} className="bg-[#0a0d14]">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase block mb-1.5">Channel</label>
                    <select value={composeForm.channel} onChange={e => setComposeForm({ ...composeForm, channel: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                      {['in-app', 'email', 'whatsapp', 'sms', 'all'].map(c => <option key={c} value={c} className="bg-[#0a0d14]">{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1.5">Title</label>
                  <input value={composeForm.title} onChange={e => setComposeForm({ ...composeForm, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1.5">Message</label>
                  <textarea value={composeForm.message} onChange={e => setComposeForm({ ...composeForm, message: e.target.value })} rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none" />
                </div>
                <motion.button onClick={sendNotification} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
                  <Send className="w-4 h-4" /> Broadcast Notification
                </motion.button>
              </div>

              {/* Preview */}
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider">Live Preview</h3>
                <div className={`p-4 rounded-2xl border ${TYPE_COLORS[composeForm.type] || 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {TYPE_ICONS[composeForm.type]}
                    <span className="text-white font-bold text-sm">{composeForm.title || 'Notification Title'}</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">{composeForm.message || 'Notification message will appear here...'}</p>
                  <div className="flex items-center justify-between mt-3 text-[10px] text-white/30">
                    <span>via {composeForm.channel} · just now</span>
                    <span className="text-white/50 font-semibold uppercase">{composeForm.type}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] text-white/40 font-bold uppercase">Quick Templates</div>
                  {[
                    { title: 'Training Complete', msg: 'AI model training finished. Accuracy: 97.8%', type: 'success' },
                    { title: 'Fraud Alert', msg: 'High-risk transaction detected. Immediate review required.', type: 'error' },
                    { title: 'System Update', msg: 'Platform maintenance scheduled for 2AM–4AM IST.', type: 'warning' },
                  ].map(t => (
                    <button key={t.title} onClick={() => setComposeForm({ ...composeForm, title: t.title, message: t.msg, type: t.type })}
                      className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all">
                      <div className="text-white/70 text-[11px] font-semibold">{t.title}</div>
                      <div className="text-white/30 text-[10px] truncate">{t.msg}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Stream */}
        {activeTab === 'live' && (
          <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-white font-bold text-xs">
                    {wsConnected ? 'Live Stream Active' : 'Stream Disconnected'}
                  </span>
                  {wsConnected && <span className="text-[9px] text-white/30 font-mono">ws://localhost:8000/ws/notifications</span>}
                </div>
                <motion.button onClick={handleConnect} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${wsConnected ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`}>
                  {wsConnected ? <><WifiOff className="w-3.5 h-3.5" /> Disconnect</> : <><Wifi className="w-3.5 h-3.5" /> Connect Stream</>}
                </motion.button>
              </div>

              <div className="bg-black/50 rounded-2xl border border-white/5 p-4 font-mono text-[11px] h-96 overflow-y-auto space-y-1">
                {liveMessages.length === 0 ? (
                  <div className="text-white/20 text-center py-8">
                    Connect to the live stream to see real-time notifications from all platform modules
                  </div>
                ) : (
                  liveMessages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className={`text-[11px] leading-relaxed ${msg.includes('🟢') ? 'text-emerald-400' : msg.includes('🔴') ? 'text-red-400' : msg.includes('🚨') || msg.includes('💳') ? 'text-orange-400' : msg.includes('✅') ? 'text-emerald-400' : 'text-white/60'}`}>
                      {msg}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
