import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, User, Shield, Brain, Zap, Globe, ChevronRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'

const ROLES = [
  { id: 'admin',    label: 'Admin',    icon: Shield, color: 'from-red-500 to-pink-500',    demo: { email: 'admin@enterprise.ai',    pass: 'Admin@123' } },
  { id: 'manager',  label: 'Manager',  icon: User,   color: 'from-amber-500 to-orange-500', demo: { email: 'manager@enterprise.ai',  pass: 'Manager@123' } },
  { id: 'employee', label: 'Employee', icon: Globe,  color: 'from-emerald-500 to-teal-500', demo: { email: 'employee@enterprise.ai', pass: 'Employee@123' } },
  { id: 'guest',    label: 'Guest',    icon: Zap,    color: 'from-blue-500 to-cyan-500',    demo: { email: 'guest@enterprise.ai',    pass: 'Guest@123' } },
]

const FEATURES = [
  { icon: Brain,  label: 'Local AI',        desc: 'Ollama powered LLMs' },
  { icon: Shield, label: 'Zero Cloud',      desc: '100% offline operation' },
  { icon: Zap,    label: 'RAG Pipeline',    desc: 'Document intelligence' },
  { icon: Globe,  label: 'ML & Analytics',  desc: 'Predictive insights' },
]

const FloatingOrb = ({ className }: { className?: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
  />
)

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [remember, setRemember]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [activeRole, setActiveRole] = useState<string | null>(null)

  // Particle canvas
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width)  p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${p.opacity})`
        ctx.fill()
      })
      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - d / 100)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Enter email and password'); return }
    setLoading(true)
    try {
      const res = await authApi.login(email, password, remember)
      const { access_token, refresh_token, user } = res.data
      setAuth(access_token, refresh_token, user)
      toast.success(`Welcome back, ${user.full_name}! 🎉`)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (roleId: string) => {
    const role = ROLES.find(r => r.id === roleId)
    if (role) {
      setEmail(role.demo.email)
      setPassword(role.demo.pass)
      setActiveRole(roleId)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex overflow-hidden relative">
      {/* Animated background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <FloatingOrb className="w-96 h-96 bg-indigo-600 top-[-10%] left-[-10%]" />
      <FloatingOrb className="w-80 h-80 bg-purple-600 bottom-[-5%] right-[-5%]" />
      <FloatingOrb className="w-64 h-64 bg-cyan-600 top-1/2 left-1/3" />

      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center neon-indigo">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">Enterprise AI</div>
            <div className="text-indigo-400 text-xs">Unified Intelligence Platform</div>
          </div>
        </div>

        {/* Hero text */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-5xl font-black leading-tight text-white">
              The Future of<br />
              <span className="gradient-text">Enterprise AI</span><br />
              is Offline.
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-md">
              A 100% offline, all-in-one AI platform combining LLMs, RAG, Computer Vision, ML, Blockchain, and Analytics — powered entirely by local models.
            </p>
          </motion.div>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-all cursor-default"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{f.label}</div>
                  <div className="text-slate-500 text-xs">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {[['15+', 'AI Modules'], ['0', 'Cloud APIs'], ['100%', 'Offline']].map(([val, label]) => (
              <div key={label}>
                <div className="text-3xl font-black gradient-text">{val}</div>
                <div className="text-slate-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-slate-600 text-sm">
          © 2024 Enterprise AI Platform · Built for Final Year Project
        </div>
      </motion.div>

      {/* Right panel — login form */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center p-6 relative z-10"
      >
        <div className="w-full max-w-md">
          <div className="glass-card p-8 gradient-border">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-indigo-400 text-xs font-medium">All systems operational</span>
              </div>
              <h2 className="text-3xl font-bold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to your Enterprise AI workspace</p>
            </div>

            {/* Quick role login */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2 font-medium">QUICK DEMO LOGIN</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(role => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fillDemoCredentials(role.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-sm font-medium ${
                      activeRole === role.id
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                        : 'border-white/5 hover:border-white/20 bg-white/3 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                      <role.icon className="w-3 h-3 text-white" />
                    </div>
                    {role.label}
                    {activeRole === role.id && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-xs text-slate-500 bg-[#0d1520] px-3">OR SIGN IN MANUALLY</div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">EMAIL OR USERNAME</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@enterprise.ai"
                    className="enterprise-input pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="enterprise-input pl-10 pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <span className="text-sm text-slate-400">Remember me</span>
                </label>
                <button type="button" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Sign In Securely</>
                )}
              </motion.button>
            </form>

            {/* Security badges */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" />JWT Secured</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" />AES Encrypted</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />100% Offline</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
