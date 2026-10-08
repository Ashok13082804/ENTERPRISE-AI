import React, { useRef } from 'react';
import {
  Sparkles, Edit3, Wand2, LayoutGrid, Palette, FolderHeart, History,
  MousePointer2, Hand, Crop, PenTool, Type, Shapes, Eraser, Sparkle,
  Upload, Image as ImageIcon
} from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { StudioMode, ToolType } from '@/types/imageStudio';
import toast from 'react-hot-toast';

export const StudioSidebar: React.FC = () => {
  const {
    mode, setMode,
    activeTool, setActiveTool,
    addLayer, canvasWidth, canvasHeight
  } = useImageStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mainModes: Array<{ id: StudioMode; label: string; icon: any }> = [
    { id: 'generate', label: 'Generate', icon: Sparkles },
    { id: 'edit', label: 'Edit Studio', icon: Edit3 },
    { id: 'transform', label: 'AI Transform', icon: Wand2 },
    { id: 'collage', label: 'Collage', icon: LayoutGrid },
    { id: 'styles', label: '30 Categories', icon: Palette },
    { id: 'projects', label: 'Projects', icon: FolderHeart },
    { id: 'history', label: 'History', icon: History },
  ];

  const editTools: Array<{ id: ToolType; label: string; icon: any; shortcut: string }> = [
    { id: 'select', label: 'Select & Move', icon: MousePointer2, shortcut: 'V' },
    { id: 'pan', label: 'Pan Canvas', icon: Hand, shortcut: 'H' },
    { id: 'crop', label: 'Crop Image', icon: Crop, shortcut: 'C' },
    { id: 'draw', label: 'Doodle / Brush', icon: PenTool, shortcut: 'B' },
    { id: 'text', label: 'Add Text', icon: Type, shortcut: 'T' },
    { id: 'shape', label: 'Add Shape', icon: Shapes, shortcut: 'U' },
    { id: 'eraser', label: 'Eraser', icon: Eraser, shortcut: 'E' },
    { id: 'inpaint', label: 'Object Inpaint', icon: Sparkle, shortcut: 'I' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        addLayer({
          name: file.name.substring(0, 20),
          type: 'image',
          visible: true,
          locked: false,
          opacity: 1,
          blendMode: 'normal',
          x: Math.max(20, (canvasWidth - img.width) / 4),
          y: Math.max(20, (canvasHeight - img.height) / 4),
          width: Math.min(img.width, 800),
          height: Math.min(img.height, 800),
          rotation: 0,
          src,
          originalSrc: src
        });
        setMode('edit');
        toast.success(`Uploaded ${file.name}`);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <aside className="w-16 md:w-20 border-r border-border/60 bg-card/60 backdrop-blur-md flex flex-col items-center py-3 justify-between shrink-0 select-none overflow-y-auto scrollbar-thin">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* Top: Mode Navigation */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {mainModes.map((item) => {
          const Icon = item.icon;
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-b from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none tracking-tight">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Middle: Canvas Edit Tool Palette (when in edit mode) */}
      {mode === 'edit' && (
        <div className="flex flex-col items-center gap-1 w-full px-2 my-2 py-2 border-y border-border/40">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-0.5">
            Tools
          </span>
          {editTools.map((tool) => {
            const Icon = tool.icon;
            const isToolActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isToolActive
                    ? 'bg-secondary text-foreground border border-violet-500/60 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <Icon className={`w-4 h-4 ${isToolActive ? 'text-violet-400' : ''}`} />
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom: Fast Upload Image Action */}
      <div className="w-full px-2 pt-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-square rounded-2xl border border-dashed border-border/80 hover:border-violet-500/80 bg-secondary/30 hover:bg-secondary/70 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all group"
          title="Upload Image"
        >
          <Upload className="w-4 h-4 group-hover:scale-110 transition-transform text-indigo-400" />
          <span className="text-[9px] font-medium leading-none">Upload</span>
        </button>
      </div>
    </aside>
  );
};
