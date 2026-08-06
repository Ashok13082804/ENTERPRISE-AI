import React from 'react'
import { motion } from 'framer-motion'
import { GitCommit, Compass, Sparkles } from 'lucide-react'

interface VectorVisualizerProps {
  sampleInput: string
  accuracy: string
}

export const NLPVectorVisualizer: React.FC<VectorVisualizerProps> = ({
  sampleInput,
  accuracy,
}) => {
  const points = [
    { label: 'Query Vector', x: 50, y: 45, color: '#2dd4bf', size: 12 },
    { label: 'Doc Chunk #1 (0.94)', x: 62, y: 38, color: '#38bdf8', size: 10 },
    { label: 'Doc Chunk #2 (0.88)', x: 40, y: 55, color: '#818cf8', size: 9 },
    { label: 'Doc Chunk #3 (0.76)', x: 75, y: 70, color: '#c084fc', size: 8 },
    { label: 'Irrelevant Outlier (0.21)', x: 20, y: 80, color: '#f43f5e', size: 6 },
  ]

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 bg-slate-950/80 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Vector Embedding Space & Cosine Similarity</span>
        </h4>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
          Accuracy: {accuracy}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 2D Scatter Coordinate Plot */}
        <div className="relative h-48 bg-slate-900/90 rounded-xl border border-white/10 p-3 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          {/* Coordinate axes */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />

          {/* Vector points */}
          {points.map((pt, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="absolute group cursor-pointer"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            >
              <div
                className="rounded-full animate-pulse shadow-lg"
                style={{
                  width: `${pt.size}px`,
                  height: `${pt.size}px`,
                  backgroundColor: pt.color,
                  boxShadow: `0 0 10px ${pt.color}`,
                }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap bg-slate-950 text-[10px] text-white px-2 py-1 rounded border border-white/10 shadow-xl z-20">
                {pt.label}
              </div>
            </motion.div>
          ))}

          <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 font-mono">
            PCA Projection: Dim-0 vs Dim-1 (Nomic-768)
          </div>
        </div>

        {/* Dense Vector Dimensions & Stats */}
        <div className="space-y-2 text-xs">
          <div className="glass p-2.5 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Embedding Model</span>
            <p className="font-mono text-teal-300 font-bold">nomic-embed-text-v1.5 (768-d)</p>
          </div>

          <div className="glass p-2.5 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Vector Norm</span>
            <p className="font-mono text-cyan-300 font-bold">||V|| = 1.0000 (L2 Normalized)</p>
          </div>

          <div className="glass p-2.5 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Top Cosine Score</span>
            <p className="font-mono text-emerald-400 font-bold">0.9412 (High Semantic Similarity)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
