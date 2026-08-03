import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload, Search, Database, FileText, Loader2, CheckCircle,
  Trash2, ChevronRight, Brain, BookOpen, Sparkles
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { ragApi } from '@/api/client'
import toast from 'react-hot-toast'

export default function RAGPage() {
  const [collection, setCollection]   = useState('default')
  const [question, setQuestion]       = useState('')
  const [answer, setAnswer]           = useState<any>(null)
  const [querying, setQuerying]       = useState(false)
  const [model, setModel]             = useState('llama3')
  const [uploading, setUploading]     = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)

  const { data: collectionsData, refetch: refetchCollections } = useQuery({
    queryKey: ['rag-collections'],
    queryFn: () => ragApi.listCollections().then(r => r.data),
  })

  const { data: docsData, refetch: refetchDocs } = useQuery({
    queryKey: ['rag-documents', collection],
    queryFn: () => ragApi.listDocuments(collection).then(r => r.data),
  })

  const collections = collectionsData?.collections || []
  const docs = Array.isArray(docsData) ? docsData : []

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setUploading(true)
    setUploadResult(null)
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('collection', collection)
        const res = await ragApi.upload(formData)
        setUploadResult(res.data)
        toast.success(`✅ "${file.name}" indexed with ${res.data.chunks} chunks!`)
      }
      refetchCollections()
      refetchDocs()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [collection, refetchCollections, refetchDocs])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    multiple: true,
  })

  const handleQuery = async () => {
    if (!question.trim()) return
    setQuerying(true)
    setAnswer(null)
    try {
      const res = await ragApi.query({ question, collection, model, n_results: 5 })
      setAnswer(res.data)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Query failed')
    } finally {
      setQuerying(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          RAG Knowledge Base
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload documents → Auto-index → Ask questions → Get AI answers with citations
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload panel */}
        <div className="lg:col-span-1 space-y-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" /> Upload Documents
            </h3>

            {/* Collection input */}
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1 block">COLLECTION NAME</label>
              <input
                value={collection}
                onChange={e => setCollection(e.target.value)}
                placeholder="default"
                className="enterprise-input text-sm"
              />
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <span className="text-sm text-blue-400">Processing & Indexing...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Drop files here</p>
                    <p className="text-muted-foreground text-xs mt-0.5">PDF, DOCX, XLSX, CSV, PPTX, TXT, MD</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload result */}
            {uploadResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Successfully Indexed
                </div>
                <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                  <div>Chunks: <span className="text-white">{uploadResult.chunks}</span></div>
                  <div>Characters: <span className="text-white">{uploadResult.total_chars?.toLocaleString()}</span></div>
                  <div className="truncate">Hash: <span className="text-emerald-400 font-mono text-[10px]">{uploadResult.document_hash?.slice(0, 20)}...</span></div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Collections */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" /> Collections ({collections.length})
            </h3>
            {collections.length === 0 ? (
              <p className="text-muted-foreground text-xs">No collections yet. Upload a document first.</p>
            ) : (
              <div className="space-y-2">
                {collections.map((col: string) => (
                  <button
                    key={col}
                    onClick={() => setCollection(col)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      collection === col ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2"><Database className="w-3 h-3" />{col}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Indexed docs */}
          {docs.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> Indexed Documents ({docs.length})
              </h3>
              <div className="space-y-2">
                {docs.map((doc: any) => (
                  <div key={doc.id} className="glass rounded-lg p-2.5 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-white text-xs font-medium truncate">{doc.title}</div>
                      <div className="text-muted-foreground text-[10px]">{doc.chunk_count} chunks · .{doc.file_type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Query panel */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" /> Ask the Knowledge Base
            </h3>

            <div className="flex gap-3 mb-4">
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                <option value="llama3">Llama 3</option>
                <option value="mistral">Mistral</option>
                <option value="phi3">Phi-3</option>
                <option value="gemma">Gemma</option>
              </select>
              <div className="badge badge-info self-center">Collection: {collection}</div>
            </div>

            <div className="flex gap-2">
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuery() } }}
                placeholder="Ask a question about your documents... (Enter to send)"
                className="enterprise-input flex-1 resize-none"
                rows={3}
              />
              <motion.button
                onClick={handleQuery}
                disabled={querying || !question.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary px-5 self-stretch flex items-center gap-2"
              >
                {querying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {querying ? 'Searching...' : 'Ask AI'}
              </motion.button>
            </div>
          </motion.div>

          {/* Answer */}
          {answer && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-white font-semibold">AI Answer</h3>
                <span className="badge badge-info ml-auto text-[10px]">{answer.context_chunks} chunks retrieved</span>
              </div>

              <div className="prose-dark text-sm mb-4">
                <ReactMarkdown>{answer.answer}</ReactMarkdown>
              </div>

              {answer.sources?.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-xs text-muted-foreground font-medium mb-2">📚 RETRIEVED SOURCES</h4>
                  <div className="space-y-2">
                    {answer.sources.map((src: any) => (
                      <div key={src.index} className="glass rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-indigo-400 text-xs font-semibold">
                            [Source {src.index}] {src.metadata?.document_title || 'Document'}
                          </span>
                          <span className="badge badge-success text-[10px]">
                            {(src.score * 100).toFixed(0)}% match
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">{src.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Prompt suggestions */}
          {!answer && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5">
              <h3 className="text-white font-semibold mb-3 text-sm">💡 Try these questions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'What are the key findings in the document?',
                  'Summarize the main points',
                  'What are the recommendations?',
                  'List all action items mentioned',
                  'What are the risks identified?',
                  'Explain the methodology used',
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => setQuestion(q)}
                    className="glass rounded-xl p-3 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
