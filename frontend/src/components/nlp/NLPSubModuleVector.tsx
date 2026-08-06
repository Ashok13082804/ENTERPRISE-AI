import React, { useMemo } from 'react'
import { Layers, TrendingUp, Cpu } from 'lucide-react'
import { NLPModuleItem } from '@/data/nlp300Catalog'

interface NLPSubModuleVectorProps {
  activeModule: NLPModuleItem
  vectorScore?: number
}

// Deterministically generate a stable fake embedding from a string seed
function seedVector(seed: string, dims = 8): number[] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return Array.from({ length: dims }, (_, i) => {
    const v = Math.sin(hash + i * 127.1) * 0.5 + 0.5
    return Math.round(v * 100) / 100
  })
}

function cosineSim(a: number[], b: number[]): number {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0)
  const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0))
  const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0))
  return normA && normB ? dot / (normA * normB) : 0
}

export const NLPSubModuleVector: React.FC<NLPSubModuleVectorProps> = ({
  activeModule,
  vectorScore = 0,
}) => {
  const queryVec = useMemo(() => seedVector(activeModule.id, 10), [activeModule.id])
  const docVecs = useMemo(() => {
    return activeModule.pipelineSteps.map((step) => ({
      label: step,
      vec: seedVector(step, 10),
    }))
  }, [activeModule.id])

  const similarities = useMemo(() => {
    return docVecs.map((d) => ({
      label: d.label,
      similarity: cosineSim(queryVec, d.vec),
      vec: d.vec,
    })).sort((a, b) => b.similarity - a.similarity)
  }, [docVecs, queryVec])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Vector Space Similarity Matrix</h3>
            <p className="text-xs text-muted-foreground">
              Dense embedding distances between input query vector and pipeline step document vectors for{' '}
              <span className="text-foreground font-semibold">{activeModule.name}</span>
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-violet-500">
              {vectorScore > 0 ? (vectorScore * 100).toFixed(1) + '%' : (similarities[0]?.similarity * 100).toFixed(1) + '%'}
            </div>
            <div className="text-xs text-muted-foreground">Top Match Score</div>
          </div>
        </div>

        {/* Query Vector Display */}
        <div className="bg-muted/50 rounded-xl p-4 mb-4 border border-border">
          <div className="text-xs font-mono font-bold text-primary mb-2">Query Embedding Vector (dim=10)</div>
          <div className="flex flex-wrap gap-2">
            {queryVec.map((v, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg px-2.5 py-1 font-mono text-[11px] text-foreground"
              >
                <span className="text-muted-foreground text-[9px]">d{i}: </span>{v.toFixed(3)}
              </div>
            ))}
          </div>
        </div>

        {/* Similarity Bars */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
            Cosine Similarity to Pipeline Step Vectors
          </div>
          {similarities.map((item, idx) => {
            const pct = item.similarity * 100
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium truncate max-w-xs">{item.label}</span>
                  <span className={`font-mono font-bold ${pct > 85 ? 'text-emerald-500' : pct > 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {pct.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pct > 85 ? 'bg-emerald-500' : pct > 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vector Heatmap */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          Embedding Dimension Heatmap
        </h4>
        <p className="text-xs text-muted-foreground mb-4">
          Color intensity represents activation magnitude per embedding dimension across pipeline step vectors.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[10px] font-mono">
            <thead>
              <tr>
                <th className="text-left p-2 text-muted-foreground">Step</th>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i} className="p-1.5 text-muted-foreground text-center">d{i}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {similarities.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2 text-foreground font-medium max-w-[140px] truncate">{item.label}</td>
                  {item.vec.map((v, di) => {
                    const intensity = Math.round(v * 255)
                    return (
                      <td key={di} className="p-1">
                        <div
                          className="w-8 h-6 rounded text-center text-[9px] flex items-center justify-center font-mono text-white"
                          style={{
                            backgroundColor: `rgba(109, 40, 217, ${v})`,
                          }}
                          title={v.toFixed(3)}
                        >
                          {v.toFixed(2)}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
