import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Languages, Loader2, Copy, FileText, Mail, BarChart2, Code, Database, MessageSquare, Lightbulb, CheckCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { nlpApi } from '@/api/client'
import toast from 'react-hot-toast'

const TOOLS = [
  { id: 'email',     label: 'Email Writer',   icon: Mail,        color: 'text-blue-400' },
  { id: 'summary',   label: 'Summarizer',     icon: FileText,    color: 'text-emerald-400' },
  { id: 'grammar',   label: 'Grammar Check',  icon: CheckCircle, color: 'text-green-400' },
  { id: 'code',      label: 'Code Gen',       icon: Code,        color: 'text-purple-400' },
  { id: 'sql',       label: 'SQL Builder',    icon: Database,    color: 'text-amber-400' },
  { id: 'translate', label: 'Translate',      icon: Languages,   color: 'text-cyan-400' },
  { id: 'sentiment', label: 'Sentiment',      icon: MessageSquare, color: 'text-pink-400' },
  { id: 'insights',  label: 'AI Insights',    icon: Lightbulb,   color: 'text-orange-400' },
  { id: 'prompt',    label: 'Prompt Optimizer', icon: BarChart2, color: 'text-violet-400' },
]

export default function NLPPage() {
  const [tool, setTool]     = useState('email')
  const [result, setResult] = useState('')
  const [model, setModel]   = useState('llama3')

  // Input states
  const [emailForm, setEmailForm]   = useState({ purpose: '', context: '', recipient: '', tone: 'professional' })
  const [text, setText]             = useState('')
  const [targetLang, setTargetLang] = useState('Spanish')
  const [codeLang, setCodeLang]     = useState('python')
  const [codeDesc, setCodeDesc]     = useState('')
  const [sqlDesc, setSqlDesc]       = useState('')

  const runMutation = useMutation({
    mutationFn: async () => {
      let res: any
      if (tool === 'email')     res = await nlpApi.generateEmail({ ...emailForm, model })
      else if (tool === 'summary')  res = await nlpApi.summarize({ content: text, model })
      else if (tool === 'grammar')  res = await nlpApi.checkGrammar({ text, model })
      else if (tool === 'code')     res = await nlpApi.generateCode({ description: codeDesc, language: codeLang, model })
      else if (tool === 'sql')      res = await nlpApi.generateSQL({ description: sqlDesc, model })
      else if (tool === 'translate') res = await nlpApi.translate({ text, target_language: targetLang, model })
      else if (tool === 'sentiment') res = await nlpApi.sentiment(text, model)
      else if (tool === 'insights') res = await nlpApi.insights({ data_summary: text, model })
      else if (tool === 'prompt')   res = await nlpApi.optimizePrompt({ prompt: text, model })
      return res.data
    },
    onSuccess: (data) => {
      if (typeof data === 'string') setResult(data)
      else if (data.result) setResult(data.result)
      else if (data.corrected_text) setResult(data.corrected_text)
      else setResult(JSON.stringify(data, null, 2))
      toast.success('Done!')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed'),
  })

  const renderInput = () => {
    if (tool === 'email') return (
      <div className="space-y-3">
        {[{ key: 'purpose', label: 'PURPOSE', ph: 'Meeting follow-up, proposal, announcement...' }, { key: 'context', label: 'CONTEXT', ph: 'Background details...' }, { key: 'recipient', label: 'RECIPIENT', ph: 'Client, Team, CEO...' }].map(f => (
          <div key={f.key}>
            <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
            <textarea value={(emailForm as any)[f.key]} onChange={e => setEmailForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="enterprise-input resize-none" rows={2} />
          </div>
        ))}
        <select value={emailForm.tone} onChange={e => setEmailForm(p => ({ ...p, tone: e.target.value }))} className="enterprise-input text-sm">
          {['professional','casual','formal','urgent','friendly'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    )
    if (tool === 'code') return (
      <div className="space-y-3">
        <select value={codeLang} onChange={e => setCodeLang(e.target.value)} className="enterprise-input text-sm">
          {['python','typescript','javascript','java','go','rust','sql','bash'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <textarea value={codeDesc} onChange={e => setCodeDesc(e.target.value)} placeholder="Describe what code to generate..." className="enterprise-input resize-none" rows={4} />
      </div>
    )
    if (tool === 'sql') return (
      <textarea value={sqlDesc} onChange={e => setSqlDesc(e.target.value)} placeholder="Describe the SQL query you need..." className="enterprise-input resize-none" rows={4} />
    )
    if (tool === 'translate') return (
      <div className="space-y-3">
        <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="enterprise-input text-sm">
          {['Spanish','French','German','Japanese','Chinese','Arabic','Hindi','Portuguese','Russian'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Text to translate..." className="enterprise-input resize-none" rows={4} />
      </div>
    )
    return <textarea value={text} onChange={e => setText(e.target.value)} placeholder={`Enter text for ${tool}...`} className="enterprise-input resize-none" rows={6} />
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center"><Languages className="w-5 h-5 text-white" /></div>
          NLP Writing Suite
        </h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered writing tools — email, summarization, translation, code & more</p>
      </motion.div>

      {/* Tool selector */}
      <div className="flex flex-wrap gap-2">
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => { setTool(t.id); setResult('') }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${tool === t.id ? 'bg-primary/20 text-primary border border-primary/30' : 'glass hover:bg-white/10 text-muted-foreground hover:text-foreground'}`}>
            <t.icon className={`w-4 h-4 ${tool === t.id ? 'text-primary' : t.color}`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">{TOOLS.find(t => t.id === tool)?.label}</h3>
            <select value={model} onChange={e => setModel(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none">
              {['llama3','mistral','phi3','gemma'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {renderInput()}
          <motion.button onClick={() => runMutation.mutate()} disabled={runMutation.isPending}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full flex items-center justify-center gap-2">
            {runMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Languages className="w-4 h-4" /> Generate</>}
          </motion.button>
        </div>

        {/* Output */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Result</h3>
            {result && (
              <button onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!') }}
                className="btn-ghost text-xs flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </button>
            )}
          </div>
          {!result ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">AI output will appear here</div>
          ) : (
            <div className="prose-dark text-sm max-h-[500px] overflow-y-auto">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
