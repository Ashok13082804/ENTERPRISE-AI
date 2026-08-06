import React from 'react'
import { Activity, Zap, CheckCircle2, BarChart2, Clock, TrendingUp, Award, Cpu } from 'lucide-react'
import { NLPModuleItem } from '@/data/nlp300Catalog'

interface NLPSubModuleAnalyticsProps {
  activeModule: NLPModuleItem
  latencyMs?: number
  tokensProcessed?: number
  vectorScore?: number
  executionCount?: number
}

export const NLPSubModuleAnalytics: React.FC<NLPSubModuleAnalyticsProps> = ({
  activeModule,
  latencyMs = 0,
  tokensProcessed = 0,
  vectorScore = 0,
  executionCount = 0,
}) => {
  const stats = [
    {
      label: 'Module Accuracy',
      value: activeModule.accuracy,
      icon: Award,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Last Latency',
      value: latencyMs > 0 ? `${latencyMs}ms` : '—',
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Tokens Processed',
      value: tokensProcessed > 0 ? tokensProcessed.toLocaleString() : '—',
      icon: Cpu,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
    },
    {
      label: 'Vector Alignment',
      value: vectorScore > 0 ? (vectorScore * 100).toFixed(1) + '%' : '—',
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Session Executions',
      value: executionCount > 0 ? executionCount : '—',
      icon: BarChart2,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
    {
      label: 'Status',
      value: 'Live ✓',
      icon: Activity,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  ]

  // Simulated historical bar chart data
  const barData = [42, 68, 55, 82, 74, 91, 88, 96, 78, 85, 93, 100]
  const barLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-6">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon
          return (
            <div
              key={idx}
              className={`bg-card border ${s.border} rounded-2xl p-4 flex items-center gap-4`}
            >
              <div className={`p-3 ${s.bg} ${s.color} rounded-xl shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Simulated Performance Chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          Sub-Website Monthly Execution Volume (Simulated)
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Showing historical inference volume trend for <span className="text-foreground font-semibold">{activeModule.name}</span>
        </p>
        <div className="flex items-end gap-2 h-40">
          {barData.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 gap-1">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all"
                style={{ height: `${val}%` }}
              />
              <span className="text-[9px] text-muted-foreground font-mono">{barLabels[idx]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Steps Reference */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Pipeline Execution Steps
        </h3>
        <div className="space-y-2">
          {activeModule.pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-muted/40 border border-border/60 rounded-xl p-3"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
                {idx + 1}
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-medium text-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-bold text-foreground mb-3">Module Capabilities</h3>
        <div className="flex flex-wrap gap-2">
          {activeModule.capabilities.map((cap, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
