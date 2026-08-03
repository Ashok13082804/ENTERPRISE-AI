import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Save, Brain, Pin, Star, Archive, Trash2, Copy,
  Download, History, Tag, FolderOpen, Palette, Lock, Unlock,
  Eye, Edit3, MoreHorizontal, Clock, FileText, Loader2,
  Check, X, ChevronDown, Plus, Undo, Redo
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesApi, foldersApi, tagsApi, chatApi } from '@/api/client'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import AIAssistantPanel from '@/components/notes/AIAssistantPanel'
import toast from 'react-hot-toast'

const NOTE_COLORS = [
  { value: 'default', class: 'bg-white/10' },
  { value: 'red', class: 'bg-red-500' },
  { value: 'orange', class: 'bg-orange-500' },
  { value: 'yellow', class: 'bg-yellow-500' },
  { value: 'green', class: 'bg-emerald-500' },
  { value: 'blue', class: 'bg-blue-500' },
  { value: 'purple', class: 'bg-purple-500' },
  { value: 'pink', class: 'bg-pink-500' },
]

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [color, setColor] = useState('default')
  const [folderId, setFolderId] = useState<number | null>(null)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [selectedModel, setSelectedModel] = useState('llama3')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>()
  const isNew = id === 'new'

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.get(Number(id)).then(r => r.data),
    enabled: !isNew && !!id,
  })

  const { data: folders } = useQuery({
    queryKey: ['folders'],
    queryFn: () => foldersApi.list().then(r => r.data),
  })

  const { data: versions } = useQuery({
    queryKey: ['note-versions', id],
    queryFn: () => notesApi.getVersions(Number(id)).then(r => r.data),
    enabled: showVersions && !isNew && !!id,
  })

  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: () => chatApi.getModels().then(r => r.data),
    staleTime: 300_000,
  })

  // Initialize from note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setTags(note.tags || [])
      setColor(note.color || 'default')
      setFolderId(note.folder_id || null)
    }
  }, [note])

  // Word count calculation
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const saveMutation = useMutation({
    mutationFn: (data: object) => {
      if (isNew) {
        return notesApi.create(data).then(r => r.data)
      }
      return notesApi.update(Number(id), data).then(r => r.data)
    },
    onSuccess: (saved: any) => {
      setSaveStatus('saved')
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes-stats'] })
      if (isNew) {
        navigate(`/notes/${saved.id}`, { replace: true })
      } else {
        queryClient.setQueryData(['note', id], saved)
      }
    },
    onError: () => {
      setSaveStatus('unsaved')
      toast.error('Failed to save note')
    },
  })

  const saveNote = useCallback((t = title, c = content) => {
    setSaveStatus('saving')
    saveMutation.mutate({ title: t, content: c, tags, color, folder_id: folderId })
  }, [title, content, tags, color, folderId, saveMutation])

  // Auto-save
  useEffect(() => {
    if (!isDirty) return
    clearTimeout(autoSaveTimer.current)
    setSaveStatus('unsaved')
    autoSaveTimer.current = setTimeout(() => {
      saveNote()
    }, 2000)
    return () => clearTimeout(autoSaveTimer.current)
  }, [title, content, isDirty])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveNote()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        wrapSelection('**', '**')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        wrapSelection('*', '*')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [saveNote])

  const handleContentChange = (val: string) => {
    setUndoStack(prev => [...prev.slice(-20), content])
    setContent(val)
    setIsDirty(true)
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    setIsDirty(true)
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setUndoStack(s => s.slice(0, -1))
    setContent(prev)
  }

  const wrapSelection = (before: string, after: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end)
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end)
    setContent(newContent)
    setIsDirty(true)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      const newTags = [...tags, t]
      setTags(newTags)
      setTagInput('')
      if (!isNew) notesApi.update(Number(id), { tags: newTags })
    }
  }

  const removeTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag)
    setTags(newTags)
    if (!isNew) notesApi.update(Number(id), { tags: newTags })
  }

  const toggleAction = async (field: string, value: boolean) => {
    if (isNew) { toast.error('Save the note first'); return }
    try {
      await notesApi.update(Number(id), { [field]: value })
      queryClient.invalidateQueries({ queryKey: ['note', id] })
      toast.success(`${field.replace('is_', '').replace('_', ' ')} ${value ? 'on' : 'off'}`)
    } catch {
      toast.error('Action failed')
    }
  }

  const handleApplyAI = (text: string) => {
    setContent(prev => prev + '\n\n' + text)
    setIsDirty(true)
  }

  const exportNote = async (format: string) => {
    if (isNew) { toast.error('Save first'); return }
    try {
      const res = await notesApi.export(Number(id), format)
      const blob = new Blob([res.data])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'note'}.${format === 'markdown' ? 'md' : format}`
      a.click()
    } catch { toast.error('Export failed') }
  }

  const models = modelsData?.models?.map((m: any) => m.name) || ['llama3', 'mistral', 'phi3', 'gemma']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading note...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="border-b border-white/10 px-4 py-2 flex items-center gap-2 shrink-0">
          <button onClick={() => navigate('/notes')} className="btn-ghost p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 flex items-center gap-2">
            {/* Save status */}
            <div className="flex items-center gap-1.5 text-xs">
              {saveStatus === 'saving' && <><Loader2 className="w-3 h-3 animate-spin text-muted-foreground" /><span className="text-muted-foreground">Saving...</span></>}
              {saveStatus === 'saved' && <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Saved</span></>}
              {saveStatus === 'unsaved' && <><div className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-amber-400">Unsaved</span></>}
            </div>

            <span className="text-muted-foreground/30">|</span>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" /> {wordCount}w
              <span className="ml-1.5"><Clock className="w-3 h-3 inline" /> {readingTime}m</span>
            </div>
          </div>

          {/* Toolbar buttons */}
          <div className="flex items-center gap-1">
            <button onClick={handleUndo} title="Undo (Ctrl+Z)" className="btn-ghost p-2" disabled={undoStack.length === 0}>
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setPreviewMode(!previewMode)} className={`btn-ghost p-2 ${previewMode ? 'text-primary' : ''}`}>
              {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setShowVersions(!showVersions)} className={`btn-ghost p-2 ${showVersions ? 'text-primary' : ''}`} title="Version History">
              <History className="w-3.5 h-3.5" />
            </button>

            {/* Color picker */}
            <div className="relative">
              <button onClick={() => setShowColorPicker(!showColorPicker)} className="btn-ghost p-2" title="Note Color">
                <Palette className="w-3.5 h-3.5" />
              </button>
              {showColorPicker && (
                <div className="absolute right-0 top-full mt-1 p-2 glass-card rounded-xl z-30 flex gap-1.5">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.value}
                      title={c.value}
                      onClick={() => {
                        setColor(c.value)
                        if (!isNew) notesApi.update(Number(id), { color: c.value })
                        setShowColorPicker(false)
                      }}
                      className={`w-5 h-5 rounded-full ${c.class} ${color === c.value ? 'ring-2 ring-white/60 scale-110' : 'hover:scale-110'} transition-transform`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Export */}
            <div className="relative group">
              <button className="btn-ghost p-2" title="Export">
                <Download className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-36 glass-card rounded-xl z-30 py-1 hidden group-hover:block">
                {['markdown', 'pdf', 'docx', 'txt'].map(fmt => (
                  <button key={fmt} onClick={() => exportNote(fmt)} className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-white/5 text-foreground capitalize">
                    {fmt === 'markdown' ? '📝' : fmt === 'pdf' ? '📄' : fmt === 'docx' ? '📘' : '📃'} {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Note actions */}
            <button
              onClick={() => toggleAction('is_pinned', !note?.is_pinned)}
              className={`btn-ghost p-2 ${note?.is_pinned ? 'text-yellow-400' : ''}`}
              title="Pin"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleAction('is_favorite', !note?.is_favorite)}
              className={`btn-ghost p-2 ${note?.is_favorite ? 'text-amber-400' : ''}`}
              title="Favorite"
            >
              <Star className={`w-3.5 h-3.5 ${note?.is_favorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => { notesApi.delete(Number(id)); navigate('/notes') }}
              className="btn-ghost p-2 text-red-400/60 hover:text-red-400"
              title="Trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-5 bg-white/10" />

            {/* AI Panel toggle */}
            <button
              onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isAIPanelOpen
                  ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300 neon-purple'
                  : 'bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              AI
            </button>

            <button
              onClick={() => saveNote()}
              disabled={saveMutation.isPending}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </button>
          </div>
        </div>

        {/* Markdown formatting toolbar */}
        {!previewMode && (
          <div className="border-b border-white/5 px-4 py-1.5 flex items-center gap-1">
            {[
              { label: 'B', action: () => wrapSelection('**', '**'), title: 'Bold (Ctrl+B)', cls: 'font-bold' },
              { label: 'I', action: () => wrapSelection('*', '*'), title: 'Italic (Ctrl+I)', cls: 'italic' },
              { label: '~~', action: () => wrapSelection('~~', '~~'), title: 'Strikethrough', cls: '' },
              { label: '`', action: () => wrapSelection('`', '`'), title: 'Inline code', cls: 'font-mono' },
              { label: 'H1', action: () => setContent(c => c + '\n# '), title: 'Heading 1', cls: '' },
              { label: 'H2', action: () => setContent(c => c + '\n## '), title: 'Heading 2', cls: '' },
              { label: '—', action: () => setContent(c => c + '\n---\n'), title: 'Divider', cls: '' },
              { label: '☐', action: () => setContent(c => c + '\n- [ ] '), title: 'Checklist', cls: '' },
              { label: '```', action: () => wrapSelection('\n```\n', '\n```\n'), title: 'Code block', cls: 'font-mono' },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                title={btn.title}
                className={`text-xs px-2 py-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all ${btn.cls}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Title + Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Tags & Folder row */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="ml-0.5 text-indigo-400/70 hover:text-indigo-300">×</button>
                </span>
              ))}
              {showTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setShowTagInput(false) }}
                    placeholder="Tag name..."
                    className="text-xs bg-white/5 border border-white/20 rounded-full px-3 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-28"
                  />
                  <button onClick={addTag} className="text-xs text-emerald-400"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setShowTagInput(false)} className="text-xs text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <button onClick={() => setShowTagInput(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Tag className="w-3 h-3" /> Add tag
                </button>
              )}
              {folderId && folders && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" />
                  {folders.find((f: any) => f.id === folderId)?.name}
                </span>
              )}
            </div>

            {/* Title */}
            <textarea
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Untitled Note"
              className="w-full text-3xl font-bold text-white bg-transparent border-none outline-none resize-none mb-4 placeholder:text-muted-foreground/30 leading-tight"
              rows={1}
              onInput={e => {
                const ta = e.target as HTMLTextAreaElement
                ta.style.height = 'auto'
                ta.style.height = ta.scrollHeight + 'px'
              }}
            />

            {/* Content */}
            {previewMode ? (
              <div className="prose-dark min-h-[400px]">
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return match ? (
                        <SyntaxHighlighter style={vscDarkPlus as any} language={match[1]} PreTag="div">
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>{children}</code>
                      )
                    }
                  }}
                >
                  {content || '*Start writing...*'}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => handleContentChange(e.target.value)}
                placeholder="Start writing your note... Markdown is supported ✨"
                className="w-full min-h-[500px] bg-transparent border-none outline-none resize-none text-foreground/90 text-sm leading-relaxed placeholder:text-muted-foreground/30 font-mono"
                style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
              />
            )}
          </div>
        </div>

        {/* Bottom model selector */}
        <div className="border-t border-white/5 px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">AI Model:</span>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-foreground focus:outline-none"
          >
            {models.map((m: string) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <span className="text-[10px] text-muted-foreground ml-auto">
            Ctrl+S to save · Ctrl+B bold · Ctrl+I italic
          </span>
        </div>
      </div>

      {/* Version History Drawer */}
      <AnimatePresence>
        {showVersions && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-white/10 overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <History className="w-4 h-4" /> History
              </h3>
              <button onClick={() => setShowVersions(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {versions?.map((v: any) => (
                <div key={v.id} className="glass rounded-xl p-3 border border-white/5 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">v{v.version_number}</span>
                    <span className="text-[10px] text-muted-foreground">{v.word_count}w</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{v.content_preview}...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span>
                    <button
                      onClick={async () => {
                        await notesApi.restoreVersion(Number(id), v.id)
                        queryClient.invalidateQueries({ queryKey: ['note', id] })
                        toast.success(`Restored to v${v.version_number}`)
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isAIPanelOpen && (
          <AIAssistantPanel
            noteId={isNew ? undefined : Number(id)}
            content={content}
            title={title}
            model={selectedModel}
            onApply={handleApplyAI}
            onClose={() => setIsAIPanelOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
