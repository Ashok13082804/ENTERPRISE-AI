import React from 'react'
import { motion } from 'framer-motion'
import {
  ChevronRight, Cpu, Layers, Database, FileText, Activity,
  Sliders, Workflow, Bot, RefreshCw, Star, Zap, Code
} from 'lucide-react'
import { NLPModuleItem } from '@/data/nlp300Catalog'

interface NLPSubModuleHeaderProps {
  activeModule: NLPModuleItem
  activeTab: 'demo' | 'analytics' | 'workflow' | 'schema' | 'docs' | 'vector' | 'settings'
  setActiveTab: (tab: 'demo' | 'analytics' | 'workflow' | 'schema' | 'docs' | 'vector' | 'settings') => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  onOpenOrchestrator: () => void
}

export const OLLAMA_MODELS = [
  { id: 'llama3', name: 'Llama 3 (Meta 8B/70B)' },
  { id: 'mistral', name: 'Mistral 7B Instruct' },
  { id: 'gemma', name: 'Google Gemma 7B' },
  { id: 'phi3', name: 'Microsoft Phi-3 Mini' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder 6.7B' },
  { id: 'codellama', name: 'CodeLlama 13B' },
]

export const NLPSubModuleHeader: React.FC<NLPSubModuleHeaderProps> = ({
  activeModule,
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
  onOpenOrchestrator
}) => {
  return (
    <div className="bg-card/80 border-b border-border p-4 md:p-6 backdrop-blur-md rounded-2xl shadow-sm mb-6">
      {/* Top Breadcrumb & Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <span className="text-primary font-bold">NLPVerse</span>
            <ChevronRight className="w-3 h-3" />
            <span>Category #{activeModule.categoryId}: {activeModule.categoryName}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{activeModule.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {activeModule.name}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Sub-Website Module
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-3xl">
                {activeModule.description}
              </p>
            </div>
          </div>
        </div>

        {/* Local AI Model Switcher & Orchestrator Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
            <Cpu className="w-4 h-4 text-primary animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">Local Ollama Engine</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer text-foreground"
              >
                {OLLAMA_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-card text-foreground">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onOpenOrchestrator}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground text-xs font-semibold rounded-xl transition shadow-md"
          >
            <Workflow className="w-4 h-4" />
            <span>AI Orchestrator</span>
          </button>
        </div>
      </div>

      {/* Sub-Website Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-border/50 pt-3 no-scrollbar">
        {[
          { id: 'demo', label: 'Demo & Playground', icon: Zap },
          { id: 'analytics', label: 'Dashboard & Metrics', icon: Activity },
          { id: 'workflow', label: 'AI Pipeline Graph', icon: Workflow },
          { id: 'schema', label: 'DB Schema & Data', icon: Database },
          { id: 'docs', label: 'API & Developer Docs', icon: Code },
          { id: 'vector', label: 'Vector Matrix', icon: Layers },
          { id: 'settings', label: 'Orchestration & Settings', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
