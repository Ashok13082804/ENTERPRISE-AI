import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Plus, Loader2, Trash2, Edit2, X, Calendar } from 'lucide-react'
import { tasksApi } from '@/api/client'
import toast from 'react-hot-toast'

const STATUSES = ['todo', 'in_progress', 'review', 'done']
const STATUS_COLORS: Record<string, string> = {
  todo: 'badge-info',
  in_progress: 'badge-warning',
  review: 'badge-purple',
  done: 'badge-success'
}

export default function TasksPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo' })
  
  // Edit task modal states
  const [editingTask, setEditingTask] = useState<any>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', estimated_hours: 0 })

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list().then(r => r.data)
  })

  const createMutation = useMutation({
    mutationFn: () => tasksApi.create(form).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created!')
      setShowForm(false)
      setForm({ title: '', description: '', priority: 'medium', status: 'todo' })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      tasksApi.updateStatus(id, status).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const editMutation = useMutation({
    mutationFn: (data: any) =>
      tasksApi.update(editingTask.id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated!')
      setEditingTask(null)
    },
    onError: () => toast.error('Failed to update task'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksApi.delete(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Deleted')
    },
  })

  const handleOpenEdit = (task: any) => {
    setEditingTask(task)
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
      estimated_hours: task.estimated_hours || 0,
    })
  }

  const handleSaveEdit = () => {
    editMutation.mutate(editForm)
  }

  const taskArr = Array.isArray(tasks) ? tasks : []
  const grouped = STATUSES.reduce((acc: any, s) => {
    acc[s] = taskArr.filter((t: any) => t.status === s)
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto relative">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            Tasks Board
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{taskArr.length} tasks registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Task</button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-3">
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title" className="enterprise-input" />
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="enterprise-input resize-none" rows={2} />
          <div className="flex gap-2">
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="enterprise-input text-sm flex-1">
              {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="enterprise-input text-sm flex-1">
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <motion.button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title} whileHover={{ scale: 1.02 }} className="btn-primary flex items-center gap-2">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
            </motion.button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {STATUSES.map(status => (
            <div key={status} className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm capitalize">{status.replace('_', ' ')}</h3>
                <span className={`badge ${STATUS_COLORS[status]} text-[10px]`}>{grouped[status]?.length || 0}</span>
              </div>
              {grouped[status]?.map((task: any) => (
                <motion.div key={task.id} layout className="glass rounded-xl p-3 space-y-2 hover:bg-white/10 transition-all border border-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-xs font-medium">{task.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(task.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {task.description && <p className="text-muted-foreground text-[10px] line-clamp-2 leading-relaxed">{task.description}</p>}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] uppercase font-semibold text-amber-400">⚡ {task.priority}</span>
                    {task.due_date && <span className="text-[9px] text-muted-foreground font-mono">{task.due_date.slice(0,10)}</span>}
                  </div>
                  <select
                    value={task.status}
                    onChange={e => updateStatusMutation.mutate({ id: task.id, status: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-foreground focus:outline-none"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                  </select>
                </motion.div>
              ))}
              {(!grouped[status] || grouped[status].length === 0) && (
                <div className="text-center text-muted-foreground text-[10px] py-6 border border-dashed border-white/5 rounded-xl">Empty</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  Edit Task Card
                </h3>
                <button onClick={() => setEditingTask(null)} className="text-muted-foreground hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">TASK TITLE</label>
                  <input
                    value={editForm.title}
                    onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                    className="enterprise-input text-xs"
                    placeholder="Enter task title..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">DESCRIPTION</label>
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    className="enterprise-input text-xs resize-none"
                    rows={3}
                    placeholder="Describe the task details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">PRIORITY</label>
                    <select
                      value={editForm.priority}
                      onChange={e => setEditForm(p => ({ ...p, priority: e.target.value }))}
                      className="enterprise-input text-xs"
                    >
                      {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> DUE DATE</label>
                    <input
                      type="date"
                      value={editForm.due_date}
                      onChange={e => setEditForm(p => ({ ...p, due_date: e.target.value }))}
                      className="enterprise-input text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">ESTIMATED HOURS</label>
                  <input
                    type="number"
                    value={editForm.estimated_hours}
                    onChange={e => setEditForm(p => ({ ...p, estimated_hours: parseFloat(e.target.value) || 0 }))}
                    className="enterprise-input text-xs"
                    placeholder="e.g. 8.5"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={handleSaveEdit}
                  disabled={editMutation.isPending || !editForm.title}
                  className="btn-primary text-xs flex-1 flex items-center justify-center gap-1.5"
                >
                  {editMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
                <button onClick={() => setEditingTask(null)} className="btn-secondary text-xs flex-1">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
