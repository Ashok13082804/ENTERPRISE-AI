import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Banknote, Shield, AlertTriangle, TrendingUp, BarChart2, Brain,
  Users, CreditCard, Activity, Lock, Loader2, ChevronRight,
  CheckCircle, XCircle, RefreshCw, Eye, AlertCircle, Zap, Hash
} from 'lucide-react'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

const TOOLTIP_STYLE = {
  background: '#0d1520',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: 10,
  color: '#fff'
}

export default function BankingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'fraud' | 'loan' | 'aml' | 'accounts'>('overview')
  const [fraudForm, setFraudForm] = useState({ amount: 85000, merchant: 'Unknown Merchant', location: 'VPN', device: 'mobile', transaction_type: 'online' })
  const [fraudResult, setFraudResult] = useState<any>(null)
  const [loanForm, setLoanForm] = useState({ income: 80000, loan_amount: 2000000, loan_tenure_months: 60, credit_score: 720, employment_type: 'Salaried', existing_loans: 1 })
  const [loanResult, setLoanResult] = useState<any>(null)

  const { data: stats } = useQuery({ queryKey: ['banking-stats'], queryFn: () => axios.get(`${API}/banking/stats`).then(r => r.data) })
  const { data: txData, refetch: refetchTx } = useQuery({ queryKey: ['transactions'], queryFn: () => axios.get(`${API}/banking/transactions`).then(r => r.data) })
  const { data: amlData } = useQuery({ queryKey: ['aml'], queryFn: () => axios.get(`${API}/banking/aml/alerts`).then(r => r.data) })
  const { data: accountsData } = useQuery({ queryKey: ['accounts'], queryFn: () => axios.get(`${API}/banking/accounts`).then(r => r.data) })

  const fraudMutation = useMutation({
    mutationFn: () => axios.post(`${API}/banking/fraud/check`, fraudForm).then(r => r.data),
    onSuccess: d => { setFraudResult(d); toast.success(`Fraud check complete: ${d.action}`) },
    onError: () => toast.error('Fraud check failed'),
  })

  const loanMutation = useMutation({
    mutationFn: () => axios.post(`${API}/banking/loan/eligibility`, loanForm).then(r => r.data),
    onSuccess: d => { setLoanResult(d); toast.success('Loan eligibility assessed!') },
    onError: () => toast.error('Assessment failed'),
  })

  const riskColor = (level: string) => ({
    'Low': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Medium': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'High': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    'Critical': 'bg-red-500/10 text-red-400 border-red-500/30',
  }[level] || 'bg-white/5 text-white/50 border-white/10')

  const MOCK_TREND = [1200, 1450, 1380, 1620, 1750, 1480, 1900, 2100, 1870, 2050, 2300, 2180].map((v, i) => ({ month: `M${i + 1}`, transactions: v }))

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Banknote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Banking & Fraud Intelligence</h1>
            <p className="text-xs text-white/40">AI-Powered Real-Time Fraud Detection, AML Monitoring & Credit Risk Assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Monitoring Active
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {stats?.avg_detection_ms || 42}ms Avg Detection
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'overview', label: '📊 Dashboard' },
          { id: 'transactions', label: '💳 Transactions' },
          { id: 'fraud', label: '🛡️ Fraud Detector' },
          { id: 'loan', label: '🏦 Loan Eligibility AI' },
          { id: 'aml', label: '🚨 AML Monitoring' },
          { id: 'accounts', label: '👥 Account Manager' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-lg shadow-emerald-500/10'
                : 'text-white/50 border-white/10 hover:text-white hover:bg-white/5'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Transactions Today', value: stats?.total_transactions_today?.toLocaleString() || '48,234', icon: Activity, color: 'from-blue-500 to-indigo-500' },
                { label: 'Fraud Blocked Today', value: stats?.fraud_detected_today || '23', icon: Shield, color: 'from-red-500 to-rose-500' },
                { label: 'Amount Protected', value: `₹${((stats?.fraud_amount_blocked || 4820000) / 100000).toFixed(1)}L`, icon: Lock, color: 'from-orange-500 to-red-500' },
                { label: 'Active Accounts', value: stats?.active_accounts?.toLocaleString() || '2,84,720', icon: Users, color: 'from-emerald-500 to-teal-500' },
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
              <div className="lg:col-span-8 glass-card p-5">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Transaction Volume (thousands)
                </h4>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={MOCK_TREND}>
                    <defs>
                      <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="transactions" stroke="#10b981" fill="url(#txGrad)" strokeWidth={2} name="Transactions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-4 glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" /> Model Performance Metrics
                </h4>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Detection Accuracy', value: stats?.model_accuracy || 98.7, color: 'emerald' },
                    { label: 'AML Coverage', value: 94.2, color: 'teal' },
                    { label: 'False Positive Rate', value: stats?.false_positive_rate || 0.8, color: 'amber' },
                    { label: 'Fraud Rate %', value: stats?.fraud_rate_percent || 0.048, color: 'red' },
                  ].map(m => (
                    <div key={m.label} className="space-y-1">
                      <div className="flex justify-between text-white/60">
                        <span>{m.label}</span>
                        <span className={`text-${m.color}-400 font-bold font-mono`}>{m.value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-${m.color}-500`} style={{ width: `${Math.min(m.value, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Transactions */}
        {activeTab === 'transactions' && (
          <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Live Transaction Feed
                </h3>
                <button onClick={() => refetchTx()} className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40">
                      <th className="py-2">TX ID</th>
                      <th className="py-2">AMOUNT</th>
                      <th className="py-2">MERCHANT</th>
                      <th className="py-2">TYPE</th>
                      <th className="py-2">RISK TIER</th>
                      <th className="py-2">STATUS</th>
                      <th className="py-2">TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(txData?.transactions || []).map((tx: any) => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-mono font-semibold text-emerald-400">{tx.id}</td>
                        <td className="py-3 font-bold text-white">₹{tx.amount?.toLocaleString()}</td>
                        <td className="py-3 text-white/70">{tx.merchant}</td>
                        <td className="py-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold">{tx.type}</span></td>
                        <td className="py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${riskColor(tx.risk)}`}>{tx.risk}</span></td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            {tx.status === 'Approved' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                            <span className={`text-xs font-semibold ${tx.status === 'Approved' ? 'text-emerald-400' : 'text-red-400'}`}>{tx.status}</span>
                          </div>
                        </td>
                        <td className="py-3 text-white/40 font-mono">{tx.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Fraud Detector */}
        {activeTab === 'fraud' && (
          <motion.div key="fraud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4.5 h-4.5 text-red-400 animate-pulse" /> Real-Time Transaction Fraud Classifier
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Amount (₹)</label>
                    <input type="number" value={fraudForm.amount} onChange={e => setFraudForm({ ...fraudForm, amount: +e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Merchant Name</label>
                    <input value={fraudForm.merchant} onChange={e => setFraudForm({ ...fraudForm, merchant: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Transaction Location</label>
                    <input value={fraudForm.location} onChange={e => setFraudForm({ ...fraudForm, location: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Device Type</label>
                    <select value={fraudForm.device} onChange={e => setFraudForm({ ...fraudForm, device: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                      <option value="mobile">Mobile</option>
                      <option value="desktop">Desktop</option>
                      <option value="unknown">Unknown Device</option>
                    </select>
                  </div>
                </div>
                <motion.button onClick={() => fraudMutation.mutate()} disabled={fraudMutation.isPending}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                  {fraudMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Classify Transaction Risk
                </motion.button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="glass-card p-5 h-full min-h-[360px] flex flex-col justify-between">
                <div className="text-xs text-white/40 mb-3 font-bold tracking-wider uppercase">Fraud Classification Verdict</div>
                {fraudResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className={`p-5 rounded-2xl border ${fraudResult.is_fraud ? 'bg-red-500/5 border-red-500/30' : 'bg-emerald-500/5 border-emerald-500/30'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        {fraudResult.is_fraud ? <XCircle className="w-8 h-8 text-red-400" /> : <CheckCircle className="w-8 h-8 text-emerald-400" />}
                        <div>
                          <div className={`text-lg font-bold ${fraudResult.is_fraud ? 'text-red-400' : 'text-emerald-400'}`}>{fraudResult.action}</div>
                          <div className="text-[10px] text-white/40">{fraudResult.fraud_type || 'Legitimate transaction pattern'}</div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/50">Fraud Probability</span>
                          <span className={`font-bold font-mono ${fraudResult.is_fraud ? 'text-red-400' : 'text-emerald-400'}`}>{Math.round(fraudResult.fraud_probability * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${fraudResult.is_fraud ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${fraudResult.fraud_probability * 100}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {[
                        ['Risk Level', fraudResult.risk_level],
                        ['Confidence', `${Math.round(fraudResult.confidence * 100)}%`],
                        ['Detection Time', `${fraudResult.decision_time_ms}ms`],
                        ['Model Engine', fraudResult.model_used],
                      ].map(([l, v]) => (
                        <div key={l} className="bg-white/5 p-2.5 rounded-xl">
                          <span className="text-white/40 block">{l}</span>
                          <span className="text-white font-semibold mt-0.5 block">{v}</span>
                        </div>
                      ))}
                    </div>
                    {fraudResult.flags?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 uppercase font-bold">Risk Flags Detected:</span>
                        {fraudResult.flags.map((f: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-red-400">
                            <AlertTriangle className="w-3 h-3" />{f}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-[10px] text-white/60 leading-relaxed">
                      {fraudResult.explanation}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">Fraud Detection Engine Ready</div>
                      <div className="text-white/20 text-[11px] mt-1">Uses XGBoost + Isolation Forest + Ollama explanation</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loan Eligibility AI */}
        {activeTab === 'loan' && (
          <motion.div key="loan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Banknote className="w-4.5 h-4.5 text-emerald-400" /> AI Credit Risk & EMI Calculator
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Monthly Income (₹)', key: 'income' },
                  { label: 'Loan Amount (₹)', key: 'loan_amount' },
                  { label: 'Tenure (months)', key: 'loan_tenure_months' },
                  { label: 'Credit Score (300-900)', key: 'credit_score' },
                  { label: 'Existing Loans', key: 'existing_loans' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">{label}</label>
                    <input type="number" value={(loanForm as any)[key]} onChange={e => setLoanForm({ ...loanForm, [key]: +e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Employment Type</label>
                  <select value={loanForm.employment_type} onChange={e => setLoanForm({ ...loanForm, employment_type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business">Business Owner</option>
                    <option value="Contract">Contract Worker</option>
                  </select>
                </div>
              </div>
              <motion.button onClick={() => loanMutation.mutate()} disabled={loanMutation.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                {loanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Assess Loan Eligibility
              </motion.button>
            </div>

            <div className="lg:col-span-6">
              <div className="glass-card p-5 h-full min-h-[380px] flex flex-col justify-between">
                <div className="text-xs text-white/40 mb-3 font-bold tracking-wider uppercase">Credit Assessment Report</div>
                {loanResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className={`p-5 rounded-2xl border ${loanResult.eligible ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30'} text-center`}>
                      {loanResult.eligible ? <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" /> : <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />}
                      <div className={`text-xl font-bold ${loanResult.eligible ? 'text-emerald-400' : 'text-red-400'}`}>
                        {loanResult.eligible ? '✅ Loan Pre-Approved' : '❌ Not Eligible'}
                      </div>
                      <div className="text-[10px] text-white/40 mt-1">{loanResult.recommendation}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      {[
                        ['Monthly EMI', `₹${loanResult.monthly_emi?.toFixed(0)}`],
                        ['FOIR Ratio', `${loanResult.foir}%`],
                        ['Interest Rate', `${loanResult.recommended_interest_rate}%`],
                        ['Risk Category', loanResult.risk_category],
                        ['Max Eligible', `₹${loanResult.max_eligible_amount?.toLocaleString()}`],
                        ['Default Risk', `${(loanResult.default_probability * 100).toFixed(1)}%`],
                      ].map(([l, v]) => (
                        <div key={l} className="bg-white/5 p-2.5 rounded-xl text-center">
                          <span className="text-white/40 block">{l}</span>
                          <span className="text-white font-bold font-mono block mt-0.5">{v}</span>
                        </div>
                      ))}
                    </div>
                    {loanResult.ai_insights?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 font-bold uppercase block">AI Banker Insights</span>
                        {loanResult.ai_insights.map((insight: string, i: number) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/70">
                            <ChevronRight className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />{insight}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">Credit Engine Standby</div>
                      <div className="text-white/20 text-[11px] mt-1">Submit applicant financials for AI assessment</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* AML Monitoring */}
        {activeTab === 'aml' && (
          <motion.div key="aml" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Suspicious Activity Alerts
                </h4>
                <div className="space-y-2">
                  {(amlData?.alerts || []).map((a: any) => (
                    <div key={a.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                      <AlertCircle className={`w-4 h-4 flex-shrink-0 ${
                        a.severity === 'Critical' ? 'text-red-400' : a.severity === 'High' ? 'text-orange-400' : 'text-amber-400'
                      }`} />
                      <div className="flex-1">
                        <div className="text-white text-xs font-semibold">{a.type}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{a.account} · {a.time} {a.amount && `· ₹${a.amount.toLocaleString()}`}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${riskColor(a.severity)}`}>{a.severity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <Hash className="w-4 h-4 text-violet-400" /> Detected Suspicious Patterns
                </h4>
                <div className="space-y-2">
                  {(amlData?.suspicious_patterns || []).map((p: any, i: number) => (
                    <div key={i} className="p-3 bg-violet-500/5 rounded-xl border border-violet-500/20 space-y-1">
                      <div className="text-white text-xs font-semibold">{p.pattern}</div>
                      <div className="text-[10px] text-white/40">
                        {p.accounts} accounts flagged · ₹{p.total_amount?.toLocaleString()} in suspicious flow
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Accounts */}
        {activeTab === 'accounts' && (
          <motion.div key="accounts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Account Registry
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40">
                      <th className="py-2">ACCOUNT NO</th>
                      <th className="py-2">ACCOUNT HOLDER</th>
                      <th className="py-2">TYPE</th>
                      <th className="py-2">BALANCE</th>
                      <th className="py-2">RISK PROFILE</th>
                      <th className="py-2">STATUS</th>
                      <th className="py-2">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(accountsData?.accounts || []).map((a: any) => (
                      <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-mono font-semibold text-emerald-400">{a.id}</td>
                        <td className="py-3 text-white font-medium">{a.holder}</td>
                        <td className="py-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold">{a.type}</span></td>
                        <td className="py-3 text-white font-bold">₹{a.balance?.toLocaleString()}</td>
                        <td className="py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${riskColor(a.risk)}`}>{a.risk}</span></td>
                        <td className="py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${a.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{a.status}</span></td>
                        <td className="py-3"><button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Eye className="w-3 h-3" /> View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
