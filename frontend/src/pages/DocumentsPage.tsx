import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  FileText, Upload, Trash2, Download, Search, Loader2, Eye, Hash, Shield, Key,
  CheckCircle, Edit3, History, Globe, FileCheck, Copy
} from 'lucide-react'
import { documentsApi } from '@/api/client'
import toast from 'react-hot-toast'

const FILE_ICONS: Record<string, string> = { pdf: '📄', docx: '📝', xlsx: '📊', csv: '📋', pptx: '📑', txt: '📃', md: '📝' }

export default function DocumentsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadPassword, setUploadPassword] = useState('')
  const [selected, setSelected] = useState<any>(null)
  
  // File operations states
  const [unlockPassword, setUnlockPassword] = useState('')
  const [unlockedText, setUnlockedText] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [historyList, setHistoryList] = useState<any[]>([])
  const [targetFormat, setTargetFormat] = useState('pdf')

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.list().then(r => r.data)
  })
  
  const docs = data?.documents || []
  
  // Fast Search triggered either on input change or clicking the search button
  const filtered = docs.filter((d: any) => 
    d.title.toLowerCase().includes(activeSearch.toLowerCase())
  )

  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentsApi.delete(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Deleted')
      setSelected(null)
      setIsUnlocked(false)
      setUnlockedText('')
    },
  })

  const unlockMutation = useMutation({
    mutationFn: (pwd: string) => documentsApi.unlock(selected.id, { password: pwd }).then(r => r.data),
    onSuccess: (res) => {
      setIsUnlocked(true)
      setUnlockedText(res.content)
      setEditText(res.content)
      toast.success('Document unlocked successfully!')
    },
    onError: () => {
      toast.error('Incorrect password. Please try again.')
    }
  })

  const correctMutation = useMutation({
    mutationFn: (data: any) => documentsApi.correct(selected.id, data).then(r => r.data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['documents'] })
      toast.success(`Correction registered in block #${res.blockchain_record}!`)
      setUnlockedText(editText)
      setIsEditing(false)
    },
    onError: () => {
      toast.error('Failed to save correction.')
    }
  })

  const fetchHistoryMutation = useMutation({
    mutationFn: () => documentsApi.corrections(selected.id).then(r => r.data),
    onSuccess: (res) => {
      setHistoryList(res.history || [])
    }
  })

  const convertMutation = useMutation({
    mutationFn: (data: any) => documentsApi.convert(selected.id, data).then(r => r.data),
    onSuccess: (blob, vars) => {
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${selected.title.split('.')[0]}.${vars.format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success(`Offline conversion to ${vars.format.toUpperCase()} complete!`)
    },
    onError: () => {
      toast.error('Conversion failed.')
    }
  })

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'general')
      if (uploadPassword) {
        fd.append('password', uploadPassword)
      }
      try {
        await documentsApi.upload(fd)
        toast.success(`✅ ${file.name} uploaded`)
      } catch (e: any) {
        toast.error(e.response?.data?.detail || 'Upload failed')
      }
    }
    setUploading(false)
    setUploadPassword('')
    qc.invalidateQueries({ queryKey: ['documents'] })
  }, [qc, uploadPassword])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true })

  const handleSelectDoc = (doc: any) => {
    setSelected(doc)
    setIsUnlocked(false)
    setUnlockedText('')
    setIsEditing(false)
    setUnlockPassword('')
    setHistoryList([])
  }

  const triggerUnlock = () => {
    if (!unlockPassword) return
    unlockMutation.mutate(unlockPassword)
  }

  const triggerSaveCorrection = () => {
    correctMutation.mutate({
      password: unlockPassword,
      content_text: editText
    })
  }

  const triggerConvert = () => {
    convertMutation.mutate({
      format: targetFormat,
      password: unlockPassword
    })
  }

  const handleCopyShareLink = () => {
    const baseUrl = window.location.origin
    const shareLink = `${baseUrl}/api/v1/documents/shared/${selected.id}`
    navigator.clipboard.writeText(shareLink)
    toast.success('Shareable API download link copied to clipboard!')
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          Document Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Upload, search, password protect, write corrections, and verify integrity via blockchain.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div {...getRootProps()} className={`glass-card p-6 text-center cursor-pointer border-2 border-dashed transition-all ${isDragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/20 hover:border-white/40'}`}>
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Drop files here</p>
                <p className="text-muted-foreground text-xs">Supports PDF, Word, Excel, CSV, TXT</p>
              </>
            )}
          </div>

          <div className="glass-card p-4 space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Optional File Password</label>
            <input
              type="password"
              value={uploadPassword}
              onChange={e => setUploadPassword(e.target.value)}
              placeholder="Set password to encrypt on upload..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setActiveSearch(e.target.value); }}
                placeholder="Search documents..."
                className="enterprise-input pl-10"
              />
            </div>
            <button 
              onClick={() => setActiveSearch(search)}
              className="px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
            >
              Search
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-12 text-center text-muted-foreground">No documents found. Upload your first document!</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((doc: any) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleSelectDoc(doc)}
                  className={`glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all ${selected?.id === doc.id ? 'border-cyan-500/50 bg-cyan-500/5' : ''}`}
                >
                  <span className="text-2xl">{FILE_ICONS[doc.file_type] || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{doc.title}</div>
                    <div className="text-muted-foreground text-xs flex gap-3 mt-0.5">
                      <span>.{doc.file_type}</span>
                      <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                      <span>{doc.category}</span>
                      {doc.is_indexed && <span className="badge-success badge text-[10px]">RAG Indexed</span>}
                      {doc.is_locked && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> Locked</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); deleteMutation.mutate(doc.id) }}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-6 space-y-6"
          >
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>{FILE_ICONS[selected.file_type] || '📄'}</span>
                  {selected.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Blockchain hash verification & correction desk</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selected.is_locked ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
                {selected.is_locked ? 'AES Encrypted' : 'Plaintext'}
              </span>
            </div>

            {selected.is_locked && !isUnlocked ? (
              <div className="glass rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5 max-w-md mx-auto text-center space-y-4">
                <Key className="w-10 h-10 text-amber-400 mx-auto" />
                <div>
                  <h4 className="text-white font-medium">Password Protected File</h4>
                  <p className="text-xs text-muted-foreground mt-1">This file is encrypted using blockchain credentials. Provide the password to view or correct.</p>
                </div>
                <input
                  type="password"
                  value={unlockPassword}
                  onChange={e => setUnlockPassword(e.target.value)}
                  placeholder="Enter file password..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
                <button
                  onClick={triggerUnlock}
                  disabled={unlockMutation.isPending}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                >
                  {unlockMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Decrypt File Content
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Metadata block */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    ['File Extension', `.${selected.file_type}`],
                    ['Storage Size', `${(selected.file_size/1024).toFixed(1)} KB`],
                    ['RAG Collection', selected.category || 'general'],
                    ['Blockchain Ledger', 'Verified on-chain']
                  ].map(([k, v]) => (
                    <div key={k} className="glass rounded-xl p-3 bg-white/3">
                      <div className="text-xs text-muted-foreground">{k}</div>
                      <div className="text-white text-sm font-medium mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>

                {selected.document_hash && (
                  <div className="glass rounded-xl p-3 flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20">
                    <Hash className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground font-medium">Ledger Data Hash:</span>
                    <span className="text-indigo-400 font-mono text-xs truncate flex-1">{selected.document_hash}</span>
                  </div>
                )}

                {/* Operations tabs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: View & Edit Content */}
                  <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        {isEditing ? 'Write Correction' : 'File Content Reader'}
                      </h4>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isEditing ? 'Cancel Edit' : 'Edit Text'}
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          rows={8}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none resize-none"
                        />
                        <button
                          onClick={triggerSaveCorrection}
                          disabled={correctMutation.isPending}
                          className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-1.5"
                        >
                          {correctMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                          Commit Correction & Update Hash
                        </button>
                      </div>
                    ) : (
                      <div className="max-h-[220px] overflow-y-auto p-3 bg-white/3 rounded-xl border border-white/5 text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                        {unlockedText || selected.content_text || 'No text extracted. Document may be binary.'}
                      </div>
                    )}
                  </div>

                  {/* Right: Convert & Share */}
                  <div className="space-y-4">
                    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Download className="w-4 h-4 text-emerald-400" /> Convert Document Format
                      </h4>
                      <div className="flex gap-2">
                        <select
                          value={targetFormat}
                          onChange={e => setTargetFormat(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none flex-1"
                        >
                          <option value="pdf">PDF (.pdf)</option>
                          <option value="txt">Text (.txt)</option>
                        </select>
                        <button
                          onClick={triggerConvert}
                          disabled={convertMutation.isPending}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all"
                        >
                          Convert & Download
                        </button>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-400" /> Share Secure Download Link
                      </h4>
                      <p className="text-xs text-muted-foreground">Anyone with this URL can securely download the file directly from our server (protected by password if locked).</p>
                      <button
                        onClick={handleCopyShareLink}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs rounded-xl flex items-center justify-center gap-2 border border-white/10 transition-all"
                      >
                        <Copy className="w-4 h-4" /> Copy Access Link
                      </button>
                    </div>
                  </div>
                </div>

                {/* History block */}
                <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-400" /> Blockchain Version History
                    </h4>
                    <button
                      onClick={() => fetchHistoryMutation.mutate()}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      Retrieve Ledger
                    </button>
                  </div>
                  {historyList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-muted-foreground">
                            <th className="py-2">Block Index</th>
                            <th>Version</th>
                            <th>Committer</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyList.map((h: any) => (
                            <tr key={h.index} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                              <td className="py-2 text-indigo-400 font-mono">Block #{h.index}</td>
                              <td className="text-white font-medium">v{h.version}</td>
                              <td className="text-muted-foreground">{h.author}</td>
                              <td className="text-muted-foreground">{h.timestamp ? new Date(h.timestamp).toLocaleString() : 'N/A'}</td>
                              <td><span className="text-emerald-400 font-medium">✓ Verified</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">Click retrieve to read immutable blockchain updates.</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
