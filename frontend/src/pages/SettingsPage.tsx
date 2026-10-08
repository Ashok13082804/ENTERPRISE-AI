import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Settings, User, Bell, Lock, Moon, Sun, Save, Loader2 } from 'lucide-react'
import { usersApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore, Theme } from '@/store/themeStore'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const { theme: currentTheme, setTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState<'profile'|'security'|'notifications'|'appearance'>('profile')
  const [form, setForm] = useState({ full_name: user?.full_name || '', department: user?.department || '', theme: currentTheme || 'dark' })

  const updateMutation = useMutation({
    mutationFn: () => usersApi.updateMe(form).then(r => r.data),
    onSuccess: (data) => { updateUser(data); toast.success('Settings saved!') },
    onError: () => toast.error('Save failed'),
  })

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
  ]

  return (
    <div className="p-6 space-y-6 max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center"><Settings className="w-5 h-5 text-white" /></div>
          Settings
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`sidebar-item w-full ${activeTab === t.id ? 'active' : ''}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 glass-card p-5 space-y-4">
          {activeTab === 'profile' && (
            <>
              <h3 className="text-white font-semibold">Profile Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                {[{ key: 'full_name', label: 'Full Name', ph: 'John Doe' }, { key: 'department', label: 'Department', ph: 'Engineering' }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-muted-foreground mb-1 block uppercase">{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="enterprise-input" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">EMAIL (read-only)</label>
                <input value={user?.email || ''} readOnly className="enterprise-input opacity-50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ROLE (read-only)</label>
                <input value={user?.role || ''} readOnly className="enterprise-input opacity-50 capitalize" />
              </div>
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              <h3 className="text-foreground font-semibold">Appearance</h3>
              <div className="grid grid-cols-2 gap-4">
                {[{ id: 'dark', label: 'Dark Mode', icon: '🌙', desc: 'Deep dark theme' }, { id: 'light', label: 'Light Mode', icon: '☀️', desc: 'Clean white theme' }].map(item => (
                  <button key={item.id} onClick={() => { setForm(p => ({ ...p, theme: item.id as Theme })); setTheme(item.id as Theme); toast.success(`Switched to ${item.label}`); }}
                    className={`glass-card p-4 text-left transition-all ${currentTheme === item.id ? 'border-primary/50 bg-primary/10' : 'hover:bg-white/10'}`}>
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-foreground font-semibold text-sm">{item.label}</div>
                    <div className="text-muted-foreground text-xs">{item.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Security Settings</h3>
              {[{ label: 'Two-Factor Auth', status: 'Disabled', action: 'Enable' }, { label: 'Active Sessions', status: '1 session', action: 'View All' }, { label: 'API Keys', status: 'None', action: 'Generate' }].map(s => (
                <div key={s.label} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div><div className="text-white text-sm font-medium">{s.label}</div><div className="text-muted-foreground text-xs">{s.status}</div></div>
                  <button className="btn-secondary text-xs px-3 py-1.5">{s.action}</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Notification Preferences</h3>
              {[['AI Chat responses', true], ['Document uploads', true], ['Project updates', true], ['Security alerts', true], ['System maintenance', false]].map(([label, def]) => (
                <div key={label as string} className="flex items-center justify-between glass rounded-xl p-4">
                  <span className="text-white text-sm">{label as string}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={def as boolean} className="sr-only peer" />
                    <div className="w-10 h-5 bg-white/10 peer-checked:bg-indigo-600 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              ))}
            </div>
          )}

          <motion.button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary flex items-center gap-2">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  )
}
