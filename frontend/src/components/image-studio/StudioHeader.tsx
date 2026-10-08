import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Edit3, Wand2, LayoutGrid, Palette, FolderHeart, History,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download, Save, Keyboard,
  Moon, Sun, ArrowLeft
} from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { StudioMode } from '@/types/imageStudio';
import { ImageStudioService } from '@/services/imageStudioService';
import toast from 'react-hot-toast';

export const StudioHeader: React.FC = () => {
  const navigate = useNavigate();
  const {
    mode, setMode,
    undo, redo, historyStack, redoStack,
    zoom, setZoom, resetCanvasView,
    setExportModalOpen, setShortcutsModalOpen,
    currentProjectName, setCurrentProjectName,
    layers, canvasWidth, canvasHeight, canvasBgColor,
    currentProjectId
  } = useImageStudioStore();

  const handleSaveProject = async () => {
    try {
      const project = {
        id: currentProjectId || `proj_${Date.now()}`,
        name: currentProjectName,
        thumbnail: layers.find(l => l.type === 'image')?.src || '',
        canvas: { width: canvasWidth, height: canvasHeight, backgroundColor: canvasBgColor },
        layers,
        promptHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await ImageStudioService.saveProject(project);
      toast.success('Project saved successfully!');
    } catch (e) {
      toast.error('Failed to save project');
    }
  };

  const navModes: Array<{ id: StudioMode; label: string; icon: any; color: string }> = [
    { id: 'generate', label: 'Generate', icon: Sparkles, color: 'text-violet-400' },
    { id: 'edit', label: 'Edit', icon: Edit3, color: 'text-cyan-400' },
    { id: 'transform', label: 'Transform', icon: Wand2, color: 'text-emerald-400' },
    { id: 'collage', label: 'Collage', icon: LayoutGrid, color: 'text-amber-400' },
    { id: 'styles', label: 'Styles (30 Cats)', icon: Palette, color: 'text-pink-400' },
    { id: 'projects', label: 'Projects', icon: FolderHeart, color: 'text-blue-400' },
    { id: 'history', label: 'History', icon: History, color: 'text-purple-400' },
  ];

  return (
    <header className="h-16 border-b border-border/60 bg-card/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
      {/* Left: Brand & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base leading-tight tracking-tight text-foreground">
                AI Image Studio
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-md">
                PRO 2.0
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Generate • Transform • Edit • Collage • Create
            </p>
          </div>
        </div>
      </div>

      {/* Center: Mode Tabs */}
      <nav className="hidden lg:flex items-center bg-secondary/50 p-1 rounded-xl border border-border/50">
        {navModes.map((item) => {
          const Icon = item.icon;
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-card text-foreground shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-muted-foreground'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Actions, Zoom, Undo/Redo & Export */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-secondary/40 rounded-xl p-0.5 border border-border/40">
          <button
            onClick={undo}
            disabled={historyStack.length === 0}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center bg-secondary/40 rounded-xl p-0.5 border border-border/40 text-xs">
          <button
            onClick={() => setZoom(zoom - 0.15)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom Out (Ctrl -)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span
            onClick={resetCanvasView}
            className="px-2 py-1 cursor-pointer font-mono font-medium text-muted-foreground hover:text-foreground select-none"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.15)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom In (Ctrl +)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard Shortcuts Dialog Trigger */}
        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Save Project */}
        <button
          onClick={handleSaveProject}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/50 text-xs font-medium text-foreground transition-colors"
          title="Save Project (Ctrl+S)"
        >
          <Save className="w-4 h-4 text-indigo-400" />
          <span>Save</span>
        </button>

        {/* Export Button */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-500/20 transition-all hover:scale-[1.02]"
          title="Export Canvas (Ctrl+E)"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
