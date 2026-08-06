import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Cpu, Database, FileText, Layers, Sparkles, Zap } from 'lucide-react'

interface NLPPipelineGraphProps {
  steps: string[]
  currentStep?: number
}

export const NLPPipelineGraph: React.FC<NLPPipelineGraphProps> = ({
  steps,
  currentStep = steps.length,
}) => {
  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 bg-slate-950/80 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-400" />
          <span>NLP Execution Pipeline & Stage DAG</span>
        </h4>
        <span className="text-[11px] font-mono text-slate-400">5 Stages Active</span>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {steps.map((stepName, idx) => {
          const isDone = idx < currentStep
          const isCurrent = idx === currentStep - 1

          return (
            <React.Fragment key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex-1 min-w-[130px] p-3 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-gradient-to-br from-teal-900/50 to-cyan-950/70 border-teal-400 shadow-lg shadow-teal-500/20'
                    : isDone
                    ? 'bg-slate-900/60 border-white/10'
                    : 'bg-slate-950/40 border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-teal-300 font-bold">
                    STEP 0{idx + 1}
                  </span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                <p className="text-xs font-bold text-white truncate">{stepName}</p>

                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  {idx === 0 && 'Raw Tokens -> Vectors'}
                  {idx === 1 && 'Embedding Matrix'}
                  {idx === 2 && 'FAISS Search Chunk'}
                  {idx === 3 && 'RAG Prompt Construct'}
                  {idx === 4 && 'LLM Output Decoding'}
                </div>
              </motion.div>

              {idx < steps.length - 1 && (
                <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
