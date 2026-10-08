import React, { useState } from 'react';
import { X, Download, FileText, Check, Sparkles, RefreshCw } from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { ImageStudioService } from '@/services/imageStudioService';
import toast from 'react-hot-toast';

export const ExportModal: React.FC = () => {
  const {
    exportModalOpen, setExportModalOpen,
    canvasWidth, canvasHeight
  } = useImageStudioStore();

  const [format, setFormat] = useState<'png' | 'jpg' | 'webp' | 'pdf'>('png');
  const [quality, setQuality] = useState<number>(95);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1);
  const [isExporting, setIsExporting] = useState(false);

  if (!exportModalOpen) return null;

  const finalW = canvasWidth * scaleMultiplier;
  const finalH = canvasHeight * scaleMultiplier;

  const handleExport = async () => {
    setIsExporting(true);
    toast.loading(`Rendering ${format.toUpperCase()} export...`, { id: 'export-toast' });

    try {
      // Find canvas in DOM
      const canvasEl = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvasEl) {
        toast.dismiss('export-toast');
        toast.error('Canvas element not found');
        setIsExporting(false);
        return;
      }

      // Render scaled copy if scaleMultiplier > 1
      let exportCanvas = canvasEl;
      if (scaleMultiplier !== 1) {
        const offscreen = document.createElement('canvas');
        offscreen.width = finalW;
        offscreen.height = finalH;
        const offCtx = offscreen.getContext('2d')!;
        offCtx.drawImage(canvasEl, 0, 0, finalW, finalH);
        exportCanvas = offscreen;
      }

      const mimeType = format === 'jpg' ? 'image/jpeg' : (format === 'webp' ? 'image/webp' : 'image/png');
      const b64 = exportCanvas.toDataURL(mimeType, quality / 100);

      const res = await ImageStudioService.exportResult(b64, format, quality);

      // Trigger browser download
      const a = document.createElement('a');
      a.href = res.url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.dismiss('export-toast');
      toast.success(`Exported ${res.filename}!`);
      setExportModalOpen(false);
    } catch (err) {
      toast.dismiss('export-toast');
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-violet-400" />
            <h2 className="font-bold text-base text-foreground">Export Artwork</h2>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            File Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'png', label: 'PNG', desc: 'Lossless' },
              { id: 'jpg', label: 'JPG', desc: 'Compact' },
              { id: 'webp', label: 'WebP', desc: 'Modern' },
              { id: 'pdf', label: 'PDF', desc: 'Print' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormat(fmt.id as any)}
                className={`py-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all ${
                  format === fmt.id
                    ? 'bg-violet-500 text-white border-violet-400 font-bold shadow-md shadow-violet-500/20'
                    : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span className="text-xs font-bold">{fmt.label}</span>
                <span className="text-[9px] opacity-75">{fmt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Scale Multiplier */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Resolution Multiplier
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 1, label: '1x (Standard)', desc: `${canvasWidth}×${canvasHeight}` },
              { val: 2, label: '2x (Crisp HD)', desc: `${canvasWidth * 2}×${canvasHeight * 2}` },
              { val: 4, label: '4x (Ultra HD)', desc: `${canvasWidth * 4}×${canvasHeight * 4}` },
            ].map((sc) => (
              <button
                key={sc.val}
                onClick={() => setScaleMultiplier(sc.val)}
                className={`p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all ${
                  scaleMultiplier === sc.val
                    ? 'bg-indigo-500/15 border-indigo-500 text-foreground font-bold'
                    : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span className="text-xs font-semibold">{sc.label}</span>
                <span className="text-[10px] text-muted-foreground">{sc.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider (for JPG & WebP) */}
        {format !== 'png' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Compression Quality</span>
              <span className="font-bold text-foreground">{quality}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exporting Document...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()} ({finalW} × {finalH} px)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
