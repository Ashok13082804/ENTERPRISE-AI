import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, FileText, Upload, Lock, Key, Copy, Download, Edit3, Trash2,
  RefreshCw, CheckCircle, FileCode, Cpu, Terminal, BookOpen, AlertCircle,
  HelpCircle, Eye, EyeOff, Loader2, Sparkles, Send, FileCheck, Share2
} from 'lucide-react'
import { cybersecurityApi } from '@/api/client'
import toast from 'react-hot-toast'

export default function CybersecurityPage() {
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<any>(null)
  
  // Vault Upload states
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadPassword, setUploadPassword] = useState('')
  const [showUploadPass, setShowUploadPass] = useState(false)
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Interactive Operations state
  const [promptAction, setPromptAction] = useState<'read' | 'edit' | 'download' | 'convert' | 'share' | 'rag' | null>(null)
  const [authPassword, setAuthPassword] = useState('')
  const [showAuthPass, setShowAuthPass] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [activePassword, setActivePassword] = useState('') // caches the validated password for the session
  
  // Result States
  const [fileContent, setFileContent] = useState('')
  const [isBinary, setIsBinary] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [targetExtension, setTargetExtension] = useState('json')
  const [shareLink, setShareLink] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  
  // RAG States
  const [ragQuestion, setRagQuestion] = useState('Summarize the key points of this file.')
  const [ragAnswer, setRagAnswer] = useState('')

  // Load Vault Files list
  const { refetch: refetchFiles, isPending: loadingFiles } = useQuery({
    queryKey: ['cyber-vault-files'],
    queryFn: () => cybersecurityApi.list().then(res => {
      setFiles(res.data.files || [])
      return res.data.files
    }),
  })

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUploadFile) return
      const formData = new FormData()
      formData.append('file', selectedUploadFile)
      return cybersecurityApi.upload(formData, uploadTitle, uploadPassword)
    },
    onSuccess: () => {
      toast.success('File secured in vault!')
      setUploadTitle('')
      setUploadPassword('')
      setSelectedUploadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      refetchFiles()
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Upload failed'),
  })

  const readMutation = useMutation({
    mutationFn: (pwd: string) => cybersecurityApi.read(selectedFile.id, { password: pwd }).then(r => r.data),
    onSuccess: (data) => {
      setFileContent(data.content)
      setIsBinary(data.binary)
      setEditContent(data.content)
      setIsUnlocked(true)
      setActivePassword(authPassword)
      setPromptAction(null)
      toast.success('Decryption successful!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Incorrect password')
      setAuthPassword('')
    }
  })

  const writeMutation = useMutation({
    mutationFn: (data: any) => cybersecurityApi.write(selectedFile.id, data).then(r => r.data),
    onSuccess: () => {
      toast.success('Changes saved successfully!')
      setFileContent(editContent)
      refetchFiles()
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Write failed'),
  })

  const downloadMutation = useMutation({
    mutationFn: (pwd: string) => cybersecurityApi.download(selectedFile.id, { password: pwd }).then(r => r.data),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', selectedFile.filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Secure download initiated!')
      setPromptAction(null)
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Download authentication failed'),
  })

  const convertMutation = useMutation({
    mutationFn: (pwd: string) => cybersecurityApi.convert(selectedFile.id, { password: pwd, target_extension: targetExtension }).then(r => r.data),
    onSuccess: (data) => {
      toast.success(data.message || 'File converted successfully!')
      refetchFiles()
      setSelectedFile((prev: any) => ({
        ...prev,
        filename: data.new_filename,
        extension: data.extension,
        size_bytes: data.size_bytes
      }))
      setPromptAction(null)
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Conversion failed'),
  })

  const shareMutation = useMutation({
    mutationFn: (pwd: string) => cybersecurityApi.share(selectedFile.id, { password: pwd }).then(r => r.data),
    onSuccess: (data) => {
      setShareLink(window.location.origin + data.share_url)
      setPromptAction(null)
      toast.success('Decryption URL link generated!')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Verification failure'),
  })

  const ragMutation = useMutation({
    mutationFn: (pwd: string) => cybersecurityApi.rag(selectedFile.id, { password: pwd, question: ragQuestion }).then(r => r.data),
    onSuccess: (data) => {
      setRagAnswer(data.answer)
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'RAG Pipeline error'),
  })

  // Selection reset
  const handleSelectFile = (file: any) => {
    setSelectedFile(file)
    setIsUnlocked(false)
    setActivePassword('')
    setFileContent('')
    setEditContent('')
    setRagAnswer('')
    setShareLink('')
  }

  const handleVerifyAuth = () => {
    if (!authPassword) return
    if (promptAction === 'read') {
      readMutation.mutate(authPassword)
    } else if (promptAction === 'download') {
      downloadMutation.mutate(authPassword)
    } else if (promptAction === 'convert') {
      convertMutation.mutate(authPassword)
    } else if (promptAction === 'share') {
      shareMutation.mutate(authPassword)
    } else if (promptAction === 'rag') {
      ragMutation.mutate(authPassword)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopiedLink(true)
    toast.success('Share link copied!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cybersecurity & File Vault</h1>
            <p className="text-xs text-white/40">Secure Encrypted Storage, Extensions Transmutation & Local Document RAG</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs text-red-400 font-semibold uppercase">Encrypted Session</span>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column: Vault File Manager List */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          
          {/* File Upload Section */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-red-400" /> Secure New File
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 mb-1.5 block">DOCUMENT TITLE</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="e.g. Q3 Sales Report"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 mb-1.5 block">VAULT ACCESS PASSWORD</label>
                <div className="relative">
                  <input
                    type={showUploadPass ? 'text' : 'password'}
                    value={uploadPassword}
                    onChange={e => setUploadPassword(e.target.value)}
                    placeholder="Enter encryption key..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-9 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                  <button
                    onClick={() => setShowUploadPass(!showUploadPass)}
                    className="absolute right-2.5 top-2 text-white/30 hover:text-white/60"
                  >
                    {showUploadPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-white/30 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-white/5"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => setSelectedUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5 text-white/40" />
                </div>
                <div className="text-white/60 text-xs font-semibold">
                  {selectedUploadFile ? selectedUploadFile.name : 'Select file to secure'}
                </div>
                <div className="text-white/20 text-[10px] mt-1">TXT, PDF, CSV, JSON, PNG, JPG</div>
              </div>

              <motion.button
                onClick={() => uploadMutation.mutate()}
                disabled={uploadMutation.isPending || !selectedUploadFile || !uploadTitle || !uploadPassword}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Seal in Vault
              </motion.button>
            </div>
          </div>

          {/* Secure Vault Files List */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" /> Vault Files ({files.length})
              </h3>
              <button onClick={() => refetchFiles()} className="text-white/40 hover:text-white/70">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingFiles ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                <span className="text-[10px] text-white/30">Loading vault records...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-10 text-white/20 text-xs">
                Vault is empty. Secure a file above.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 relative overflow-hidden ${
                      selectedFile?.id === file.id
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white/40" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-xs font-semibold truncate leading-tight">{file.title}</div>
                      <div className="text-[10px] text-white/40 truncate mt-0.5">{file.filename}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[9px] uppercase font-bold text-red-400 border border-red-400/30 px-1.5 py-0.5 rounded bg-red-400/5">
                        {file.extension}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: File Workspace operations */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card p-6 h-full min-h-[500px] flex flex-col justify-between">
            {selectedFile ? (
              <div className="space-y-5 flex-1 flex flex-col">
                
                {/* File Header Details */}
                <div className="flex justify-between items-start pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm capitalize">{selectedFile.title}</h4>
                      <p className="text-[10px] text-white/40 mt-0.5 font-mono">{selectedFile.filename} · {(selectedFile.size_bytes / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Decrypted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-400 animate-pulse">
                        <Lock className="w-3.5 h-3.5" /> Encrypted Lock
                      </span>
                    )}
                  </div>
                </div>

                {/* Unlock Vault Key Required Trigger */}
                {!isUnlocked ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                      <Lock className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="max-w-sm">
                      <div className="text-white font-bold text-sm">Decryption Key Required</div>
                      <div className="text-white/30 text-xs mt-1">Enter file passcode to proceed with read, edit, convert, download or sharing.</div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setPromptAction('read')
                        setAuthPassword('')
                      }}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-xs shadow-lg flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" /> Decrypt File Vault
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5 flex-1 flex flex-col">
                    
                    {/* Vault Actions Row */}
                    <div className="flex flex-wrap gap-2 py-1">
                      <button
                        onClick={() => {
                          setPromptAction('read')
                          setAuthPassword(activePassword)
                          readMutation.mutate(activePassword)
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Read
                      </button>

                      <button
                        onClick={() => {
                          setPromptAction('convert')
                          setAuthPassword(activePassword)
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Convert Extension
                      </button>

                      <button
                        onClick={() => {
                          setPromptAction('share')
                          setAuthPassword(activePassword)
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Copy Link
                      </button>

                      <button
                        onClick={() => {
                          setPromptAction('download')
                          setAuthPassword(activePassword)
                          downloadMutation.mutate(activePassword)
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" /> Download
                      </button>
                    </div>

                    {/* Result Content Box */}
                    {fileContent && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 flex-1 flex flex-col">
                        <div className="flex justify-between items-center text-xs text-white/50">
                          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Decrypted Content Stream</span>
                          {!isBinary && (
                            <button
                              onClick={() => writeMutation.mutate({ password: activePassword, new_content: editContent })}
                              disabled={writeMutation.isPending}
                              className="text-red-400 font-bold hover:text-red-300 transition-colors flex items-center gap-1"
                            >
                              {writeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                              Save Changes
                            </button>
                          )}
                        </div>

                        {isBinary ? (
                          <div className="bg-black/30 rounded-xl p-5 border border-white/10 text-center text-white/40 text-xs">
                            {fileContent}
                          </div>
                        ) : (
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full flex-1 min-h-[160px] bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 focus:outline-none focus:border-red-500/30 resize-none leading-relaxed"
                          />
                        )}
                      </motion.div>
                    )}

                    {/* RAG Summarization Interface */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Local RAG Assistant</span>
                        <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">Offline (Ollama)</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ragQuestion}
                          onChange={e => setRagQuestion(e.target.value)}
                          placeholder="Ask the local RAG to explain, summarize, or translate..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/30"
                        />
                        <button
                          onClick={() => ragMutation.mutate(activePassword)}
                          disabled={ragMutation.isPending || !ragQuestion}
                          className="px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {ragMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Analyze
                        </button>
                      </div>

                      {ragAnswer && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-black/30 rounded-xl p-3 border border-white/5 text-xs text-white/80 leading-relaxed font-mono whitespace-pre-wrap max-h-40 overflow-y-auto"
                        >
                          {ragAnswer}
                        </motion.div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white/20" />
                </div>
                <div>
                  <div className="text-white/40 font-semibold">Decryption Terminal Ready</div>
                  <div className="text-white/20 text-xs mt-1">Select a vault record on the left to initialize authentication.</div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Share Link Modal Overlay */}
      {shareLink && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold text-sm">Decrypted Share Link Created</span>
              <button onClick={() => setShareLink('')} className="text-white/40 hover:text-white/70">✕</button>
            </div>
            
            <div className="bg-black/40 rounded-xl p-3 border border-white/10 flex items-center justify-between">
              <span className="font-mono text-xs text-indigo-400 truncate flex-1 select-all">{shareLink}</span>
              <button
                onClick={handleCopyLink}
                className="ml-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                {copiedLink ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="text-[10px] text-white/40">
              Anyone with this cryptographic token can decrypt and stream the file contents on demand. Keep it safe.
            </div>
          </div>
        </div>
      )}

      {/* Vault Password Dialog Prompt (Used when action triggered first time or not cached) */}
      {promptAction && !activePassword && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-sm w-full p-6 space-y-4 border-red-500/20">
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <h4 className="text-white font-bold text-sm">Authentication Required</h4>
              <p className="text-[11px] text-white/40 mt-1 uppercase">Perform: {promptAction} file</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">VAULT PASSWORD KEY</label>
                <div className="relative">
                  <input
                    type={showAuthPass ? 'text' : 'password'}
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="Enter file decryption pass..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-9 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                  <button
                    onClick={() => setShowAuthPass(!showAuthPass)}
                    className="absolute right-2.5 top-2 text-white/30 hover:text-white/60"
                  >
                    {showAuthPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {promptAction === 'convert' && (
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">TARGET EXTENSION</label>
                  <select
                    value={targetExtension}
                    onChange={e => setTargetExtension(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="json">JSON format</option>
                    <option value="csv">CSV format</option>
                    <option value="txt">TXT format</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setPromptAction(null)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-xs font-semibold"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleVerifyAuth}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  Confirm Key
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}
