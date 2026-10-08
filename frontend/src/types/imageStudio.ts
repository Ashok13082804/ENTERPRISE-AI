/**
 * AI Image Studio Types
 * Complete specification for Generation, Transformation, Editing, Collage, and Layers
 */

export type StudioMode = 'generate' | 'edit' | 'transform' | 'collage' | 'styles' | 'projects' | 'history';

export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | 'custom';

export type QualityLevel = 'standard' | 'hd' | 'ultra';

export type LayerType = 'image' | 'text' | 'shape' | 'doodle' | 'filter' | 'frame';

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn';

export type ToolType = 'select' | 'pan' | 'crop' | 'draw' | 'text' | 'shape' | 'eraser' | 'inpaint';

export type DrawTool = 'pen' | 'pencil' | 'brush' | 'marker' | 'highlighter' | 'eraser' | 'line' | 'arrow';

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'arrow' | 'speech_bubble' | 'heart' | 'badge' | 'line';

export interface ColorAdjustments {
  brightness: number;    // -100 to 100
  contrast: number;      // -100 to 100
  saturation: number;    // -100 to 100
  temperature: number;   // -100 to 100
  tint: number;          // -100 to 100
  exposure: number;      // -100 to 100
  highlights: number;    // -100 to 100
  shadows: number;       // -100 to 100
  sharpness: number;     // -100 to 100
  blur: number;          // 0 to 100
  vignette: number;      // 0 to 100
  sepia: number;         // 0 to 100
  grayscale: boolean;
  invert: boolean;
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;       // 0 to 1
  blendMode: BlendMode;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;      // in degrees
  zIndex: number;
  
  // Image specific
  src?: string;
  originalSrc?: string;
  aspectRatio?: number;
  adjustments?: ColorAdjustments;

  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: 'none' | 'underline';
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  textOutline?: boolean;
  outlineColor?: string;
  outlineWidth?: number;
  textBackground?: string;

  // Shape specific
  shapeType?: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  cornerRadius?: number;

  // Doodle/Drawing specific
  points?: Array<{ x: number; y: number }>;
  drawColor?: string;
  brushSize?: number;
  drawTool?: DrawTool;
}

export interface PhotographicControls {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  depthOfField?: string;
  exposure?: string;
  iso?: string;
  shutterSpeed?: string;
  lighting?: string;
  composition?: string;
  perspective?: string;
}

export interface CharacterControls {
  age?: string;
  pose?: string;
  expression?: string;
  clothing?: string;
  hairstyle?: string;
  accessories?: string;
  bodyPosition?: string;
  cameraAngle?: string;
  consistency?: boolean;
}

export interface GenerationSettings {
  prompt: string;
  negativePrompt: string;
  category: string;
  subcategory: string;
  style: string;
  aspectRatio: AspectRatio;
  customWidth: number;
  customHeight: number;
  numOutputs: number;
  quality: QualityLevel;
  lighting: string;
  cameraAngle: string;
  composition: string;
  colorPalette: string;
  mood: string;
  detailLevel: string;
  seed?: number;
  keepConsistent: boolean;
  variationStrength: number;
  photographicControls: PhotographicControls;
  characterControls: CharacterControls;
  diagramType?: string;
}

export interface GenerationResult {
  id: string;
  url: string;
  base64?: string;
  filename: string;
  prompt: string;
  category: string;
  style: string;
  aspectRatio: string;
  width: number;
  height: number;
  seed: number;
  timestamp: string;
  model: string;
  source: 'neural_cloud' | 'studio_procedural';
  parameters?: any;
}

export interface TransformationResult {
  originalUrl: string;
  transformedUrl: string;
  originalBase64?: string;
  transformedBase64?: string;
  style: string;
  strength: number;
  timestamp: string;
}

export interface CollageSettings {
  layout: 'grid_2' | 'grid_3' | 'grid_4' | 'grid_6' | 'grid_9' | 'grid_12' | 'polaroid' | 'photo_wall' | 'magazine';
  canvasWidth: number;
  canvasHeight: number;
  spacing: number;
  padding: number;
  cornerRadius: number;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  images: Array<{
    id: string;
    url: string;
    zoom?: number;
    rotation?: number;
  }>;
}

export interface StudioProject {
  id: string;
  name: string;
  thumbnail: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  layers: Layer[];
  promptHistory: Array<{
    prompt: string;
    timestamp: string;
    category: string;
    style: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDefinition {
  id: string;
  number: number;
  name: string;
  iconName: string;
  description: string;
  accentColor: string;
  subtypes: string[];
  suggestedPrompt?: string;
  recommendedAspect?: AspectRatio;
}
