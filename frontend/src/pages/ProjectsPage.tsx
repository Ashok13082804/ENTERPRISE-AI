import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  FolderKanban, Plus, Loader2, Trash2, ChevronRight, FileCode, Play, Save,
  ArrowLeft, Brain, Terminal, Code, Settings, Sparkles, RefreshCw, GitBranch,
  File, FolderOpen, Zap, CheckCircle, AlertCircle, Download, X
} from 'lucide-react'
import { projectsApi } from '@/api/client'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  planning: 'badge-info', active: 'badge-success', completed: 'badge-purple', archived: 'badge-warning',
}
const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-blue-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400',
}

// Language detection based on file extension
const detectLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    py: 'python', ts: 'typescript', tsx: 'typescript', js: 'javascript',
    jsx: 'javascript', html: 'html', css: 'css', json: 'json',
    md: 'markdown', yaml: 'yaml', yml: 'yaml', sh: 'shell',
    sql: 'sql', rs: 'rust', go: 'go', java: 'java', cpp: 'cpp', c: 'c',
  }
  return map[ext || ''] || 'plaintext'
}

const fileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const colors: Record<string, string> = {
    py: 'text-blue-400', ts: 'text-blue-300', tsx: 'text-cyan-400', js: 'text-yellow-400',
    html: 'text-orange-400', css: 'text-pink-400', json: 'text-amber-400', md: 'text-gray-400',
  }
  return colors[ext || ''] || 'text-white/40'
}

export default function ProjectsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', department: '' })
  const [activeProject, setActiveProject] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<string>('main.py')
  const [editorContent, setEditorContent] = useState<string>('')
  const [terminalOutput, setTerminalOutput] = useState<{ stdout: string, stderr: string, exit_code: number } | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiPending, setAiPending] = useState(false)
  const [activePanel, setActivePanel] = useState<'terminal' | 'git'>('terminal')
  const [openTabs, setOpenTabs] = useState<string[]>([])

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => projectsApi.create(form).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created!')
      setShowForm(false)
      setForm({ name: '', description: '', priority: 'medium', department: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project deleted') },
  })

  const loadFiles = async (projId: number) => {
    try {
      const res = await projectsApi.getFiles(projId)
      setFiles(res.data.files || [])
      if (res.data.files?.length > 0) {
        const hasMain = res.data.files.some((f: any) => f.name === 'main.py')
        const firstFile = hasMain ? 'main.py' : res.data.files[0].name
        setSelectedFile(firstFile)
        setOpenTabs([firstFile])
        loadFileContent(projId, firstFile)
      }
    } catch { toast.error('Could not load workspace') }
  }

  const loadFileContent = async (projId: number, path: string) => {
    try {
      const res = await projectsApi.readFile(projId, path)
      setEditorContent(res.data.content)
    } catch { toast.error(`Could not read ${path}`) }
  }

  const handleSelectFile = (fileName: string) => {
    setSelectedFile(fileName)
    if (!openTabs.includes(fileName)) setOpenTabs(prev => [...prev, fileName])
    if (activeProject) loadFileContent(activeProject.id, fileName)
  }

  const handleCloseTab = (tab: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = openTabs.filter(t => t !== tab)
    setOpenTabs(newTabs)
    if (selectedFile === tab && newTabs.length > 0) handleSelectFile(newTabs[newTabs.length - 1])
  }

  const handleOpenWorkspace = (project: any) => {
    setActiveProject(project)
    setTerminalOutput(null)
    setAiResponse('')
    setAiPrompt('')
    setOpenTabs([])
    loadFiles(project.id)
  }

  const saveMutation = useMutation({
    mutationFn: (data: { path: string, content: string }) =>
      projectsApi.writeFile(activeProject.id, data).then(r => r.data),
    onSuccess: (res) => { toast.success(`✅ Saved ${res.path}`); loadFiles(activeProject.id) },
    onError: () => toast.error('Save failed'),
  })

  const runMutation = useMutation({
    mutationFn: (data: { path: string }) =>
      projectsApi.run(activeProject.id, data).then(r => r.data),
    onSuccess: (res) => { setTerminalOutput(res); setActivePanel('terminal'); toast.success('Execution finished') },
    onError: () => toast.error('Runtime failed'),
  })

  const handleRunCode = () => {
    saveMutation.mutate({ path: selectedFile, content: editorContent })
    runMutation.mutate({ path: selectedFile })
  }

  const handleAskAI = async () => {
    if (!aiPrompt) return
    setAiPending(true)
    try {
      const res = await projectsApi.aiAssist(activeProject.id, { path: selectedFile, prompt: aiPrompt })
      setAiResponse(res.data.response)
      toast.success('AI assistant responded!')
    } catch { toast.error('AI assistant error') }
    finally { setAiPending(false) }
  }

  // ── IDE View ─────────────────────────────────────────────────────────────────
  if (activeProject) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)', background: '#0a0d14' }}>
        {/* IDE Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5" style={{ background: '#070a12', minHeight: 48, flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveProject(null)}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg hover:bg-white/5 transition-all">
              <ArrowLeft className="w-3.5 h-3.5" /> Projects
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Code className="w-3 h-3 text-white" />
              </div>
              <span className="text-white font-semibold text-xs">{activeProject.name}</span>
              <span className="text-white/30 text-[10px] font-mono">/workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button onClick={() => saveMutation.mutate({ path: selectedFile, content: editorContent })}
              disabled={saveMutation.isPending} whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white text-[11px] font-semibold transition-all">
              {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-cyan-400" />}
              Save
            </motion.button>
            <motion.button onClick={handleRunCode} disabled={runMutation.isPending} whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all">
              {runMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run
            </motion.button>
            <motion.button onClick={() => { saveMutation.mutate({ path: selectedFile, content: editorContent }); toast.success('File saved!') }} whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white text-[11px] font-bold transition-all">
              <Brain className="w-3.5 h-3.5" /> AI
            </motion.button>
          </div>
        </div>

        {/* IDE Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* File Explorer */}
          <div className="w-52 border-r border-white/5 flex flex-col" style={{ background: '#080b12', flexShrink: 0 }}>
            <div className="px-3 py-2 text-[9px] font-bold text-white/30 tracking-widest uppercase border-b border-white/5">
              Explorer
            </div>
            <div className="px-2 py-1 text-[10px] font-semibold text-white/50 flex items-center gap-1.5 mt-1">
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" /> {activeProject.name}
            </div>
            <div className="flex-1 overflow-y-auto py-1 px-1">
              {files.map(f => (
                <button key={f.name} onClick={() => handleSelectFile(f.name)}
                  className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-mono text-left transition-all ${selectedFile === f.name ? 'bg-white/8 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                  <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${fileIcon(f.name)}`} />
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
            </div>
            {/* Status bar bottom */}
            <div className="border-t border-white/5 px-3 py-1.5 flex items-center gap-1.5 text-[9px] text-white/30">
              <GitBranch className="w-3 h-3" /> main
              <span className="ml-auto text-emerald-400">{files.length} files</span>
            </div>
          </div>

          {/* Editor + Bottom Panel */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Tab bar */}
            <div className="flex items-center border-b border-white/5 overflow-x-auto" style={{ background: '#070a12', flexShrink: 0 }}>
              {openTabs.map(tab => (
                <div key={tab} onClick={() => handleSelectFile(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-mono cursor-pointer border-r border-white/5 flex-shrink-0 transition-all ${selectedFile === tab ? 'bg-[#0a0d14] text-white border-b-2 border-b-cyan-500' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                  <FileCode className={`w-3 h-3 ${fileIcon(tab)}`} />
                  {tab}
                  <button onClick={e => handleCloseTab(tab, e)}
                    className="ml-1 text-white/20 hover:text-white/70 rounded hover:bg-white/10 p-0.5">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={detectLanguage(selectedFile)}
                value={editorContent}
                onChange={val => setEditorContent(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                  minimap: { enabled: true, scale: 1 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'phase',
                  cursorSmoothCaretAnimation: 'on',
                  renderLineHighlight: 'gutter',
                  bracketPairColorization: { enabled: true },
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                  lineNumbers: 'on',
                  glyphMargin: true,
                  folding: true,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  suggest: { showKeywords: true, showMethods: true },
                }}
              />
            </div>

            {/* Bottom Panel */}
            <div className="border-t border-white/5" style={{ background: '#070a12', flexShrink: 0, height: 220 }}>
              <div className="flex items-center border-b border-white/5">
                {[
                  { id: 'terminal', label: 'Terminal', icon: Terminal },
                  { id: 'git', label: 'Source Control', icon: GitBranch },
                ].map(p => (
                  <button key={p.id} onClick={() => setActivePanel(p.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-semibold transition-all ${activePanel === p.id ? 'text-white border-b-2 border-cyan-400' : 'text-white/30 hover:text-white/70'}`}>
                    <p.icon className="w-3 h-3" /> {p.label}
                  </button>
                ))}
                {terminalOutput && (
                  <span className={`ml-auto mr-3 text-[9px] font-bold px-2 py-0.5 rounded ${terminalOutput.exit_code === 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                    Exit {terminalOutput.exit_code}
                  </span>
                )}
              </div>
              <div className="h-[175px] overflow-y-auto p-3 font-mono text-[11px] leading-relaxed select-text">
                {activePanel === 'terminal' ? (
                  <>
                    <div className="text-white/30 mb-1">$ python {selectedFile}</div>
                    {runMutation.isPending ? (
                      <div className="text-amber-400 animate-pulse">⚡ Running process...</div>
                    ) : terminalOutput ? (
                      <>
                        {terminalOutput.stdout && <pre className="text-emerald-400 whitespace-pre-wrap">{terminalOutput.stdout}</pre>}
                        {terminalOutput.stderr && <pre className="text-red-400 whitespace-pre-wrap">{terminalOutput.stderr}</pre>}
                        {!terminalOutput.stdout && !terminalOutput.stderr && <div className="text-white/40">Process completed with no output.</div>}
                      </>
                    ) : (
                      <div className="text-white/20">Click ▶ Run to execute {selectedFile}</div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px]"><CheckCircle className="w-3 h-3" /> Working tree clean on branch <strong>main</strong></div>
                    <div className="text-white/30">Modified files will appear here after saving.</div>
                    <div className="text-white/20 text-[10px]">git status · git add · git commit · git push</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Assistant Panel */}
          <div className="w-72 border-l border-white/5 flex flex-col" style={{ background: '#08091a', flexShrink: 0 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-white font-bold text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" /> Antigravity AI Coder
              </span>
              <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">LOCAL</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiResponse ? (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3 text-[11px] text-white/70 whitespace-pre-wrap leading-relaxed">
                  {aiResponse}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-violet-400/50" />
                  </div>
                  <div>
                    <div className="text-white/30 font-bold text-[11px]">AI Code Assistant</div>
                    <div className="text-white/20 text-[10px] mt-0.5">Ask about code, bugs, or features</div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 w-full mt-2">
                    {['Explain this code', 'Find bugs', 'Optimize performance', 'Add comments'].map(q => (
                      <button key={q} onClick={() => setAiPrompt(q)}
                        className="text-[10px] text-white/40 hover:text-violet-400 bg-white/3 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/30 py-1.5 px-3 rounded-lg text-left transition-all">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/5 space-y-2">
              <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ask AI programmer assistant..."
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAskAI() }}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-[11px] text-white focus:outline-none focus:border-violet-500/50 resize-none placeholder:text-white/20" />
              <motion.button onClick={handleAskAI} disabled={aiPending || !aiPrompt} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all">
                {aiPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Ask AI (Ctrl+Enter)
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Project List View ────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Projects IDE</h1>
            <p className="text-xs text-white/40">Monaco Editor · Local Terminal · Antigravity AI Coding Assistant</p>
          </div>
        </div>
        <motion.button onClick={() => setShowForm(!showForm)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg">
          <Plus className="w-4 h-4" /> New Project
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-card p-5 space-y-4 border border-orange-500/20">
            <h3 className="text-white font-bold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-orange-400" /> Create New Project</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 uppercase block mb-1">Project Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="my-ai-project"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase block mb-1">Department</label>
                <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Engineering"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50" />
              </div>
            </div>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What does this project do?" rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500/50 resize-none" />
            <div className="flex items-center gap-3">
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p} className="bg-[#0a0d14]">{p}</option>)}
              </select>
              <motion.button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.name}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg disabled:opacity-50">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
              </motion.button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-white/10 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/5">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-white/30" /></div>
      ) : !Array.isArray(projects) || projects.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center space-y-4">
          <div className="text-6xl">🗂️</div>
          <div className="text-white font-bold text-lg">No Projects Yet</div>
          <div className="text-white/40 text-sm">Create your first project to launch the AI IDE Workspace</div>
          <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.05 }}
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold rounded-xl shadow-lg">
            <Plus className="w-4 h-4" /> Create First Project
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(projects as any[]).map((p: any, i: number) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => handleOpenWorkspace(p)}
              className="glass-card p-5 hover:bg-white/8 cursor-pointer border border-white/5 hover:border-orange-500/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md flex-shrink-0">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm leading-tight">{p.name}</h3>
                    {p.department && <div className="text-white/30 text-[10px]">{p.department}</div>}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(p.id) }}
                  className="text-red-400/50 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {p.description && <p className="text-white/40 text-[11px] mb-3 leading-relaxed line-clamp-2">{p.description}</p>}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${p.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-white/40'}`}>{p.status}</span>
                <span className={`text-[10px] font-semibold uppercase ${PRIORITY_COLORS[p.priority]}`}>⚡ {p.priority}</span>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-orange-400 font-semibold">
                <span className="flex items-center gap-1.5"><Code className="w-3.5 h-3.5" /> Open IDE Workspace</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
