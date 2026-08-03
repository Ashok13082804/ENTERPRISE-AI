import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Eye, Upload, Loader2, FileText, Scan, QrCode, Image as ImageIcon,
  ChevronRight, BarChart3, Zap, CheckCircle, AlertCircle, Camera,
  RefreshCw, Download, Copy, Sparkles, Target, Brain, Shield
} from 'lucide-react'
import { visionApi } from '@/api/client'
import toast from 'react-hot-toast'

const TASKS = [
  {
    id: 'ocr', label: 'OCR', icon: FileText,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'from-blue-500/10 to-cyan-500/10',
    border: 'border-blue-500/30',
    desc: 'Extract text from any image with high accuracy',
    badge: 'EasyOCR + Tesseract'
  },
  {
    id: 'face', label: 'Face Detect', icon: Eye,
    gradient: 'from-pink-500 to-rose-500',
    bg: 'from-pink-500/10 to-rose-500/10',
    border: 'border-pink-500/30',
    desc: 'Detect and locate human faces',
    badge: 'OpenCV HaarCascade'
  },
  {
    id: 'object', label: 'Object Detect', icon: Scan,
    gradient: 'from-violet-500 to-purple-500',
    bg: 'from-violet-500/10 to-purple-500/10',
    border: 'border-violet-500/30',
    desc: 'Detect objects, contours and shapes',
    badge: 'OpenCV DNN'
  },
  {
    id: 'qr', label: 'QR / Barcode', icon: QrCode,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/30',
    desc: 'Decode QR codes and barcodes instantly',
    badge: 'OpenCV QRDetector'
  },
  {
    id: 'classify', label: 'Classify Image', icon: Brain,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/30',
    desc: 'Classify image content and visual features',
    badge: 'AI Feature Analysis'
  },
]

function ConfidenceBar({ value, color = 'indigo' }: { value: number; color?: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${
            pct > 80 ? 'from-emerald-500 to-green-400' :
            pct > 60 ? 'from-amber-500 to-yellow-400' :
            'from-red-500 to-rose-400'
          }`}
        />
      </div>
      <span className="text-xs font-mono text-white/70 w-10 text-right">{pct}%</span>
    </div>
  )
}

function ResultsPanel({ task, result }: { task: string; result: any }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (task === 'ocr') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Text Extracted</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {result.model || 'EasyOCR'}
          </span>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-white/50">Confidence</span>
          <ConfidenceBar value={result.confidence || 0} />
        </div>
        <div className="relative">
          <div className="bg-black/30 rounded-xl p-4 border border-white/10 font-mono text-sm text-green-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {result.text || 'No text detected'}
          </div>
          <button
            onClick={() => handleCopy(result.text)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/60" />}
          </button>
        </div>
        {result.regions?.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-white/60">Detected Regions ({result.regions.length})</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {result.regions.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-xs text-white/80 truncate flex-1">{r.text}</span>
                  <span className="text-xs text-indigo-400 font-mono ml-2">{Math.round((r.confidence || 0) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  if (task === 'face') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-semibold text-white">Face Detection Complete</span>
        </div>
        <div className="text-center py-6">
          <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            {result.faces_detected}
          </div>
          <div className="text-sm text-white/50 mt-1">
            {result.faces_detected === 1 ? 'Face Detected' : 'Faces Detected'}
          </div>
        </div>
        {result.faces?.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-white/60">Face Locations</span>
            {result.faces.map((f: any, i: number) => (
              <div key={i} className="grid grid-cols-4 gap-1 text-xs">
                {['x', 'y', 'width', 'height'].map(k => (
                  <div key={k} className="bg-white/5 rounded px-2 py-1.5 text-center">
                    <div className="text-white/40">{k}</div>
                    <div className="text-white font-mono">{f[k]}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="text-xs text-center text-white/30">Model: {result.model}</div>
      </motion.div>
    )
  }

  if (task === 'object') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">Objects Detected</span>
          </div>
          <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs border border-violet-500/30">
            {result.total_detected} found
          </span>
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {result.objects?.map((obj: any) => (
            <div key={obj.id} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white capitalize">{obj.class}</span>
                <span className="text-xs text-violet-400">{Math.round(obj.confidence * 100)}%</span>
              </div>
              <ConfidenceBar value={obj.confidence} />
              <div className="mt-2 text-xs text-white/40 font-mono">
                bbox: [{obj.bbox?.join(', ')}] · area: {obj.area?.toLocaleString()}px
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-center text-white/30">
          Image: {result.image_size?.[0]}×{result.image_size?.[1]}px · {result.model}
        </div>
      </motion.div>
    )
  }

  if (task === 'qr') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-2">
          {result.detected
            ? <CheckCircle className="w-4 h-4 text-emerald-400" />
            : <AlertCircle className="w-4 h-4 text-amber-400" />}
          <span className="text-sm font-semibold text-white">
            {result.detected ? 'QR Code Decoded' : 'No QR Code Found'}
          </span>
        </div>
        {result.detected && result.data && (
          <>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="text-xs text-emerald-400/70 mb-1">{result.type}</div>
              <div className="text-sm text-emerald-300 break-all font-mono">{result.data}</div>
            </div>
            <button
              onClick={() => handleCopy(result.data)}
              className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Decoded Data
            </button>
          </>
        )}
      </motion.div>
    )
  }

  if (task === 'classify') {
    const topClass = result.classifications?.[0]
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Classification Complete</span>
        </div>
        {topClass && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
            <div className="text-xs text-amber-400/70 mb-1">Top Classification</div>
            <div className="text-xl font-bold text-amber-300 capitalize">
              {topClass.class?.replace(/_/g, ' ')}
            </div>
            <div className="text-2xl font-mono text-white/80 mt-1">
              {Math.round((topClass.confidence || 0) * 100)}%
            </div>
          </div>
        )}
        <div className="space-y-2">
          <span className="text-xs font-medium text-white/60">All Classifications</span>
          {result.classifications?.map((c: any, i: number) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/70 capitalize">{c.class?.replace(/_/g, ' ')}</span>
                <span className="text-amber-400 font-mono">{Math.round((c.confidence || 0) * 100)}%</span>
              </div>
              <ConfidenceBar value={c.confidence} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-white/40">Size</div>
            <div className="text-white font-mono">{result.image_size?.[0]}×{result.image_size?.[1]}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-white/40">Brightness</div>
            <div className="text-white font-mono">{result.brightness?.toFixed(1)}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-white/40">Model</div>
            <div className="text-white truncate">{result.model?.split(' ')[0]}</div>
          </div>
        </div>
      </motion.div>
    )
  }

  return <div className="text-white/40 text-sm">Upload an image to analyze</div>
}

export default function VisionPage() {
  const [task, setTask] = useState('ocr')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeTask = TASKS.find(t => t.id === task)!

  const processFile = useCallback(async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setFileName(file.name)
    setResult(null)
    setLoading(true)
    const steps = ['Reading image...', 'Preprocessing...', 'Running AI model...', 'Generating results...']
    let stepIdx = 0
    const stepInterval = setInterval(() => {
      if (stepIdx < steps.length) setProcessingStep(steps[stepIdx++])
    }, 400)
    try {
      const formData = new FormData()
      formData.append('file', file)
      let res: any
      if (task === 'ocr') res = await visionApi.ocr(formData)
      else if (task === 'face') res = await visionApi.detectFaces(formData)
      else if (task === 'object') res = await visionApi.detectObjects(formData)
      else if (task === 'qr') res = await visionApi.detectQR(formData)
      else if (task === 'classify') res = await visionApi.classifyImage(formData)
      setResult(res.data)
      toast.success(`${activeTask.label} analysis complete!`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Analysis failed')
    } finally {
      clearInterval(stepInterval)
      setLoading(false)
      setProcessingStep('')
    }
  }, [task, activeTask])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) processFile(file)
  }, [processFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.webp', '.gif'] },
    multiple: false,
  })

  const handleReset = () => {
    setPreview(null)
    setResult(null)
    setFileName(null)
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Vision AI</h1>
              <p className="text-xs text-white/40">OpenCV · EasyOCR · HaarCascade — Fully Local, No API</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">AI Engine Active</span>
        </div>
      </motion.div>

      {/* Task Selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-5 gap-3">
        {TASKS.map((t) => {
          const Icon = t.icon
          const isActive = task === t.id
          return (
            <motion.button
              key={t.id}
              onClick={() => { setTask(t.id); setResult(null) }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all border ${
                isActive
                  ? `bg-gradient-to-br ${t.bg} ${t.border} shadow-lg`
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              {isActive && (
                <motion.div layoutId="taskIndicator"
                  className={`absolute inset-0 bg-gradient-to-br ${t.bg} opacity-60 rounded-2xl`} />
              )}
              <div className="relative z-10">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-3 shadow-md`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="font-semibold text-sm text-white">{t.label}</div>
                <div className="text-xs text-white/40 mt-0.5 hidden xl:block">{t.desc}</div>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              )}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left: Upload + Preview */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="col-span-7 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${activeTask.gradient} flex items-center justify-center`}>
                  <activeTask.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-white text-sm">{activeTask.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${activeTask.bg} ${activeTask.border} border text-white/70`}>
                  {activeTask.badge}
                </span>
              </div>
              {preview && (
                <button onClick={handleReset}
                  className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>

            {preview ? (
              <div className="relative rounded-xl overflow-hidden bg-black/30 border border-white/10">
                <img src={preview} alt="Preview" className="w-full max-h-[380px] object-contain" />
                {loading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${activeTask.gradient} flex items-center justify-center`}>
                        <activeTask.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/60 animate-spin" />
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold text-sm">{processingStep}</div>
                      <div className="text-white/40 text-xs mt-1">Using {activeTask.badge}</div>
                    </div>
                  </div>
                )}
                {!loading && result && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs text-white font-medium">Analyzed</span>
                  </div>
                )}
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? `border-current bg-gradient-to-br ${activeTask.bg}`
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
                style={{ borderColor: isDragActive ? undefined : undefined }}
              >
                <input {...getInputProps()} />
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeTask.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-semibold mb-1">
                  {isDragActive ? 'Drop image here' : 'Drop image or click to upload'}
                </div>
                <div className="text-white/40 text-sm mb-3">JPG, PNG, WebP, BMP, GIF</div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${activeTask.gradient} text-white text-sm font-medium shadow-lg cursor-pointer`}>
                  <Camera className="w-4 h-4" />
                  Choose Image
                </div>
              </div>
            )}

            {fileName && (
              <div className="flex items-center gap-2 mt-3 text-xs text-white/50">
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="truncate">{fileName}</span>
              </div>
            )}
          </div>

          {/* Task Description Card */}
          <div className={`glass-card p-4 bg-gradient-to-r ${activeTask.bg} border ${activeTask.border}`}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">{activeTask.label} — How it works</div>
                <div className="text-xs text-white/50 mt-1">{activeTask.desc}. {
                  task === 'ocr' ? 'Attempts EasyOCR first, falls back to Tesseract, then simulation.' :
                  task === 'face' ? 'Uses OpenCV Haar Cascades trained on thousands of face images.' :
                  task === 'object' ? 'Applies edge detection and contour analysis to find objects.' :
                  task === 'qr' ? 'OpenCV QRCodeDetector scans the entire image for encoded data.' :
                  'Analyzes color space, brightness, and visual features to classify content.'
                }</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Results Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="col-span-5">
          <div className="glass-card p-5 h-full min-h-[460px]">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-white/60" />
              <span className="font-semibold text-white text-sm">Analysis Results</span>
              {result && (
                <div className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Complete
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-64 gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeTask.gradient} flex items-center justify-center`}>
                      <activeTask.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -inset-2 rounded-2xl border-2 border-transparent border-t-white/40 animate-spin" />
                  </div>
                  <div className="text-center">
                    <div className="text-white/70 text-sm font-medium">Analyzing...</div>
                    <div className="text-white/30 text-xs">{processingStep}</div>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${activeTask.gradient} animate-bounce`}
                        style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ResultsPanel task={task} result={result} />
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeTask.bg} ${activeTask.border} border flex items-center justify-center`}>
                    <activeTask.icon className={`w-8 h-8 text-transparent bg-gradient-to-br ${activeTask.gradient} bg-clip-text`} style={{ WebkitBackgroundClip: 'text' }} />
                  </div>
                  <div>
                    <div className="text-white/40 text-sm font-medium">Ready to Analyze</div>
                    <div className="text-white/20 text-xs mt-1">Upload an image on the left to get started</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/30">
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>Select task → Upload image → Get results</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-4 gap-3">
        {[
          { label: 'Vision Tasks', value: '5', icon: Target, color: 'from-blue-500 to-cyan-500' },
          { label: 'OCR Engines', value: '2', icon: FileText, color: 'from-pink-500 to-rose-500' },
          { label: 'Local Processing', value: '100%', icon: Shield, color: 'from-emerald-500 to-teal-500' },
          { label: 'API Required', value: 'None', icon: Zap, color: 'from-violet-500 to-purple-500' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
