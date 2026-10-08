import React, { useState, useEffect } from 'react';
import {
  History, Sparkles, Copy, Download, Edit3, Trash2, Calendar,
  RotateCcw, Check, LayoutGrid
} from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { ImageStudioService } from '@/services/imageStudioService';
import { GenerationResult } from '@/types/imageStudio';
import toast from 'react-hot-toast';

export const HistoryPanel: React.FC = () => {
  const {
    addLayer, setMode, setCollageSettings, collageSettings,
    historyStack, undo
  } = useImageStudioStore();

  const [historyItems, setHistoryItems] = useState<GenerationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'generation' | 'canvas'>('generation');

  useEffect(() => {
    const items = ImageStudioService.getGenerationHistory();
    setHistoryItems(items);
  }, []);

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  const handleSendToEditor = (item: GenerationResult) => {
    addLayer({
      name: `${item.style} History`,
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: item.width,
      height: item.height,
      rotation: 0,
      src: item.url
    });
    setMode('edit');
    toast.success('Loaded into Canvas Studio!');
  };

  const handleClearHistory = () => {
    localStorage.removeItem('enterprise_ai_studio_history');
    setHistoryItems([]);
    toast.success('Generation history cleared');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md p-5 rounded-2xl border border-border/70 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            Generation & Canvas History
          </h2>
          <p className="text-xs text-muted-foreground">
            Review past generated artworks, retrieve prompts, or revert recent canvas operations.
          </p>
        </div>

        {/* Tab & Clear Actions */}
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary/60 p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setActiveTab('generation')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'generation' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Generations ({historyItems.length})
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'canvas' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Canvas Steps ({historyStack.length})
            </button>
          </div>

          {activeTab === 'generation' && historyItems.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-secondary/60 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 border border-border/60 transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Generation History Tab */}
      {activeTab === 'generation' && (
        <div className="space-y-4">
          {historyItems.length === 0 ? (
            <div className="text-center py-16 bg-card/40 rounded-2xl border border-dashed border-border/70 space-y-2">
              <Sparkles className="w-10 h-10 text-purple-400/50 mx-auto" />
              <h3 className="font-bold text-sm text-foreground">No generation history yet</h3>
              <p className="text-xs text-muted-foreground">Generate some images in the studio to populate this history log.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-card/85 rounded-2xl border border-border/80 overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="aspect-square w-full bg-secondary relative overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                      {item.style}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-foreground font-medium line-clamp-2">
                      "{item.prompt}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{item.category}</span>
                      <span>{item.aspectRatio}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                      <button
                        onClick={() => handleSendToEditor(item)}
                        className="py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleCopyPrompt(item.prompt)}
                        className="py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs flex items-center justify-center gap-1 border border-border"
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        <span>Prompt</span>
                      </button>
                      <a
                        href={item.url}
                        download={`history_${item.id}.png`}
                        className="py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs flex items-center justify-center gap-1 border border-border"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Save</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Canvas Steps Tab */}
      {activeTab === 'canvas' && (
        <div className="space-y-4">
          {historyStack.length === 0 ? (
            <div className="text-center py-16 bg-card/40 rounded-2xl border border-dashed border-border/70 space-y-2">
              <RotateCcw className="w-10 h-10 text-purple-400/50 mx-auto" />
              <h3 className="font-bold text-sm text-foreground">No canvas edit operations recorded</h3>
              <p className="text-xs text-muted-foreground">Modify layers, shapes, or doodles in the Canvas to record undoable steps.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historyStack.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center font-mono font-bold text-purple-400 text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-foreground">
                      Snapshot: {step.length} layer(s) active
                    </span>
                  </div>
                  <button
                    onClick={undo}
                    className="px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold flex items-center gap-1 border border-border"
                  >
                    <RotateCcw className="w-3 h-3 text-purple-400" />
                    <span>Undo to here</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
