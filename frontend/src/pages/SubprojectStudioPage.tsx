import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Download, Copy, Check, Terminal, Play, FolderArchive, Sparkles,
  FileCode, Layers, ShieldCheck, Cpu, Database, Server, RefreshCw,
  Search, ExternalLink, ChevronRight, BookOpen, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzerApi, CatalogModule } from '@/services/analyzerApi';

export default function SubprojectStudioPage() {
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [filteredModules, setFilteredModules] = useState<CatalogModule[]>([]);
  const [selectedProjectNumber, setSelectedProjectNumber] = useState<number>(1);
  const [selectedModule, setSelectedModule] = useState<CatalogModule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [exportingZip, setExportingZip] = useState<boolean>(false);

  // Search & Category
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Preview code data
  const [previewFiles, setPreviewFiles] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>('src/model.py');
  const [copiedCode, setCopiedCode] = useState(false);

  // Master Prompt Modal
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [masterPrompt, setMasterPrompt] = useState<string>('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Categories list
  const categories = [
    'All',
    'Computer Vision — CNN',
    'Object Detection — YOLO',
    'Medical Deep Learning',
    'NLP + LSTM/GRU',
    'Transformers / BERT',
    'Speech + Audio Deep Learning',
    'Time-Series Deep Learning',
    'Cybersecurity + Deep Learning',
    'Agriculture + Deep Learning',
    'Education + Deep Learning',
    'Finance + Deep Learning',
    'GAN Projects',
    'Autoencoder Projects',
    'U-Net / Segmentation',
    'Robotics + Deep Learning',
    'Multimodal Deep Learning',
    'Video Deep Learning'
  ];

  // Load modules catalog on mount
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const res = await analyzerApi.listModules();
      setModules(res.modules);
      setFilteredModules(res.modules);
      if (res.modules.length > 0) {
        const first = res.modules[0];
        const num = first.project_number || 1;
        setSelectedProjectNumber(num);
        setSelectedModule(first);
        loadSubprojectPreview(num);
      }
    } catch (e: any) {
      toast.error('Failed to load project catalog: ' + (e.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Filter modules
  useEffect(() => {
    let list = [...modules];
    if (selectedCategory !== 'All') {
      list = list.filter((m) => m.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.module_id.toLowerCase().includes(q) ||
          m.module_name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          String(m.project_number).includes(q)
      );
    }
    setFilteredModules(list);
  }, [search, selectedCategory, modules]);

  // Load code preview for a project
  const loadSubprojectPreview = async (projectNum: number) => {
    try {
      setLoadingPreview(true);
      const res = await analyzerApi.previewSubproject(projectNum);
      setPreviewFiles(res.files || {});
      const files = Object.keys(res.files || {});
      if (files.length > 0 && !files.includes(activeTab)) {
        setActiveTab(files[0]);
      }
    } catch (e: any) {
      toast.error('Failed to preview code: ' + (e.message || ''));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSelectProject = (mod: CatalogModule) => {
    const num = mod.project_number || 1;
    setSelectedProjectNumber(num);
    setSelectedModule(mod);
    loadSubprojectPreview(num);
  };

  // Download standalone ZIP bundle
  const handleDownloadZip = async () => {
    try {
      setExportingZip(true);
      toast.loading(`Bundling Subproject #${selectedProjectNumber}...`, { id: 'zip-export' });
      const res = await analyzerApi.exportSubproject(selectedProjectNumber);
      toast.success(`Subproject #${selectedProjectNumber} bundled successfully!`, { id: 'zip-export' });

      // Trigger direct download
      const link = document.createElement('a');
      link.href = res.download_url;
      link.download = res.zip_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      toast.error('Failed to export ZIP bundle: ' + (e.message || ''), { id: 'zip-export' });
    } finally {
      setExportingZip(false);
    }
  };

  // Copy active code tab
  const handleCopyCode = () => {
    const code = previewFiles[activeTab] || '';
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(`Copied ${activeTab} to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Open Master Prompt Modal
  const handleOpenMasterPrompt = async () => {
    setShowPromptModal(true);
    if (!masterPrompt) {
      try {
        setLoadingPrompt(true);
        const res = await analyzerApi.getMasterPrompt();
        setMasterPrompt(res.prompt);
      } catch (e: any) {
        toast.error('Failed to fetch prompt: ' + (e.message || ''));
      } finally {
        setLoadingPrompt(false);
      }
    }
  };

  const handleCopyMasterPrompt = () => {
    if (!masterPrompt) return;
    navigator.clipboard.writeText(masterPrompt);
    setCopiedPrompt(true);
    toast.success('Master Subproject Prompt copied to clipboard!');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-purple px-3 py-1 font-semibold uppercase tracking-wider text-xs">
                Approach 2: Standalone Subproject Studio
              </span>
              <span className="badge badge-info px-2.5 py-0.5 text-xs">
                450 Deep Learning Projects
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">
              Deep Learning Subproject Studio & Code Exporter
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Export any of the 450 deep learning projects as an independent, production-grade microservice complete with
              neural backbone models, PyTorch dataloaders, training pipelines, FastAPI microservices, and Dockerfiles.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleOpenMasterPrompt}
              className="btn-secondary flex items-center gap-2 text-sm shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Master Integration Prompt
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={exportingZip || loading}
              className="btn-primary flex items-center gap-2 text-sm shadow-md"
            >
              {exportingZip ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FolderArchive className="w-4 h-4" />
              )}
              Download Subproject #{selectedProjectNumber} ZIP
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              450
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Ready Projects</div>
              <div className="text-sm font-semibold text-foreground">100% Exportable</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Domains</div>
              <div className="text-sm font-semibold text-foreground">17 Curated Fields</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Local AI Engine</div>
              <div className="text-sm font-semibold text-foreground">Zero API Keys</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Architecture</div>
              <div className="text-sm font-semibold text-foreground">Docker + FastAPI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Catalog Explorer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Select Project (#1 to #450)
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                {filteredModules.length} found
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name, or algorithm..."
                className="enterprise-input pl-9 text-xs"
              />
            </div>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="enterprise-input text-xs py-2"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-background text-foreground">
                  {c}
                </option>
              ))}
            </select>

            {/* Project List */}
            <div className="max-h-[580px] overflow-y-auto space-y-2 pr-1 pt-1">
              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                  Loading 450+ catalog...
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No projects match your filter.
                </div>
              ) : (
                filteredModules.map((m) => {
                  const num = m.project_number || 1;
                  const isSelected = selectedProjectNumber === num;
                  return (
                    <div
                      key={m.module_id}
                      onClick={() => handleSelectProject(m)}
                      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500/50 shadow-md'
                          : 'bg-white/5 dark:bg-white/5 hover:bg-white/10 border-border/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-400">
                          {m.module_id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground font-medium">
                          #{num}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-foreground line-clamp-1">
                        {m.module_name}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                        {m.category}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Inspector & Files Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedModule && (
            <div className="glass-card p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-purple text-xs font-mono font-bold">
                      {selectedModule.module_id}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedModule.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground mt-1">
                    {selectedModule.module_name}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadZip}
                    disabled={exportingZip}
                    className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    Download ZIP
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedModule.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedModule.algorithms?.map((algo, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono"
                  >
                    {algo}
                  </span>
                ))}
                {selectedModule.datasets?.map((ds, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono"
                  >
                    {ds}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Code Viewer Container */}
          <div className="glass-card overflow-hidden border border-border/80 shadow-xl">
            {/* Tab Bar */}
            <div className="flex items-center justify-between bg-black/20 dark:bg-black/40 border-b border-border/60 px-3 py-2 overflow-x-auto gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {Object.keys(previewFiles).map((fileName) => {
                  const active = activeTab === fileName;
                  return (
                    <button
                      key={fileName}
                      onClick={() => setActiveTab(fileName)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        active
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      {fileName}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pl-2">
                <button
                  onClick={handleCopyCode}
                  className="btn-ghost p-1.5 rounded-md text-xs flex items-center gap-1"
                  title="Copy file contents"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Copy</span>
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[520px] min-h-[380px]">
              {loadingPreview ? (
                <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  <span>Generating subproject architecture files...</span>
                </div>
              ) : previewFiles[activeTab] ? (
                <pre className="leading-relaxed">
                  <code>{previewFiles[activeTab]}</code>
                </pre>
              ) : (
                <div className="py-24 text-center text-slate-500">
                  Select a project to inspect its standalone code.
                </div>
              )}
            </div>

            {/* Microservice Run Instructions */}
            <div className="p-3 bg-indigo-950/30 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-mono">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Run microservice:</span>
                <span className="text-foreground bg-black/30 px-2 py-0.5 rounded border border-white/5">
                  uvicorn app:app --port 800{selectedProjectNumber % 10} --reload
                </span>
              </div>
              <span className="text-emerald-400 font-medium">Standalone & Offline Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Master Subproject Prompt Modal */}
      <AnimatePresence>
        {showPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-4xl w-full max-h-[85vh] flex flex-col border border-indigo-500/30 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border/60 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Master Subproject Integration Prompt
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Copy and paste this into any AI assistant (ChatGPT, Claude, Cursor, Antigravity) to replicate or embed this engine.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMasterPrompt}
                    className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPrompt ? 'Copied!' : 'Copy Entire Prompt'}
                  </button>
                  <button
                    onClick={() => setShowPromptModal(false)}
                    className="btn-ghost p-2 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto flex-1 bg-slate-950 text-slate-200 font-mono text-xs">
                {loadingPrompt ? (
                  <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                    <span>Loading Master Integration Prompt...</span>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {masterPrompt}
                  </pre>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border/60 bg-black/20 flex items-center justify-between text-xs text-muted-foreground">
                <span>Also saved locally at: <code>MASTER_SUBPROJECT_PROMPT.md</code></span>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="btn-secondary text-xs px-4 py-1.5"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
