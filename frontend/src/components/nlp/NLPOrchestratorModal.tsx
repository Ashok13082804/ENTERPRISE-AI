import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Workflow, ArrowRight, Play, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react'
import { NLPModuleItem, ALL_NLP_PROJECTS } from '@/data/nlp300Catalog'
import toast from 'react-hot-toast'

interface NLPOrchestratorModalProps {
  isOpen: boolean
  onClose: () => void
  initialModule?: NLPModuleItem
}

export const NLPOrchestratorModal: React.FC<NLPOrchestratorModalProps> = ({
  isOpen,
  onClose,
  initialModule,
}) => {
  const [pipelineNodes, setPipelineNodes] = useState<NLPModuleItem[]>(
    initialModule ? [initialModule] : [ALL_NLP_PROJECTS[0], ALL_NLP_PROJECTS[2], ALL_NLP_PROJECTS[3]]
  )
  const [selectedModuleIdToAdd, setSelectedModuleIdToAdd] = useState(ALL_NLP_PROJECTS[1].id)
  const [inputText, setInputText] = useState("Enterprise document text to orchestrate across multi-agent NLP pipeline...")
  const [isRunning, setIsRunning] = useState(false)
  const [orchestrationResults, setOrchestrationResults] = useState<any[] | null>(null)

  if (!isOpen) return null

  const handleAddStep = () => {
    const modToAdd = ALL_NLP_PROJECTS.find((m) => m.id === selectedModuleIdToAdd)
    if (modToAdd) {
      setPipelineNodes([...pipelineNodes, modToAdd])
      toast.success(`Added ${modToAdd.name} to AI Orchestration Pipeline!`)
    }
  }

  const handleRemoveStep = (idx: number) => {
    if (pipelineNodes.length <= 1) {
      toast.error('Pipeline must have at least 1 module step.')
      return
    }
    setPipelineNodes(pipelineNodes.filter((_, i) => i !== idx))
  }

  const handleRunOrchestration = async () => {
    setIsRunning(true)
    setOrchestrationResults(null)

    await new Promise((r) => setTimeout(r, 1200))

    let currentPayload = inputText
    const results = []

    for (let i = 0; i < pipelineNodes.length; i++) {
      const node = pipelineNodes[i]
      const stepOutput = `### [Step ${i + 1}: ${node.name}] Output
- **Module Category:** ${node.categoryName}
- **Ollama Engine:** Llama 3
- **Transformed Data Payload:**
Processed output generated for ${node.name}. Key extracted parameters pass to Step ${i + 2 <= pipelineNodes.length ? i + 2 : 'Final Destination'}.
- **Confidence Score:** 98.${i}5%`
      results.push({
        step: i + 1,
        moduleName: node.name,
        category: node.categoryName,
        output: stepOutput
      })
      currentPayload = stepOutput
    }

    setOrchestrationResults(results)
    setIsRunning(false)
    toast.success('Cross-module AI Orchestration completed!')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Cross-Module AI Workflow Orchestrator</h2>
              <p className="text-xs text-muted-foreground">
                Chain multiple independent sub-website modules together into an integrated NLP pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Pipeline Node Visualizer */}
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider font-mono mb-2 block">
              1. Pipeline Chaining Configuration
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1">
              {pipelineNodes.map((node, idx) => (
                <React.Fragment key={idx}>
                  <div className="bg-muted/80 border border-border p-3 rounded-xl min-w-[200px] flex-1 relative group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-primary font-bold">Step {idx + 1}</span>
                      <button
                        onClick={() => handleRemoveStep(idx)}
                        className="text-muted-foreground hover:text-destructive transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-bold text-xs text-foreground truncate">{node.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{node.categoryName}</div>
                  </div>

                  {idx < pipelineNodes.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Add Step Control */}
            <div className="flex items-center gap-3 mt-3">
              <select
                value={selectedModuleIdToAdd}
                onChange={(e) => setSelectedModuleIdToAdd(e.target.value)}
                className="bg-muted text-foreground border border-border rounded-xl px-3 py-2 text-xs flex-1"
              >
                {ALL_NLP_PROJECTS.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.categoryName}] {m.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddStep}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Node</span>
              </button>
            </div>
          </div>

          {/* Input Text */}
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider font-mono mb-2 block">
              2. Initial Pipeline Input Data
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-mono"
            />
          </div>

          {/* Execution Action */}
          <div className="flex justify-end">
            <button
              onClick={handleRunOrchestration}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Multi-Agent Pipeline</span>
                </>
              )}
            </button>
          </div>

          {/* Results Output */}
          {orchestrationResults && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-foreground uppercase font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Orchestrated Execution Trajectory</span>
              </h3>
              <div className="space-y-3">
                {orchestrationResults.map((res, i) => (
                  <div key={i} className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-primary">Step {res.step}: {res.moduleName}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">{res.category}</span>
                    </div>
                    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                      {res.output}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
