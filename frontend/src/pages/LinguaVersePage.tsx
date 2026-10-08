import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Globe, Brain, BookOpen, BarChart2, Zap, TrendingUp, Loader2,
  CheckCircle, Award, Languages, Search, ChevronRight, Copy, Check, Info, FileText, Volume2
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:8000/api/v1'

const TABS = [
  { id: 'overview',  label: 'Overview',          icon: BarChart2 },
  { id: 'translate', label: 'Translator',        icon: Languages },
  { id: 'dict',      label: 'Dictionary',        icon: BookOpen },
  { id: 'grammar',   label: 'Grammar Analyzer',  icon: Globe },
  { id: 'idioms',    label: 'Idioms & Slang',    icon: Info },
  { id: 'assist',    label: 'Writing Assistant', icon: FileText },
  { id: 'pronounce', label: 'Pronunciation Lab',  icon: Volume2 },
  { id: 'quiz',      label: 'Quiz',              icon: Award },
]

export default function LinguaVersePage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Translator
  const [text, setText] = useState('hello')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('Hindi')
  const [transType, setTransType] = useState('natural')
  const [transResult, setTransResult] = useState<any>(null)

  // Dictionary
  const [dictWord, setDictWord] = useState('ephemeral')
  const [dictLang, setDictLang] = useState('English')
  const [dictResult, setDictResult] = useState<any>(null)

  // Grammar Analyzer
  const [gramText, setGramText] = useState('She run every day to the market, it is beautiful.')
  const [gramLang, setGramLang] = useState('English')
  const [gramResult, setGramResult] = useState<any>(null)

  // Idioms & Slang
  const [idiomLang, setIdiomLang] = useState('English')
  const [idiomSearch, setIdiomSearch] = useState('')
  const [idiomResult, setIdiomResult] = useState<any>(null)

  // Writing Assistant
  const [assistText, setAssistText] = useState('i am very tired, i want to sleep now.')
  const [assistStyle, setAssistStyle] = useState('formal')
  const [assistResult, setAssistResult] = useState<any>(null)

  // Pronunciation Lab
  const [pronText, setPronText] = useState('Universal Translator')
  const [pronLang, setPronLang] = useState('English')
  const [pronResult, setPronResult] = useState<any>(null)

  // Quiz
  const [quizLang, setQuizLang] = useState('English')
  const [quizResult, setQuizResult] = useState<any>(null)

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['lingua-stats'],
    queryFn: () => axios.get(`${API}/linguaverse/stats`).then(r => r.data)
  })

  const { data: langsData } = useQuery({
    queryKey: ['lingua-languages'],
    queryFn: () => axios.get(`${API}/linguaverse/languages`).then(r => r.data),
    enabled: activeTab === 'overview',
  })

  const { data: tipsData } = useQuery({
    queryKey: ['lingua-learning-tips', targetLang],
    queryFn: () => axios.get(`${API}/linguaverse/learning-tips?language=${targetLang}`).then(r => r.data),
    enabled: activeTab === 'translate',
  })

  const { data: analyticsData } = useQuery({
    queryKey: ['lingua-analytics'],
    queryFn: () => axios.get(`${API}/linguaverse/analytics`).then(r => r.data),
    enabled: activeTab === 'overview',
  })

  // Mutations
  const translateMutation = useMutation({
    mutationFn: () => axios.post(`${API}/linguaverse/translate`, { text, source_language: sourceLang, target_language: targetLang, translation_type: transType }).then(r => r.data),
    onSuccess: d => { setTransResult(d); toast.success('Translation completed! ✓') },
    onError: () => toast.error('Translation error'),
  })

  const dictMutation = useMutation({
    mutationFn: () => axios.post(`${API}/linguaverse/dictionary`, { word: dictWord, language: dictLang }).then(r => r.data),
    onSuccess: d => { setDictResult(d); toast.success('Word found!') },
    onError: () => toast.error('Dictionary error'),
  })

  const grammarMutation = useMutation({
    mutationFn: () => axios.post(`${API}/linguaverse/grammar/analyze`, { text: gramText, language: gramLang }).then(r => r.data),
    onSuccess: d => { setGramResult(d); toast.success('Analysis complete!') },
    onError: () => toast.error('Grammar analysis error'),
  })

  const idiomsMutation = useMutation({
    mutationFn: () => axios.post(`${API}/linguaverse/idioms?language=${idiomLang}&search=${idiomSearch}`).then(r => r.data),
    onSuccess: d => { setIdiomResult(d); toast.success('Idioms retrieved!') },
    onError: () => toast.error('Idioms lookup error'),
  })

  const assistMutation = useMutation({
    mutationFn: () => axios.post(`${API}/linguaverse/writing/assist`, { text: assistText, style: assistStyle }).then(r => r.data),
    onSuccess: d => { setAssistResult(d); toast.success('Rewritten!') },
    onError: () => toast.error('Writing assistant error'),
  })

  const pronMutation = useMutation({
    mutationFn: () => axios.post(`${API}/linguaverse/pronunciation`, { text: pronText, language: pronLang }).then(r => r.data),
    onSuccess: d => { setPronResult(d); toast.success('Pronunciation generated!') },
    onError: () => toast.error('Pronunciation error'),
  })

  const quizMutation = useMutation({
    mutationFn: () => axios.post(`${API}/linguaverse/quiz/generate`, { language: quizLang, difficulty: 'medium', num_questions: 5 }).then(r => r.data),
    onSuccess: d => { setQuizResult(d); toast.success('Quiz generated!') },
    onError: () => toast.error('Quiz error'),
  })

  const [copied, setCopied] = useState(false)
  const copyTranslation = () => {
    if (transResult?.result?.natural) {
      navigator.clipboard.writeText(transResult.result.natural)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Globe className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">LinguaVerse AI</h1>
          <p className="text-sm text-muted-foreground">Offline AI-Powered Universal Language Translation, Meaning & Linguistic Analysis Platform</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="badge badge-info text-xs px-2 py-1">MarianMT & NLLB</span>
          <span className="badge badge-success text-xs px-2 py-1">Offline</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Translations', value: stats?.total_translations?.toLocaleString(), icon: Languages, color: 'from-indigo-500 to-blue-600' },
              { label: 'Languages Supported', value: stats?.languages_supported, icon: Globe, color: 'from-cyan-500 to-teal-600' },
              { label: 'Language Families', value: stats?.language_families, icon: BookOpen, color: 'from-violet-500 to-purple-600' },
              { label: 'Accuracy Rate', value: `${stats?.accuracy_rate}%`, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-white/5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5 text-white" /></div>
                <div className="text-2xl font-bold text-white">{s.value ?? '—'}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Source Languages */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Top Source Languages</h3>
              <div className="space-y-3">
                {Object.entries(analyticsData?.top_source_languages || {}).map(([lang, pct]: any) => (
                  <div key={lang} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-muted-foreground truncate">{lang}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-white w-8 text-right">{pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Families Map */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Languages List</h3>
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
                {Object.entries(langsData?.language_families || {}).map(([family, list]: any) => (
                  <div key={family} className="space-y-1">
                    <div className="text-xs font-semibold text-indigo-400">{family}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{list.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSLATOR ────────────────────────────────────── */}
      {activeTab === 'translate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Languages className="w-5 h-5 text-indigo-400" /> Universal Translator</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Source Language</label>
                <select value={sourceLang} onChange={e => setSourceLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="auto">Auto Detect</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Target Language</label>
                <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Translation Type</label>
              <select value={transType} onChange={e => setTransType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                <option value="natural">Natural Meaning</option>
                <option value="literal">Literal Translation</option>
                <option value="formal">Formal register</option>
                <option value="informal">Informal register</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Source Text</label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
                placeholder="Type word or phrase here to translate..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
            </div>
            <button onClick={() => translateMutation.mutate()} disabled={!text || translateMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {translateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Translate Offline
            </button>

            {/* Quick prompts */}
            <div className="flex gap-2">
              {['hello', 'thank you', 'good morning', 'how are you'].map(p => (
                <button key={p} onClick={() => setText(p)}
                  className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>

          {transResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Translation Result</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Detected: <span className="text-indigo-400 font-bold">{transResult.detected_language}</span></span>
                  <span className="text-xs text-indigo-400 font-bold">{(transResult.confidence_score * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
                <div className="text-xs text-muted-foreground mb-1">Translation ({targetLang})</div>
                <div className="text-lg font-bold text-white flex items-center justify-between">
                  <span>{transResult.result?.natural}</span>
                  <button onClick={copyTranslation} className="text-muted-foreground hover:text-foreground">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {transResult.result?.transliteration && (
                  <div className="text-xs text-indigo-300 mt-1 italic">Romanised: {transResult.result.transliteration}</div>
                )}
                {transResult.result?.pronunciation && (
                  <div className="text-xs text-emerald-400 mt-1">Pronounce: {transResult.result.pronunciation}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white/3 rounded-xl">
                  <div className="text-muted-foreground">Literal Translation</div>
                  <div className="text-foreground font-medium mt-0.5">{transResult.result?.literal}</div>
                </div>
                <div className="p-2.5 bg-white/3 rounded-xl">
                  <div className="text-muted-foreground">Formal register</div>
                  <div className="text-foreground font-medium mt-0.5">{transResult.result?.formal}</div>
                </div>
              </div>

              {tipsData?.tips && (
                <div className="p-3 bg-white/3 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-2">Learning Tips for {targetLang}</div>
                  <div className="space-y-1">
                    {tipsData.tips.slice(0, 3).map((tip: string, i: number) => (
                      <div key={i} className="text-xs text-muted-foreground flex gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Languages className="w-16 h-16 text-indigo-400/30" />
              <div className="text-white font-medium">Universal Translator</div>
              <div className="text-sm text-muted-foreground max-w-xs">Enter your text and perform translation between any of our supported language pairs offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── DICTIONARY ────────────────────────────────────── */}
      {activeTab === 'dict' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-400" /> Multilingual Dictionary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Language</label>
                <select value={dictLang} onChange={e => setDictLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Word</label>
                <input value={dictWord} onChange={e => setDictWord(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
            </div>
            <button onClick={() => dictMutation.mutate()} disabled={!dictWord || dictMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {dictMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Lookup Word
            </button>
          </div>

          {dictResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[550px]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-white">{dictResult.word}</div>
                  <div className="text-xs text-indigo-400 italic">{dictResult.pronunciation?.ipa}</div>
                </div>
                <span className="badge badge-info text-xs px-2 py-1">{dictResult.register}</span>
              </div>

              <div className="space-y-3">
                {dictResult.definitions?.map((def: any, i: number) => (
                  <div key={i} className="p-3 bg-white/3 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold text-indigo-400 capitalize">{def.pos}</span>
                    <div className="text-sm text-foreground mt-1">{def.definition}</div>
                    {def.example && <div className="text-xs text-muted-foreground mt-1.5 italic">Example: "{def.example}"</div>}
                  </div>
                ))}
              </div>

              {dictResult.etymology && (
                <div className="p-3 bg-white/3 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">Etymology</div>
                  <div className="text-xs text-foreground">{dictResult.etymology}</div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <BookOpen className="w-16 h-16 text-indigo-400/30" />
              <div className="text-white font-medium">Dictionary Results</div>
              <div className="text-sm text-muted-foreground font-light">Look up definitions, etymology, synonyms, register, and pronunciations instantly offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── GRAMMAR ANALYZER ──────────────────────────────── */}
      {activeTab === 'grammar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-400" /> Grammar Analyzer</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Language</label>
                <select value={gramLang} onChange={e => setGramLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Text to Analyze</label>
              <textarea value={gramText} onChange={e => setGramText(e.target.value)} rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none" />
            </div>
            <button onClick={() => grammarMutation.mutate()} disabled={!gramText || grammarMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {grammarMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Analyze Grammar
            </button>
          </div>

          {gramResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[550px]">
              <h3 className="text-base font-semibold text-white">Grammatical Breakdown</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white/3 rounded-xl">
                  <div className="text-muted-foreground">Tense</div>
                  <div className="text-indigo-300 font-bold mt-0.5">{gramResult.analysis?.tense}</div>
                </div>
                <div className="p-2.5 bg-white/3 rounded-xl">
                  <div className="text-muted-foreground">Sentence Complexity</div>
                  <div className="text-indigo-300 font-bold mt-0.5">{gramResult.analysis?.complexity}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-2">Part of Speech Tagging (Sample)</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(gramResult.pos_tagging || {}).map(([word, pos]: any) => (
                    <span key={word} className="text-xs px-2 py-1 bg-white/5 rounded-lg border border-white/5 font-mono">
                      {word}: <span className="text-indigo-400">{pos}</span>
                    </span>
                  ))}
                </div>
              </div>

              {gramResult.suggestions?.length > 0 && (
                <div className="p-3 bg-white/3 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">Stylistic Suggestions</div>
                  {gramResult.suggestions.map((s: string, i: number) => (
                    <div key={i} className="text-xs text-muted-foreground py-0.5">• {s}</div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Globe className="w-16 h-16 text-indigo-400/30" />
              <div className="text-white font-medium">Grammar Panel</div>
              <div className="text-sm text-muted-foreground">Breakdown sentence syntax, tag parts of speech, determine tenses and analyze voice offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── IDIOMS & SLANG ────────────────────────────────── */}
      {activeTab === 'idioms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Info className="w-5 h-5 text-indigo-400" /> Idioms & Cultural Expressions</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Language</label>
                <select value={idiomLang} onChange={e => setIdiomLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Search Query</label>
                <input value={idiomSearch} onChange={e => setIdiomSearch(e.target.value)}
                  placeholder="Filter idioms..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
            </div>
            <button onClick={() => idiomsMutation.mutate()} disabled={idiomsMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {idiomsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Fetch Idioms
            </button>
          </div>

          {idiomResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4 overflow-y-auto max-h-[550px]">
              <h3 className="text-base font-semibold text-white">{idiomLang} Idioms Library ({idiomResult.total})</h3>
              <div className="space-y-3">
                {idiomResult.idioms?.map((i: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white/3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-sm font-bold text-white">{i.idiom}</div>
                    <div className="text-xs text-indigo-400">Meaning: {i.meaning}</div>
                    {i.literal && <div className="text-[11px] text-muted-foreground italic">Literal: "{i.literal}"</div>}
                    {i.context && <div className="text-[11px] text-muted-foreground font-light">Origin/Context: {i.context}</div>}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Info className="w-16 h-16 text-indigo-400/30" />
              <div className="text-white font-medium">Idioms Panel</div>
              <div className="text-sm text-muted-foreground">Search and explore cultural context, metaphorical phrases, and idioms across languages</div>
            </div>
          )}
        </div>
      )}

      {/* ── WRITING ASSISTANT ──────────────────────────────── */}
      {activeTab === 'assist' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400" /> Writing Assistant</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Style / Mode</label>
              <select value={assistStyle} onChange={e => setAssistStyle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                <option value="grammar_fix">Fix Grammar & Spelling</option>
                <option value="formal">Rewrite formally</option>
                <option value="informal">Rewrite informally</option>
                <option value="academic">Academic Rewriting</option>
                <option value="business">Business Rewriting</option>
                <option value="simplify">Simplify text</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Your text</label>
              <textarea value={assistText} onChange={e => setAssistText(e.target.value)} rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
            </div>
            <button onClick={() => assistMutation.mutate()} disabled={!assistText || assistMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {assistMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Improve Writing
            </button>
          </div>

          {assistResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Rewritten Output ({assistStyle})</h3>
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-sm text-white leading-relaxed">
                {assistResult.rewritten_text}
              </div>
              <div className="text-xs text-emerald-400 font-bold">{assistResult.readability_improvement}</div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Changes Applied</div>
                {assistResult.changes_made?.map((c: string, i: number) => (
                  <div key={i} className="text-xs text-muted-foreground py-0.5">• {c}</div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <FileText className="w-16 h-16 text-indigo-400/30" />
              <div className="text-white font-medium">Assistant Panel</div>
              <div className="text-sm text-muted-foreground">Correct spelling, rephrase sentences, and modify tones (formal, informal, business, academic) offline</div>
            </div>
          )}
        </div>
      )}

      {/* ── PRONUNCIATION LAB ─────────────────────────────── */}
      {activeTab === 'pronounce' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Volume2 className="w-5 h-5 text-indigo-400" /> Pronunciation Lab</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Language</label>
                <select value={pronLang} onChange={e => setPronLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Word / Phrase</label>
              <input value={pronText} onChange={e => setPronText(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none" />
            </div>
            <button onClick={() => pronMutation.mutate()} disabled={!pronText || pronMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {pronMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
              Generate Pronunciation Info
            </button>
          </div>

          {pronResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Pronunciation Analysis</h3>
              <div className="grid grid-cols-2 gap-3 font-mono text-center text-sm">
                <div className="p-3 bg-white/3 rounded-xl">
                  <div className="text-xs text-muted-foreground capitalize font-sans mb-1">IPA Representation</div>
                  <div className="text-indigo-300 font-bold">{pronResult.ipa}</div>
                </div>
                <div className="p-3 bg-white/3 rounded-xl">
                  <div className="text-xs text-muted-foreground capitalize font-sans mb-1">Syllables</div>
                  <div className="text-indigo-300 font-bold">{pronResult.syllables}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground p-3 bg-white/3 rounded-xl">{pronResult.stress}</div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground mb-1.5">Pronunciation Tips</div>
                {pronResult.pronunciation_tips?.map((tip: string, i: number) => (
                  <div key={i} className="text-xs text-muted-foreground flex gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    {tip}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <Volume2 className="w-16 h-16 text-indigo-400/30" />
              <div className="text-white font-medium">Pronunciation Lab</div>
              <div className="text-sm text-muted-foreground font-light">Generate IPA transcripts, syllable divisions, stress annotations and offline pronunciation guides</div>
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ ──────────────────────────────────────────── */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Award className="w-5 h-5 text-indigo-400" /> Language Quiz Generator</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Language</label>
              <select value={quizLang} onChange={e => setQuizLang(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            <button onClick={() => quizMutation.mutate()} disabled={quizMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              {quizMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              Generate Quiz
            </button>
          </div>

          {quizResult ? (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <div className="text-sm font-semibold text-white">{quizResult.language} Quiz ({quizResult.quiz_type})</div>
                <div className="text-xs text-muted-foreground">{quizResult.total_questions} questions · {quizResult.time_limit_minutes} min</div>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[450px]">
                {quizResult.questions?.map((q: any, i: number) => (
                  <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-indigo-400 font-medium">Q{i + 1}</div>
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
              <Award className="w-16 h-16 text-indigo-400/30" />
              <div className="text-white font-medium">Start Quiz</div>
              <div className="text-sm text-muted-foreground font-light">Generate and practice vocabulary, translation, or grammatical quizzes locally</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
