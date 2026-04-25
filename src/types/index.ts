// Core types for AnimaStudio

export type LayerType = "image" | "text" | "shape" | "icon" | "html" | "3d";

export interface AnimationPreset {
  id: string;
  name: string;
  category: string;
  cssAnimation: string;
  duration: number;
  easing: string;
  delay: number;
  iterationCount: string;
  preview?: string;
}

export interface Keyframe {
  time: number; // 0-100 percentage
  properties: Record<string, string | number>;
}

export interface LayerAnimation {
  presetId?: string;
  keyframes: Keyframe[];
  duration: number;
  delay: number;
  easing: string;
  iterationCount: string;
  direction: "normal" | "reverse" | "alternate" | "alternate-reverse";
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  blendMode: string;
  animation?: LayerAnimation;
  // Type-specific
  content?: string;
  src?: string;
  shape?: "rect" | "circle" | "triangle" | "star";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: string;
  boxShadow?: string;
  iconName?: string;
  borderRadius?: number;
  objectFit?: "contain" | "cover" | "fill";
  filters?: LayerFilter[];
  // Effects
  glowColor?: string;
  glowIntensity?: number;
  gradient?: GradientConfig;
}

export interface GradientConfig {
  type: "linear" | "radial";
  angle: number;
  stops: { color: string; position: number }[];
}

export interface LayerFilter {
  type: "blur" | "brightness" | "contrast" | "saturate" | "hue-rotate" | "drop-shadow" | "grayscale" | "sepia" | "invert";
  value: number;
}

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  background: string;
  layers: Layer[];
  createdAt: string;
  updatedAt: string;
  duration: number;
}

export interface Asset3D {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  format: "gltf" | "obj";
  tags: string[];
}

export interface IconAsset {
  id: string;
  name: string;
  category: string;
  svg: string;
}

export interface CanvasTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export type PanelTab = "layers" | "assets" | "animations" | "elements";
export type PropertiesTab = "transform" | "animation" | "style" | "filters" | "effects";
export type ActiveTool = "select" | "text" | "shape" | "pan" | "zoom";

export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  width: number;
  height: number;
  description: string;
}
