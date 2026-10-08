/**
 * AI Image Studio Zustand Store
 * Complete state management for multi-layer canvas, undo/redo, tools, generation, and projects.
 */
import { create } from 'zustand';
import {
  StudioMode,
  ToolType,
  DrawTool,
  ShapeType,
  Layer,
  GenerationSettings,
  GenerationResult,
  TransformationResult,
  CollageSettings,
  StudioProject,
  ColorAdjustments
} from '@/types/imageStudio';
import { ALL_30_CATEGORIES, SAMPLE_PROJECTS } from '@/data/imageStudioPresets';

export const DEFAULT_ADJUSTMENTS: ColorAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  sharpness: 0,
  blur: 0,
  vignette: 0,
  sepia: 0,
  grayscale: false,
  invert: false
};

interface ImageStudioState {
  // Navigation & Mode
  mode: StudioMode;
  setMode: (mode: StudioMode) => void;

  // Active Tool & Controls
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  activeDrawTool: DrawTool;
  setActiveDrawTool: (tool: DrawTool) => void;
  drawColor: string;
  setDrawColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  drawOpacity: number;
  setDrawOpacity: (opacity: number) => void;

  activeShape: ShapeType;
  setActiveShape: (shape: ShapeType) => void;
  shapeFill: string;
  setShapeFill: (color: string) => void;
  shapeStroke: string;
  setShapeStroke: (color: string) => void;
  shapeStrokeWidth: number;
  setShapeStrokeWidth: (width: number) => void;

  // Canvas Viewport
  canvasWidth: number;
  canvasHeight: number;
  canvasBgColor: string;
  setCanvasSize: (width: number, height: number) => void;
  setCanvasBgColor: (color: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number }) => void;
  resetCanvasView: () => void;

  // Layer Engine & Selection
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  addLayer: (layer: Omit<Layer, 'id' | 'zIndex'> & { id?: string }) => void;
  updateLayer: (id: string, partial: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  updateLayerAdjustments: (id: string, adjustments: Partial<ColorAdjustments>) => void;
  clearCanvas: () => void;

  // Undo / Redo History
  historyStack: Layer[][];
  redoStack: Layer[][];
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // AI Generation State
  generationSettings: GenerationSettings;
  setGenerationSettings: (partial: Partial<GenerationSettings>) => void;
  generationResults: GenerationResult[];
  setGenerationResults: (results: GenerationResult[]) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;

  // AI Transformation State
  activeTransformation: TransformationResult | null;
  setActiveTransformation: (res: TransformationResult | null) => void;
  isTransforming: boolean;
  setIsTransforming: (loading: boolean) => void;
  beforeAfterSliderPos: number;
  setBeforeAfterSliderPos: (pos: number) => void;

  // Collage State
  collageSettings: CollageSettings;
  setCollageSettings: (partial: Partial<CollageSettings>) => void;
  isCollaging: boolean;
  setIsCollaging: (loading: boolean) => void;

  // Project Management
  currentProjectId: string | null;
  currentProjectName: string;
  setCurrentProjectName: (name: string) => void;
  savedProjects: StudioProject[];
  setSavedProjects: (projects: StudioProject[]) => void;
  loadProject: (project: StudioProject) => void;

  // Modals
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;
}

export const useImageStudioStore = create<ImageStudioState>((set, get) => ({
  mode: 'generate',
  setMode: (mode) => set({ mode }),

  activeTool: 'select',
  setActiveTool: (activeTool) => set({ activeTool }),
  activeDrawTool: 'brush',
  setActiveDrawTool: (activeDrawTool) => set({ activeDrawTool }),
  drawColor: '#38bdf8',
  setDrawColor: (drawColor) => set({ drawColor }),
  brushSize: 5,
  setBrushSize: (brushSize) => set({ brushSize }),
  drawOpacity: 1,
  setDrawOpacity: (drawOpacity) => set({ drawOpacity }),

  activeShape: 'rectangle',
  setActiveShape: (activeShape) => set({ activeShape }),
  shapeFill: '#1e293b',
  setShapeFill: (shapeFill) => set({ shapeFill }),
  shapeStroke: '#38bdf8',
  setShapeStroke: (shapeStroke) => set({ shapeStroke }),
  shapeStrokeWidth: 2,
  setShapeStrokeWidth: (shapeStrokeWidth) => set({ shapeStrokeWidth }),

  canvasWidth: 1024,
  canvasHeight: 1024,
  canvasBgColor: '#0f172a',
  setCanvasSize: (canvasWidth, canvasHeight) => set({ canvasWidth, canvasHeight }),
  setCanvasBgColor: (canvasBgColor) => set({ canvasBgColor }),
  zoom: 1,
  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(zoom, 4)) }),
  panOffset: { x: 0, y: 0 },
  setPanOffset: (panOffset) => set({ panOffset }),
  resetCanvasView: () => set({ zoom: 1, panOffset: { x: 0, y: 0 } }),

  layers: [],
  selectedLayerId: null,
  setSelectedLayerId: (selectedLayerId) => set({ selectedLayerId }),

  addLayer: (layerData) => {
    get().pushHistory();
    const id = layerData.id || `layer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLayer: Layer = {
      ...layerData,
      id,
      zIndex: get().layers.length + 1
    };
    set((state) => ({
      layers: [...state.layers, newLayer],
      selectedLayerId: id
    }));
  },

  updateLayer: (id, partial) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, ...partial } : l))
    }));
  },

  deleteLayer: (id) => {
    get().pushHistory();
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId
    }));
  },

  duplicateLayer: (id) => {
    const layer = get().layers.find((l) => l.id === id);
    if (!layer) return;
    get().pushHistory();
    const newId = `layer_${Date.now()}`;
    const duplicated: Layer = {
      ...layer,
      id: newId,
      name: `${layer.name} (Copy)`,
      x: layer.x + 24,
      y: layer.y + 24,
      zIndex: get().layers.length + 1
    };
    set((state) => ({
      layers: [...state.layers, duplicated],
      selectedLayerId: newId
    }));
  },

  moveLayer: (id, direction) => {
    const { layers } = get();
    const idx = layers.findIndex((l) => l.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === layers.length - 1) return;
    if (direction === 'down' && idx === 0) return;

    get().pushHistory();
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    const newLayers = [...layers];
    const temp = newLayers[idx];
    newLayers[idx] = newLayers[targetIdx];
    newLayers[targetIdx] = temp;

    // reindex zIndex
    const indexed = newLayers.map((l, i) => ({ ...l, zIndex: i + 1 }));
    set({ layers: indexed });
  },

  toggleLayerVisibility: (id) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    }));
  },

  toggleLayerLock: (id) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l))
    }));
  },

  updateLayerAdjustments: (id, adjustments) => {
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== id) return l;
        const currentAdj = l.adjustments || { ...DEFAULT_ADJUSTMENTS };
        return {
          ...l,
          adjustments: { ...currentAdj, ...adjustments }
        };
      })
    }));
  },

  clearCanvas: () => {
    get().pushHistory();
    set({ layers: [], selectedLayerId: null });
  },

  historyStack: [],
  redoStack: [],
  pushHistory: () => {
    const current = get().layers;
    set((state) => ({
      historyStack: [...state.historyStack.slice(-30), current],
      redoStack: []
    }));
  },

  undo: () => {
    const { historyStack, layers } = get();
    if (historyStack.length === 0) return;
    const prev = historyStack[historyStack.length - 1];
    set((state) => ({
      layers: prev,
      historyStack: state.historyStack.slice(0, -1),
      redoStack: [layers, ...state.redoStack]
    }));
  },

  redo: () => {
    const { redoStack, layers } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    set((state) => ({
      layers: next,
      redoStack: state.redoStack.slice(1),
      historyStack: [...state.historyStack, layers]
    }));
  },

  // Generation state
  generationSettings: {
    prompt: '',
    negativePrompt: '',
    category: ALL_30_CATEGORIES[0].name,
    subcategory: ALL_30_CATEGORIES[0].subtypes[0],
    style: ALL_30_CATEGORIES[0].subtypes[0],
    aspectRatio: '1:1',
    customWidth: 1024,
    customHeight: 1024,
    numOutputs: 1,
    quality: 'hd',
    lighting: 'Cinematic Volumetric Lighting',
    cameraAngle: 'Eye-Level Direct',
    composition: 'Rule of Thirds',
    colorPalette: 'Vibrant & Saturated',
    mood: 'Epic & Dramatic',
    detailLevel: 'Ultra-Detailed 8K',
    seed: undefined,
    keepConsistent: false,
    variationStrength: 0.7,
    photographicControls: {},
    characterControls: {}
  },
  setGenerationSettings: (partial) => {
    set((state) => ({
      generationSettings: { ...state.generationSettings, ...partial }
    }));
  },

  generationResults: [],
  setGenerationResults: (generationResults) => set({ generationResults }),
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),

  // Transformation state
  activeTransformation: null,
  setActiveTransformation: (activeTransformation) => set({ activeTransformation }),
  isTransforming: false,
  setIsTransforming: (isTransforming) => set({ isTransforming }),
  beforeAfterSliderPos: 50,
  setBeforeAfterSliderPos: (beforeAfterSliderPos) => set({ beforeAfterSliderPos }),

  // Collage state
  collageSettings: {
    layout: 'grid_4',
    canvasWidth: 1200,
    canvasHeight: 1200,
    spacing: 16,
    padding: 24,
    cornerRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 0,
    borderColor: '#ffffff',
    images: []
  },
  setCollageSettings: (partial) => {
    set((state) => ({
      collageSettings: { ...state.collageSettings, ...partial }
    }));
  },
  isCollaging: false,
  setIsCollaging: (isCollaging) => set({ isCollaging }),

  // Projects
  currentProjectId: null,
  currentProjectName: 'Untitled Project',
  setCurrentProjectName: (currentProjectName) => set({ currentProjectName }),
  savedProjects: SAMPLE_PROJECTS,
  setSavedProjects: (savedProjects) => set({ savedProjects }),

  loadProject: (project) => {
    set({
      currentProjectId: project.id,
      currentProjectName: project.name,
      canvasWidth: project.canvas.width,
      canvasHeight: project.canvas.height,
      canvasBgColor: project.canvas.backgroundColor,
      layers: project.layers,
      selectedLayerId: project.layers[0]?.id || null,
      mode: 'edit',
      historyStack: [],
      redoStack: []
    });
  },

  // Modals
  exportModalOpen: false,
  setExportModalOpen: (exportModalOpen) => set({ exportModalOpen }),
  shortcutsModalOpen: false,
  setShortcutsModalOpen: (shortcutsModalOpen) => set({ shortcutsModalOpen })
}));
