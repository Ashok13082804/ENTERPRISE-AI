import React, { useRef, useState } from 'react';
import {
  LayoutGrid, Upload, Trash2, Plus, Download, Edit3,
  Sliders, Palette, Check, RefreshCw
} from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { COLLAGE_LAYOUTS } from '@/data/imageStudioPresets';
import { ImageStudioService } from '@/services/imageStudioService';
import toast from 'react-hot-toast';

export const CollagePanel: React.FC = () => {
  const {
    collageSettings, setCollageSettings,
    isCollaging, setIsCollaging,
    addLayer, setMode
  } = useImageStudioStore();

  const [previewCollageUrl, setPreviewCollageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample default images if empty
  const defaultImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
  ];

  const currentImages = collageSettings.images.length > 0
    ? collageSettings.images
    : defaultImages.map((url, i) => ({ id: `img_${i}`, url }));

  // Multiple files upload
  const handleMultipleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setCollageSettings({
          images: [...collageSettings.images, { id: `up_${Date.now()}_${Math.random()}`, url }]
        });
      };
      reader.readAsDataURL(file);
    });
    toast.success(`Uploaded ${files.length} image(s)`);
    e.target.value = '';
  };

  // Generate / Render Collage
  const handleBuildCollage = async () => {
    setIsCollaging(true);
    toast.loading('Composing multi-photo collage...', { id: 'col-toast' });
    try {
      const url = await ImageStudioService.createCollage({
        ...collageSettings,
        images: currentImages
      });
      setPreviewCollageUrl(url);
      toast.dismiss('col-toast');
      toast.success('Collage assembled successfully!');
    } catch (e) {
      toast.dismiss('col-toast');
      toast.error('Failed to compose collage');
    } finally {
      setIsCollaging(false);
    }
  };

  // Send to main canvas
  const handleSendToEditor = () => {
    const url = previewCollageUrl || currentImages[0]?.url;
    if (!url) return;
    addLayer({
      name: `${collageSettings.layout} Collage`,
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: collageSettings.canvasWidth,
      height: collageSettings.canvasHeight,
      rotation: 0,
      src: url
    });
    setMode('edit');
    toast.success('Sent collage to Canvas Editor!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMultipleUpload}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md p-5 rounded-2xl border border-border/70 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            Collage Studio & Composition Builder
          </h2>
          <p className="text-xs text-muted-foreground">
            Arrange multiple images into balanced grids, polaroids, mosaics, or magazine layouts with customizable spacing and rounded borders.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Multiple Images</span>
        </button>
      </div>

      {/* Grid: Layouts & Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Layouts & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Layout Selector */}
          <div className="bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/70 shadow-lg space-y-3">
            <span className="font-bold text-xs text-foreground uppercase tracking-wider block">
              Grid Templates ({COLLAGE_LAYOUTS.length})
            </span>
            <div className="grid grid-cols-3 gap-2">
              {COLLAGE_LAYOUTS.map((lay) => {
                const isActive = collageSettings.layout === lay.id;
                return (
                  <button
                    key={lay.id}
                    onClick={() => setCollageSettings({ layout: lay.id as any })}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500 text-foreground font-bold shadow-md shadow-amber-500/10 scale-[1.02]'
                        : 'bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span className="text-xs font-semibold">{lay.name}</span>
                    <span className="text-[10px] text-muted-foreground">{lay.count} slots</span>
                  </button>
                );
              })}
            </div>

            {/* Sliders: Spacing, Padding, Radius */}
            <div className="space-y-3 pt-3 border-t border-border/50 text-xs">
              <div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Image Gap Spacing</span>
                  <span>{collageSettings.spacing}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={collageSettings.spacing}
                  onChange={(e) => setCollageSettings({ spacing: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Outer Canvas Padding</span>
                  <span>{collageSettings.padding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={collageSettings.padding}
                  onChange={(e) => setCollageSettings({ padding: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Corner Radius</span>
                  <span>{collageSettings.cornerRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={collageSettings.cornerRadius}
                  onChange={(e) => setCollageSettings({ cornerRadius: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Background Color Swatches */}
            <div className="pt-2 border-t border-border/50">
              <label className="text-xs text-muted-foreground block mb-1.5">Canvas Backdrop</label>
              <div className="flex gap-2 flex-wrap">
                {['#0f172a', '#000000', '#1e293b', '#ffffff', '#f8fafc', '#ffe4e6', '#e0e7ff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCollageSettings({ backgroundColor: c })}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-lg border shadow-sm ${
                      collageSettings.backgroundColor === c ? 'ring-2 ring-amber-400' : 'border-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Assemble Button */}
            <button
              onClick={handleBuildCollage}
              disabled={isCollaging}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {isCollaging ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Composing Collage...</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  <span>Generate Composed Collage</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Collage Preview & Image Pool (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/70 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                Live Collage Preview ({currentImages.length} images)
              </span>
              {previewCollageUrl && (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> High-Res Ready
                </span>
              )}
            </div>

            {/* Rendered Viewport */}
            <div
              style={{
                backgroundColor: collageSettings.backgroundColor,
                padding: `${collageSettings.padding}px`
              }}
              className="aspect-square w-full rounded-xl overflow-hidden shadow-2xl transition-all relative flex items-center justify-center border border-border/60"
            >
              {previewCollageUrl ? (
                <img
                  src={previewCollageUrl}
                  alt="Collage Result"
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Dynamic HTML Grid Preview */
                <div
                  style={{ gap: `${collageSettings.spacing}px` }}
                  className={`w-full h-full grid ${
                    collageSettings.layout === 'grid_2'
                      ? 'grid-cols-2'
                      : collageSettings.layout === 'grid_6'
                      ? 'grid-cols-3 grid-rows-2'
                      : collageSettings.layout === 'grid_9'
                      ? 'grid-cols-3 grid-rows-3'
                      : 'grid-cols-2 grid-rows-2'
                  }`}
                >
                  {currentImages.slice(0, 6).map((img, i) => (
                    <div
                      key={img.id || i}
                      style={{ borderRadius: `${collageSettings.cornerRadius}px` }}
                      className="overflow-hidden relative bg-black/40 border border-white/10 group"
                    >
                      <img
                        src={img.url}
                        alt={`Tile ${i}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions for Collage */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSendToEditor}
                className="py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/20"
              >
                <Edit3 className="w-4 h-4" />
                <span>Open in Canvas Editor</span>
              </button>
              <a
                href={previewCollageUrl || currentImages[0]?.url}
                download="collage_composition.png"
                className="py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs flex items-center justify-center gap-1.5 border border-border"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Collage</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
