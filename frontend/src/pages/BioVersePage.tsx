import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Leaf, Brain, BookOpen, BarChart2, Zap, TrendingUp, Loader2,
  CheckCircle, Award, FlaskConical, Microscope, Dna, Bug, Eye,
  GitBranch, Search, ChevronRight, Download, Volume2
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

const handleSpeak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95
    window.speechSynthesis.speak(u)
    toast.success('Playing audio explanation')
  } else {
    toast.error('TTS not supported')
  }
}


const TABS = [
  { id: 'overview',  label: 'Overview',      icon: BarChart2 },
  { id: 'solver',    label: 'AI Solver',     icon: Brain },
  { id: 'genetics',  label: 'Genetics Lab',  icon: Dna },
  { id: 'lab',       label: 'Lab Simulator', icon: FlaskConical },
  { id: 'taxonomy',  label: 'Taxonomy',      icon: GitBranch },
  { id: 'diagram',   label: 'Diagrams',      icon: Eye },
  { id: 'quiz',      label: 'Quiz',          icon: Award },
  { id: 'analytics', label: 'Analytics',     icon: TrendingUp },
]

const BRANCH_COLORS: Record<string, string> = {
  'Cell Biology':        'from-emerald-500 to-teal-600',
  'Molecular Biology':   'from-blue-500 to-cyan-600',
  'Genetics':            'from-violet-500 to-purple-600',
  'Microbiology':        'from-rose-500 to-pink-600',
  'Immunology':          'from-orange-500 to-amber-600',
  'Human Physiology':    'from-red-500 to-rose-600',
  'Plant Biology':       'from-lime-500 to-green-600',
  'Ecology':             'from-sky-500 to-blue-600',
  'Evolution':           'from-amber-500 to-yellow-600',
  'Biotechnology':       'from-fuchsia-500 to-violet-600',
  'Biochemistry':        'from-cyan-500 to-teal-600',
  'Neuroscience':        'from-indigo-500 to-blue-600',
  'Histology':           'from-pink-500 to-rose-600',
  'Embryology':          'from-teal-500 to-emerald-600',
  'Bioinformatics':      'from-slate-500 to-blue-600',
}

const LAB_ICONS: Record<string, string> = {
  dna_extraction: '🧬', pcr: '🔬', gel_electrophoresis: '⚡',
  microscopy: '🔭', blood_typing: '🩸', photosynthesis: '🌿',
}

const DIAGRAM_TYPES = [
  { id: 'cell', label: 'Cell Structure', icon: '🦠' },
  { id: 'dna', label: 'DNA Double Helix', icon: '🧬' },
  { id: 'food_chain', label: 'Food Chain', icon: '🌿' },
  { id: 'krebs_cycle', label: 'Krebs Cycle', icon: '⚡' },
]

export default function BioVersePage() {
  const [activeTab, setActiveTab] = useState('overview')
  // Solver
  const [question, setQuestion] = useState('')
  const [branch, setBranch] = useState('Cell Biology')
  const [solveResult, setSolveResult] = useState<any>(null)
  // Genetics
  const [parent1, setParent1] = useState('Aa')
  const [parent2, setParent2] = useState('Aa')
  const [trait, setTrait] = useState('flower color')
  const [geneticsResult, setGeneticsResult] = useState<any>(null)
  // Lab
  const [labExp, setLabExp] = useState('dna_extraction')
  const [labResult, setLabResult] = useState<any>(null)
  // Taxonomy
  const [speciesQuery, setSpeciesQuery] = useState('')
  const [taxonomyResult, setTaxonomyResult] = useState<any>(null)
  // Diagram
  const [diagramType, setDiagramType] = useState('cell')
  const [diagramResult, setDiagramResult] = useState<any>(null)
  // Quiz
  const [quizBranch, setQuizBranch] = useState('genetics')
  const [quizResult, setQuizResult] = useState<any>(null)

  const { data: stats } = useQuery({ queryKey: ['bio-stats'], queryFn: () => axios.get(`${API}/bioverse/stats`).then(r => r.data) })
  const { data: topicsData } = useQuery({ queryKey: ['bio-topics'], queryFn: () => axios.get(`${API}/bioverse/topics`).then(r => r.data), enabled: activeTab === 'overview' })
  const { data: analyticsData } = useQuery({ queryKey: ['bio-analytics'], queryFn: () => axios.get(`${API}/bioverse/analytics`).then(r => r.data), enabled: activeTab === 'analytics' })

  const solveMutation = useMutation({
    mutationFn: () => axios.post(`${API}/bioverse/solve`, { question, branch, show_mechanism: true, level: 'undergraduate' }).then(r => r.data),
    onSuccess: d => { setSolveResult(d); toast.success('Solved! ✓') },
    onError: () => toast.error('Solver error'),
  })

  const geneticsMutation = useMutation({
    mutationFn: () => axios.post(`${API}/bioverse/genetics/punnett`, { parent1_genotype: parent1, parent2_genotype: parent2, trait }).then(r => r.data),
    onSuccess: d => { setGeneticsResult(d); toast.success('Punnett square solved!') },
    onError: () => toast.error('Genetics error'),
  })

  const labMutation = useMutation({
    mutationFn: () => axios.post(`${API}/bioverse/lab/simulate`, { experiment: labExp }).then(r => r.data),
    onSuccess: d => { setLabResult(d); toast.success('Lab simulation ready!') },
    onError: () => toast.error('Lab error'),
  })

  const taxonomyMutation = useMutation({
    mutationFn: () => axios.post(`${API}/bioverse/species/classify`, { species_name: speciesQuery }).then(r => r.data),
    onSuccess: d => { setTaxonomyResult(d); toast.success('Species classified!') },
    onError: () => toast.error('Taxonomy error'),
  })

  const diagramMutation = useMutation({
    mutationFn: () => axios.post(`${API}/bioverse/diagram/generate`, { diagram_type: diagramType }).then(r => r.data),
    onSuccess: d => { setDiagramResult(d); toast.success('Diagram loaded!') },
    onError: () => toast.error('Diagram error'),
  })

  const quizMutation = useMutation({
    mutationFn: () => axios.post(`${API}/bioverse/quiz/generate`, { branch: quizBranch, difficulty: 'medium', num_questions: 5 }).then(r => r.data),
    onSuccess: d => { setQuizResult(d); toast.success('Quiz generated!') },
    onError: () => toast.error('Quiz error'),
  })

  // Render Punnett Square as SVG grid
  const renderPunnett = (result: any) => {
    if (!result?.punnett_square) return null
    const { gametes_parent1: g1, gametes_parent2: g2, offspring_genotypes: offspring } = result.punnett_square
    const cell = 60, pad = 32
    const W = pad + cell * (g2.length + 1), H = pad + cell * (g1.length + 1)

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
        {/* Headers */}
        {g2.map((g: string, i: number) => (
          <text key={i} x={pad + cell * i + cell / 2} y={pad - 8} textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">{g}</text>
        ))}
        {g1.map((g: string, j: number) => (
          <text key={j} x={pad - 10} y={pad + cell * j + cell / 2 + 5} textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">{g}</text>
        ))}
        {/* Cells */}
        {g1.map((_: string, j: number) =>
          g2.map((_: string, i: number) => {
            const genotype = offspring[j * g2.length + i] || ''
            const isHomoRec = genotype.split('').every((c: string) => c === c.toLowerCase())
            return (
              <g key={`${j}-${i}`}>
                <rect x={pad + cell * i} y={pad + cell * j} width={cell} height={cell} fill={isHomoRec ? 'rgba(239,68,68,0.15)' : 'rgba(167,139,250,0.1)'} stroke="rgba(255,255,255,0.1)" strokeWidth="1" rx="4" />
                <text x={pad + cell * i + cell / 2} y={pad + cell * j + cell / 2 + 5} textAnchor="middle" fill={isHomoRec ? '#f87171' : '#c4b5fd'} fontSize="13" fontWeight="bold">{genotype}</text>
              </g>
            )
          })
        )}
        <defs />
      </svg>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Leaf className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">BioVerse AI</h1>
          <p className="text-sm text-muted-foreground">Offline AI-Powered Biology Learning, Research, Lab Analysis & Problem Solving Platform</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="badge badge-info text-xs px-2 py-1">BioPython</span>
          <span className="badge badge-success text-xs px-2 py-1">Offline</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Questions Answered', value: stats?.total_questions_answered?.toLocaleString(), icon: Brain, color: 'from-emerald-500 to-teal-600' },
              { label: 'Branches Covered', value: stats?.topics_covered, icon: BookOpen, color: 'from-blue-500 to-cyan-600' },
              { label: 'Lab Simulations', value: stats?.lab_simulations_run?.toLocaleString(), icon: FlaskConical, color: 'from-violet-500 to-purple-600' },
              { label: 'Accuracy Rate', value: `${stats?.accuracy_rate}%`, icon: CheckCircle, color: 'from-amber-500 to-orange-600' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-white/5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5 text-white" /></div>
                <div className="text-2xl font-bold text-white">{s.value ?? '—'}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Species Classified', value: stats?.species_classified?.toLocaleString(), color: 'text-emerald-400' },
              { label: 'Diagrams Generated', value: stats?.diagrams_generated?.toLocaleString(), color: 'text-blue-400' },
              { label: 'RAG Documents', value: stats?.rag_documents?.toLocaleString(), color: 'text-violet-400' },
              { label: 'Avg Response', value: `${stats?.avg_response_ms}ms`, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-4 border border-white/5 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value ?? '—'}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-400" /> Biology Branches</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(topicsData?.topics || {}).map(([br, subtopics]: any) => (
                <motion.div key={br} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-3 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all group">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${BRANCH_COLORS[br] || 'from-emerald-500 to-teal-600'} flex items-center justify-center mb-2`}>
                    <Leaf className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors leading-tight">{br}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{(subtopics as string[]).length} topics</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Knowledge sources */}
          <div className="glass rounded-2xl p-4 border border-white/5">
            <div className="text-xs font-semibold text-white mb-2">📚 RAG Knowledge Sources</div>
            <div className="flex flex-wrap gap-2">
              {(stats?.knowledge_sources || []).map((src: string) => (
                <span key={src} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md">{src}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI SOLVER ─────────────────────────────────────── */}
      {activeTab === 'solver' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Brain className="w-5 h-5 text-emerald-400" /> AI Biology Solver</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Branch</label>
              <select value={branch} onChange={e => setBranch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
                {Object.keys(BRANCH_COLORS).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Question / Topic</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={5}
                placeholder="Ask any Biology question...&#10;e.g. Explain the stages of mitosis&#10;e.g. How does photosynthesis work?&#10;e.g. What is the role of enzymes?"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none" />
            </div>
            <button onClick={() => solveMutation.mutate()} disabled={!question || solveMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {solveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Solve with AI + BioPython
            </button>
            <div className="flex flex-wrap gap-2">
              {['Explain mitosis', 'Photosynthesis process', 'DNA replication', 'Mendelian genetics'].map(ex => (
                <button key={ex} onClick={() => setQuestion(ex)}
                  className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">{ex}</button>
              ))}
            </div>
          </div>

          {solveResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Solution</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeak(solveResult.solution?.answer)}
                    className="p-1 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-all mr-1.5"
                    title="Speak Answer"
                  >
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  </button>
                  {solveResult.solution?.verified_by_biopython && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3 h-3" /> Verified</span>}
                  <span className="text-xs text-emerald-400 font-bold">{(solveResult.solution?.confidence_score * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="text-sm text-white">{solveResult.solution?.answer}</div>
              </div>
              {solveResult.mechanism?.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Mechanism / Steps</div>
                  <div className="space-y-2">
                    {solveResult.mechanism.map((step: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">{i + 1}</div>
                        <div className="text-sm text-foreground">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {solveResult.theory?.equation && (
                <div className="p-3 bg-white/3 rounded-xl font-mono text-emerald-300 text-center text-sm">{solveResult.theory.equation}</div>
              )}
              {solveResult.theory?.mnemonic && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div className="text-xs text-amber-400 font-medium mb-1">💡 Mnemonic</div>
                  <div className="text-xs text-foreground">{solveResult.theory.mnemonic}</div>
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {solveResult.rag_sources?.map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md">{s}</span>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Brain className="w-16 h-16 text-emerald-400/30" />
              <div className="text-white font-medium">AI Biology Solver</div>
              <div className="text-sm text-muted-foreground max-w-xs">Solve conceptual questions, explain mechanisms, interpret diagrams, and get step-by-step answers — all offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── GENETICS LAB ──────────────────────────────────── */}
      {activeTab === 'genetics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Dna className="w-5 h-5 text-emerald-400" /> Punnett Square Calculator</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Parent 1 Genotype</label>
                <input value={parent1} onChange={e => setParent1(e.target.value.slice(0, 2))}
                  placeholder="e.g. Aa, AA, aa"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Parent 2 Genotype</label>
                <input value={parent2} onChange={e => setParent2(e.target.value.slice(0, 2))}
                  placeholder="e.g. Aa, AA, aa"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Trait</label>
              <input value={trait} onChange={e => setTrait(e.target.value)}
                placeholder="e.g. flower color, seed shape"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[{ p1: 'Aa', p2: 'Aa', t: 'flower color' }, { p1: 'AA', p2: 'aa', t: 'plant height' }, { p1: 'Aa', p2: 'aa', t: 'seed shape' }].map(({ p1, p2, t }) => (
                <button key={t} onClick={() => { setParent1(p1); setParent2(p2); setTrait(t) }}
                  className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">
                  {p1} × {p2}: {t}
                </button>
              ))}
            </div>
            <button onClick={() => geneticsMutation.mutate()} disabled={geneticsMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {geneticsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
              Solve Punnett Square
            </button>
          </div>

          {geneticsResult && !geneticsResult.error ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Punnett Square Result</h3>
              {renderPunnett(geneticsResult)}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-white/3 rounded-xl">
                  <div className="text-xs text-muted-foreground">Dominant Phenotype</div>
                  <div className="text-lg font-bold text-emerald-400">{geneticsResult.ratios?.phenotypic?.['Dominant phenotype']} / 4</div>
                  <div className="text-xs text-muted-foreground">{geneticsResult.analysis?.probability_dominant_phenotype}</div>
                </div>
                <div className="p-3 bg-white/3 rounded-xl">
                  <div className="text-xs text-muted-foreground">Recessive Phenotype</div>
                  <div className="text-lg font-bold text-red-400">{geneticsResult.ratios?.phenotypic?.['Recessive phenotype']} / 4</div>
                  <div className="text-xs text-muted-foreground">{geneticsResult.analysis?.probability_recessive_phenotype}</div>
                </div>
              </div>
              <div className="text-center text-sm text-white font-medium">Phenotypic Ratio: <span className="text-emerald-400 font-bold">{geneticsResult.ratios?.phenotypic_ratio}</span></div>
              <div className="space-y-1">
                {geneticsResult.explanation?.map((step: string, i: number) => (
                  <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {step}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Dna className="w-16 h-16 text-emerald-400/30" />
              <div className="text-white font-medium">Genetics Calculator</div>
              <div className="text-sm text-muted-foreground">Solve monohybrid crosses, calculate phenotypic ratios, and visualise Punnett squares</div>
            </div>
          )}
        </div>
      )}

      {/* ── LAB SIMULATOR ─────────────────────────────────── */}
      {activeTab === 'lab' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['dna_extraction', 'pcr', 'gel_electrophoresis', 'microscopy', 'blood_typing', 'photosynthesis'].map(exp => (
              <button key={exp} onClick={() => setLabExp(exp)}
                className={`p-4 rounded-xl text-left transition-all border ${labExp === exp ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'glass border-white/5 text-muted-foreground hover:text-foreground'}`}>
                <div className="text-2xl mb-1">{LAB_ICONS[exp]}</div>
                <div className="text-sm font-medium capitalize">{exp.replace(/_/g, ' ')}</div>
              </button>
            ))}
          </div>
          <button onClick={() => labMutation.mutate()} disabled={labMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {labMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            Start Lab Simulation
          </button>

          {labResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{LAB_ICONS[labExp]}</span>
                <div>
                  <div className="text-base font-semibold text-white">{labResult.name}</div>
                  <div className="text-xs text-emerald-400">{labResult.category}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Protocol Steps</div>
                <div className="space-y-2">
                  {labResult.protocol?.map((step: string, i: number) => (
                    <div key={i} className="flex gap-3 p-3 bg-white/3 rounded-xl items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">{i + 1}</div>
                      <div className="text-sm text-foreground">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <div className="text-xs text-muted-foreground mb-1">Materials Needed</div>
                  {labResult.materials?.map((m: string) => (
                    <div key={m} className="text-xs text-foreground py-0.5">• {m}</div>
                  ))}
                </div>
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                  <div className="text-xs text-amber-400 font-medium mb-1">⚠ Safety Notes</div>
                  {labResult.safety_notes?.map((n: string) => (
                    <div key={n} className="text-xs text-muted-foreground py-0.5">• {n}</div>
                  ))}
                </div>
              </div>
              {typeof labResult.expected_result === 'string' && (
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="text-xs text-emerald-400 font-medium mb-1">✓ Expected Result</div>
                  <div className="text-xs text-foreground">{labResult.expected_result}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Applications</div>
                <div className="flex flex-wrap gap-1">
                  {labResult.applications?.map((a: string) => (
                    <span key={a} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md">{a}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ── TAXONOMY ──────────────────────────────────────── */}
      {activeTab === 'taxonomy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><GitBranch className="w-5 h-5 text-emerald-400" /> Species Classifier</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Species Name</label>
              <div className="flex gap-2">
                <input value={speciesQuery} onChange={e => setSpeciesQuery(e.target.value)}
                  placeholder="e.g. Homo sapiens, Panthera leo, E. coli"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
                <button onClick={() => taxonomyMutation.mutate()} disabled={!speciesQuery || taxonomyMutation.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm rounded-xl disabled:opacity-50">
                  {taxonomyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Homo sapiens', 'Panthera leo', 'Rosa canina', 'E. coli', 'Saccharomyces cerevisiae'].map(s => (
                <button key={s} onClick={() => setSpeciesQuery(s)}
                  className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors font-mono">{s}</button>
              ))}
            </div>
          </div>

          {taxonomyResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="text-base font-semibold text-white">{taxonomyResult.classification?.common_name}</div>
              <div className="text-xs text-emerald-400 font-mono italic">{taxonomyResult.query}</div>
              <div className="space-y-1.5">
                {Object.entries(taxonomyResult.taxonomic_hierarchy || {}).map(([rank, value]: any) => (
                  <div key={rank} className="flex items-center gap-3 p-2 bg-white/3 rounded-lg">
                    <div className="text-xs text-muted-foreground w-20">{rank}</div>
                    <div className="text-sm text-white font-medium italic">{value}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-white/3 rounded-lg">
                  <div className="text-muted-foreground">Habitat</div>
                  <div className="text-foreground mt-0.5">{taxonomyResult.ecology?.habitat}</div>
                </div>
                <div className="p-2 bg-white/3 rounded-lg">
                  <div className="text-muted-foreground">Diet</div>
                  <div className="text-foreground mt-0.5">{taxonomyResult.ecology?.diet}</div>
                </div>
              </div>
              <div className="p-2 bg-emerald-500/5 rounded-lg text-xs">
                <span className="text-muted-foreground">Conservation: </span>
                <span className="text-emerald-400 font-medium">{taxonomyResult.conservation}</span>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <GitBranch className="w-16 h-16 text-emerald-400/30" />
              <div className="text-white font-medium">Species Classifier</div>
              <div className="text-sm text-muted-foreground">Classify any species using the offline ITIS taxonomy database with full 7-rank classification</div>
            </div>
          )}
        </div>
      )}

      {/* ── DIAGRAMS ──────────────────────────────────────── */}
      {activeTab === 'diagram' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DIAGRAM_TYPES.map(d => (
              <button key={d.id} onClick={() => setDiagramType(d.id)}
                className={`p-4 rounded-xl text-center transition-all border ${diagramType === d.id ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'glass border-white/5 text-muted-foreground hover:text-foreground'}`}>
                <div className="text-3xl mb-1">{d.icon}</div>
                <div className="text-xs font-medium">{d.label}</div>
              </button>
            ))}
          </div>
          <button onClick={() => diagramMutation.mutate()} disabled={diagramMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {diagramMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Generate Diagram
          </button>

          {diagramResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="text-base font-semibold text-white">{diagramResult.title}</div>
              {/* Render based on diagram type */}
              {diagramResult.data?.components && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {diagramResult.data.components.map((comp: any) => (
                    <div key={comp.name} className="p-3 bg-white/3 rounded-xl border border-white/5">
                      <div className="text-xs font-semibold text-emerald-400">{comp.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{comp.function || comp.detail}</div>
                      {comp.position && <div className="text-[10px] text-blue-400 mt-1">📍 {comp.position}</div>}
                    </div>
                  ))}
                </div>
              )}
              {diagramResult.data?.levels && (
                <div className="space-y-2">
                  {diagramResult.data.levels.map((level: any) => (
                    <div key={level.level} className="p-3 bg-white/3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-emerald-400">{level.level}</span>
                        <span className="text-xs text-amber-400">Example: {level.example}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{level.role}</div>
                    </div>
                  ))}
                </div>
              )}
              {diagramResult.data?.steps && (
                <div className="space-y-2">
                  {diagramResult.data.steps.map((step: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">{i + 1}</div>
                      <div className="text-sm text-foreground">{step}</div>
                    </div>
                  ))}
                </div>
              )}
              {diagramResult.educational_notes && (
                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-xs text-blue-300">
                  📝 {diagramResult.educational_notes}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* ── QUIZ ──────────────────────────────────────────── */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Award className="w-5 h-5 text-emerald-400" /> Biology Quiz Generator</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Branch</label>
              <select value={quizBranch} onChange={e => setQuizBranch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
                {['genetics', 'cell biology', 'ecology', 'biochemistry', 'microbiology', 'human physiology'].map(b => (
                  <option key={b} value={b} className="capitalize">{b.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                ))}
              </select>
            </div>
            <button onClick={() => quizMutation.mutate()} disabled={quizMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {quizMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              Generate Quiz
            </button>
          </div>

          {quizResult ? (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white capitalize">{quizResult.branch} Quiz</div>
                  <div className="text-xs text-muted-foreground">{quizResult.total_questions} questions · {quizResult.time_limit_minutes} min</div>
                </div>
                <span className="badge badge-info text-xs">{quizResult.difficulty}</span>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[450px]">
                {quizResult.questions?.map((q: any, i: number) => (
                  <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-emerald-400 font-medium">Q{i + 1}</div>
                    <div className="text-sm text-white font-medium">{q.q}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options?.map((opt: string, j: number) => (
                        <div key={j} className={`text-xs px-3 py-2 rounded-lg ${opt === q.answer ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/3 text-muted-foreground'}`}>
                          {String.fromCharCode(65 + j)}. {opt}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-teal-400 pt-1">💡 {q.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Award className="w-16 h-16 text-emerald-400/30" />
              <div className="text-white font-medium">Biology Quiz</div>
              <div className="text-sm text-muted-foreground">MCQs from NCERT, Campbell Biology, OpenStax and university Biology textbooks</div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS ─────────────────────────────────────── */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Branch Popularity</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.branch_popularity || {}).map(([br, pct]: any) => (
                <div key={br} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-muted-foreground truncate">{br}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{pct}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Lab Simulations by Type</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.lab_simulations_by_type || {}).map(([lab, pct]: any) => (
                <div key={lab} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-muted-foreground truncate">{lab}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{pct}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Accuracy by Branch</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.avg_accuracy_by_branch || {}).map(([br, acc]: any) => (
                <div key={br} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-muted-foreground truncate">{br}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className={`h-2 rounded-full ${acc >= 90 ? 'bg-emerald-500' : acc >= 85 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${acc}%` }} />
                  </div>
                  <div className="text-xs text-white w-8 text-right">{acc}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Platform Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Questions Answered', value: stats?.total_questions_answered?.toLocaleString(), color: 'text-emerald-400' },
                { label: 'Lab Simulations', value: stats?.lab_simulations_run?.toLocaleString(), color: 'text-blue-400' },
                { label: 'Quiz Completion', value: `${analyticsData.quiz_completion_rate}%`, color: 'text-amber-400' },
                { label: 'Accuracy', value: `${stats?.accuracy_rate}%`, color: 'text-teal-400' },
              ].map(s => (
                <div key={s.label} className="p-3 bg-white/3 rounded-xl text-center">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value ?? '—'}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
