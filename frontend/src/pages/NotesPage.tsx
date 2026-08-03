import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Grid3X3, List, Filter, SortAsc, SortDesc,
  Pin, Star, Archive, Trash2, Brain, Tag, FolderOpen,
  FileText, RefreshCw, ChevronDown, X, Check, Sparkles
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesApi, foldersApi, tagsApi } from '@/api/client'
import NoteCard from '@/components/notes/NoteCard'
import toast from 'react-hot-toast'

const COLOR_OPTIONS = [
  { value: 'default', label: 'Default', class: 'bg-white/20' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'green', label: 'Green', class: 'bg-emerald-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
]

export default function NotesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | undefined>()
  const [selectedFolder, setSelectedFolder] = useState<number | undefined>()
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const [selectedNotes, setSelectedNotes] = useState<Set<number>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)

  // URL-driven filters
  const filterType = searchParams.get('filter') // pinned, favorites, archived, trash
  const isTrash = filterType === 'trash'
  const isArchived = filterType === 'archived'
  const isPinned = filterType === 'pinned' ? true : undefined
  const isFavorite = filterType === 'favorites' ? true : undefined

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const queryParams = {
    search: debouncedSearch || undefined,
    folder_id: selectedFolder,
    tag: selectedTag,
    color: selectedColor,
    is_pinned: isPinned,
    is_favorite: isFavorite,
    is_archived: isArchived,
    is_trashed: isTrash,
    sort_by: sortBy,
    sort_order: sortOrder,
    limit: 100,
  }

  const { data: notesData, isLoading, refetch } = useQuery({
    queryKey: ['notes', queryParams],
    queryFn: () => notesApi.list(queryParams).then(r => r.data),
    staleTime: 30_000,
  })

  const { data: folders } = useQuery({
    queryKey: ['folders'],
    queryFn: () => foldersApi.list().then(r => r.data),
  })

  const { data: tagCloud } = useQuery({
    queryKey: ['tag-cloud'],
    queryFn: () => tagsApi.cloud().then(r => r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['notes-stats'],
    queryFn: () => notesApi.stats().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => notesApi.create({ title: 'Untitled Note', content: '' }).then(r => r.data),
    onSuccess: (note: any) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      navigate(`/notes/${note.id}`)
    },
    onError: () => toast.error('Failed to create note'),
  })

  const bulkMutation = useMutation({
    mutationFn: (data: object) => notesApi.bulk(data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes-stats'] })
      setSelectedNotes(new Set())
      setBulkMode(false)
      toast.success('Action applied')
    },
  })

  const emptyTrashMutation = useMutation({
    mutationFn: () => notesApi.emptyTrash().then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Trash emptied')
    },
  })

  const notes = notesData?.notes || []
  const total = notesData?.total || 0

  const toggleSelect = useCallback((id: number) => {
    setSelectedNotes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const applyBulkAction = (action: string) => {
    if (selectedNotes.size === 0) return
    bulkMutation.mutate({ note_ids: Array.from(selectedNotes), action })
  }

  const filterLabels: Record<string, string> = {
    pinned: '📌 Pinned Notes',
    favorites: '⭐ Favorites',
    archived: '🗄️ Archived',
    trash: '🗑️ Trash',
  }

  const pageTitle = filterType ? filterLabels[filterType] : selectedFolder ? (folders?.find((f: any) => f.id === selectedFolder)?.name || 'Folder') : '📝 All Notes'

  const QuickStatCard = ({ icon: Icon, label, value, color, filter }: any) => (
    <button
      onClick={() => setSearchParams(filter ? { filter } : {})}
      className={`glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-all text-left ${filterType === filter ? 'ring-1 ring-primary/50' : ''}`}
    >
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="text-sm font-bold text-white">{value ?? '—'}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </button>
  )

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Folders & Tags */}
      <div className="hidden lg:flex flex-col w-56 shrink-0 border-r border-white/10 p-4 space-y-6">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Views</p>
          <div className="space-y-1">
            {[
              { label: '📝 All Notes', filter: null },
              { label: '📌 Pinned', filter: 'pinned' },
              { label: '⭐ Favorites', filter: 'favorites' },
              { label: '🗄️ Archived', filter: 'archived' },
              { label: '🗑️ Trash', filter: 'trash' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => { setSearchParams(item.filter ? { filter: item.filter } : {}); setSelectedFolder(undefined) }}
                className={`sidebar-item w-full ${filterType === item.filter && !selectedFolder ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Folders */}
        {folders && folders.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Folders</p>
            <div className="space-y-1">
              {folders.map((folder: any) => (
                <button
                  key={folder.id}
                  onClick={() => { setSelectedFolder(folder.id); setSearchParams({}) }}
                  className={`sidebar-item w-full justify-between ${selectedFolder === folder.id ? 'active' : ''}`}
                >
                  <span>{folder.icon} {folder.name}</span>
                  <span className="text-[10px] text-muted-foreground">{folder.note_count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Cloud */}
        {tagCloud && tagCloud.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</p>
            <div className="flex flex-wrap gap-1">
              {tagCloud.slice(0, 15).map((t: any) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTag(selectedTag === t.name ? undefined : t.name)}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-all ${selectedTag === t.name ? 'bg-indigo-500/40 text-indigo-300 border border-indigo-500/50' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">{pageTitle}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{total} notes{debouncedSearch ? ` matching "${debouncedSearch}"` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              {isTrash && (
                <button
                  onClick={() => emptyTrashMutation.mutate()}
                  className="btn-secondary text-xs py-2 flex items-center gap-1.5 text-red-400 border-red-500/30 hover:border-red-500/50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Empty Trash
                </button>
              )}
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="btn-primary text-xs py-2 flex items-center gap-1.5"
              >
                {createMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                New Note
              </button>
            </div>
          </div>

          {/* Stats Row */}
          {!filterType && stats && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              <QuickStatCard icon={FileText} label="Total" value={stats.total_notes} color="bg-indigo-600" filter={null} />
              <QuickStatCard icon={Pin} label="Pinned" value={stats.pinned_notes} color="bg-yellow-600" filter="pinned" />
              <QuickStatCard icon={Star} label="Favorites" value={stats.favorite_notes} color="bg-amber-600" filter="favorites" />
              <QuickStatCard icon={Brain} label="AI Notes" value={stats.ai_notes} color="bg-purple-600" filter={null} />
            </div>
          )}

          {/* Search & Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="enterprise-input pl-9 text-sm py-2"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary text-xs py-2 flex items-center gap-1.5 ${showFilters ? 'bg-primary/20 border-primary/30 text-primary' : ''}`}
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary text-xs py-2 px-3"
              title={`Sort ${sortOrder}`}
            >
              {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            </button>
            <div className="flex border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-2 ${view === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'} transition-all`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 ${view === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'} transition-all`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`btn-secondary text-xs py-2 ${bulkMode ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : ''}`}
            >
              Select
            </button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Color:</span>
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c.value}
                        title={c.label}
                        onClick={() => setSelectedColor(selectedColor === c.value ? undefined : c.value)}
                        className={`w-5 h-5 rounded-full ${c.class} transition-transform ${selectedColor === c.value ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Sort:</span>
                    {['updated_at', 'created_at', 'title', 'word_count'].map(s => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`text-xs px-2 py-1 rounded-lg transition-all ${sortBy === s ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {bulkMode && selectedNotes.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-600/20 border-b border-indigo-500/30 px-6 py-2 flex items-center gap-3"
            >
              <span className="text-xs text-indigo-300 font-medium">{selectedNotes.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => applyBulkAction('favorite')} className="btn-secondary text-xs py-1 flex items-center gap-1"><Star className="w-3 h-3" /> Favorite</button>
                <button onClick={() => applyBulkAction('archive')} className="btn-secondary text-xs py-1 flex items-center gap-1"><Archive className="w-3 h-3" /> Archive</button>
                <button onClick={() => applyBulkAction('trash')} className="btn-secondary text-xs py-1 flex items-center gap-1 text-red-400"><Trash2 className="w-3 h-3" /> Trash</button>
                {isTrash && <button onClick={() => applyBulkAction('delete')} className="btn-secondary text-xs py-1 text-red-500">Delete Permanently</button>}
                <button onClick={() => { setSelectedNotes(new Set()); setBulkMode(false) }} className="text-xs text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-2'}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`shimmer rounded-2xl ${view === 'grid' ? 'h-48' : 'h-14'}`} />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <EmptyState filter={filterType} search={debouncedSearch} onCreate={() => createMutation.mutate()} />
          ) : (
            <motion.div
              layout
              className={view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'
                : 'space-y-2'
              }
            >
              {/* Pinned section in non-filtered view */}
              {!filterType && !selectedFolder && !debouncedSearch && (() => {
                const pinned = notes.filter((n: any) => n.is_pinned)
                const rest = notes.filter((n: any) => !n.is_pinned)
                if (pinned.length === 0) {
                  return rest.map((note: any) => (
                    <NoteCard key={note.id} note={note} view={view} onRefresh={refetch} selected={selectedNotes.has(note.id)} onSelect={bulkMode ? toggleSelect : undefined} />
                  ))
                }
                return (
                  <>
                    {view === 'grid' && (
                      <>
                        <div className="col-span-full">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Pin className="w-3 h-3" /> Pinned
                          </p>
                        </div>
                        {pinned.map((note: any) => (
                          <NoteCard key={note.id} note={note} view={view} onRefresh={refetch} selected={selectedNotes.has(note.id)} onSelect={bulkMode ? toggleSelect : undefined} />
                        ))}
                        {rest.length > 0 && (
                          <div className="col-span-full">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Other</p>
                          </div>
                        )}
                      </>
                    )}
                    {rest.map((note: any) => (
                      <NoteCard key={note.id} note={note} view={view} onRefresh={refetch} selected={selectedNotes.has(note.id)} onSelect={bulkMode ? toggleSelect : undefined} />
                    ))}
                  </>
                )
              })()}

              {/* Filtered view */}
              {(filterType || selectedFolder || debouncedSearch) && notes.map((note: any) => (
                <NoteCard key={note.id} note={note} view={view} onRefresh={refetch} selected={selectedNotes.has(note.id)} onSelect={bulkMode ? toggleSelect : undefined} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Create Button (mobile) */}
      <button
        onClick={() => createMutation.mutate()}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl neon-indigo hover:scale-110 transition-transform z-40"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  )
}

function EmptyState({ filter, search, onCreate }: { filter: string | null; search: string; onCreate: () => void }) {
  if (search) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Search className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">No notes matching "{search}"</p>
        <p className="text-xs text-muted-foreground">Try a different search term</p>
      </div>
    )
  }
  if (filter === 'trash') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Trash2 className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Trash is empty</p>
        <p className="text-xs text-muted-foreground">Deleted notes appear here</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center"
      >
        <FileText className="w-10 h-10 text-indigo-400/50" />
      </motion.div>
      <div className="text-center">
        <p className="text-foreground font-medium">No notes yet</p>
        <p className="text-xs text-muted-foreground mt-1">Create your first note to get started</p>
      </div>
      <button onClick={onCreate} className="btn-primary text-sm flex items-center gap-2">
        <Plus className="w-4 h-4" /> Create Note
      </button>
      <button className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition-colors">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Or generate with AI
      </button>
    </div>
  )
}
