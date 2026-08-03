import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, LayoutDashboard, MessageSquare, Database, FileText, BarChart2,
  Cpu, Eye, Link2, Languages, FolderKanban, CheckSquare, Users, Shield,
  Bell, Settings, LogOut, Search, Menu, X, Zap, Sun, Moon, Bot,
  Heart, Scale, Briefcase, Banknote, Building2, GraduationCap, Sprout,
  ShoppingCart, Vote, AlertTriangle, Globe, ChevronDown, GitMerge,
  Calculator, Atom, FlaskConical, Code2, Leaf, Compass, Lock,
  StickyNote, Star, Pin, Archive, Trash2, FolderOpen, Tag, Bookmark
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface NavItem {
  icon: any
  label: string
  path: string
  color: string
}

interface NavGroup {
  groupLabel: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: 'Smart Notes',
    items: [
      { icon: StickyNote,      label: 'All Notes',        path: '/notes',              color: 'text-indigo-400' },
      { icon: LayoutDashboard, label: 'Notes Dashboard',  path: '/notes/dashboard',    color: 'text-purple-400' },
      { icon: Brain,           label: 'AI Assistant',     path: '/notes/new',          color: 'text-pink-400' },
      { icon: FolderOpen,      label: 'Folders',          path: '/folders',            color: 'text-cyan-400' },
      { icon: Star,            label: 'Favorites',        path: '/notes?filter=favorites', color: 'text-amber-400' },
      { icon: Pin,             label: 'Pinned',           path: '/notes?filter=pinned',    color: 'text-yellow-400' },
      { icon: Trash2,          label: 'Trash',            path: '/notes?filter=trash',     color: 'text-red-400' },
    ],
  },
  {
    groupLabel: 'Core Platform',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',       path: '/',              color: 'text-indigo-400' },
      { icon: MessageSquare,   label: 'AI Chat',          path: '/chat',          color: 'text-purple-400' },
      { icon: Database,        label: 'RAG Knowledge',    path: '/rag',           color: 'text-blue-400' },
      { icon: FileText,        label: 'Documents',        path: '/documents',     color: 'text-cyan-400' },
      { icon: BarChart2,       label: 'Analytics',        path: '/analytics',     color: 'text-emerald-400' },
    ],
  },
  {
    groupLabel: 'AI Engines',
    items: [
      { icon: Cpu,             label: 'ML Studio',        path: '/ml',            color: 'text-amber-400' },
      { icon: Eye,             label: 'Vision AI',        path: '/vision',        color: 'text-pink-400' },
      { icon: Languages,       label: 'NLP Suite',        path: '/nlp',           color: 'text-teal-400' },
      { icon: Link2,           label: 'Blockchain',       path: '/blockchain',    color: 'text-violet-400' },
    ],
  },
  {
    groupLabel: 'Enterprise Modules',
    items: [
      { icon: Heart,           label: 'Healthcare',       path: '/healthcare',    color: 'text-red-400' },
      { icon: Scale,           label: 'Legal AI',         path: '/legal',         color: 'text-violet-400' },
      { icon: Briefcase,       label: 'Recruitment',      path: '/recruitment',   color: 'text-blue-400' },
      { icon: Banknote,        label: 'Banking & Fraud',  path: '/banking',       color: 'text-emerald-400' },
      { icon: Building2,       label: 'Smart City',       path: '/smartcity',     color: 'text-teal-400' },
      { icon: GraduationCap,   label: 'Education',        path: '/education',     color: 'text-indigo-400' },
      { icon: Sprout,          label: 'Agriculture AI',   path: '/agriculture',   color: 'text-green-400' },
      { icon: Shield,          label: 'Insurance AI',     path: '/insurance',     color: 'text-amber-400' },
      { icon: ShoppingCart,    label: 'E-Commerce AI',    path: '/ecommerce',     color: 'text-pink-400' },
      { icon: Vote,            label: 'E-Voting',         path: '/evoting',       color: 'text-blue-400' },
      { icon: AlertTriangle,   label: 'Disaster Mgmt',    path: '/disaster',      color: 'text-orange-400' },
      { icon: Globe,           label: 'Digital Forensics', path: '/forensics',    color: 'text-slate-400' },
      { icon: FileText,        label: 'Resume Portal',    path: '/resume-portal', color: 'text-cyan-400' },
    ],
  },
  {
    groupLabel: 'Academic AI',
    items: [
      { icon: Calculator,      label: 'MathVerse AI',     path: '/mathverse',     color: 'text-violet-400' },
      { icon: Atom,            label: 'PhysicsVerse AI',  path: '/physicsverse',  color: 'text-cyan-400' },
      { icon: FlaskConical,    label: 'ChemVerse AI',     path: '/chemverse',     color: 'text-emerald-400' },
      { icon: Code2,           label: 'CSVerse AI',       path: '/csverse',       color: 'text-amber-400' },
      { icon: Leaf,            label: 'BioVerse AI',      path: '/bioverse',      color: 'text-green-400' },
      { icon: Compass,         label: 'CalcVerse AI',     path: '/calcverse',     color: 'text-indigo-400' },
      { icon: Languages,       label: 'LinguaVerse AI',   path: '/linguaverse',   color: 'text-blue-400' },
    ],
  },
  {
    groupLabel: 'Management',
    items: [
      { icon: FolderKanban,    label: 'Projects',         path: '/projects',      color: 'text-orange-400' },
      { icon: CheckSquare,     label: 'Tasks',            path: '/tasks',         color: 'text-lime-400' },
      { icon: Users,           label: 'Users',            path: '/users',         color: 'text-rose-400' },
      { icon: Shield,          label: 'Security',         path: '/security',      color: 'text-red-400' },
      { icon: Lock,            label: 'Cybersecurity',    path: '/cybersecurity', color: 'text-rose-500' },
      { icon: Bell,            label: 'Notifications',    path: '/notifications', color: 'text-yellow-400' },
      { icon: Settings,        label: 'Settings',         path: '/settings',      color: 'text-slate-400' },
    ],
  },
]

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen]         = useState(true)
  const [searchQuery, setSearchQuery]          = useState('')
  const [dark, setDark]                        = useState(true)
  const [collapsedGroups, setCollapsedGroups]  = useState<Set<string>>(new Set())

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  // Filter nav items by search
  const filteredGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      searchQuery === '' || item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(group => group.items.length > 0)

  return (
    <div className="flex h-screen bg-background overflow-hidden bg-particles">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0 h-full glass-nav border-r border-white/5 flex flex-col z-20 overflow-hidden"
          >
            {/* Logo */}
            <div className="p-5 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center neon-indigo flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-bold text-sm truncate">Enterprise AI</div>
                  <div className="text-indigo-400 text-xs truncate">Unified Platform</div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="px-3 pt-3 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Nav groups */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
              {filteredGroups.map(group => (
                <div key={group.groupLabel}>
                  {/* Group header */}
                  {searchQuery === '' && (
                    <button
                      onClick={() => toggleGroup(group.groupLabel)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors mt-2"
                    >
                      <span>{group.groupLabel}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${collapsedGroups.has(group.groupLabel) ? '-rotate-90' : ''}`} />
                    </button>
                  )}
                  {/* Group items */}
                  <AnimatePresence>
                    {!collapsedGroups.has(group.groupLabel) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-0.5 overflow-hidden"
                      >
                        {group.items.map(item => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                          >
                            <item.icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                            <span className="truncate">{item.label}</span>
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* AI Status */}
            <div className="px-3 py-2 flex-shrink-0">
              <div className="glass rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400">Ollama Running</span>
                </div>
                <div className="text-xs text-muted-foreground">llama3 · mistral · gemma</div>
                <div className="text-xs text-muted-foreground">nomic-embed-text · FAISS</div>
              </div>
            </div>

            {/* User card */}
            <div className="p-3 border-t border-white/5 flex-shrink-0">
              <div className="glass rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-xs font-semibold truncate">{user?.full_name || 'User'}</div>
                  <div className="text-muted-foreground text-xs truncate capitalize">{user?.role || 'admin'}</div>
                </div>
                <button onClick={handleLogout} title="Logout" className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="glass-nav h-14 flex items-center px-4 gap-4 z-10 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost p-2 rounded-lg">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex-1" />

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <button className="btn-ghost p-2 rounded-lg" title="AI Assistant">
              <Bot className="w-4 h-4 text-indigo-400" />
            </button>

            <NavLink to="/notifications" className="btn-ghost p-2 rounded-lg relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            </NavLink>

            <button onClick={() => setDark(!dark)} className="btn-ghost p-2 rounded-lg">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="h-5 w-px bg-white/10" />

            <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.full_name?.charAt(0) || 'U'}</span>
              </div>
              <span className="text-xs font-medium text-foreground">{user?.full_name?.split(' ')[0]}</span>
              <span className="badge badge-info text-[10px] px-1.5 capitalize">{user?.role}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
