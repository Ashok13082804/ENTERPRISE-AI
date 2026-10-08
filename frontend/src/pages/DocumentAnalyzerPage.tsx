import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  Filter,
  Search,
  Eye,
  ChevronDown,
  ChevronRight,
  Layers,
  BarChart3,
  Cpu,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  FileSpreadsheet,
  Image as ImageIcon,
  Activity,
  Terminal,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { analyzerApi, AnalysisResponse, SampleFile, CatalogModule } from '../services/analyzerApi';

const CHART_COLORS = ['#00f0ff', '#7000ff', '#ff007a', '#10b981', '#f59e0b', '#3b82f6'];

interface DocumentAnalyzerPageProps {
  setCurrentTab?: (tab: string) => void;
}

export const DocumentAnalyzerPage: React.FC<DocumentAnalyzerPageProps> = ({ setCurrentTab }) => {
  const [samples, setSamples] = useState<SampleFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mode & manual selection
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [allCatalogModules, setAllCatalogModules] = useState<CatalogModule[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Result display state
  const [activeResultTab, setActiveResultTab] = useState<'report' | 'modules' | 'visuals' | 'profile' | 'logs'>('report');
  const [moduleFilter, setModuleFilter] = useState<'all' | 'completed' | 'skipped'>('completed');
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const PIPELINE_STEPS = [
    { title: 'Upload & Validation', desc: 'MIME detection and integrity check' },
    { title: 'Content Extraction', desc: 'Multi-format parser & OCR layout' },
    { title: 'Input Profiling', desc: 'Type, language, complexity, and tokens' },
    { title: 'Module Selection', desc: 'Matching input profile against 450+ catalog' },
    { title: 'Parallel Execution', desc: 'Real algorithms with error boundary' },
    { title: 'AI Report Synthesis', desc: '18-section report & multi-format export' }
  ];

  useEffect(() => {
    // Load preset sample files
    analyzerApi.getSampleFiles().then(setSamples).catch(() => {});
    // Load catalog modules for manual selection
    analyzerApi.listModules().then(res => setAllCatalogModules(res.modules)).catch(() => {});
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startAnalysisProgressAnimation = () => {
    setAnalysisProgressStep(0);
    const interval = setInterval(() => {
      setAnalysisProgressStep(prev => {
        if (prev < 5) return prev + 1;
        clearInterval(interval);
        return 5;
      });
    }, 700);
    return interval;
  };

  const runAnalysisWithCustomFile = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    const progressTimer = startAnalysisProgressAnimation();

    try {
      const res = await analyzerApi.analyzeDocument(
        selectedFile,
        mode,
        mode === 'manual' ? selectedModuleIds : undefined
      );
      clearInterval(progressTimer);
      setAnalysisProgressStep(5);
      setAnalysisResult(res);
    } catch (err: any) {
      clearInterval(progressTimer);
      setErrorMessage(err.message || 'Analysis pipeline failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAnalysisWithSample = async (sampleId: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    const progressTimer = startAnalysisProgressAnimation();

    try {
      const res = await analyzerApi.analyzeSample(sampleId);
      clearInterval(progressTimer);
      setAnalysisProgressStep(5);
      setAnalysisResult(res);
    } catch (err: any) {
      clearInterval(progressTimer);
      setErrorMessage(err.message || 'Sample analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleModuleSelection = (id: string) => {
    setSelectedModuleIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter modules in results tab
  const filteredModuleResults = analysisResult
    ? analysisResult.module_results.filter(m => {
        const matchesSearch =
          m.module_id.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
          m.module_name.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
          m.category.toLowerCase().includes(moduleSearchQuery.toLowerCase());
        return matchesSearch;
      })
    : [];

  const filteredSkippedModules = analysisResult
    ? analysisResult.skipped_modules.filter(m => {
        const matchesSearch =
          m.module_id.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
          m.module_name.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
          m.category.toLowerCase().includes(moduleSearchQuery.toLowerCase());
        return matchesSearch;
      })
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-cyan-950/40 p-8 border border-cyan-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            450+ Deep Learning Modules Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI-Powered <span className="cyber-gradient-text">Document Analysis Platform</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload any document, image, or tabular dataset. The platform automatically extracts contents, profiles structure and language, dynamically selects applicable modules out of the 450+ catalog, and generates an authentic 18-section executive report with interactive charts and multi-format exports.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-dark-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Catalog Modules</div>
              <div className="text-xl font-bold text-cyan-400">450+ Total</div>
            </div>
            <div className="bg-dark-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Selection Mode</div>
              <div className="text-xl font-bold text-purple-400">Dynamic Filtering</div>
            </div>
            <div className="bg-dark-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 uppercase tracking-wider">AI Report</div>
              <div className="text-xl font-bold text-pink-400">18 Real Sections</div>
            </div>
            <div className="bg-dark-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Export Formats</div>
              <div className="text-xl font-bold text-emerald-400">PDF, DOCX, CSV...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset 1-Click Sample Benchmarks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Quick Benchmark Presets (One-Click Testing)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {samples.map(s => (
            <button
              key={s.id}
              onClick={() => runAnalysisWithSample(s.id)}
              disabled={isAnalyzing}
              className="group text-left p-3.5 rounded-xl bg-dark-900/80 hover:bg-dark-850 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                    {s.file_type}
                  </span>
                  <span className="text-[11px] text-slate-400">{s.category}</span>
                </div>
                <div className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {s.name}
                </div>
                <div className="text-xs text-slate-400 line-clamp-2">
                  {s.description}
                </div>
              </div>
              <div className="mt-3 text-xs font-semibold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Run Analysis <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Upload & Mode Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag & Drop Area */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-950/10'
                : 'border-slate-800 bg-dark-900/60 hover:border-cyan-500/40 hover:bg-dark-900'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="font-bold text-emerald-400 text-base flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Ready to Analyze: {selectedFile.name}
                </div>
                <p className="text-xs text-slate-400">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB | Click or drop another file to replace
                </p>
              </div>
            ) : (
              <div className="space-y-1 max-w-sm">
                <div className="font-bold text-slate-200 text-base">
                  Drag & Drop Document, Image, or Dataset
                </div>
                <p className="text-xs text-slate-400">
                  Supports PDF, DOCX, TXT, CSV, XLSX, PPTX, JSON, XML, JPG, PNG, TIFF, WebP, Scans, ZIP
                </p>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {mode === 'auto'
                ? '⚡ System will automatically profile input and activate applicable modules.'
                : `🛠️ Manual Mode: ${selectedModuleIds.length} modules selected.`}
            </div>
            <button
              onClick={runAnalysisWithCustomFile}
              disabled={!selectedFile || isAnalyzing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing 450+ Engine...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Execute Deep Learning Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mode Selector Card */}
        <div className="bg-dark-900/80 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              Module Execution Mode
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('auto')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === 'auto'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'bg-dark-800 text-slate-300 hover:bg-dark-750'
                }`}
              >
                Auto Analysis (Default)
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === 'manual'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'bg-dark-800 text-slate-300 hover:bg-dark-750'
                }`}
              >
                Manual Selection
              </button>
            </div>

            {mode === 'auto' ? (
              <div className="text-xs text-slate-400 leading-relaxed bg-dark-850 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Intelligent Module Selection Active
                </div>
                <p>
                  Irrelevant modules will be skipped cleanly. Only applicable domain modules (e.g. CV for images, NLP for text, Tabular for CSV) will execute.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Filter 450+ modules..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-dark-850 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {allCatalogModules
                    .filter(m =>
                      m.module_name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      m.category.toLowerCase().includes(catalogSearch.toLowerCase())
                    )
                    .slice(0, 30)
                    .map(m => (
                      <label
                        key={m.module_id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-dark-800 text-xs text-slate-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedModuleIds.includes(m.module_id)}
                          onChange={() => toggleModuleSelection(m.module_id)}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span className="font-mono text-[10px] text-cyan-400">{m.module_id}</span>
                        <span className="truncate">{m.module_name}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500">
            Runs 100% offline & locally with PyTorch, OpenCV, NLTK & Scikit-learn backbones.
          </div>
        </div>
      </div>

      {/* Progress Timeline Animation during analysis */}
      {isAnalyzing && (
        <div className="bg-dark-900 rounded-2xl p-6 border border-cyan-500/30 shadow-2xl space-y-5 animate-pulse">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
              Executing Intelligent Processing Pipeline...
            </h3>
            <span className="text-xs font-mono text-cyan-400">Step {analysisProgressStep + 1} of 6</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {PIPELINE_STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center transition-all ${
                  idx <= analysisProgressStep
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-dark-950 text-slate-600'
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1">
                  Step 0{idx + 1}
                </div>
                <div className="text-xs font-bold">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <div className="text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Analysis Results & Dynamic Report View */}
      {analysisResult && (
        <div className="space-y-6 pt-4">
          {/* Executive Overview Header Card */}
          <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 rounded-2xl p-6 border border-cyan-500/30 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold uppercase">
                    {analysisResult.input_profile.file_type}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {analysisResult.report.title}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Generated at {analysisResult.report.generated_at} | Classification: <strong className="text-slate-200">{analysisResult.input_profile.document_type}</strong>
                </p>
              </div>

              {/* Multi-Format Export Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Export:
                </span>
                <a
                  href={`http://127.0.0.1:8000${analysisResult.exports.pdf}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30 transition-all"
                >
                  PDF
                </a>
                <a
                  href={`http://127.0.0.1:8000${analysisResult.exports.docx}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold border border-blue-500/30 transition-all"
                >
                  DOCX
                </a>
                <a
                  href={`http://127.0.0.1:8000${analysisResult.exports.html}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-all"
                >
                  HTML
                </a>
                <a
                  href={`http://127.0.0.1:8000${analysisResult.exports.json}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/30 transition-all"
                >
                  JSON
                </a>
                <a
                  href={`http://127.0.0.1:8000${analysisResult.exports.csv}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all"
                >
                  CSV
                </a>
                <a
                  href={`http://127.0.0.1:8000${analysisResult.exports.txt}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-600 transition-all"
                >
                  TXT
                </a>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div className="bg-dark-950/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Total Catalog</div>
                <div className="text-xl font-bold text-white">450+ Modules</div>
              </div>
              <div className="bg-dark-950/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Applicable Selected</div>
                <div className="text-xl font-bold text-cyan-400">{analysisResult.report.metadata.applicable_modules_count}</div>
              </div>
              <div className="bg-dark-950/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Completed</div>
                <div className="text-xl font-bold text-emerald-400">{analysisResult.completed_modules}</div>
              </div>
              <div className="bg-dark-950/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Skipped (Irrelevant)</div>
                <div className="text-xl font-bold text-slate-500">{analysisResult.skipped_modules.length}</div>
              </div>
              <div className="bg-dark-950/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Confidence</div>
                <div className="text-xl font-bold text-purple-400">
                  {Math.round(analysisResult.report.metadata.overall_confidence * 100)}%
                </div>
              </div>
              <div className="bg-dark-950/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Total Latency</div>
                <div className="text-xl font-bold text-pink-400">{analysisResult.report.metadata.total_execution_time}s</div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveResultTab('report')}
              className={`pb-3 transition-colors border-b-2 ${
                activeResultTab === 'report'
                  ? 'border-cyan-400 text-cyan-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              18-Section Dynamic Report
            </button>
            <button
              onClick={() => setActiveResultTab('modules')}
              className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeResultTab === 'modules'
                  ? 'border-cyan-400 text-cyan-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Module-Wise Results
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-dark-800 text-slate-300">
                {analysisResult.module_results.length}
              </span>
            </button>
            <button
              onClick={() => setActiveResultTab('visuals')}
              className={`pb-3 transition-colors border-b-2 ${
                activeResultTab === 'visuals'
                  ? 'border-cyan-400 text-cyan-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Dynamic Visualizations
            </button>
            <button
              onClick={() => setActiveResultTab('profile')}
              className={`pb-3 transition-colors border-b-2 ${
                activeResultTab === 'profile'
                  ? 'border-cyan-400 text-cyan-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Input Profiler Data
            </button>
            <button
              onClick={() => setActiveResultTab('logs')}
              className={`pb-3 transition-colors border-b-2 ${
                activeResultTab === 'logs'
                  ? 'border-cyan-400 text-cyan-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Pipeline Logs
            </button>
          </div>

          {/* Tab 1: 18-Section AI Report */}
          {activeResultTab === 'report' && (
            <div className="space-y-4">
              {analysisResult.report.sections.map((sec, idx) => (
                <div key={idx} className="bg-dark-900 rounded-xl p-5 border border-slate-800 space-y-3">
                  <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
                    {sec.title}
                  </h3>
                  <div className="text-sm text-slate-300 leading-relaxed">
                    {typeof sec.content === 'string' ? (
                      <p>{sec.content}</p>
                    ) : Array.isArray(sec.content) ? (
                      sec.content.length > 0 && typeof sec.content[0] === 'object' ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-dark-950 text-slate-400 uppercase">
                              <tr>
                                <th className="p-2.5">ID</th>
                                <th className="p-2.5">Module Name</th>
                                <th className="p-2.5">Category</th>
                                <th className="p-2.5">Confidence</th>
                                <th className="p-2.5">Summary</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {sec.content.map((item: any, i: number) => (
                                <tr key={i} className="hover:bg-dark-850">
                                  <td className="p-2.5 font-mono text-cyan-400">{item.id}</td>
                                  <td className="p-2.5 font-semibold text-slate-200">{item.name}</td>
                                  <td className="p-2.5 text-slate-400">{item.category}</td>
                                  <td className="p-2.5">
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">
                                      {item.confidence}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-300">{item.summary}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <ul className="list-disc pl-5 space-y-1 text-slate-300">
                          {sec.content.map((item: any, i: number) => (
                            <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                          ))}
                        </ul>
                      )
                    ) : typeof sec.content === 'object' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-dark-950 p-4 rounded-lg border border-slate-850">
                        {Object.entries(sec.content).map(([k, v]) => (
                          <div key={k} className="text-xs">
                            <span className="text-slate-400 font-semibold">{k}:</span>{' '}
                            <span className="text-slate-200 font-mono">
                              {Array.isArray(v) ? v.join(', ') : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Module-Wise Results & Skipped Modules */}
          {activeResultTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-dark-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModuleFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      moduleFilter === 'completed'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-dark-800 text-slate-300'
                    }`}
                  >
                    Completed ({analysisResult.completed_modules})
                  </button>
                  <button
                    onClick={() => setModuleFilter('skipped')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      moduleFilter === 'skipped'
                        ? 'bg-slate-700 text-white'
                        : 'bg-dark-800 text-slate-400'
                    }`}
                  >
                    Skipped / Irrelevant ({analysisResult.skipped_modules.length})
                  </button>
                  <button
                    onClick={() => setModuleFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      moduleFilter === 'all'
                        ? 'bg-cyan-500 text-black'
                        : 'bg-dark-800 text-slate-300'
                    }`}
                  >
                    All Evaluated ({analysisResult.module_results.length + analysisResult.skipped_modules.length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search module results..."
                    value={moduleSearchQuery}
                    onChange={e => setModuleSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-dark-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Module Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(moduleFilter === 'completed' || moduleFilter === 'all') &&
                  filteredModuleResults.map(m => {
                    const isExpanded = expandedModuleId === m.module_id;
                    return (
                      <div
                        key={m.module_id}
                        className="bg-dark-900 rounded-xl p-4 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                                {m.module_id}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">{m.category}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">{m.module_name}</h4>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {Math.round(m.confidence * 100)}%
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{m.explanation}</p>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                          <span>Runtime: {m.execution_time}s</span>
                          <button
                            onClick={() => setExpandedModuleId(isExpanded ? null : m.module_id)}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                          >
                            {isExpanded ? 'Hide Raw JSON' : 'Inspect Details'}
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="bg-dark-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-48">
                            <pre>{JSON.stringify(m.result, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {(moduleFilter === 'skipped' || moduleFilter === 'all') &&
                  filteredSkippedModules.map(m => (
                    <div
                      key={m.module_id}
                      className="bg-dark-900/50 rounded-xl p-4 border border-slate-850 opacity-75 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                            {m.module_id}
                          </span>
                          <span className="text-xs text-slate-500">{m.category}</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                          Skipped
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-300">{m.module_name}</h4>
                      <p className="text-xs text-slate-400 italic">{m.reason}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tab 3: Dynamic Visualizations */}
          {activeResultTab === 'visuals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisResult.module_results
                .filter(m => m.visualization && m.visualization.data && m.visualization.data.length > 0)
                .map((m, idx) => (
                  <div key={idx} className="bg-dark-900 rounded-xl p-5 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{m.visualization?.title}</h4>
                      <span className="text-[10px] font-mono text-cyan-400">{m.module_id}</span>
                    </div>

                    <div className="h-64 w-full">
                      {m.visualization?.type === 'bar' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={m.visualization.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0d1525', borderColor: '#1e293b' }}
                            />
                            <Bar dataKey="value" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      {m.visualization?.type === 'pie' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={m.visualization.data}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {m.visualization.data.map((_, i) => (
                                <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0d1525', borderColor: '#1e293b' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}

                      {m.visualization?.type === 'radar' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={m.visualization.data}>
                            <PolarGrid stroke="#1e293b" />
                            <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={11} />
                            <PolarRadiusAxis stroke="#64748b" fontSize={10} />
                            <Radar
                              name="Indicator"
                              dataKey="value"
                              stroke="#7000ff"
                              fill="#7000ff"
                              fillOpacity={0.5}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0d1525', borderColor: '#1e293b' }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      )}

                      {m.visualization?.type === 'line' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={m.visualization.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="step" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0d1525', borderColor: '#1e293b' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#ff007a"
                              strokeWidth={2}
                              dot={{ fill: '#ff007a' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Tab 4: Input Profiler Data */}
          {activeResultTab === 'profile' && (
            <div className="bg-dark-900 rounded-xl p-6 border border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Deep Input Profiler Characteristics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-dark-950 p-4 rounded-xl border border-slate-850 space-y-2">
                  <div className="text-xs text-slate-400">Detected Document Type</div>
                  <div className="text-lg font-bold text-cyan-300">
                    {analysisResult.input_profile.document_type}
                  </div>
                  <div className="text-xs text-slate-500">
                    Confidence: High | Mode: Deterministic
                  </div>
                </div>
                <div className="bg-dark-950 p-4 rounded-xl border border-slate-850 space-y-2">
                  <div className="text-xs text-slate-400">Estimated Complexity</div>
                  <div className="text-lg font-bold text-purple-300 uppercase">
                    {analysisResult.input_profile.estimated_complexity}
                  </div>
                  <div className="text-xs text-slate-500">
                    Word Count: {analysisResult.input_profile.word_count}
                  </div>
                </div>
                <div className="bg-dark-950 p-4 rounded-xl border border-slate-850 space-y-2">
                  <div className="text-xs text-slate-400">Vocabulary Richness</div>
                  <div className="text-lg font-bold text-pink-300">
                    {analysisResult.input_profile.vocabulary_richness}
                  </div>
                  <div className="text-xs text-slate-500">
                    Language: {analysisResult.input_profile.language}
                  </div>
                </div>
              </div>

              <div className="bg-dark-950 p-4 rounded-xl border border-slate-850">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Full Input Profile JSON
                </div>
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-72">
                  {JSON.stringify(analysisResult.input_profile, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 5: Pipeline Logs */}
          {activeResultTab === 'logs' && (
            <div className="bg-dark-950 rounded-xl p-5 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-850 pb-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Pipeline Execution Telemetry Trace
              </div>
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {analysisResult.logs.map((l, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-slate-600 shrink-0">[{l.time}]</span>
                    <span
                      className={`font-bold shrink-0 ${
                        l.level === 'SUCCESS'
                          ? 'text-emerald-400'
                          : l.level === 'ERROR'
                          ? 'text-red-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {l.level}
                    </span>
                    <span className="text-slate-300">{l.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentAnalyzerPage;

