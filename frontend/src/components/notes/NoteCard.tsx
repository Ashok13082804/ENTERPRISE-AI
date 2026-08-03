import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Pin, Star, Archive, Trash2, Copy, Edit3, Lock,
  Clock, FileText, Tag, MoreHorizontal, Brain
} from 'lucide-react'
import { useState } from 'react'
import { notesApi } from '@/api/client'
import toast from 'react-hot-toast'

interface Note {
  id: number
  title: string
  content: string
  tags: string[]
  color: string
  is_pinned: boolean
  is_favorite: boolean
  is_archived: boolean
  is_trashed: boolean
  is_locked: boolean
  is_ai_generated: boolean
  word_count: number
  reading_time_minutes: number
  ai_summary?: string
  updated_at: string
  folder_id?: number
}

const COLOR_MAP: Record<string, { bg: string; border: string; glow: string }> = {
  default: { bg: 'bg-white/5', border: 'border-white/10', glow: '' },
  red:     { bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'shadow-red-500/10' },
  orange:  { bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-orange-500/10' },
  yellow:  { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/10' },
  green:   { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/10' },
  blue:    { bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-blue-500/10' },
  purple:  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-purple-500/10' },
  pink:    { bg: 'bg-pink-500/10', border: 'border-pink-500/30', glow: 'shadow-pink-500/10' },
}

const TAG_COLORS = ['bg-indigo-500/20 text-indigo-300', 'bg-purple-500/20 text-purple-300', 'bg-cyan-500/20 text-cyan-300', 'bg-emerald-500/20 text-emerald-300', 'bg-pink-500/20 text-pink-300']

interface NoteCardProps {
  note: Note
  view?: 'grid' | 'list'
  onRefresh: () => void
  selected?: boolean
  onSelect?: (id: number) => void
}

export default function NoteCard({ note, view = 'grid', onRefresh, selected, onSelect }: NoteCardProps) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const colors = COLOR_MAP[note.color] || COLOR_MAP.default

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const action = async (fn: () => Promise<any>, msg: string) => {
    setLoading(true)
    try {
      await fn()
      toast.success(msg)
      onRefresh()
    } catch {
      toast.error('Action failed')
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  const contentPreview = note.ai_summary || (note.content || '').replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\*/g, '').slice(0, 150)

  if (view === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`group flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer
          ${colors.bg} ${colors.border} hover:bg-white/10 ${selected ? 'ring-2 ring-primary/50' : ''}`}
        onClick={() => navigate(`/notes/${note.id}`)}
      >
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => { e.stopPropagation(); onSelect(note.id) }}
            className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">{note.title || 'Untitled'}</span>
            {note.is_ai_generated && <Brain className="w-3 h-3 text-purple-400 shrink-0" />}
            {note.is_pinned && <Pin className="w-3 h-3 text-yellow-400 shrink-0" />}
            {note.is_favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{contentPreview}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {note.tags.slice(0, 2).map((t, i) => (
            <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] ${TAG_COLORS[i % TAG_COLORS.length]}`}>{t}</span>
          ))}
          <span className="text-xs text-muted-foreground">{note.word_count}w</span>
          <span className="text-xs text-muted-foreground">{formatDate(note.updated_at)}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 backdrop-blur-sm
        ${colors.bg} ${colors.border} hover:shadow-xl ${colors.glow} ${selected ? 'ring-2 ring-primary/50' : ''}`}
      onClick={() => navigate(`/notes/${note.id}`)}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(note.id)}
            className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
          />
        </div>
      )}

      {/* Top badges */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {note.is_pinned && <Pin className="w-3.5 h-3.5 text-yellow-400" />}
          {note.is_favorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
          {note.is_ai_generated && (
            <span className="flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full">
              <Brain className="w-2.5 h-2.5" /> AI
            </span>
          )}
          {note.is_locked && <Lock className="w-3 h-3 text-muted-foreground" />}
        </div>

        {/* Action menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 w-44 glass-card rounded-xl shadow-2xl z-50 py-1 border border-white/10">
              <button onClick={() => navigate(`/notes/${note.id}`)} className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-white/5 text-foreground">
                <Edit3 className="w-3.5 h-3.5" /> Open & Edit
              </button>
              <button onClick={() => action(() => notesApi.duplicate(note.id).then(r => r.data), 'Note duplicated')} className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-white/5 text-foreground">
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              <button onClick={() => action(() => notesApi.update(note.id, { is_pinned: !note.is_pinned }).then(r => r.data), note.is_pinned ? 'Unpinned' : 'Pinned')} className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-white/5 text-foreground">
                <Pin className="w-3.5 h-3.5" /> {note.is_pinned ? 'Unpin' : 'Pin'}
              </button>
              <button onClick={() => action(() => notesApi.update(note.id, { is_favorite: !note.is_favorite }).then(r => r.data), note.is_favorite ? 'Removed from favorites' : 'Added to favorites')} className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-white/5 text-foreground">
                <Star className="w-3.5 h-3.5" /> {note.is_favorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button onClick={() => action(() => notesApi.update(note.id, { is_archived: true }).then(r => r.data), 'Archived')} className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-white/5 text-foreground">
                <Archive className="w-3.5 h-3.5" /> Archive
              </button>
              <div className="border-t border-white/10 my-1" />
              <button onClick={() => action(() => notesApi.delete(note.id).then(r => r.data), 'Moved to trash')} className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-white/5 text-red-400">
                <Trash2 className="w-3.5 h-3.5" /> Move to Trash
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white text-sm mb-1.5 line-clamp-2 leading-snug">
        {note.title || 'Untitled Note'}
      </h3>

      {/* Content preview */}
      {contentPreview && (
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
          {contentPreview}
        </p>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag, i) => (
            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full ${TAG_COLORS[i % TAG_COLORS.length]}`}>
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">+{note.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1"><FileText className="w-2.5 h-2.5" /> {note.word_count}w</span>
          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {note.reading_time_minutes}m read</span>
        </div>
        <span>{formatDate(note.updated_at)}</span>
      </div>
    </motion.div>
  )
}
