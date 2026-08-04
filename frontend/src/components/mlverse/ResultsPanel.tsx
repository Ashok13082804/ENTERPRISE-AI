import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Download, Award, BarChart3, HelpCircle, Shield, FileText, ChevronRight } from 'lucide-react'

interface ResultsPanelProps {
  result: any
  moduleId: string
  onOpenExplain: () => void
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, moduleId, onOpenExplain }) => {
  const [downloading, setDownloading] = useState(false)

  if (!result) return null

  const handleDownloadReport = async (format: string) => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/v1/mlverse/report/download/${moduleId}?format=${format}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `MLVerse_${moduleId}_Report.${format}`
      a.click()
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  // Extract primary key-value pairs to highlight
  const rawKeys = Object.keys(result).filter(
    (k) => !['feature_importance', 'metrics', 'explanation', 'confidence'].includes(k)
  )

  const featureImportance = result.feature_importance || {}
  const metrics = result.metrics || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-slate-900/90 shadow-2xl space-y-6"
    >
      {/* Header Result Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-4 h-4" /> Prediction Output Generated
          </span>
          <h3 className="text-xl font-bold text-white">AI Inference Results</h3>
        </div>

        {/* Confidence Badge */}
        {result.confidence && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-[10px] uppercase text-emerald-400 font-semibold">Model Confidence</p>
              <p className="text-sm font-extrabold text-white">{Math.round(result.confidence * 100)}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Result Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rawKeys.map((key) => {
          const val = result[key]
          if (typeof val === 'object' && val !== null && !Array.isArray(val)) return null
          
          return (
            <div key={key} className="bg-slate-950/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="text-lg font-bold text-indigo-300 mt-1 break-words">
                {Array.isArray(val) ? val.join(', ') : String(val)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Explanation Box */}
      {result.explanation && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
          <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> AI Natural Language Summary
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed">{result.explanation}</p>
        </div>
      )}

      {/* Feature Importance Bar Chart */}
      {Object.keys(featureImportance).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-400" /> Feature Importance Breakdown
            </h4>
            <button
              onClick={onOpenExplain}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View Full XAI SHAP Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(featureImportance).map(([feat, val]: [string, any]) => {
              const pct = typeof val === 'number' ? Math.round(val * 100) : 50
              return (
                <div key={feat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-300">
                    <span>{feat}</span>
                    <span className="font-mono text-indigo-400">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
        <button
          onClick={onOpenExplain}
          className="btn-ghost text-xs text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          <HelpCircle className="w-4 h-4" /> Explainable AI (SHAP / LIME)
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadReport('json')}
            disabled={downloading}
            className="text-xs text-white bg-slate-800 hover:bg-slate-700 border border-white/10 px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> JSON Report
          </button>
          <button
            onClick={() => handleDownloadReport('txt')}
            disabled={downloading}
            className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> PDF / Text Report
          </button>
        </div>
      </div>
    </motion.div>
  )
}
