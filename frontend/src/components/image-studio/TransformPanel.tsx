import React, { useState, useRef } from 'react';
import {
  Wand2, Upload, Move, Check, Download, Edit3, LayoutGrid,
  RefreshCw, Sparkles, Sliders
} from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { ImageStudioService } from '@/services/imageStudioService';
import toast from 'react-hot-toast';

export const TransformPanel: React.FC = () => {
  const {
    activeTransformation, setActiveTransformation,
    isTransforming, setIsTransforming,
    addLayer, setMode, setCollageSettings, collageSettings
  } = useImageStudioStore();

  const [inputImage, setInputImage] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'
  );
  const [selectedStyle, setSelectedStyle] = useState('watercolor');
  const [strength, setStrength] = useState<number>(0.85);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 20+ Photo-to-Art Styles
  const transformStyles = [
    { id: 'watercolor', label: 'Watercolor Painting', icon: '🎨', desc: 'Soft fluid washes and organic pigment bleeding' },
    { id: 'pencil_sketch', label: 'Pencil Sketch', icon: '✏️', desc: 'Delicate graphite shading and cross-hatching' },
    { id: 'charcoal', label: 'Charcoal Drawing', icon: '🖤', desc: 'Smudged high-contrast dramatic carbon grain' },
    { id: 'oil_painting', label: 'Oil Painting', icon: '🖼️', desc: 'Impasto brushstrokes and rich glossy texture' },
    { id: 'anime', label: 'Anime-style Artwork', icon: '✨', desc: 'Vibrant cell shading and illuminated contours' },
    { id: 'manga', label: 'Manga Monochrome', icon: '📖', desc: 'Halftone dot screens and black inked contours' },
    { id: 'cartoon', label: 'Cartoon Illustration', icon: '🎈', desc: 'Bold ink outlines and saturated flat tones' },
    { id: 'comic', label: 'Comic Art', icon: '💥', desc: 'Golden age halftone dots and action pop' },
    { id: 'pixel_art', label: 'Pixel Art (Retro 16-bit)', icon: '👾', desc: 'Charming pixelated retro console aesthetic' },
    { id: '3d_render', label: '3D Render / Clay', icon: '🧊', desc: 'Smooth studio clay and ambient occlusion bevels' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: '🌆', desc: 'Cyan & magenta duotone with glowing light rim' },
    { id: 'vintage', label: 'Vintage / Sepia', icon: '📜', desc: 'Aged parchment tones, film grain and vignette' },
    { id: 'line_art', label: 'Line Art / Ink', icon: '🖋️', desc: 'Clean vector contours and minimalist strokes' },
    { id: 'pop_art', label: 'Pop Art', icon: '⭐', desc: 'Warhol-inspired vivid multi-tone posterization' },
    { id: 'abstract', label: 'Abstract Artwork', icon: '🌀', desc: 'Surreal color distortion and geometric flow' },
    { id: 'acrylic', label: 'Acrylic Painting', icon: '🖌️', desc: 'Saturated bold strokes and matte surface' },
  ];

  // Handle local image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInputImage(reader.result as string);
      toast.success('Uploaded source photo');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Run Transformation
  const handleTransform = async () => {
    if (!inputImage) {
      toast.error('Please upload or select an image');
      return;
    }
    setIsTransforming(true);
    toast.loading(`Applying ${selectedStyle.replace('_', ' ')} transformation...`, { id: 'tf-toast' });

    try {
      const result = await ImageStudioService.transformImage(inputImage, selectedStyle, strength);
      setActiveTransformation(result);
      toast.dismiss('tf-toast');
      toast.success('Transformation complete!');
    } catch (e) {
      toast.dismiss('tf-toast');
      toast.error('Transformation failed');
    } finally {
      setIsTransforming(false);
    }
  };

  const handleSendToEditor = () => {
    if (!activeTransformation) return;
    addLayer({
      name: `${activeTransformation.style} Transform`,
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      x: 50,
      y: 50,
      width: 800,
      height: 800,
      rotation: 0,
      src: activeTransformation.transformedUrl
    });
    setMode('edit');
    toast.success('Opened in Canvas Editor!');
  };

  const handleAddToCollage = () => {
    if (!activeTransformation) return;
    setCollageSettings({
      images: [
        ...collageSettings.images,
        { id: `tf_orig_${Date.now()}`, url: activeTransformation.originalUrl },
        { id: `tf_trans_${Date.now()}`, url: activeTransformation.transformedUrl }
      ]
    });
    setMode('collage');
    toast.success('Added Before/After pair to Collage Studio!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md p-5 rounded-2xl border border-border/70 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-emerald-400" />
            AI Image-to-Image Transformation Studio
          </h2>
          <p className="text-xs text-muted-foreground">
            Convert any uploaded photograph into 20+ fine-art, anime, or 3D rendering styles while preserving the original subject.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-xs font-semibold text-foreground transition-all hover:scale-105 shrink-0"
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Upload Custom Photo</span>
        </button>
      </div>

      {/* Main Grid: Style Picker & Before/After Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 20+ Styles Grid (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/70 shadow-lg space-y-3">
            <span className="font-bold text-xs text-foreground uppercase tracking-wider block">
              Choose Transformation Style ({transformStyles.length})
            </span>

            <div className="grid grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
              {transformStyles.map((st) => {
                const isActive = selectedStyle === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStyle(st.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500 text-foreground font-bold shadow-md shadow-emerald-500/10 scale-[1.02]'
                        : 'bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{st.icon}</span>
                      <span className="text-xs font-semibold truncate">{st.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      {st.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Strength Slider */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Transformation Intensity</span>
                <span className="font-bold text-foreground">{Math.round(strength * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={strength}
                onChange={(e) => setStrength(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Transform Trigger Button */}
            <button
              onClick={handleTransform}
              disabled={isTransforming}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {isTransforming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Artistic Style...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Transform into {selectedStyle.replace('_', ' ').toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Before / After Comparison Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/70 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                Before / After Interactive Comparison Slider
              </span>
              <span className="text-[11px] text-muted-foreground">
                Drag divider horizontally to inspect
              </span>
            </div>

            {/* Interactive Split View */}
            <div
              className="relative aspect-square w-full rounded-xl overflow-hidden bg-black select-none cursor-ew-resize border border-border"
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                  setSliderPos(pos);
                }
              }}
            >
              {/* After Image (Transformed) */}
              <img
                src={activeTransformation?.transformedUrl || inputImage}
                alt="Transformed"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Before Image (Original Clipped) */}
              <div
                style={{ width: `${sliderPos}%` }}
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl"
              >
                <img
                  src={inputImage}
                  alt="Original"
                  className="absolute inset-y-0 left-0 max-w-none h-full object-cover pointer-events-none"
                  style={{ width: '100%', minWidth: '400px' }}
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                  ORIGINAL
                </span>
              </div>

              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-600/80 backdrop-blur-md text-white text-[10px] font-bold">
                {selectedStyle.toUpperCase()}
              </span>

              {/* Slider Center Thumb */}
              <div
                style={{ left: `${sliderPos}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center border border-border pointer-events-none"
              >
                <Move className="w-4 h-4" />
              </div>
            </div>

            {/* Actions for Transformed Result */}
            {activeTransformation && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={handleSendToEditor}
                  className="py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center justify-center gap-1 shadow-md shadow-violet-500/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open in Canvas</span>
                </button>
                <button
                  onClick={handleAddToCollage}
                  className="py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs flex items-center justify-center gap-1 border border-border"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add to Collage</span>
                </button>
                <a
                  href={activeTransformation.transformedUrl}
                  download={`transformed_${selectedStyle}.png`}
                  className="py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs flex items-center justify-center gap-1 border border-border"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
