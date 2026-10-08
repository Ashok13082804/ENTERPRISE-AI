import React, { useState } from 'react';
import {
  Layers as LayersIcon, Sliders, Type, Shapes, PenTool, Wand2,
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, ArrowUp, ArrowDown,
  Sparkles, Sun, Contrast, Droplets, Scissors, Check, Palette
} from 'lucide-react';
import { useImageStudioStore, DEFAULT_ADJUSTMENTS } from '@/store/imageStudioStore';
import { ImageStudioService } from '@/services/imageStudioService';
import { FONT_PRESETS, SHAPE_PRESETS, STICKER_PRESETS } from '@/data/imageStudioPresets';
import { BlendMode, DrawTool, ShapeType } from '@/types/imageStudio';
import toast from 'react-hot-toast';

export const StudioPropertiesPanel: React.FC = () => {
  const {
    layers, selectedLayerId, setSelectedLayerId,
    updateLayer, deleteLayer, duplicateLayer, moveLayer,
    toggleLayerVisibility, toggleLayerLock, updateLayerAdjustments,
    activeTool, setActiveTool,
    activeDrawTool, setActiveDrawTool,
    drawColor, setDrawColor, brushSize, setBrushSize, drawOpacity, setDrawOpacity,
    activeShape, setActiveShape, shapeFill, setShapeFill, shapeStroke, setShapeStroke,
    shapeStrokeWidth, setShapeStrokeWidth,
    addLayer, canvasWidth, canvasHeight
  } = useImageStudioStore();

  const [activeTab, setActiveTab] = useState<'layers' | 'adjust' | 'text' | 'shapes' | 'doodle' | 'ai'>('layers');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Blend modes list
  const blendModes: BlendMode[] = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn'
  ];

  // Draw tools
  const drawTools: Array<{ id: DrawTool; label: string }> = [
    { id: 'brush', label: 'Brush' },
    { id: 'pen', label: 'Pen' },
    { id: 'pencil', label: 'Pencil' },
    { id: 'marker', label: 'Marker' },
    { id: 'highlighter', label: 'Highlighter' },
    { id: 'eraser', label: 'Eraser' },
  ];

  // Palette colors for brush & shapes
  const colorPalette = [
    '#ffffff', '#000000', '#38bdf8', '#818cf8', '#c084fc',
    '#f43f5e', '#fb923c', '#facc15', '#4ade80', '#2dd4bf'
  ];

  // AI Background Removal
  const handleRemoveBackground = async () => {
    if (!selectedLayer || selectedLayer.type !== 'image' || !selectedLayer.src) {
      toast.error('Please select an image layer first');
      return;
    }
    setIsProcessingAI(true);
    toast.loading('Removing background with AI...');
    try {
      const resultUrl = await ImageStudioService.editImage(selectedLayer.src, 'remove_bg');
      toast.dismiss();
      updateLayer(selectedLayer.id, { src: resultUrl });
      toast.success('Background removed successfully!');
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to remove background');
    } finally {
      setIsProcessingAI(false);
    }
  };

  // AI Background Replacement
  const handleReplaceBackground = async (color: string) => {
    if (!selectedLayer || selectedLayer.type !== 'image' || !selectedLayer.src) {
      toast.error('Please select an image layer first');
      return;
    }
    setIsProcessingAI(true);
    toast.loading('Replacing background...');
    try {
      const resultUrl = await ImageStudioService.editImage(selectedLayer.src, 'replace_bg', undefined, { bg_color: color });
      toast.dismiss();
      updateLayer(selectedLayer.id, { src: resultUrl });
      toast.success('Background replaced!');
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to replace background');
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <aside className="w-80 border-l border-border/60 bg-card/75 backdrop-blur-md flex flex-col h-full shrink-0 select-none">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-border/50 bg-secondary/30 p-1 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'layers'
              ? 'bg-card text-foreground shadow-sm border border-border/70'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Layer Management"
        >
          <LayersIcon className="w-3.5 h-3.5 text-violet-400" />
          <span>Layers</span>
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'adjust'
              ? 'bg-card text-foreground shadow-sm border border-border/70'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Adjustments & Filters"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Adjust</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'text'
              ? 'bg-card text-foreground shadow-sm border border-border/70'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Text Tool"
        >
          <Type className="w-3.5 h-3.5 text-amber-400" />
          <span>Text</span>
        </button>

        <button
          onClick={() => setActiveTab('shapes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'shapes'
              ? 'bg-card text-foreground shadow-sm border border-border/70'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Shapes & Stickers"
        >
          <Shapes className="w-3.5 h-3.5 text-pink-400" />
          <span>Shapes</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'ai'
              ? 'bg-card text-foreground shadow-sm border border-border/70'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="AI Tools"
        >
          <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* 1. LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">
                Layers ({layers.length})
              </span>
              <button
                onClick={() =>
                  addLayer({
                    name: `Shape ${layers.length + 1}`,
                    type: 'shape',
                    visible: true,
                    locked: false,
                    opacity: 1,
                    blendMode: 'normal',
                    x: 100,
                    y: 100,
                    width: 200,
                    height: 120,
                    rotation: 0,
                    shapeType: 'rectangle',
                    fillColor: '#38bdf8'
                  })
                }
                className="px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-[11px] font-medium text-foreground transition-colors"
              >
                + Add Layer
              </button>
            </div>

            {/* Layer List (Top to Bottom) */}
            <div className="space-y-1.5">
              {[...layers]
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((layer) => {
                  const isSelected = layer.id === selectedLayerId;
                  return (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-secondary border-violet-500/80 shadow-sm'
                          : 'bg-card/40 border-border/50 hover:bg-secondary/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="w-5 text-center font-mono text-[10px] text-muted-foreground">
                          {layer.zIndex}
                        </span>
                        <div className="truncate font-medium text-foreground">
                          {layer.name}
                        </div>
                      </div>

                      {/* Layer Quick Actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleLayerVisibility(layer.id)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                          title={layer.visible ? 'Hide' : 'Show'}
                        >
                          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground/40" />}
                        </button>
                        <button
                          onClick={() => toggleLayerLock(layer.id)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                          title={layer.locked ? 'Unlock' : 'Lock'}
                        >
                          {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-muted-foreground/40" />}
                        </button>
                        <button
                          onClick={() => moveLayer(layer.id, 'up')}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                          title="Bring Forward"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveLayer(layer.id, 'down')}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                          title="Send Backward"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => duplicateLayer(layer.id)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteLayer(layer.id)}
                          className="p-1 rounded text-muted-foreground hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Selected Layer Properties */}
            {selectedLayer && (
              <div className="pt-3 border-t border-border/50 space-y-3">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Selected: {selectedLayer.name}
                </span>

                {/* Opacity */}
                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Opacity</span>
                    <span>{Math.round((selectedLayer.opacity ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={selectedLayer.opacity ?? 1}
                    onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* Blend Mode */}
                <div>
                  <label className="text-muted-foreground block mb-1">Blend Mode</label>
                  <select
                    value={selectedLayer.blendMode || 'normal'}
                    onChange={(e) => updateLayer(selectedLayer.id, { blendMode: e.target.value as BlendMode })}
                    className="w-full bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                  >
                    {blendModes.map((bm) => (
                      <option key={bm} value={bm}>
                        {bm.charAt(0).toUpperCase() + bm.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ADJUSTMENTS & FILTERS TAB */}
        {activeTab === 'adjust' && (
          <div className="space-y-4">
            <span className="font-semibold text-foreground text-sm block">
              Filters & Adjustments
            </span>

            {selectedLayer ? (
              <div className="space-y-3">
                {/* Sliders */}
                {[
                  { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
                  { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
                  { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
                  { key: 'temperature', label: 'Temperature', min: -100, max: 100 },
                  { key: 'blur', label: 'Blur', min: 0, max: 50 },
                  { key: 'vignette', label: 'Vignette', min: 0, max: 100 },
                  { key: 'sepia', label: 'Sepia', min: 0, max: 100 }
                ].map(({ key, label, min, max }) => {
                  const val = (selectedLayer.adjustments as any)?.[key] ?? 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>{label}</span>
                        <span>{val}</span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={val}
                        onChange={(e) => updateLayerAdjustments(selectedLayer.id, { [key]: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  );
                })}

                {/* Toggles */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() =>
                      updateLayerAdjustments(selectedLayer.id, {
                        grayscale: !selectedLayer.adjustments?.grayscale
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      selectedLayer.adjustments?.grayscale
                        ? 'bg-cyan-500 text-white border-cyan-400'
                        : 'bg-secondary text-muted-foreground border-border'
                    }`}
                  >
                    Grayscale
                  </button>
                  <button
                    onClick={() =>
                      updateLayerAdjustments(selectedLayer.id, {
                        invert: !selectedLayer.adjustments?.invert
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      selectedLayer.adjustments?.invert
                        ? 'bg-violet-500 text-white border-violet-400'
                        : 'bg-secondary text-muted-foreground border-border'
                    }`}
                  >
                    Invert
                  </button>
                  <button
                    onClick={() => updateLayerAdjustments(selectedLayer.id, { ...DEFAULT_ADJUSTMENTS })}
                    className="px-2 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground border border-border"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Select an image layer to adjust its lighting and colors.</p>
            )}
          </div>
        )}

        {/* 3. TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <span className="font-semibold text-foreground text-sm block">
              Typography Tool
            </span>

            {/* Add New Text Layer Button */}
            <button
              onClick={() => {
                addLayer({
                  name: 'Text Layer',
                  type: 'text',
                  visible: true,
                  locked: false,
                  opacity: 1,
                  blendMode: 'normal',
                  x: 100,
                  y: 100,
                  width: 320,
                  height: 60,
                  rotation: 0,
                  text: 'Double click to edit text',
                  fontSize: 32,
                  fontFamily: 'Inter, sans-serif',
                  fontColor: '#ffffff',
                  fontWeight: 700
                });
                toast.success('Text layer created');
              }}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-xs shadow-md shadow-amber-500/20"
            >
              + Add New Text Layer
            </button>

            {selectedLayer && selectedLayer.type === 'text' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Text Content</label>
                  <input
                    type="text"
                    value={selectedLayer.text || ''}
                    onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Font Preset</label>
                  <select
                    value={selectedLayer.fontFamily || 'Inter, sans-serif'}
                    onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                  >
                    {FONT_PRESETS.map((f) => (
                      <option key={f.id} value={f.family}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Font Size</span>
                    <span>{selectedLayer.fontSize || 32}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={selectedLayer.fontSize || 32}
                    onChange={(e) => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Font Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedLayer.fontColor || '#ffffff'}
                      onChange={(e) => updateLayer(selectedLayer.id, { fontColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <div className="flex gap-1 flex-wrap">
                      {colorPalette.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateLayer(selectedLayer.id, { fontColor: c })}
                          style={{ backgroundColor: c }}
                          className="w-5 h-5 rounded-md border border-white/20"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => updateLayer(selectedLayer.id, { fontWeight: selectedLayer.fontWeight === 700 ? 400 : 700 })}
                    className={`flex-1 py-1.5 rounded-lg border font-bold text-xs ${
                      selectedLayer.fontWeight === 700 ? 'bg-amber-500 text-white border-amber-400' : 'bg-secondary border-border'
                    }`}
                  >
                    Bold
                  </button>
                  <button
                    onClick={() => updateLayer(selectedLayer.id, { fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`flex-1 py-1.5 rounded-lg border italic text-xs ${
                      selectedLayer.fontStyle === 'italic' ? 'bg-amber-500 text-white border-amber-400' : 'bg-secondary border-border'
                    }`}
                  >
                    Italic
                  </button>
                  <button
                    onClick={() => updateLayer(selectedLayer.id, { textShadow: !selectedLayer.textShadow })}
                    className={`flex-1 py-1.5 rounded-lg border text-xs ${
                      selectedLayer.textShadow ? 'bg-amber-500 text-white border-amber-400' : 'bg-secondary border-border'
                    }`}
                  >
                    Shadow
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. SHAPES & STICKERS TAB */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <span className="font-semibold text-foreground text-sm block">
              Shapes & Elements
            </span>

            {/* Shape Palette */}
            <div className="grid grid-cols-4 gap-2">
              {SHAPE_PRESETS.map((sh) => (
                <button
                  key={sh.id}
                  onClick={() => {
                    setActiveShape(sh.shapeType);
                    addLayer({
                      name: sh.name,
                      type: 'shape',
                      visible: true,
                      locked: false,
                      opacity: 1,
                      blendMode: 'normal',
                      x: 120,
                      y: 120,
                      width: 140,
                      height: 140,
                      rotation: 0,
                      shapeType: sh.shapeType,
                      fillColor: shapeFill,
                      strokeColor: shapeStroke,
                      strokeWidth: shapeStrokeWidth
                    });
                    toast.success(`Added ${sh.name}`);
                  }}
                  className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-border flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-all"
                >
                  <span className="text-[10px] font-medium">{sh.name}</span>
                </button>
              ))}
            </div>

            {/* Stickers & Badges */}
            <div className="pt-2">
              <span className="font-semibold text-muted-foreground text-xs block mb-2">
                Stickers & Badges
              </span>
              <div className="grid grid-cols-4 gap-2">
                {STICKER_PRESETS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      addLayer({
                        name: st.label,
                        type: 'text',
                        visible: true,
                        locked: false,
                        opacity: 1,
                        blendMode: 'normal',
                        x: 150,
                        y: 150,
                        width: 80,
                        height: 80,
                        rotation: 0,
                        text: st.emoji,
                        fontSize: 48
                      });
                      toast.success(`Added ${st.label}`);
                    }}
                    className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary border border-border flex flex-col items-center gap-0.5"
                  >
                    <span className="text-xl">{st.emoji}</span>
                    <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                      {st.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. AI TOOLS TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <span className="font-semibold text-foreground text-sm block">
              AI Powered Tools
            </span>

            {/* Background Cutout */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-foreground">AI Background Removal</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Accurately cut out the foreground subject with alpha transparency.
              </p>
              <button
                onClick={handleRemoveBackground}
                disabled={isProcessingAI}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium text-xs shadow-sm transition-all"
              >
                Remove Background
              </button>
            </div>

            {/* Background Replacement */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span className="font-medium text-foreground">Replace Background Color</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['#ffffff', '#0f172a', '#1e293b', '#00f0ff', '#ff007f', '#ffd700'].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleReplaceBackground(c)}
                    style={{ backgroundColor: c }}
                    className="w-7 h-7 rounded-lg border border-white/20 shadow-sm"
                    title={`Replace with ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
