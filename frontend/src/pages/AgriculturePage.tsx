import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, Sprout, CloudRain, FlaskConical, BarChart2, Brain,
  Upload, Loader2, ChevronRight, Sun, Droplets, TrendingUp,
  Download, Thermometer, Wind, AlertTriangle, CheckCircle, Image, Zap
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'
const TOOLTIP_STYLE = { background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 10, color: '#fff' }

export default function AgriculturePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'disease' | 'yield' | 'fertilizer' | 'weather' | 'crops'>('overview')
  const [yieldForm, setYieldForm] = useState({ crop: 'wheat', area_acres: 5.0, soil_type: 'loamy', rainfall_mm: 750, temperature_c: 26, fertilizer_kg: 150 })
  const [fertForm, setFertForm] = useState({ crop: 'wheat', soil_ph: 6.5, nitrogen_ppm: 200, phosphorus_ppm: 100, potassium_ppm: 160, area_acres: 5.0 })
  const [yieldResult, setYieldResult] = useState<any>(null)
  const [fertResult, setFertResult] = useState<any>(null)
  const [diseaseFile, setDiseaseFile] = useState<File | null>(null)
  const [diseasePreview, setDiseasePreview] = useState<string | null>(null)
  const [diseaseResult, setDiseaseResult] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: stats } = useQuery({ queryKey: ['agri-stats'], queryFn: () => axios.get(`${API}/agriculture/stats`).then(r => r.data) })
  const { data: weatherData } = useQuery({ queryKey: ['weather'], queryFn: () => axios.get(`${API}/agriculture/weather`).then(r => r.data), enabled: activeTab === 'weather' })
  const { data: cropsData } = useQuery({ queryKey: ['crops'], queryFn: () => axios.get(`${API}/agriculture/crops`).then(r => r.data), enabled: activeTab === 'crops' })

  const yieldMutation = useMutation({
    mutationFn: () => axios.post(`${API}/agriculture/yield/predict`, yieldForm).then(r => r.data),
    onSuccess: d => { setYieldResult(d); toast.success('Yield forecast complete!') },
    onError: () => toast.error('Prediction failed'),
  })

  const fertMutation = useMutation({
    mutationFn: () => axios.post(`${API}/agriculture/fertilizer/recommend`, fertForm).then(r => r.data),
    onSuccess: d => { setFertResult(d); toast.success('Recommendations ready!') },
    onError: () => toast.error('Analysis failed'),
  })

  const diseaseMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('file', diseaseFile as File)
      return axios.post(`${API}/agriculture/disease/detect`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
    },
    onSuccess: d => { setDiseaseResult(d); toast.success('Disease analysis complete!') },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Analysis failed'),
  })

  const handleFileSelect = (file: File | null) => {
    if (!file) return
    setDiseaseFile(file)
    const url = URL.createObjectURL(file)
    setDiseasePreview(url)
    setDiseaseResult(null)
  }

  const handleDownloadReport = async () => {
    try {
      const res = await axios.post(`${API}/agriculture/disease/report`, {
        crop_name: diseaseFile?.name?.replace(/\.[^.]+$/, '') || 'Crop',
        disease_name: diseaseResult.disease_name,
        severity: diseaseResult.severity,
        treatment: diseaseResult.treatment_recommendation,
        confidence: diseaseResult.confidence,
        recommendations: diseaseResult.additional_recommendations || []
      }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'crop_diagnostic_report.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF report downloaded!')
    } catch {
      toast.error('Failed to generate PDF')
    }
  }

  const severityColor = (sev: string) => ({
    'Low': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    'Moderate': 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    'High': 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    'Severe': 'text-red-400 border-red-500/30 bg-red-500/10',
  }[sev] || 'text-white/40 border-white/10 bg-white/5')

  const MOCK_WEATHER_TREND = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({
    day: d, temp: [24, 26, 29, 31, 28, 25, 23][i], rain: [12, 0, 8, 0, 15, 20, 5][i]
  }))

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Agriculture Intelligence Platform</h1>
            <p className="text-xs text-white/40">AI-Driven Crop Disease Detection, Yield Forecasting & Smart Fertilizer Advisory</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-xs text-green-400 font-semibold">
            <Leaf className="w-3.5 h-3.5" /> Agri-AI Active
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
            {stats?.total_crops_monitored || '14,820'} Crops Monitored
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'overview', label: '🌾 Overview' },
          { id: 'disease', label: '🔬 Disease Detector' },
          { id: 'yield', label: '📈 Yield Predictor' },
          { id: 'fertilizer', label: '⚗️ Fertilizer AI' },
          { id: 'weather', label: '🌤️ Weather Forecast' },
          { id: 'crops', label: '🌱 Crop Guide' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent shadow-md shadow-green-500/20'
                : 'text-white/50 border-white/10 hover:text-white hover:bg-white/5'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Farms Analyzed', value: stats?.total_farms || '4,280', icon: Leaf, color: 'from-green-500 to-emerald-600' },
                { label: 'Diseases Caught', value: stats?.diseases_detected_today || '138', icon: AlertTriangle, color: 'from-orange-500 to-red-600' },
                { label: 'Yield Boost', value: `${stats?.yield_improvement_percent || 24}%`, icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
                { label: 'Active Alerts', value: stats?.active_alerts || '7', icon: Zap, color: 'from-red-500 to-rose-600' },
              ].map(s => (
                <div key={s.label} className="glass-card p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-white/40">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 glass-card p-5">
                <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-green-400" /> Crop Yield Distribution by Region
                </h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={(stats?.regional_yield || [
                    { region: 'North', yield: 4.8 }, { region: 'South', yield: 6.2 },
                    { region: 'East', yield: 5.1 }, { region: 'West', yield: 7.4 },
                    { region: 'Central', yield: 4.3 }, { region: 'NE', yield: 5.9 }
                  ])}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="region" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" t/ac" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="yield" fill="#22c55e" radius={[4, 4, 0, 0]} name="Yield (t/acre)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5 space-y-3">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-400" /> Soil Health Monitor
                </h4>
                {[
                  { label: 'Nitrogen Level', value: stats?.avg_soil_nitrogen || 68, color: 'green' },
                  { label: 'Phosphorus', value: stats?.avg_soil_phosphorus || 52, color: 'blue' },
                  { label: 'Potassium', value: stats?.avg_soil_potassium || 75, color: 'amber' },
                  { label: 'Soil pH Score', value: stats?.avg_soil_ph_score || 80, color: 'emerald' },
                  { label: 'Moisture', value: stats?.avg_moisture || 63, color: 'teal' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[10px] text-white/50 mb-1">
                      <span>{m.label}</span>
                      <span className="font-mono text-white">{m.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-${m.color}-500 transition-all duration-700`} style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Disease Detector */}
        {activeTab === 'disease' && (
          <motion.div key="disease" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-green-400 animate-pulse" /> AI Crop Disease Diagnostics
              </h3>

              <input type="file" ref={fileRef} className="hidden" accept="image/*"
                onChange={e => handleFileSelect(e.target.files?.[0] || null)} />

              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]) }}
                className="relative border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 transition-all overflow-hidden"
                style={{ minHeight: 200 }}>
                {diseasePreview ? (
                  <>
                    <img src={diseasePreview} alt="crop" className="w-full h-48 object-cover rounded-2xl" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="text-white text-xs font-semibold">Click to Replace</div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <Image className="w-6 h-6 text-green-400/70" />
                    </div>
                    <div className="text-center">
                      <div className="text-white/40 text-xs font-semibold">Drop crop image here</div>
                      <div className="text-white/20 text-[10px] mt-0.5">JPG, PNG, WebP — leaf/plant images</div>
                    </div>
                  </div>
                )}
              </div>

              {diseaseFile && (
                <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 text-[10px]">
                  <span className="text-white/60 font-medium">{diseaseFile.name}</span>
                  <span className="text-white/30">{(diseaseFile.size / 1024).toFixed(0)} KB</span>
                </div>
              )}

              <motion.button
                onClick={() => diseaseMutation.mutate()}
                disabled={!diseaseFile || diseaseMutation.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                {diseaseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {diseaseMutation.isPending ? 'Analyzing Crop Image...' : 'Detect Disease'}
              </motion.button>
            </div>

            <div className="lg:col-span-7">
              <div className="glass-card p-5 h-full flex flex-col">
                <div className="text-xs text-white/40 font-bold tracking-wider uppercase mb-4">Diagnostic Report</div>
                {diseaseResult ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-1">
                    <div className={`p-5 rounded-2xl border ${severityColor(diseaseResult.severity)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-bold text-base">{diseaseResult.disease_name}</div>
                          <div className="text-[10px] opacity-70 mt-0.5">{diseaseResult.pathogen_type || 'Fungal / Bacterial'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black">{Math.round(diseaseResult.confidence * 100)}%</div>
                          <div className="text-[10px] opacity-60">Confidence</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-[10px]">
                      {[
                        ['Severity', diseaseResult.severity],
                        ['Crop Type', diseaseResult.crop_type || 'N/A'],
                        ['Spread Risk', diseaseResult.spread_risk || 'Medium'],
                      ].map(([l, v]) => (
                        <div key={l} className="bg-white/5 p-3 rounded-xl text-center">
                          <div className="text-white/40">{l}</div>
                          <div className="text-white font-bold mt-0.5">{v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
                      <div className="text-amber-400 font-bold text-[10px] uppercase flex items-center gap-1">
                        <FlaskConical className="w-3 h-3" /> Treatment Recommendation
                      </div>
                      <div className="text-white/70 text-[11px] leading-relaxed">{diseaseResult.treatment_recommendation}</div>
                    </div>

                    {diseaseResult.additional_recommendations?.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-white/40 font-bold uppercase">Preventive Measures</div>
                        {diseaseResult.additional_recommendations.slice(0, 3).map((r: string, i: number) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/60">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />{r}
                          </div>
                        ))}
                      </div>
                    )}

                    <motion.button onClick={handleDownloadReport}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                      <Download className="w-3.5 h-3.5 text-green-400" /> Download PDF Report
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-green-500/5 border border-green-500/20 flex items-center justify-center">
                      <Leaf className="w-10 h-10 text-green-400/30" />
                    </div>
                    <div>
                      <div className="text-white/40 font-semibold">Upload a Leaf or Plant Image</div>
                      <div className="text-white/20 text-[11px] mt-1">AI will identify diseases, severity, and suggest treatment using computer vision</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Yield Predictor */}
        {activeTab === 'yield' && (
          <motion.div key="yield" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Crop Yield Forecast Engine
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Crop Type</label>
                  <select value={yieldForm.crop} onChange={e => setYieldForm({ ...yieldForm, crop: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-green-500/50">
                    {['wheat', 'rice', 'maize', 'cotton', 'sugarcane', 'soybean', 'barley'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Soil Type</label>
                  <select value={yieldForm.soil_type} onChange={e => setYieldForm({ ...yieldForm, soil_type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    {['loamy', 'sandy', 'clay', 'silty', 'peaty', 'saline'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                {[
                  { label: 'Farm Area (acres)', key: 'area_acres', step: 0.5 },
                  { label: 'Rainfall (mm)', key: 'rainfall_mm', step: 10 },
                  { label: 'Temperature (°C)', key: 'temperature_c', step: 1 },
                  { label: 'Fertilizer (kg/acre)', key: 'fertilizer_kg', step: 10 },
                ].map(({ label, key, step }) => (
                  <div key={key}>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">{label}</label>
                    <input type="number" step={step} value={(yieldForm as any)[key]}
                      onChange={e => setYieldForm({ ...yieldForm, [key]: +e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-green-500/50" />
                  </div>
                ))}
              </div>
              <motion.button onClick={() => yieldMutation.mutate()} disabled={yieldMutation.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {yieldMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Forecast Crop Yield
              </motion.button>
            </div>

            <div className="glass-card p-5 min-h-[360px] flex flex-col">
              <div className="text-xs text-white/40 font-bold tracking-wider uppercase mb-4">Yield Forecast Report</div>
              {yieldResult ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 flex-1">
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5 text-center">
                    <div className="text-5xl font-black text-amber-400">{yieldResult.predicted_yield_tons_per_acre?.toFixed(2)}</div>
                    <div className="text-white/40 text-xs mt-1">tons per acre predicted</div>
                    <div className="text-white/60 text-xs mt-0.5">Total: {yieldResult.total_yield_tons?.toFixed(1)} tons from {yieldForm.area_acres} acres</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    {[
                      ['Market Value', `₹${yieldResult.estimated_revenue?.toLocaleString()}`],
                      ['Profit Margin', `${yieldResult.profit_margin_percent?.toFixed(1)}%`],
                      ['Confidence', `${(yieldResult.prediction_confidence * 100)?.toFixed(0)}%`],
                      ['Optimal Harvest', yieldResult.optimal_harvest_time],
                      ['Water Need', `${yieldResult.water_requirement_mm} mm`],
                      ['Fertilizer Eff.', yieldResult.fertilizer_efficiency || 'Optimal'],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-white/5 p-3 rounded-xl">
                        <div className="text-white/40">{l}</div>
                        <div className="text-white font-bold mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  {yieldResult.recommendations?.slice(0, 3).map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/60">
                      <ChevronRight className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />{r}
                    </div>
                  ))}
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white/20" />
                  </div>
                  <div>
                    <div className="text-white/40 font-semibold text-xs">Yield Predictor Standby</div>
                    <div className="text-white/20 text-[11px] mt-1">Uses Ridge Regression trained on 5-year crop data</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Fertilizer AI */}
        {activeTab === 'fertilizer' && (
          <motion.div key="fertilizer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-400" /> Soil Nutrient Analysis & Fertilizer Advisory
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Crop Type</label>
                  <select value={fertForm.crop} onChange={e => setFertForm({ ...fertForm, crop: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    {['wheat', 'rice', 'maize', 'cotton', 'sugarcane', 'soybean'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                {[
                  { label: 'Soil pH (4–9)', key: 'soil_ph', step: 0.1 },
                  { label: 'Nitrogen (ppm)', key: 'nitrogen_ppm', step: 10 },
                  { label: 'Phosphorus (ppm)', key: 'phosphorus_ppm', step: 5 },
                  { label: 'Potassium (ppm)', key: 'potassium_ppm', step: 10 },
                  { label: 'Field Area (acres)', key: 'area_acres', step: 0.5 },
                ].map(({ label, key, step }) => (
                  <div key={key}>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">{label}</label>
                    <input type="number" step={step} value={(fertForm as any)[key]}
                      onChange={e => setFertForm({ ...fertForm, [key]: +e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500/50" />
                  </div>
                ))}
              </div>
              <motion.button onClick={() => fertMutation.mutate()} disabled={fertMutation.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {fertMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                Generate Fertilizer Plan
              </motion.button>
            </div>

            <div className="glass-card p-5 min-h-[360px] flex flex-col">
              <div className="text-xs text-white/40 font-bold tracking-wider uppercase mb-4">Soil & Fertilizer Advisory</div>
              {fertResult ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 flex-1">
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                    <div className="text-blue-400 font-bold text-xs mb-1">Recommended Fertilizer Mix</div>
                    <div className="text-white font-semibold">{fertResult.recommended_fertilizer}</div>
                    <div className="text-white/40 text-[10px] mt-0.5">{fertResult.fertilizer_schedule}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    {[
                      { label: 'N (Urea)', value: `${fertResult.nitrogen_kg_per_acre} kg/acre`, color: 'green' },
                      { label: 'P (DAP)', value: `${fertResult.phosphorus_kg_per_acre} kg/acre`, color: 'blue' },
                      { label: 'K (MOP)', value: `${fertResult.potassium_kg_per_acre} kg/acre`, color: 'amber' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 p-3 rounded-xl text-center`}>
                        <div className={`text-${color}-400 font-bold font-mono`}>{value}</div>
                        <div className="text-white/40 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-white/40 grid grid-cols-2 gap-2">
                    {[
                      ['Total Cost', `₹${fertResult.total_cost?.toLocaleString()}`],
                      ['Application Date', fertResult.application_schedule],
                      ['Soil Health Score', `${fertResult.soil_health_score}/100`],
                      ['pH Adjustment', fertResult.soil_amendment_needed || 'None required'],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-white/5 p-2.5 rounded-lg">
                        <div className="text-white/30 text-[9px]">{l}</div>
                        <div className="text-white font-semibold mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  {fertResult.application_tips?.slice(0, 3).map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/60">
                      <ChevronRight className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />{tip}
                    </div>
                  ))}
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <FlaskConical className="w-8 h-8 text-white/20" />
                  </div>
                  <div>
                    <div className="text-white/40 font-semibold text-xs">Fertilizer Advisory Engine</div>
                    <div className="text-white/20 text-[11px] mt-1">Enter soil test values for AI-driven fertilizer recommendations</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Weather Forecast */}
        {activeTab === 'weather' && (
          <motion.div key="weather" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Temperature', value: `${weatherData?.current?.temperature_c || 26}°C`, icon: Thermometer, color: 'from-orange-500 to-red-500' },
                { label: 'Humidity', value: `${weatherData?.current?.humidity_percent || 68}%`, icon: Droplets, color: 'from-blue-500 to-cyan-500' },
                { label: 'Wind Speed', value: `${weatherData?.current?.wind_speed_kmh || 14} km/h`, icon: Wind, color: 'from-teal-500 to-emerald-500' },
                { label: 'Rainfall (7d)', value: `${weatherData?.current?.rainfall_7d_mm || 42} mm`, icon: CloudRain, color: 'from-indigo-500 to-blue-500' },
              ].map(s => (
                <div key={s.label} className="glass-card p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-white/40">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-400" /> 7-Day Agri-Weather Forecast
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MOCK_WEATHER_TREND}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="temp" stroke="#f97316" fill="url(#tempGrad)" strokeWidth={2} name="Temp °C" />
                  <Area type="monotone" dataKey="rain" stroke="#3b82f6" fill="url(#rainGrad)" strokeWidth={2} name="Rainfall mm" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(weatherData?.forecast || []).slice(0, 4).map((f: any, i: number) => (
                <div key={i} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl">{f.icon || ['☀️', '⛅', '🌧️', '🌤️'][i]}</div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-xs">{f.date || ['Tomorrow', 'Day 3', 'Day 4', 'Day 5'][i]}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{f.description || ['Sunny', 'Partly Cloudy', 'Rain Expected', 'Clear'][i]}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{f.max_temp || [28, 31, 24, 27][i]}°C</div>
                    <div className="text-white/40 text-[10px]">Rain: {f.rainfall_mm || [0, 2, 18, 0][i]}mm</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Crop Guide */}
        {activeTab === 'crops' && (
          <motion.div key="crops" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(cropsData?.crops || []).map((c: any) => (
                <div key={c.id} className="glass-card p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{c.emoji || '🌾'}</div>
                    <div>
                      <div className="text-white font-bold">{c.name}</div>
                      <div className="text-[10px] text-white/40">{c.scientific_name}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {[
                      ['Season', c.season],
                      ['Water Need', c.water_requirement],
                      ['Avg Yield', `${c.avg_yield_tons_acre} t/ac`],
                      ['Duration', `${c.duration_days} days`],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-white/5 p-2 rounded-lg">
                        <div className="text-white/40">{l}</div>
                        <div className="text-white font-semibold mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-white/50 leading-relaxed">{c.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {(c.suitable_soils || []).slice(0, 3).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-[9px] bg-green-500/10 border border-green-500/20 text-green-400">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
