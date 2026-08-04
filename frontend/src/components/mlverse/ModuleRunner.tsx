import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, UploadCloud, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { ModuleItem } from './ModuleCard'

interface ModuleRunnerProps {
  module: ModuleItem
  onRunSuccess: (result: any) => void
}

export const ModuleRunner: React.FC<ModuleRunnerProps> = ({ module, onRunSuccess }) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/mlverse/predict/${module.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: module.id, payload: formData }),
      })
      const data = await response.json()
      onRunSuccess(data.result)
    } catch (err) {
      console.error('Prediction failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setUploadedFile(file)
    setUploadStatus('Uploading & validating...')

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/v1/mlverse/upload', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      setUploadStatus(`Dataset Loaded: ${data.rows_detected} rows, ${data.columns_detected} cols`)
    } catch (err) {
      setUploadStatus('Upload failed')
    }
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl relative">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              {module.category}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {module.accuracy} Accuracy
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">{module.name}</h2>
        </div>

        <button
          onClick={() => {
            setFormData({})
            setUploadedFile(null)
            setUploadStatus(null)
          }}
          className="btn-ghost p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
          title="Reset Inputs"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dynamic Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {module.inputs.map((field) => {
            const label = field.replace(/_/g, ' ')
            const isTextarea = field === 'text' || field === 'document' || field === 'essay' || field === 'report_text'
            
            if (isTextarea) {
              return (
                <div key={field} className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <textarea
                    rows={4}
                    value={formData[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder={`Enter ${label} for processing...`}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              )
            }

            return (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 capitalize">
                  {label}
                </label>
                <input
                  type="text"
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder={`e.g. 100`}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            )
          })}
        </div>

        {/* Dataset / Image Drag & Drop Upload */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Attach Custom Dataset / File (Optional)
          </label>
          <div className="relative border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/40 group">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs text-slate-300 font-medium">
              {uploadedFile ? uploadedFile.name : 'Drop CSV, Excel, Image or PDF dataset'}
            </p>
            {uploadStatus && (
              <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {uploadStatus}
              </p>
            )}
          </div>
        </div>

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Executing AI Inference Engine...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Run {module.name}</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
