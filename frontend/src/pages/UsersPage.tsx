import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Shield, Activity, LogIn, Loader2 } from 'lucide-react'
import { usersApi } from '@/api/client'

export default function UsersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['users-list'], queryFn: () => usersApi.list().then(r => r.data) })
  const users = data?.users || []

  const ROLE_COLORS: Record<string, string> = { admin: 'badge-error', manager: 'badge-warning', employee: 'badge-success', guest: 'badge-info', superadmin: 'badge-purple' }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
          User Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} users registered</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['admin','red'],['manager','amber'],['employee','emerald'],['guest','blue']].map(([role, color]) => (
          <div key={role} className="glass-card p-4">
            <div className="text-2xl font-bold text-white">{users.filter((u: any) => u.role === role).length}</div>
            <div className={`text-sm capitalize text-${color}-400 mt-1`}>{role}s</div>
          </div>
        ))}
      </div>

      {isLoading ? <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/10 text-left">
                {['User','Role','Department','Status','Last Login'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{u.full_name?.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{u.full_name}</div>
                          <div className="text-muted-foreground text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${ROLE_COLORS[u.role] || 'badge-info'} capitalize`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.department || '—'}</td>
                    <td className="px-4 py-3"><span className={`badge ${u.is_active ? 'badge-success' : 'badge-error'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}
