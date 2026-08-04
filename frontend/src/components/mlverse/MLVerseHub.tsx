import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Layers, Cpu, Brain, Zap, Filter, Award, Activity, Grid } from 'lucide-react'
import { ModuleCard, ModuleItem } from './ModuleCard'
import { ModuleRunner } from './ModuleRunner'
import { ResultsPanel } from './ResultsPanel'
import { ExplainPanel } from './ExplainPanel'

export const MLVerseHub: React.FC = () => {
  const [catalog, setCatalog] = useState<ModuleItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModule, setActiveModule] = useState<ModuleItem | null>(null)
  const [activeResult, setActiveResult] = useState<any>(null)
  const [showExplain, setShowExplain] = useState(false)

  useEffect(() => {
    fetch('/api/v1/mlverse/catalog')
      .then((res) => res.json())
      .then((data) => {
        setCatalog(data.modules || [])
        setCategories(['All', ...(data.categories || [])])
      })
      .catch((err) => console.error('Failed loading catalog', err))
  }, [])

  const filteredModules = catalog.filter((mod) => {
    const matchesCategory = selectedCategory === 'All' || mod.category === selectedCategory
    const matchesSearch =
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.inputs.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/70 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Brain className="w-4 h-4" />
            <span>The Ultimate AI & Machine Learning Ecosystem</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            MLVerse <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">100 Modules</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Access 100 enterprise-grade machine learning solutions from a single unified workspace. Predict, analyze, compare models, and decode AI decisions with Explainable AI.
          </p>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="glass-card p-3.5 rounded-xl border border-white/10 bg-slate-950/40">
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Submodules</p>
              <p className="text-2xl font-extrabold text-indigo-400 mt-0.5">100</p>
            </div>
            <div className="glass-card p-3.5 rounded-xl border border-white/10 bg-slate-950/40">
              <p className="text-xs text-slate-400 uppercase font-semibold">ML Domains</p>
              <p className="text-2xl font-extrabold text-purple-400 mt-0.5">7</p>
            </div>
            <div className="glass-card p-3.5 rounded-xl border border-white/10 bg-slate-950/40">
              <p className="text-xs text-slate-400 uppercase font-semibold">Avg. Accuracy</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">94.2%</p>
            </div>
            <div className="glass-card p-3.5 rounded-xl border border-white/10 bg-slate-950/40">
              <p className="text-xs text-slate-400 uppercase font-semibold">XAI Engine</p>
              <p className="text-2xl font-extrabold text-pink-400 mt-0.5">SHAP / LIME</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 100 ML solutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {/* Execution Drawer / Selected Module Section */}
      <AnimatePresence>
        {activeModule && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-3xl border border-indigo-500/40 bg-slate-950/90 shadow-2xl relative"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Active Execution Sandbox
                </span>
                <button
                  onClick={() => {
                    setActiveModule(null)
                    setActiveResult(null)
                  }}
                  className="text-xs text-slate-400 hover:text-white underline font-semibold"
                >
                  Close Module
                </button>
              </div>

              <ModuleRunner
                module={activeModule}
                onRunSuccess={(res) => setActiveResult(res)}
              />
            </div>

            <div>
              {activeResult ? (
                <ResultsPanel
                  result={activeResult}
                  moduleId={activeModule.id}
                  onOpenExplain={() => setShowExplain(true)}
                />
              ) : (
                <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-white/15 bg-slate-900/40 flex flex-col items-center justify-center p-8 text-center">
                  <Zap className="w-12 h-12 text-indigo-400/50 mb-3 animate-pulse" />
                  <h4 className="text-base font-bold text-white mb-1">Awaiting Prediction</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Fill in parameters or attach a dataset in the sandbox to execute AI inference.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 100 Modules Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-400" />
            <span>Modules Catalog</span>
            <span className="text-xs font-semibold text-slate-400 font-mono">({filteredModules.length} available)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredModules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              onSelect={(m) => {
                setActiveModule(m)
                setActiveResult(null)
                window.scrollTo({ top: 350, behavior: 'smooth' })
              }}
            />
          ))}
        </div>
      </div>

      {/* Explainable AI Modal */}
      {showExplain && activeModule && (
        <ExplainPanel
          moduleId={activeModule.id}
          onClose={() => setShowExplain(false)}
        />
      )}
    </div>
  )
}
