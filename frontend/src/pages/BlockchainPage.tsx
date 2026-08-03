import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2, Shield, FileText, Award, Loader2, CheckCircle, Hash, Plus,
  TrendingUp, Activity, Box, Coins, Send, Cpu, Calendar, User, List,
  AlertCircle, Key, FileCode, Search, Copy, Check, BarChart3, HelpCircle
} from 'lucide-react'
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { blockchainApi } from '@/api/client'
import toast from 'react-hot-toast'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7']
const CONTRACT_TYPES = ['Standard', 'Escrow', 'Voting', 'NFT Creation']

export default function BlockchainPage() {
  const [tab, setTab] = useState<'chain' | 'certificate' | 'transaction' | 'contract' | 'verify' | 'analytics'>('chain')
  
  // States
  const [certForm, setCertForm] = useState({
    recipient_name: '',
    certificate_type: 'Completion',
    issuer: '',
    description: '',
    grade: '',
    skills: ''
  })
  
  const [txForm, setTxForm] = useState({
    from_wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    to_wallet: '',
    amount: '',
    currency: 'ETH',
    note: ''
  })

  const [contractForm, setContractForm] = useState({
    contract_name: '',
    contract_type: 'Standard',
    parties: '',
    terms: '',
    value: ''
  })

  const [verifyHash, setVerifyHash] = useState('')
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [certResult, setCertResult] = useState<any>(null)
  const [txResult, setTxResult] = useState<any>(null)
  const [contractResult, setContractResult] = useState<any>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Fetch Chain and Analytics
  const { data: chainData, refetch: refetchChain } = useQuery({
    queryKey: ['blockchain-chain'],
    queryFn: () => blockchainApi.getChain().then(r => r.data),
    staleTime: 5000,
  })

  const { data: analyticsData, refetch: refetchAnalytics } = useQuery({
    queryKey: ['blockchain-analytics'],
    queryFn: () => blockchainApi.getAnalytics().then(r => r.data),
    staleTime: 5000,
  })

  // Mutations
  const certMutation = useMutation({
    mutationFn: (data: any) => blockchainApi.issueCertificate(data).then(r => r.data),
    onSuccess: (data) => {
      setCertResult(data)
      refetchChain()
      refetchAnalytics()
      toast.success('Certificate verified and issued on blockchain!')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to issue certificate'),
  })

  const txMutation = useMutation({
    mutationFn: (data: any) => blockchainApi.addTransaction(data).then(r => r.data),
    onSuccess: (data) => {
      setTxResult(data)
      refetchChain()
      refetchAnalytics()
      toast.success('Transaction logged and verified on blockchain!')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Transaction failed'),
  })

  const contractMutation = useMutation({
    mutationFn: (data: any) => blockchainApi.deployContract(data).then(r => r.data),
    onSuccess: (data) => {
      setContractResult(data)
      refetchChain()
      refetchAnalytics()
      toast.success('Smart Contract compiled & deployed on blockchain!')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Deployment failed'),
  })

  const verifyMutation = useMutation({
    mutationFn: () => blockchainApi.verifyHash({ hash_value: verifyHash }).then(r => r.data),
    onSuccess: (data) => setVerifyResult(data),
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Verification failed'),
  })

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    toast.success('Copied hash!')
    setTimeout(() => setCopiedText(null), 2000)
  }

  const chain = chainData?.chain || []
  const filteredChain = searchQuery
    ? chain.filter((b: any) => 
        b.hash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.record_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.issuer?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chain

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Blockchain Ledger</h1>
              <p className="text-xs text-white/40">Local Immutable Cryptographic Database & Smart Verification</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            <Box className="w-3.5 h-3.5 text-indigo-400" />
            <span>Blocks: <b>{chain.length}</b></span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            chainData?.is_valid ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            <span>{chainData?.is_valid ? 'Chain Validated' : 'Chain Tampered'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-400 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Hash Rate: {analyticsData?.hash_rate || '1.84'} GH/s</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'chain', label: '⛓️ Chain Explorer' },
          { id: 'certificate', label: '🏆 Issue Certificate' },
          { id: 'transaction', label: '💸 Transactions' },
          { id: 'contract', label: '🔐 Smart Contracts' },
          { id: 'verify', label: '🔍 Audit Verification' },
          { id: 'analytics', label: '📊 Statistics' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              tab === t.id
                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-transparent shadow-lg shadow-indigo-500/10'
                : 'text-white/50 border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        
        {/* Tab 1: Chain Explorer */}
        {tab === 'chain' && (
          <motion.div key="chain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex gap-3 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hash, type, or descriptions..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredChain.map((block: any, idx: number) => (
                <motion.div
                  key={block.index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-5 relative overflow-hidden border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-start md:items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-mono font-bold shadow-inner ${
                        block.index === 0
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        #{block.index}
                      </div>
                      {idx < filteredChain.length - 1 && (
                        <div className="w-0.5 h-12 bg-indigo-500/25 border-dashed border-l mt-2" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            block.record_type === 'certificate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            block.record_type === 'transaction' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            block.record_type === 'smart_contract' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                            'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {block.record_type?.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {block.timestamp ? new Date(block.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-white text-xs font-medium truncate">{block.description || 'Genesis Block'}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 text-[11px]">
                          <div className="flex items-center gap-1 text-white/50">
                            <span className="font-mono">Hash:</span>
                            <span className="text-indigo-400 font-mono truncate max-w-[150px]">{block.hash}</span>
                            <button onClick={() => handleCopy(block.hash)} className="text-white/30 hover:text-white/60">
                              {copiedText === block.hash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          {block.previous_hash && (
                            <div className="flex items-center gap-1 text-white/40">
                              <span className="font-mono">Prev:</span>
                              <span className="font-mono truncate max-w-[150px]">{block.previous_hash}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Render block contents depending on type */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs">
                        <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider">BLOCK METADATA</div>
                        {block.record_type === 'certificate' && (
                          <div className="space-y-1">
                            <div><span className="text-white/50">ID:</span> <span className="text-amber-300 font-mono font-semibold">{block.data?.certificate_id}</span></div>
                            <div><span className="text-white/50">To:</span> <span className="text-white/80">{block.recipient}</span></div>
                            <div><span className="text-white/50">Type:</span> <span className="text-white/80">{block.data?.certificate_type}</span></div>
                          </div>
                        )}
                        {block.record_type === 'transaction' && (
                          <div className="space-y-1">
                            <div><span className="text-white/50">Amount:</span> <span className="text-emerald-400 font-bold">{block.data?.amount} {block.data?.currency}</span></div>
                            <div><span className="text-white/50">From:</span> <span className="text-white/80 font-mono text-[10px] truncate block max-w-[120px]">{block.data?.from_wallet}</span></div>
                            <div><span className="text-white/50">To:</span> <span className="text-white/80 font-mono text-[10px] truncate block max-w-[120px]">{block.data?.to_wallet}</span></div>
                          </div>
                        )}
                        {block.record_type === 'smart_contract' && (
                          <div className="space-y-1">
                            <div><span className="text-white/50">Address:</span> <span className="text-violet-300 font-mono text-[10px] block truncate max-w-[150px]">{block.data?.contract_address}</span></div>
                            <div><span className="text-white/50">Terms:</span> <span className="text-white/80 truncate block">{block.data?.terms}</span></div>
                            <div><span className="text-white/50">Value:</span> <span className="text-white/80 font-bold">{block.data?.value} ETH</span></div>
                          </div>
                        )}
                        {(!block.record_type || block.record_type === 'audit' || block.record_type === 'genesis' || block.record_type === 'document') && (
                          <div className="space-y-1 text-white/50">
                            <div>Nonce: <span className="font-mono text-white/80">{block.nonce}</span></div>
                            <div>Issuer: <span className="text-white/80 truncate block max-w-[120px]">{block.issuer || 'System'}</span></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Issue Certificate */}
        {tab === 'certificate' && (
          <motion.div key="certificate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form */}
            <div className="lg:col-span-7 glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-amber-400" />
                Issue Tamper-Proof Professional Certificate
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">RECIPIENT NAME</label>
                  <input
                    type="text"
                    value={certForm.recipient_name}
                    onChange={e => setCertForm(p => ({ ...p, recipient_name: e.target.value }))}
                    placeholder="Recipient's Full Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">CERTIFICATE TYPE</label>
                  <select
                    value={certForm.certificate_type}
                    onChange={e => setCertForm(p => ({ ...p, certificate_type: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Completion">Completion Certificate</option>
                    <option value="Achievement">Achievement Certificate</option>
                    <option value="Employment">Employment Verification</option>
                    <option value="Excellence">Award of Excellence</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">ISSUING INSTITUTION</label>
                  <input
                    type="text"
                    value={certForm.issuer}
                    onChange={e => setCertForm(p => ({ ...p, issuer: e.target.value }))}
                    placeholder="Issuer Institution Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">GRADE / RESULT (OPTIONAL)</label>
                  <input
                    type="text"
                    value={certForm.grade}
                    onChange={e => setCertForm(p => ({ ...p, grade: e.target.value }))}
                    placeholder="e.g. A+, Distinction, 9.8 CGPA"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">SKILLS ASSESSED (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={certForm.skills}
                  onChange={e => setCertForm(p => ({ ...p, skills: e.target.value }))}
                  placeholder="e.g. Machine Learning, Python, Database Management"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">DESCRIPTION / CORE METRICS</label>
                <textarea
                  value={certForm.description}
                  onChange={e => setCertForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Briefly describe the candidate's achievements..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <motion.button
                onClick={() => {
                  const payload = {
                    recipient_name: certForm.recipient_name,
                    certificate_type: certForm.certificate_type,
                    issuer: certForm.issuer || 'Enterprise AI platform',
                    description: certForm.description,
                    grade: certForm.grade,
                    skills: certForm.skills.split(',').map(s => s.trim()).filter(Boolean)
                  }
                  certMutation.mutate(payload)
                }}
                disabled={certMutation.isPending || !certForm.recipient_name}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {certMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Issue on Blockchain
              </motion.button>
            </div>

            {/* Results Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card p-5 h-full">
                <div className="text-xs text-white/40 mb-3 block font-bold tracking-wider">CERTIFICATE VERIFICATION CARD PREVIEW</div>
                
                {certResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="bg-amber-500/5 rounded-2xl border border-amber-500/30 p-6 relative overflow-hidden text-center">
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                        BLOCKCHAIN VERIFIED
                      </div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Award className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg leading-tight">Digital Credential Certified</h3>
                      <div className="text-[10px] text-white/40 mt-1">ISSUED BY: {certResult.certificate?.issuer}</div>

                      <div className="my-5 border-y border-white/5 py-4">
                        <div className="text-xs text-white/50 mb-0.5">RECIPIENT</div>
                        <div className="text-white font-bold text-md capitalize">{certResult.certificate?.recipient_name}</div>
                        <div className="text-xs text-amber-400 font-semibold mt-1">{certResult.certificate?.certificate_type}</div>
                      </div>

                      {certResult.certificate?.details?.grade && (
                        <div className="mb-4">
                          <span className="text-[10px] text-white/40 block">RESULT / GRADE</span>
                          <span className="text-xs text-white font-semibold font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5">{certResult.certificate.details.grade}</span>
                        </div>
                      )}

                      <div className="space-y-2 text-left text-xs bg-black/25 rounded-xl p-3 border border-white/5">
                        <div className="flex justify-between">
                          <span className="text-white/40">Credential ID:</span>
                          <span className="font-mono text-white/80">{certResult.certificate_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Block Location:</span>
                          <span className="text-white/80 font-semibold">Block #{certResult.block_index}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/40">Block Hash:</span>
                          <span className="font-mono text-[9px] text-indigo-400 break-all select-all">{certResult.block_hash}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[340px] text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Award className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">No Certificate Issued Yet</div>
                      <div className="text-white/20 text-[11px] mt-1">Submit the form to generate blockchain credential</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Transactions */}
        {tab === 'transaction' && (
          <motion.div key="transaction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form */}
            <div className="lg:col-span-7 glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Coins className="w-4.5 h-4.5 text-emerald-400" />
                Record Immutable Ledger Transaction
              </h3>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">SENDER WALLET ADDRESS</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={txForm.from_wallet}
                    onChange={e => setTxForm(p => ({ ...p, from_wallet: e.target.value }))}
                    placeholder="0x..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">RECIPIENT WALLET ADDRESS</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={txForm.to_wallet}
                    onChange={e => setTxForm(p => ({ ...p, to_wallet: e.target.value }))}
                    placeholder="0x..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">AMOUNT</label>
                  <input
                    type="number"
                    value={txForm.amount}
                    onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">CURRENCY</label>
                  <select
                    value={txForm.currency}
                    onChange={e => setTxForm(p => ({ ...p, currency: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="USDT">Tether (USDT)</option>
                    <option value="SOL">Solana (SOL)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">MEMO / TRANSACTION NOTE</label>
                <input
                  type="text"
                  value={txForm.note}
                  onChange={e => setTxForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="e.g. Invoice Payment, Asset Transfer, Smart Contract Trigger"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <motion.button
                onClick={() => {
                  txMutation.mutate({
                    ...txForm,
                    amount: parseFloat(txForm.amount)
                  })
                }}
                disabled={txMutation.isPending || !txForm.to_wallet || !txForm.amount}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {txMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Log Transaction to Ledger
              </motion.button>
            </div>

            {/* Results Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card p-5 h-full">
                <div className="text-xs text-white/40 mb-3 block font-bold tracking-wider">TRANSACTION RECORD RECEIPT</div>

                {txResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/30 p-6 text-center relative overflow-hidden">
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                        CONFIRMED & IMMUTABLE
                      </div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg">Transaction Executed</h3>
                      
                      <div className="my-5 border-y border-white/5 py-4">
                        <div className="text-xs text-white/50 mb-0.5">TRANSFER AMOUNT</div>
                        <div className="text-2xl font-mono text-emerald-400 font-bold">
                          {txForm.amount} {txForm.currency}
                        </div>
                        <div className="text-xs text-white/40 mt-1">Gas fee: {txResult.gas_fee} {txForm.currency}</div>
                      </div>

                      <div className="space-y-2 text-left text-xs bg-black/25 rounded-xl p-3 border border-white/5 font-mono">
                        <div>
                          <span className="text-white/40">TX ID:</span>
                          <span className="text-white/80 float-right">{txResult.transaction_id}</span>
                        </div>
                        <div>
                          <span className="text-white/40">Block:</span>
                          <span className="text-white/80 float-right">#{txResult.block_index}</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 text-[10px] text-white/30">
                          <div>FROM: {txForm.from_wallet.slice(0, 18)}...</div>
                          <div className="mt-0.5">TO: {txForm.to_wallet.slice(0, 18)}...</div>
                          <div className="mt-1 text-indigo-400 break-all select-all font-sans text-[9px]">HASH: {txResult.tx_hash}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[340px] text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Coins className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">No Transactions Generated</div>
                      <div className="text-white/20 text-[11px] mt-1">Fill fields to submit transaction logs</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Smart Contracts */}
        {tab === 'contract' && (
          <motion.div key="contract" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form */}
            <div className="lg:col-span-7 glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <FileCode className="w-4.5 h-4.5 text-violet-400" />
                Deploy Smart Contract bytecode to Blockchain VM
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">CONTRACT NAME</label>
                  <input
                    type="text"
                    value={contractForm.contract_name}
                    onChange={e => setContractForm(p => ({ ...p, contract_name: e.target.value }))}
                    placeholder="e.g. EscrowHoldings"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">CONTRACT TYPE</label>
                  <select
                    value={contractForm.contract_type}
                    onChange={e => setContractForm(p => ({ ...p, contract_type: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                  >
                    {CONTRACT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">PARTIES (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={contractForm.parties}
                    onChange={e => setContractForm(p => ({ ...p, parties: e.target.value }))}
                    placeholder="Party A, Party B"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">VALUE STAKED / DEPOSITED (ETH)</label>
                  <input
                    type="number"
                    value={contractForm.value}
                    onChange={e => setContractForm(p => ({ ...p, value: e.target.value }))}
                    placeholder="0.0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">CONTRACT bytecode / CONDITIONS CODE</label>
                <textarea
                  value={contractForm.terms}
                  onChange={e => setContractForm(p => ({ ...p, terms: e.target.value }))}
                  placeholder="e.g. if (delivery_status == 'COMPLETED') { release_funds() } else { refund() }"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>

              <motion.button
                onClick={() => {
                  contractMutation.mutate({
                    contract_name: contractForm.contract_name,
                    contract_type: contractForm.contract_type,
                    parties: contractForm.parties.split(',').map(s => s.trim()).filter(Boolean),
                    terms: contractForm.terms,
                    value: contractForm.value ? parseFloat(contractForm.value) : 0.0
                  })
                }}
                disabled={contractMutation.isPending || !contractForm.contract_name || !contractForm.terms}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {contractMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                Compile & Deploy Smart Contract
              </motion.button>
            </div>

            {/* Contract State Display */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card p-5 h-full">
                <div className="text-xs text-white/40 mb-3 block font-bold tracking-wider">SMART CONTRACT COMPILATION STATUS</div>

                {contractResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="bg-violet-500/5 rounded-2xl border border-violet-500/30 p-6 text-center relative overflow-hidden">
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[9px] font-bold">
                        COMPILED & DEPLOYED
                      </div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <FileCode className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg">{contractResult.contract?.contract_name}</h3>
                      <div className="text-[10px] text-white/40 mt-1">STATUS: {contractResult.status}</div>

                      <div className="my-5 border-y border-white/5 py-3 text-left">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">COMPILATION ABI</div>
                        <pre className="bg-black/30 rounded-lg p-2.5 text-[9px] text-cyan-400 font-mono overflow-auto max-h-[80px]">
                          {JSON.stringify(contractResult.contract?.abi, null, 2)}
                        </pre>
                      </div>

                      <div className="space-y-2 text-left text-xs bg-black/25 rounded-xl p-3 border border-white/5 font-mono">
                        <div>
                          <span className="text-white/40">Staked:</span>
                          <span className="text-white/80 float-right font-bold">{contractResult.contract?.value} ETH</span>
                        </div>
                        <div>
                          <span className="text-white/40">Block Index:</span>
                          <span className="text-white/80 float-right">#{contractResult.block_index}</span>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <div className="text-[9px] text-white/30 truncate">ADDRESS: {contractResult.contract_address}</div>
                          <div className="text-[9px] text-indigo-400 break-all select-all mt-1">BYTECODE HASH: {contractResult.block_hash}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[340px] text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <FileCode className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">No Compiled Bytecode</div>
                      <div className="text-white/20 text-[11px] mt-1">Submit contract logic code to deploy</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: Verify Hash */}
        {tab === 'verify' && (
          <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-5 max-w-2xl mx-auto space-y-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Hash className="w-4.5 h-4.5 text-violet-400" /> Verify Block or Credential Integrity
              </h3>
              <p className="text-xs text-white/40">
                Paste any block hash, certificate ID, transaction hash, or document hash generated by this platform to query its immutable audit status.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verifyHash}
                  onChange={e => setVerifyHash(e.target.value)}
                  placeholder="Enter block hash, document hash, transaction ID..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500/50"
                />
                <motion.button
                  onClick={() => verifyMutation.mutate()}
                  disabled={verifyMutation.isPending || !verifyHash}
                  whileHover={{ scale: 1.02 }}
                  className="px-5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Verify
                </motion.button>
              </div>

              {verifyResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    verifyResult.verified ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {verifyResult.verified ? (
                      <>
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                        <span className="font-bold text-sm text-emerald-400">Cryptographically Authenticated Record</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4.5 h-4.5 text-red-400" />
                        <span className="font-bold text-sm text-red-400">Verification Hash Not Located</span>
                      </>
                    )}
                  </div>
                  
                  {verifyResult.verified ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-white/5 rounded-lg p-2.5">
                          <div className="text-white/40 text-[9px] uppercase tracking-wider">BLOCK POSITION</div>
                          <div className="text-white font-bold font-mono mt-0.5">{verifyResult.chain_position}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2.5">
                          <div className="text-white/40 text-[9px] uppercase tracking-wider">RECORD TYPE</div>
                          <div className="text-white font-bold font-mono mt-0.5 uppercase">{verifyResult.record_type}</div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3 space-y-1">
                        <div className="text-white/40 text-[9px] uppercase tracking-wider mb-2">RECORD PAYLOAD</div>
                        <div><span className="text-white/50">Timestamp:</span> <span className="text-white/80 font-mono">{verifyResult.timestamp}</span></div>
                        <div><span className="text-white/50">Issuer / Node:</span> <span className="text-white/80">{verifyResult.issuer}</span></div>
                        {verifyResult.recipient && <div><span className="text-white/50">Recipient / Wallet:</span> <span className="text-white/80">{verifyResult.recipient}</span></div>}
                      </div>

                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-white/40 text-[9px] uppercase tracking-wider mb-2">IMMUTABLE BLOCK DATA</div>
                        <pre className="text-[10px] text-cyan-400 font-mono overflow-auto max-h-[140px]">
                          {JSON.stringify(verifyResult.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/50 leading-relaxed">
                      The query hash value was not detected in any block. This implies the hash is invalid or the transaction/credential records have been tampered, modified, or deleted from local source.
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 6: Analytics */}
        {tab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Blocks Mined', value: analyticsData?.total_blocks || '1', icon: Box, color: 'from-violet-500 to-indigo-500' },
                { label: 'Verified Certificates', value: analyticsData?.total_certificates || '0', icon: Award, color: 'from-amber-500 to-orange-500' },
                { label: 'Token Transactions', value: analyticsData?.total_transactions || '0', icon: Coins, color: 'from-emerald-500 to-teal-500' },
                { label: 'Deployed Contracts', value: analyticsData?.total_contracts || '0', icon: Cpu, color: 'from-pink-500 to-rose-500' },
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Activity Chart */}
              <div className="lg:col-span-8 glass-card p-5">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Daily Block Additions / Ledger Activity
                </h4>
                {analyticsData?.activity_chart?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={analyticsData.activity_chart}>
                      <defs>
                        <linearGradient id="blockChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Area type="monotone" dataKey="blocks" stroke="#6366f1" fill="url(#blockChartGrad)" strokeWidth={2} name="Blocks Mined" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[260px] text-white/20 text-xs">
                    No block minting activity recorded yet
                  </div>
                )}
              </div>

              {/* Distribution Pie Chart */}
              <div className="lg:col-span-4 glass-card p-5">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  Block Type Distribution
                </h4>
                {analyticsData?.type_distribution?.length > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={analyticsData.type_distribution}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                        >
                          {analyticsData.type_distribution.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {analyticsData.type_distribution.map((item: any, index: number) => (
                        <div key={item.type} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-white/60 truncate uppercase">{item.type.replace('_', ' ')}:</span>
                          <span className="text-white font-bold font-mono">{item.count} ({item.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-white/20 text-xs">
                    No block distribution statistics generated
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
