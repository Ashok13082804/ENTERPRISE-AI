import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale, FileText, Shield, AlertTriangle, Search, Upload, CheckCircle,
  XCircle, Hash, BarChart2, Brain, BookOpen, Link2, ChevronRight,
  Zap, Eye, Plus, Loader2, X, AlertCircle, Copy, Check, FileCheck, HelpCircle, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'analyze' | 'compare' | 'clauses' | 'search' | 'blockchain'>('overview')
  
  // States
  const [analysisText, setAnalysisText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  
  const [doc1Text, setDoc1Text] = useState('')
  const [doc2Text, setDoc2Text] = useState('')
  const [compareResult, setCompareResult] = useState<any>(null)

  const [clauseType, setClauseType] = useState('indemnification')
  const [clauseContext, setClauseContext] = useState('Service agreement between software companies')
  const [clauseJurisdiction, setClauseJurisdiction] = useState('India')
  const [clauseResult, setClauseResult] = useState<any>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)

  const [verifyDocId, setVerifyDocId] = useState('D001')
  const [verifyResult, setVerifyResult] = useState<any>(null)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDocType, setUploadDocType] = useState('contract')

  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Queries
  const { data: stats, refetch: refetchStats } = useQuery({ queryKey: ['legal-stats'], queryFn: () => axios.get(`${API}/legal/stats`).then(r => r.data) })
  const { data: docsData, refetch: refetchDocs } = useQuery({ queryKey: ['legal-docs'], queryFn: () => axios.get(`${API}/legal/documents`).then(r => r.data) })

  // Mutations
  const uploadDocMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      if (uploadFile) fd.append('file', uploadFile)
      fd.append('doc_type', uploadDocType)
      return axios.post(`${API}/legal/documents/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
    },
    onSuccess: () => {
      toast.success('Document uploaded and hashed on blockchain!')
      setShowUploadModal(false)
      setUploadFile(null)
      refetchDocs()
      refetchStats()
    },
    onError: () => toast.error('Upload failed')
  })

  const analyzeMutation = useMutation({
    mutationFn: () => axios.post(`${API}/legal/analyze`, { text: analysisText, document_type: 'contract' }).then(r => r.data),
    onSuccess: d => { setAnalysisResult(d); toast.success('Contract risk analysis complete!') },
    onError: () => toast.error('Analysis failed'),
  })

  const compareMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('doc1_text', doc1Text)
      fd.append('doc2_text', doc2Text)
      return axios.post(`${API}/legal/compare`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
    },
    onSuccess: d => { setCompareResult(d); toast.success('Comparison analysis complete!') },
    onError: () => toast.error('Comparison failed')
  })

  const clauseMutation = useMutation({
    mutationFn: () => axios.post(`${API}/legal/clauses/generate`, {
      clause_type: clauseType, context: clauseContext, jurisdiction: clauseJurisdiction
    }).then(r => r.data),
    onSuccess: d => { setClauseResult(d); toast.success('Clause generated!') },
    onError: () => toast.error('Clause generation failed'),
  })

  const searchMutation = useMutation({
    mutationFn: () => axios.post(`${API}/legal/search`, { query: searchQuery, search_type: 'semantic' }).then(r => r.data),
    onSuccess: d => setSearchResult(d),
    onError: () => toast.error('Legal search failed'),
  })

  const verifyMutation = useMutation({
    mutationFn: () => axios.get(`${API}/legal/blockchain/verify/${verifyDocId}`).then(r => r.data),
    onSuccess: d => { setVerifyResult(d); toast.success('Integrity verified!') },
    onError: () => toast.error('Verification failed'),
  })

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    toast.success('Copied text!')
    setTimeout(() => setCopiedText(null), 2000)
  }

  const riskColor = (level: string) => ({
    'High': 'text-red-400 bg-red-500/10 border-red-500/30',
    'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  }[level] || 'text-white/50')

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Legal AI Advisor</h1>
            <p className="text-xs text-white/40">Intelligent Legal Contract Risk Analysis & Cryptographic Ledger Verification</p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/10"
        >
          <Upload className="w-4 h-4" /> Upload Contract
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'overview', label: '📊 Dashboard Overview' },
          { id: 'documents', label: '🗂️ Document Manager' },
          { id: 'analyze', label: '🧠 AI Risk Analyzer' },
          { id: 'compare', label: '🔁 Version Comparator' },
          { id: 'clauses', label: '📝 Smart Clause Writer' },
          { id: 'search', label: '🔍 Case Law RAG' },
          { id: 'blockchain', label: '🔐 Blockchain Integrity' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-transparent shadow-lg shadow-purple-500/10'
                : 'text-white/50 border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Index Docs', value: stats?.total_documents || '1,284', icon: FileText, color: 'from-blue-500 to-indigo-500' },
                { label: 'High Risk Alerts', value: stats?.high_risk_docs || '234', icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
                { label: 'Blockchain Certified', value: stats?.blockchain_verified || '742', icon: Shield, color: 'from-emerald-500 to-teal-500' },
                { label: 'Avg Risk Index', value: `${stats?.avg_risk_score || '42.3'}/100`, icon: Scale, color: 'from-amber-500 to-orange-500' },
              ].map(stat => (
                <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/40 leading-tight">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Key Risk Indicators
                </h4>
                <div className="space-y-3 text-xs text-white/70">
                  <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                    <span className="font-semibold text-red-400">High Risk Patterns:</span>
                    <p className="mt-1 text-white/50 text-[11px]">unlimited liability, perpetual non-compete, unilateral modifications, irrevocable waivers.</p>
                  </div>
                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                    <span className="font-semibold text-amber-400">Medium Risk Patterns:</span>
                    <p className="mt-1 text-white/50 text-[11px]">automatic renewals, arbitration only clauses, liquidated damages triggers.</p>
                  </div>
                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                    <span className="font-semibold text-emerald-400">Low Risk Patterns:</span>
                    <p className="mt-1 text-white/50 text-[11px]">30-day notice periods, mutual agreement terminations, reasonable fees.</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" /> Latest Cases Timeline
                </h4>
                <div className="space-y-2">
                  {[
                    { title: 'Service Dispute - TechCorp vs ClientABC', status: 'Active Civil', date: 'Filed 2025-01-15' },
                    { title: 'Employment Termination Challenge', status: 'Pending Labour', date: 'Filed 2025-06-01' },
                    { title: 'Property Ownership Disputes', status: 'Resolved Property', date: 'Closed 2024-11-10' },
                  ].map((c, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white font-semibold">{c.title}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{c.date}</div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Document Manager */}
        {activeTab === 'documents' && (
          <motion.div key="documents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 pb-2">
                      <th className="py-2">DOCUMENT ID</th>
                      <th className="py-2">FILENAME</th>
                      <th className="py-2">DOCUMENT TYPE</th>
                      <th className="py-2">RISK RATING</th>
                      <th className="py-2">UPLOADED DATE</th>
                      <th className="py-2">LEDGER STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docsData?.documents?.map((doc: any) => (
                      <tr key={doc.id} className="border-b border-white/5 text-white/70 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-mono font-semibold text-violet-400">{doc.id}</td>
                        <td className="py-3 font-medium text-white">{doc.name}</td>
                        <td className="py-3">{doc.type}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${riskColor(doc.risk)}`}>
                            {doc.risk}
                          </span>
                        </td>
                        <td className="py-3 font-mono">{doc.uploaded}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            doc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-violet-500/20 text-violet-300'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: AI Risk Analyzer */}
        {activeTab === 'analyze' && (
          <motion.div key="analyze" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4.5 h-4.5 text-violet-400 animate-pulse" /> AI Contract Risk Inspector
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Paste Contract Text</label>
                    <textarea
                      value={analysisText}
                      onChange={e => setAnalysisText(e.target.value)}
                      placeholder="Paste contract terms, agreements, or NDA documents to audit risk levels..."
                      rows={10}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
                    />
                  </div>

                  <motion.button
                    onClick={() => analyzeMutation.mutate()}
                    disabled={analyzeMutation.isPending || !analysisText}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                    Analyze Contract Risk
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Results Report */}
            <div className="lg:col-span-5">
              <div className="glass-card p-5 h-full min-h-[460px] flex flex-col justify-between">
                <div className="text-xs text-white/40 mb-3 block font-bold tracking-wider uppercase">Audit Assessment Report</div>

                {analyzeMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    <span className="text-xs text-white/50 font-semibold">Running local RAG compliance checker...</span>
                  </div>
                ) : analysisResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    
                    <div className="bg-violet-500/5 rounded-2xl border border-violet-500/30 p-5 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] text-white/40 uppercase font-bold">RISK INDEX</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${riskColor(analysisResult.risk_level)}`}>
                          {analysisResult.risk_level}
                        </span>
                      </div>
                      
                      <div className="text-3xl font-bold font-mono text-violet-400">{analysisResult.risk_score} <span className="text-xs text-white/40 font-normal">/ 100</span></div>
                      <div className="text-[10px] text-indigo-400 mt-1 font-semibold">Fraud Probability Check: {Math.round(analysisResult.fraud_probability * 100)}%</div>

                      <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">DETECTED KEY CLAUSES</div>
                        <div className="space-y-1">
                          {analysisResult.key_clauses?.map((c: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs text-white/80">
                              <span>{c.clause}</span>
                              <span className={`font-semibold ${c.risk === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>{c.risk} Risk</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-[10px] text-white/60 leading-relaxed max-h-32 overflow-y-auto">
                      <div className="font-bold text-white/70 mb-1">Executive Summary:</div>
                      {analysisResult.ai_summary}
                    </div>

                    {analysisResult.recommendations?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 font-bold uppercase">REMEDIAL RECOMMENDATIONS</span>
                        <ul className="list-disc pl-4 text-[10px] text-white/70 space-y-1">
                          {analysisResult.recommendations.map((r: string, i: number) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Scale className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">Audit Terminal Standby</div>
                      <div className="text-white/20 text-[11px] mt-1">Paste contract content on the left to initiate risk analysis</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Version Comparator */}
        {activeTab === 'compare' && (
          <motion.div key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass-card p-5 space-y-3">
                <h4 className="text-white font-semibold text-xs uppercase">Original Version (v1)</h4>
                <textarea
                  value={doc1Text}
                  onChange={e => setDoc1Text(e.target.value)}
                  placeholder="Paste original contract text here..."
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
                />
              </div>

              <div className="glass-card p-5 space-y-3">
                <h4 className="text-white font-semibold text-xs uppercase">Modified Version (v2)</h4>
                <textarea
                  value={doc2Text}
                  onChange={e => setDoc2Text(e.target.value)}
                  placeholder="Paste modified or redlined contract text here..."
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
                />
              </div>
            </div>

            <motion.button
              onClick={() => compareMutation.mutate()}
              disabled={compareMutation.isPending || !doc1Text || !doc2Text}
              whileHover={{ scale: 1.02 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {compareMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Compare Versions & Highlight Deviations
            </motion.button>

            {compareResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">Similarity Score</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{Math.round(compareResult.similarity_score * 100)}%</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">Identical Clauses</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{compareResult.identical_clauses}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">Modified / Deviated</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{compareResult.modified_clauses}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">Risk Alteration</div>
                  <div className={`text-xl font-bold mt-1.5 uppercase ${compareResult.risk_change === 'Increased' ? 'text-red-400' : 'text-emerald-400'}`}>{compareResult.risk_change}</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Tab 5: Clause Generator */}
        {activeTab === 'clauses' && (
          <motion.div key="clauses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input controls */}
            <div className="lg:col-span-6 glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-violet-400 animate-pulse" /> Custom Clause Drafter
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Select Clause Category</label>
                  <select
                    value={clauseType}
                    onChange={e => setClauseType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="indemnification">Indemnification Clause</option>
                    <option value="limitation_of_liability">Limitation of Liability</option>
                    <option value="confidentiality">Confidentiality (NDA)</option>
                    <option value="termination">Termination Notice</option>
                    <option value="governing_law">Governing Law & Jurisdiction</option>
                    <option value="dispute_resolution">Dispute Resolution Process</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Clause Context / Scope</label>
                  <input
                    type="text"
                    value={clauseContext}
                    onChange={e => setClauseContext(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Governing Jurisdiction</label>
                  <input
                    type="text"
                    value={clauseJurisdiction}
                    onChange={e => setClauseJurisdiction(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <motion.button
                  onClick={() => clauseMutation.mutate()}
                  disabled={clauseMutation.isPending || !clauseContext}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {clauseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Generate Standard Clause
                </motion.button>
              </div>
            </div>

            {/* Generated output */}
            <div className="lg:col-span-6">
              <div className="glass-card p-5 h-full min-h-[380px] flex flex-col justify-between">
                <div className="text-xs text-white/40 mb-3 block font-bold tracking-wider uppercase">Generated Legal Verbiage</div>

                {clauseMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    <span className="text-xs text-white/50 font-semibold">Drafting binding clauses...</span>
                  </div>
                ) : clauseResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="relative">
                      <textarea
                        readOnly
                        value={clauseResult.generated_clause}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 focus:outline-none resize-none leading-relaxed h-[260px]"
                      />
                      <button
                        onClick={() => handleCopy(clauseResult.generated_clause)}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                      >
                        {copiedText === clauseResult.generated_clause ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">Drafter Console Ready</div>
                      <div className="text-white/20 text-[11px] mt-1">Configure options on the left to compile standard terms</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 6: Case Law RAG */}
        {activeTab === 'search' && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-3xl mx-auto">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4.5 h-4.5 text-violet-400" /> Interactive Case Law & Statutory Code RAG
              </h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Ask a legal query, e.g. What are the rules of arbitration under the Indian Contract Act?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                />
                <motion.button
                  onClick={() => searchMutation.mutate()}
                  disabled={searchMutation.isPending || !searchQuery}
                  whileHover={{ scale: 1.02 }}
                  className="px-5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 font-sans"
                >
                  {searchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </motion.button>
              </div>

              {searchResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-4">
                  <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Semantic Query Matches ({searchResult.results?.length || 0})</span>
                  <div className="space-y-2">
                    {searchResult.results?.map((res: any) => (
                      <div key={res.id} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-semibold">{res.title}</span>
                          <span className="text-violet-400 font-mono">{(res.relevance * 100).toFixed(1)}% match</span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed font-mono">{res.excerpt}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 7: Blockchain Integrity */}
        {activeTab === 'blockchain' && (
          <motion.div key="blockchain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-2xl mx-auto">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Hash className="w-4.5 h-4.5 text-violet-400" /> Verify Document Fingerprint on Blockchain Ledger
              </h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verifyDocId}
                  onChange={e => setVerifyDocId(e.target.value)}
                  placeholder="Enter Document ID (e.g. D001)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500/50"
                />
                <motion.button
                  onClick={() => verifyMutation.mutate()}
                  disabled={verifyMutation.isPending || !verifyDocId}
                  whileHover={{ scale: 1.02 }}
                  className="px-5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 font-sans"
                >
                  {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Verify
                </motion.button>
              </div>

              {verifyResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/30 text-xs text-white/70 space-y-2"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="w-4.5 h-4.5" /> Integrity Verification Passed
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
                    <div className="bg-white/5 p-2 rounded">Block Location: <span className="font-mono text-white">#{verifyResult.block_id}</span></div>
                    <div className="bg-white/5 p-2 rounded">Chain Status: <span className="text-emerald-400">Valid</span></div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded font-mono text-[10px] text-indigo-300 break-all select-all mt-1">
                    HASH: {verifyResult.block_hash}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-sm w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-white font-bold text-sm">Upload Legal Document File</span>
              <button onClick={() => setShowUploadModal(false)} className="text-white/40 hover:text-white/70">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Document Category</label>
                <select
                  value={uploadDocType}
                  onChange={e => setUploadDocType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="contract">Standard Contract</option>
                  <option value="nda">Non-Disclosure Agreement</option>
                  <option value="employment">Employment Agreement</option>
                  <option value="deed">Property / Asset Deed</option>
                </select>
              </div>

              <div
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.pdf,.txt,.docx'
                  input.onchange = e => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) setUploadFile(file)
                  }
                  input.click()
                }}
                className="border-2 border-dashed border-white/10 hover:border-white/30 rounded-xl p-6 text-center cursor-pointer hover:bg-white/5"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5 text-white/40" />
                </div>
                <div className="text-white/60 text-xs font-semibold">
                  {uploadFile ? uploadFile.name : 'Choose contract file'}
                </div>
                <div className="text-white/20 text-[9px] mt-0.5">PDF, TXT, DOCX</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => uploadDocMutation.mutate()}
                  disabled={uploadDocMutation.isPending || !uploadFile}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold"
                >
                  Confirm Upload
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  )
}

const TOOLTIP_STYLE = {
  background: '#0d1520',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: 10,
  color: '#fff'
}
