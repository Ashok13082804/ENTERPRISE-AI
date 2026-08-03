import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield as InsuranceIcon, FileText, AlertTriangle, Brain, Upload, Loader2,
  BarChart2, CheckCircle, ShoppingCart, Users, TrendingUp, Package, Bot, Hash,
  Vote, ChevronRight, Globe, Star, Zap, Search, Activity, MapPin, Clock, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass-card ${className}`}>{children}</div>
)

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string | number | undefined; icon: any; color: string }) => (
  <div className="glass-card p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-md`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <div className="text-lg font-bold text-white">{value ?? '—'}</div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Insurance Page
// ─────────────────────────────────────────────────────────────────────────────
export function InsurancePage() {
  const [claimForm, setClaimForm] = useState({
    policy_id: 'POL-2025-001',
    claim_type: 'Vehicle Damage',
    description: 'Car accident on highway, front bumper damaged and airbags deployed.',
    estimated_amount: 85000
  })
  const [claimResult, setClaimResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'submit' | 'claims' | 'policies'>('submit')
  const { data: stats } = useQuery({ queryKey: ['insurance-stats'], queryFn: () => axios.get(`${API}/insurance/stats`).then(r => r.data) })
  const { data: claimsData } = useQuery({ queryKey: ['insurance-claims'], queryFn: () => axios.get(`${API}/insurance/claims`).then(r => r.data), enabled: activeTab === 'claims' })

  const claimMutation = useMutation({
    mutationFn: () => axios.post(`${API}/insurance/claims/submit`, claimForm).then(r => r.data),
    onSuccess: d => { setClaimResult(d); toast.success('Claim submitted!') },
    onError: () => toast.error('Submission failed'),
  })

  const fraudColor = (risk: string) => ({
    'High': 'text-red-400 bg-red-500/10 border-red-500/30',
    'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  }[risk] || 'text-white/40 bg-white/5 border-white/10')

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <InsuranceIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Insurance AI Platform</h1>
            <p className="text-xs text-white/40">AI-Powered Claims Processing, Fraud Detection & Risk Assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 font-semibold">
          <Zap className="w-3.5 h-3.5" /> AI Fraud Engine Active
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Policies" value={stats?.total_policies?.toLocaleString() || '1,24,500'} icon={FileText} color="from-amber-500 to-orange-600" />
        <StatCard label="Claims This Month" value={stats?.claims_this_month || 284} icon={Activity} color="from-blue-500 to-cyan-600" />
        <StatCard label="Fraud Detected" value={stats?.fraud_detected || 23} icon={AlertTriangle} color="from-red-500 to-rose-600" />
        <StatCard label="Model Accuracy" value={`${stats?.model_accuracy_pct || 97.4}%`} icon={Brain} color="from-emerald-500 to-teal-600" />
      </div>

      <div className="flex gap-2 border-b border-white/5 pb-3">
        {[{ id: 'submit', label: '📄 Submit Claim' }, { id: 'claims', label: '📋 Claim History' }, { id: 'policies', label: '🛡️ Policy Types' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${activeTab === t.id ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent' : 'border-white/10 text-white/40 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'submit' && (
          <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> Submit & Validate Insurance Claim
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Policy ID</label>
                  <input value={claimForm.policy_id} onChange={e => setClaimForm({ ...claimForm, policy_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Claim Type</label>
                  <select value={claimForm.claim_type} onChange={e => setClaimForm({ ...claimForm, claim_type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    {['Vehicle Damage', 'Health Emergency', 'Property Damage', 'Life Insurance', 'Travel Claim', 'Fire & Theft'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Estimated Claim Amount (₹)</label>
                <input type="number" value={claimForm.estimated_amount} onChange={e => setClaimForm({ ...claimForm, estimated_amount: +e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Incident Description</label>
                <textarea value={claimForm.description} onChange={e => setClaimForm({ ...claimForm, description: e.target.value })} rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-amber-500/50" />
              </div>
              <motion.button onClick={() => claimMutation.mutate()} disabled={claimMutation.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                {claimMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Submit & Run AI Fraud Analysis
              </motion.button>
            </GlassCard>

            <GlassCard className="p-5 min-h-[360px] flex flex-col">
              <div className="text-xs text-white/40 font-bold tracking-wider uppercase mb-4">AI Claim Assessment</div>
              {claimResult ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 flex-1">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                    <div className="text-white font-bold">Claim #{claimResult.claim_id}</div>
                    <div className="text-[10px] text-white/50 mt-0.5">{claimResult.status}</div>
                    <div className="text-xs text-white/60 mt-2">{claimResult.claim_type}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    {[
                      ['Fraud Risk', claimResult.fraud_risk],
                      ['Fraud Probability', `${Math.round(claimResult.fraud_probability * 100)}%`],
                      ['Processing Days', claimResult.estimated_approval_days],
                      ['Approved Amount', `₹${claimResult.approved_amount?.toLocaleString() || 'Pending'}`],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-white/5 p-3 rounded-xl">
                        <div className="text-white/40">{l}</div>
                        <div className="text-white font-bold mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-[10px] text-white/40 mb-1">AI Assessment</div>
                    <div className="text-xs text-white/70 leading-relaxed">{claimResult.ai_notes || 'Claim is under AI review for fraud indicators and policy coverage validation.'}</div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                    <InsuranceIcon className="w-8 h-8 text-amber-400/30" />
                  </div>
                  <div>
                    <div className="text-white/40 font-semibold text-xs">AI Claims Engine Ready</div>
                    <div className="text-white/20 text-[11px] mt-1">Fraud detection using XGBoost, LightGBM, & NLP analysis</div>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'claims' && (
          <motion.div key="claims" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-5">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Recent Claims Registry</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead><tr className="border-b border-white/5 text-white/40">
                    <th className="py-2">CLAIM ID</th><th className="py-2">TYPE</th><th className="py-2">AMOUNT</th>
                    <th className="py-2">FRAUD RISK</th><th className="py-2">STATUS</th><th className="py-2">DATE</th>
                  </tr></thead>
                  <tbody>
                    {(claimsData?.claims || []).map((c: any) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 font-mono text-amber-400 font-semibold">{c.id}</td>
                        <td className="py-3 text-white/70">{c.claim_type}</td>
                        <td className="py-3 text-white font-bold">₹{c.amount?.toLocaleString()}</td>
                        <td className="py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${fraudColor(c.fraud_risk)}`}>{c.fraud_risk}</span></td>
                        <td className="py-3"><span className={`text-[10px] font-semibold ${c.status === 'Approved' ? 'text-emerald-400' : c.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'}`}>{c.status}</span></td>
                        <td className="py-3 text-white/40 text-[10px]">{c.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'policies' && (
          <motion.div key="policies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Motor Insurance', icon: '🚗', coverage: '₹5L–₹50L', premium: '₹8,000/yr', claims: '1,240', color: 'amber' },
                { name: 'Health Insurance', icon: '🏥', coverage: '₹3L–₹25L', premium: '₹12,000/yr', claims: '2,180', color: 'blue' },
                { name: 'Life Insurance', icon: '💼', coverage: '₹25L–₹2Cr', premium: '₹18,000/yr', claims: '340', color: 'purple' },
                { name: 'Property Insurance', icon: '🏠', coverage: '₹10L–₹1Cr', premium: '₹6,500/yr', claims: '480', color: 'orange' },
                { name: 'Travel Insurance', icon: '✈️', coverage: '₹50K–₹5L', premium: '₹2,000/trip', claims: '860', color: 'teal' },
                { name: 'Crop Insurance', icon: '🌾', coverage: '₹1L–₹10L', premium: '₹3,500/season', claims: '720', color: 'green' },
              ].map(p => (
                <GlassCard key={p.name} className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{p.icon}</div>
                    <div className="text-white font-semibold">{p.name}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    {[['Coverage', p.coverage], ['Premium', p.premium], ['Claims', p.claims]].map(([l, v]) => (
                      <div key={l} className="bg-white/5 p-2 rounded-lg text-center">
                        <div className="text-white/40">{l}</div>
                        <div className="text-white font-semibold mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// E-Commerce Page
// ─────────────────────────────────────────────────────────────────────────────
export function EcommercePage() {
  const [userId, setUserId] = useState('USR-001')
  const [recommendations, setRecommendations] = useState<any>(null)
  const { data: stats } = useQuery({ queryKey: ['ecom-stats'], queryFn: () => axios.get(`${API}/ecommerce/stats`).then(r => r.data) })
  const { data: forecastData } = useQuery({ queryKey: ['inventory-forecast'], queryFn: () => axios.get(`${API}/ecommerce/inventory/forecast`).then(r => r.data) })
  const { data: ordersData } = useQuery({ queryKey: ['orders'], queryFn: () => axios.get(`${API}/ecommerce/orders`).then(r => r.data) })

  const recMutation = useMutation({
    mutationFn: () => axios.post(`${API}/ecommerce/recommend`, { user_id: userId, num_recommendations: 6 }).then(r => r.data),
    onSuccess: d => { setRecommendations(d); toast.success('AI Recommendations ready!') },
    onError: () => toast.error('Recommendation failed'),
  })

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">E-Commerce Intelligence</h1>
            <p className="text-xs text-white/40">AI Recommendation Engine, Sales Analytics & Smart Inventory Forecasting</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs text-pink-300 font-semibold">
          <Activity className="w-3.5 h-3.5" /> Live Commerce Dashboard
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Orders Today" value={stats?.orders_today?.toLocaleString() || '4,820'} icon={Package} color="from-pink-500 to-rose-600" />
        <StatCard label="Revenue Today" value={`₹${((stats?.revenue_today || 24800000) / 100000).toFixed(1)}L`} icon={TrendingUp} color="from-violet-500 to-purple-600" />
        <StatCard label="Active Customers" value={stats?.active_customers?.toLocaleString() || '18,240'} icon={Users} color="from-blue-500 to-cyan-600" />
        <StatCard label="Conversion Rate" value={`${stats?.conversion_rate || 3.8}%`} icon={BarChart2} color="from-emerald-500 to-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 glass-card p-5 space-y-4">
          <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4 text-pink-400 animate-pulse" /> AI Product Recommendation Engine
          </h3>
          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Customer ID</label>
            <input value={userId} onChange={e => setUserId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500/50" />
          </div>
          <motion.button onClick={() => recMutation.mutate()} disabled={recMutation.isPending}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
            {recMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generate AI Recommendations
          </motion.button>
          {recommendations?.recommendations?.length > 0 && (
            <div className="space-y-2">
              {recommendations.recommendations.map((p: any, i: number) => (
                <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <div className="text-white text-xs font-semibold">{p.name}</div>
                    <div className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1.5">
                      ₹{p.price?.toLocaleString()} · <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> {p.rating}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-pink-500/20 text-pink-400 text-[10px] font-bold">{Math.round(p.score * 100)}% match</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-white font-semibold text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> ⚠️ Low Stock Alerts — Inventory at Risk
            </h4>
            <div className="space-y-2">
              {(forecastData?.products_at_risk || []).map((p: any) => (
                <div key={p.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-white text-xs font-semibold">{p.name}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Stock: {p.current_stock} units · Demand: {p.predicted_demand}/day</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-bold text-xs">{p.days_to_stockout}d</div>
                    <div className="text-white/30 text-[10px]">to stockout</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-pink-400" /> Recent Orders
            </h4>
            <div className="space-y-2">
              {(ordersData?.orders?.slice(0, 5) || []).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-white text-xs font-semibold">{o.customer}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{o.items} items · {o.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-xs font-bold">₹{o.amount?.toLocaleString()}</div>
                    <span className={`text-[9px] font-bold ${o.status === 'Delivered' ? 'text-emerald-400' : o.status === 'Pending' ? 'text-amber-400' : 'text-blue-400'}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// E-Voting Page
// ─────────────────────────────────────────────────────────────────────────────
export function EVotingPage() {
  const [voterId, setVoterId] = useState('VOTER-001')
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [voteResult, setVoteResult] = useState<any>(null)
  const { data: stats } = useQuery({ queryKey: ['voting-stats'], queryFn: () => axios.get(`${API}/evoting/stats`).then(r => r.data) })
  const { data: resultsData } = useQuery({ queryKey: ['voting-results'], queryFn: () => axios.get(`${API}/evoting/results/E001`).then(r => r.data) })

  const voteMutation = useMutation({
    mutationFn: () => axios.post(`${API}/evoting/vote`, { voter_id: voterId, election_id: 'E001', candidate_id: selectedCandidate }).then(r => r.data),
    onSuccess: d => { setVoteResult(d); toast.success(`Vote recorded! Receipt: ${d.receipt}`) },
    onError: () => toast.error('Voting failed'),
  })

  const COLORS = ['from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-rose-500 to-pink-500']

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">E-Voting System</h1>
            <p className="text-xs text-white/40">Blockchain-Secured, Tamper-Proof Electronic Democratic Voting</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
          <CheckCircle className="w-3.5 h-3.5" /> Blockchain Verified
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Registered Voters" value={stats?.total_registered_voters?.toLocaleString() || '8,42,480'} icon={Users} color="from-blue-500 to-indigo-600" />
        <StatCard label="Votes Cast" value={stats?.votes_cast?.toLocaleString() || '4,18,240'} icon={Vote} color="from-violet-500 to-purple-600" />
        <StatCard label="Voter Turnout" value={`${stats?.voter_turnout_pct || 49.6}%`} icon={TrendingUp} color="from-emerald-500 to-teal-600" />
        <StatCard label="Blockchain Blocks" value={stats?.blockchain_blocks?.toLocaleString() || '1,248'} icon={Hash} color="from-amber-500 to-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
              <Vote className="w-4 h-4 text-blue-400" /> Cast Your Ballot Securely
            </h3>
            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Voter ID / Aadhaar</label>
              <input value={voterId} onChange={e => setVoterId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-2 uppercase">Select Your Candidate</label>
              <div className="space-y-2">
                {(resultsData?.candidates || []).map((c: any, i: number) => (
                  <button key={c.id} onClick={() => setSelectedCandidate(c.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${selectedCandidate === c.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 bg-white/3 hover:bg-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-white font-black text-xs flex-shrink-0`}>{c.name?.[0]}</div>
                      <div className="flex-1">
                        <div className="text-white text-xs font-semibold">{c.name}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{c.party} · {c.position}</div>
                      </div>
                      {selectedCandidate === c.id && <CheckCircle className="w-4 h-4 text-blue-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <motion.button onClick={() => voteMutation.mutate()} disabled={!selectedCandidate || voteMutation.isPending || !!voteResult}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
              {voteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
              Cast Blockchain-Secured Vote
            </motion.button>
            {voteResult && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-sm">Vote Recorded on Blockchain!</span>
                </div>
                <div className="space-y-1 text-[10px] text-white/50">
                  <div>Receipt: <span className="text-white font-mono">{voteResult.receipt}</span></div>
                  <div>Block ID: <span className="text-white">{voteResult.block_id}</span></div>
                  <div>TX Hash: <span className="text-blue-400 font-mono">{voteResult.tx_hash?.slice(0, 24)}...</span></div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-400" /> Live Election Results
          </h3>
          <div className="space-y-4">
            {(resultsData?.candidates || []).map((c: any, i: number) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-white font-black text-[9px]`}>{c.name?.[0]}</div>
                    <span className="text-white text-xs font-semibold">{c.name}</span>
                    <span className="text-[10px] text-white/30">{c.party}</span>
                  </div>
                  <span className={`text-sm font-bold ${i === 0 ? 'text-blue-400' : 'text-white/50'}`}>{c.percentage}%</span>
                </div>
                <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.percentage}%` }} transition={{ delay: i * 0.1 + 0.2, duration: 0.7 }}
                    className={`h-full rounded-full bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">{c.votes?.toLocaleString()} votes</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-white/50">
            <Hash className="w-3.5 h-3.5 text-emerald-400" />
            All votes immutably stored · {resultsData?.blockchain_verified && <span className="text-emerald-400 font-semibold">✓ Blockchain Authenticated</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Disaster Management Page
// ─────────────────────────────────────────────────────────────────────────────
export function DisasterPage() {
  const { data: stats } = useQuery({ queryKey: ['disaster-stats'], queryFn: () => axios.get(`${API}/disaster/stats`).then(r => r.data) })
  const { data: disasters } = useQuery({ queryKey: ['disasters'], queryFn: () => axios.get(`${API}/disaster/active-disasters`).then(r => r.data) })
  const { data: resources } = useQuery({ queryKey: ['resources'], queryFn: () => axios.get(`${API}/disaster/resources`).then(r => r.data) })

  const sColor = (s: string) => ({
    'Critical': 'border-red-500/30 bg-red-500/5 text-red-400',
    'High': 'border-orange-500/30 bg-orange-500/5 text-orange-400',
    'Medium': 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  }[s] || 'border-white/10 bg-white/3 text-white/40')

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Disaster Management Command</h1>
            <p className="text-xs text-white/40">AI-Powered Emergency Detection, Resource Allocation & Disaster Forecasting</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" /> {stats?.active_disasters || 3} Active Emergencies
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Disasters" value={stats?.active_disasters || 3} icon={AlertTriangle} color="from-red-500 to-rose-600" />
        <StatCard label="People Evacuated" value={stats?.people_evacuated?.toLocaleString() || '24,800'} icon={Users} color="from-orange-500 to-red-600" />
        <StatCard label="Rescue Operations" value={stats?.rescue_operations || 48} icon={Activity} color="from-amber-500 to-orange-600" />
        <StatCard label="Shelters Active" value={stats?.shelters_active || 120} icon={MapPin} color="from-emerald-500 to-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-card p-5">
            <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" /> Active Disaster Incidents
            </h4>
            <div className="space-y-3">
              {(disasters?.disasters || []).map((d: any, i: number) => (
                <motion.div key={d.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-xl border ${sColor(d.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{d.type?.includes('Flood') ? '🌊' : d.type?.includes('Fire') ? '🔥' : d.type?.includes('Cyclone') ? '🌀' : d.type?.includes('Earth') ? '🌍' : '⚠️'}</div>
                      <div>
                        <div className="text-white font-bold text-sm">{d.type}</div>
                        <div className="text-[10px] opacity-70 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{d.location}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">Affected: {d.affected?.toLocaleString()} people · Day {d.day}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-[9px] font-bold border ${sColor(d.severity)}`}>{d.severity}</span>
                      <div className="text-[10px] opacity-50 mt-1.5">{d.status}</div>
                    </div>
                  </div>
                  {d.units_deployed && (
                    <div className="mt-3 text-[10px] text-white/50 flex items-center gap-2">
                      <span>{d.units_deployed} units deployed</span>
                      {d.rescue_teams && <span>· {d.rescue_teams} rescue teams</span>}
                      {d.relief_centers && <span>· {d.relief_centers} relief centers</span>}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="glass-card p-5 space-y-4">
            <h4 className="text-white font-semibold text-xs flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" /> Resource Deployment Status
            </h4>
            <div className="space-y-3">
              {(resources?.resources || []).map((r: any) => {
                const pct = Math.round((r.deployed / r.total) * 100)
                return (
                  <div key={r.type} className="p-3 bg-white/5 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-white font-semibold">{r.type}</span>
                      <span className="text-white/40">{r.deployed}/{r.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-white/30">
                      <span>{pct}% deployed</span>
                      <span className="text-emerald-400">{r.available} available</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Digital Forensics Page
// ─────────────────────────────────────────────────────────────────────────────
export function ForensicsPage() {
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { data: stats } = useQuery({ queryKey: ['forensics-stats'], queryFn: () => axios.get(`${API}/forensics/stats`).then(r => r.data) })
  const { data: casesData } = useQuery({ queryKey: ['forensics-cases'], queryFn: () => axios.get(`${API}/forensics/cases`).then(r => r.data) })

  const analysisMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('file', evidenceFile as File)
      return axios.post(`${API}/forensics/evidence/analyze`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
    },
    onSuccess: d => { setAnalysisResult(d); toast.success('Evidence analyzed!') },
    onError: () => toast.error('Analysis failed'),
  })

  const priorityColor = (p: string) => ({
    'Critical': 'text-red-400 bg-red-500/10 border-red-500/30',
    'High': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  }[p] || 'text-white/40 bg-white/5 border-white/10')

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-500 to-zinc-700 flex items-center justify-center shadow-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Digital Forensics Lab</h1>
            <p className="text-xs text-white/40">Evidence Analysis, Metadata Extraction, Anomaly Detection & Case Timeline</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-xs text-slate-300 font-semibold">
          <Eye className="w-3.5 h-3.5" /> {stats?.cases_active || 12} Active Cases
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Active Cases" value={stats?.cases_active || 12} icon={FileText} color="from-slate-500 to-zinc-600" />
        <StatCard label="Evidence Items" value={stats?.evidence_collected?.toLocaleString() || '4,280'} icon={Search} color="from-blue-500 to-indigo-600" />
        <StatCard label="Reports Generated" value={stats?.reports_generated || 148} icon={Globe} color="from-emerald-500 to-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-slate-300 animate-pulse" /> AI Evidence Analyzer
            </h3>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setEvidenceFile(e.target.files?.[0] || null)} />
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-slate-400/40 transition-all">
              <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <div className="text-white/40 text-xs font-semibold">{evidenceFile ? evidenceFile.name : 'Upload Evidence File'}</div>
              <div className="text-white/20 text-[10px] mt-0.5">PDF, DOCX, Image, Log files</div>
            </div>
            <motion.button onClick={() => analysisMutation.mutate()} disabled={!evidenceFile || analysisMutation.isPending}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-slate-500 to-zinc-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {analysisMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Analyze Evidence with AI
            </motion.button>
          </div>

          {analysisResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
              <div className="text-xs text-white/40 font-bold uppercase tracking-wider">Forensic Analysis Report</div>
              <div className="bg-black/20 rounded-xl p-4 space-y-2">
                <div className="text-[10px] text-slate-400 font-bold mb-2">File Metadata</div>
                {Object.entries(analysisResult.metadata || {}).map(([k, v]: any) => (
                  <div key={k} className="flex justify-between text-[10px] py-0.5 border-b border-white/5 last:border-0">
                    <span className="text-white/40 capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="text-white max-w-[60%] truncate text-right font-mono">{String(v)}</span>
                  </div>
                ))}
              </div>
              {analysisResult.anomalies?.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="text-red-400 text-[10px] font-bold mb-2">⚠ Anomalies Detected</div>
                  {analysisResult.anomalies.map((a: string, i: number) => (
                    <div key={i} className="text-[11px] text-white/60 flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 text-red-400 mt-0.5" />{a}
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-3 text-[11px] text-white/50 leading-relaxed">{analysisResult.forensic_notes}</div>
            </motion.div>
          )}
        </div>

        <div className="glass-card p-5">
          <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-300" /> Active Investigation Cases
          </h4>
          <div className="space-y-2">
            {(casesData?.cases || []).map((c: any) => (
              <div key={c.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-xs">{c.title}</div>
                  <div className="text-[10px] text-white/40 mt-0.5 flex items-center gap-2">
                    <span>{c.evidence_count} evidence items</span>
                    <span>·</span>
                    <span>Assigned: {c.assigned_to}</span>
                  </div>
                  {c.last_updated && (
                    <div className="text-[9px] text-white/20 mt-0.5 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{c.last_updated}</div>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${priorityColor(c.priority)}`}>{c.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
