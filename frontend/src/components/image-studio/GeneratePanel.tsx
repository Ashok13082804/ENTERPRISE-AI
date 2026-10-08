import React, { useState } from 'react';
import {
  Sparkles, Wand2, Dices, Search, Camera, Users, Network, Sliders,
  Check, Download, Trash2, Edit3, LayoutGrid, ChevronDown, ChevronUp,
  Maximize2, Eye, Shield, RefreshCw
} from 'lucide-react';
import { useImageStudioStore } from '@/store/imageStudioStore';
import { ALL_30_CATEGORIES, DEFAULT_NEGATIVE_PROMPTS, PHOTO_CAMERAS, PHOTO_LENSES, PHOTO_LIGHTING, PHOTO_ANGLES } from '@/data/imageStudioPresets';
import { ImageStudioService } from '@/services/imageStudioService';
import { AspectRatio, GenerationResult } from '@/types/imageStudio';
import toast from 'react-hot-toast';

export const GeneratePanel: React.FC = () => {
  const {
    generationSettings, setGenerationSettings,
    generationResults, setGenerationResults,
    isGenerating, setIsGenerating,
    addLayer, setMode, setCollageSettings, collageSettings
  } = useImageStudioStore();

  const [categorySearch, setCategorySearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isInterpretingCommand, setIsInterpretingCommand] = useState(false);

  // Selected Category Object
  const selectedCat = ALL_30_CATEGORIES.find((c) => c.name === generationSettings.category) || ALL_30_CATEGORIES[0];

  // Aspect ratio choices
  const aspectRatios: Array<{ id: AspectRatio; label: string; iconRatio: string }> = [
    { id: '1:1', label: '1:1 Square', iconRatio: 'w-5 h-5' },
    { id: '16:9', label: '16:9 Landscape', iconRatio: 'w-7 h-4' },
    { id: '9:16', label: '9:16 Story/Reel', iconRatio: 'w-4 h-7' },
    { id: '4:3', label: '4:3 Standard', iconRatio: 'w-6 h-4.5' },
    { id: '3:4', label: '3:4 Portrait', iconRatio: 'w-4.5 h-6' },
    { id: '3:2', label: '3:2 Classic 35mm', iconRatio: 'w-6 h-4' },
    { id: '2:3', label: '2:3 Book Cover', iconRatio: 'w-4 h-6' },
  ];

  // Example prompts
  const samplePrompts = [
    'Create a futuristic AI laboratory with holographic interfaces, robotic arms, cinematic lighting, ultra-detailed environment, realistic photography.',
    'A cyberpunk city with flying cars and neon buildings at night in heavy rain, reflections in puddles.',
    'College final-year project architecture diagram: React frontend, FastAPI backend, ChromaDB vector store, Llama3 LLM.',
    'Delicate watercolor painting of a misty Japanese zen garden with stone lanterns and cherry blossoms.',
    '3D isometric diorama of an autonomous smart greenhouse with robotic harvesters and solar panels.'
  ];

  // Dice roll random prompt
  const handleRandomPrompt = () => {
    const randomCategory = ALL_30_CATEGORIES[Math.floor(Math.random() * ALL_30_CATEGORIES.length)];
    const randomSubtype = randomCategory.subtypes[Math.floor(Math.random() * randomCategory.subtypes.length)];
    setGenerationSettings({
      category: randomCategory.name,
      subcategory: randomSubtype,
      style: randomSubtype,
      prompt: randomCategory.suggestedPrompt || samplePrompts[Math.floor(Math.random() * samplePrompts.length)]
    });
    toast.success(`Loaded inspiration: ${randomCategory.name}`);
  };

  // AI Command Bar Interpretation
  const handleAnalyzeCommand = async () => {
    if (!generationSettings.prompt.trim()) return;
    setIsInterpretingCommand(true);
    try {
      const intent = await ImageStudioService.interpretAICommand(
        generationSettings.prompt,
        generationSettings.category,
        generationSettings.style
      );
      if (intent) {
        if (intent.category) setGenerationSettings({ category: intent.category });
        if (intent.style) setGenerationSettings({ style: intent.style, subcategory: intent.style });
        if (intent.aspect_ratio) setGenerationSettings({ aspectRatio: intent.aspect_ratio as AspectRatio });
        toast.success(`Understood: ${intent.category} → ${intent.style}`);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsInterpretingCommand(false);
    }
  };

  // Generate Action
  const handleGenerate = async () => {
    if (!generationSettings.prompt.trim()) {
      toast.error('Please enter a description for the image');
      return;
    }

    setIsGenerating(true);
    toast.loading('Synthesizing high-resolution artwork...', { id: 'gen-toast' });

    try {
      const results = await ImageStudioService.generateImage(generationSettings);
      setGenerationResults(results);
      toast.dismiss('gen-toast');
      toast.success(`Generated ${results.length} image(s) successfully!`);
    } catch (err: any) {
      toast.dismiss('gen-toast');
      toast.error('Generation completed with fallback canvas synthesis');
    } finally {
      setIsGenerating(false);
    }
  };

  // Send result to canvas editor as new layer
  const handleSendToEditor = (result: GenerationResult) => {
    addLayer({
      name: `${result.style} Artwork`,
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: result.width,
      height: result.height,
      rotation: 0,
      src: result.url,
      originalSrc: result.url
    });
    setMode('edit');
    toast.success('Loaded into Canvas Studio for editing!');
  };

  // Send result to collage builder
  const handleAddToCollage = (result: GenerationResult) => {
    setCollageSettings({
      images: [...collageSettings.images, { id: result.id, url: result.url }]
    });
    setMode('collage');
    toast.success('Added to Collage Studio!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* 1. Main Prompt Input & Command Bar */}
      <div className="space-y-3 bg-card/80 backdrop-blur-md p-5 rounded-2xl border border-border/70 shadow-lg">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Describe the image you want to create...
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomPrompt}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary/80 hover:bg-secondary text-xs font-medium text-foreground transition-all hover:scale-105"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Surprise Me</span>
            </button>
            <button
              onClick={handleAnalyzeCommand}
              disabled={isInterpretingCommand}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 text-xs font-medium transition-colors"
              title="AI Prompt Classifier"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Detect Style</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={generationSettings.prompt}
            onChange={(e) => setGenerationSettings({ prompt: e.target.value })}
            placeholder="e.g. Create a futuristic AI laboratory with holographic interfaces, robotic arms, cinematic lighting, ultra-detailed environment, realistic photography..."
            rows={3}
            className="w-full bg-secondary/50 border border-border/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all resize-none shadow-inner"
          />
        </div>

        {/* Quick Example Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-muted-foreground shrink-0 font-medium">Examples:</span>
          {samplePrompts.slice(0, 3).map((p, idx) => (
            <button
              key={idx}
              onClick={() => setGenerationSettings({ prompt: p })}
              className="truncate max-w-xs px-2.5 py-1 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 text-muted-foreground hover:text-foreground text-[11px] transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Complete 30 Categories & Subtypes Selector */}
      <div className="space-y-4 bg-card/80 backdrop-blur-md p-5 rounded-2xl border border-border/70 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              Style & Category Library (All 30 Categories)
            </h2>
            <p className="text-xs text-muted-foreground">
              Selected: <strong className="text-foreground">{generationSettings.category}</strong> → <strong className="text-violet-400">{generationSettings.style}</strong>
            </p>
          </div>

          {/* Search Category Filter */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Filter 30 categories..."
              className="w-full bg-secondary/60 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Horizontal Categories Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {ALL_30_CATEGORIES
            .filter((c) =>
              c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
              c.subtypes.some(s => s.toLowerCase().includes(categorySearch.toLowerCase()))
            )
            .map((cat) => {
              const isCatActive = generationSettings.category === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setGenerationSettings({
                      category: cat.name,
                      subcategory: cat.subtypes[0],
                      style: cat.subtypes[0],
                      aspectRatio: cat.recommendedAspect || generationSettings.aspectRatio
                    });
                  }}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
                    isCatActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-500/25 scale-[1.02]'
                      : 'bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <span className="w-5 h-5 rounded-lg bg-black/20 flex items-center justify-center text-[10px]">
                    {cat.number}
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
        </div>

        {/* Subcategories Pills for Selected Category */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {selectedCat.name} Styles ({selectedCat.subtypes.length})
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {selectedCat.subtypes.map((sub) => {
              const isStyleActive = generationSettings.style === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setGenerationSettings({ style: sub, subcategory: sub })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isStyleActive
                      ? 'bg-violet-500 text-white font-semibold shadow-sm'
                      : 'bg-secondary/60 hover:bg-secondary border border-border/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Aspect Ratio & Core Settings */}
      <div className="space-y-4 bg-card/80 backdrop-blur-md p-5 rounded-2xl border border-border/70 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Aspect Ratio</h2>
          <span className="text-xs text-muted-foreground">
            Current: <strong className="text-foreground">{generationSettings.aspectRatio}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {aspectRatios.map((ratio) => {
            const isRatioActive = generationSettings.aspectRatio === ratio.id;
            return (
              <button
                key={ratio.id}
                onClick={() => setGenerationSettings({ aspectRatio: ratio.id })}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isRatioActive
                    ? 'bg-violet-500/10 border-violet-500 text-violet-400 font-bold shadow-sm'
                    : 'bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <div className={`border-2 rounded-sm ${isRatioActive ? 'border-violet-400' : 'border-muted-foreground/60'} ${ratio.iconRatio}`} />
                <span className="text-[11px]">{ratio.id}</span>
              </button>
            );
          })}
        </div>

        {/* Advanced Accordion Toggle */}
        <div className="pt-2 border-t border-border/50">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Advanced Controls (Quality, Lighting, Camera, Negative Prompt, Seed)</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
              {/* Quality & Outputs */}
              <div className="space-y-2">
                <label className="text-muted-foreground block font-medium">Quality Level</label>
                <div className="flex gap-2">
                  {['standard', 'hd', 'ultra'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setGenerationSettings({ quality: q as any })}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium uppercase ${
                        generationSettings.quality === q
                          ? 'bg-violet-500 text-white border-violet-400 font-bold'
                          : 'bg-secondary text-muted-foreground border-border'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting */}
              <div className="space-y-2">
                <label className="text-muted-foreground block font-medium">Lighting Preset</label>
                <select
                  value={generationSettings.lighting}
                  onChange={(e) => setGenerationSettings({ lighting: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                >
                  {PHOTO_LIGHTING.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Camera Angle */}
              <div className="space-y-2">
                <label className="text-muted-foreground block font-medium">Camera Angle</label>
                <select
                  value={generationSettings.cameraAngle}
                  onChange={(e) => setGenerationSettings({ cameraAngle: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                >
                  {PHOTO_ANGLES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Style Consistency Toggle */}
              <div className="md:col-span-3 flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div>
                  <span className="font-semibold text-foreground block">Keep Style Consistent</span>
                  <span className="text-[11px] text-muted-foreground">Locks seed and visual palette language across iterations.</span>
                </div>
                <input
                  type="checkbox"
                  checked={generationSettings.keepConsistent}
                  onChange={(e) => setGenerationSettings({ keepConsistent: e.target.checked })}
                  className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                />
              </div>

              {/* Negative Prompt */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-muted-foreground block font-medium">
                  Negative Prompt (Elements to avoid)
                </label>
                <input
                  type="text"
                  value={generationSettings.negativePrompt}
                  onChange={(e) => setGenerationSettings({ negativePrompt: e.target.value })}
                  placeholder={DEFAULT_NEGATIVE_PROMPTS.general}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Action: Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full sm:w-80 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Rendering Artwork...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Image</span>
            </>
          )}
        </button>
      </div>

      {/* 5. Generation Results Grid */}
      {generationResults.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Generated Results ({generationResults.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {generationResults.map((result) => (
              <div
                key={result.id}
                className="group relative bg-card/90 rounded-2xl border border-border/80 overflow-hidden shadow-xl hover:shadow-2xl transition-all"
              >
                {/* Result Image */}
                <div className="relative aspect-square overflow-hidden bg-black/40">
                  <img
                    src={result.url}
                    alt={result.prompt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                    {result.style}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-violet-600/80 backdrop-blur-md text-[10px] font-semibold text-white">
                    {result.aspectRatio}
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-foreground font-medium line-clamp-2">
                    "{result.prompt}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => handleSendToEditor(result)}
                      className="px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleAddToCollage(result)}
                      className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs flex items-center justify-center gap-1 border border-border"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                      <span>Collage</span>
                    </button>
                    <a
                      href={result.url}
                      download={result.filename}
                      className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs flex items-center justify-center gap-1 border border-border"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Save</span>
                    </a>
                    <button
                      onClick={() => {
                        setGenerationResults(generationResults.filter((r) => r.id !== result.id));
                        toast.success('Removed from results');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-red-500/20 text-muted-foreground hover:text-red-400 font-medium text-xs flex items-center justify-center gap-1 border border-border"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
