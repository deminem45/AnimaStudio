import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, Layer, LayerType, CanvasTransform, PanelTab, PropertiesTab, ActiveTool } from "@/types";
import { generateId } from "@/lib/utils";

interface HistoryEntry {
  layers: Layer[];
  description: string;
}

interface EditorStore {
  // Project state
  project: Project;
  projects: Project[];
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  copiedLayer: Layer | null;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // UI state
  activeTool: ActiveTool;
  activePanelTab: PanelTab;
  activePropertiesTab: PropertiesTab;
  canvasTransform: CanvasTransform;
  isPlaying: boolean;
  currentTime: number;
  showExportModal: boolean;
  showNewProjectModal: boolean;
  showShortcutsModal: boolean;
  showTemplatesModal: boolean;
  showCSSPanel: boolean;
  animationSearchQuery: string;
  animationCategoryFilter: string;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;

  // Actions
  setProject: (project: Project) => void;
  updateProjectMeta: (meta: Partial<Pick<Project, "name" | "width" | "height" | "background" | "duration">>) => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  createNewProject: (name: string, width: number, height: number) => void;
  deleteProject: (id: string) => void;

  // History
  pushHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;

  // Layer actions
  addLayer: (type: LayerType, overrides?: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  copyLayer: (id: string) => void;
  pasteLayer: () => void;
  selectLayer: (id: string | null) => void;
  hoverLayer: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  clearSelection: () => void;
  groupSelectedLayers: () => void;

  // UI actions
  setActiveTool: (tool: ActiveTool) => void;
  setActivePanelTab: (tab: PanelTab) => void;
  setActivePropertiesTab: (tab: PropertiesTab) => void;
  setCanvasTransform: (transform: Partial<CanvasTransform>) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setShowExportModal: (show: boolean) => void;
  setShowNewProjectModal: (show: boolean) => void;
  setShowShortcutsModal: (show: boolean) => void;
  setShowTemplatesModal: (show: boolean) => void;
  setShowCSSPanel: (show: boolean) => void;
  setAnimationSearchQuery: (q: string) => void;
  setAnimationCategoryFilter: (cat: string) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowRulers: (show: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  zoomTo: (scale: number) => void;

  // Getters
  getSelectedLayer: () => Layer | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const DEFAULT_PROJECT: Project = {
  id: generateId(),
  name: "Untitled Project",
  width: 1280,
  height: 720,
  background: "#0d0d1a",
  layers: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  duration: 5,
};

const DEFAULT_LAYER_PROPS: Partial<Layer> = {
  visible: true,
  locked: false,
  rotation: 0,
  opacity: 100,
  blendMode: "normal",
  borderRadius: 0,
  filters: [],
};

function snapValue(value: number, gridSize: number, snap: boolean): number {
  if (!snap) return value;
  return Math.round(value / gridSize) * gridSize;
}

function createDefaultLayer(type: LayerType, overrides?: Partial<Layer>): Layer {
  const base: Layer = {
    id: generateId(),
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
    type,
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    ...DEFAULT_LAYER_PROPS,
    ...overrides,
  };

  if (type === "text") {
    return { ...base, width: 320, height: 64, content: "Your Text Here", color: "#ffffff", fontSize: 32, fontFamily: "Inter, sans-serif", fontWeight: "600", textAlign: "left", letterSpacing: 0, lineHeight: 1.4, textShadow: "", ...overrides };
  }
  if (type === "shape") {
    return { ...base, shape: "rect", fill: "#00d4ff", width: 160, height: 160, ...overrides };
  }
  if (type === "icon") {
    return { ...base, width: 80, height: 80, content: "★", color: "#00d4ff", fontSize: 64, ...overrides };
  }
  if (type === "image") {
    return { ...base, src: "", width: 300, height: 200, objectFit: "contain", ...overrides };
  }
  if (type === "html") {
    return { ...base, content: "<div style='padding:16px;background:rgba(0,212,255,0.1);border:1px solid #00d4ff;border-radius:8px;color:#fff;font-family:Inter'>HTML Element</div>", width: 300, height: 120, ...overrides };
  }
  return base;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      project: DEFAULT_PROJECT,
      projects: [],
      selectedLayerId: null,
      hoveredLayerId: null,
      copiedLayer: null,
      history: [],
      historyIndex: -1,
      activeTool: "select",
      activePanelTab: "layers",
      activePropertiesTab: "transform",
      canvasTransform: { scale: 0.7, offsetX: 0, offsetY: 0 },
      isPlaying: false,
      currentTime: 0,
      showExportModal: false,
      showNewProjectModal: false,
      showShortcutsModal: false,
      showTemplatesModal: false,
      showCSSPanel: false,
      animationSearchQuery: "",
      animationCategoryFilter: "All",
      snapToGrid: false,
      gridSize: 8,
      showGrid: false,
      showRulers: true,

      setProject: (project) => set({ project }),
      updateProjectMeta: (meta) =>
        set((s) => ({ project: { ...s.project, ...meta, updatedAt: new Date().toISOString() } })),

      saveProject: () => {
        const { project, projects } = get();
        const updated = { ...project, updatedAt: new Date().toISOString() };
        const idx = projects.findIndex((p) => p.id === updated.id);
        const newProjects = idx >= 0 ? projects.map((p, i) => (i === idx ? updated : p)) : [...projects, updated];
        set({ projects: newProjects, project: updated });
      },

      loadProject: (id) => {
        const { projects } = get();
        const p = projects.find((pr) => pr.id === id);
        if (p) set({ project: p, selectedLayerId: null, history: [], historyIndex: -1 });
      },

      createNewProject: (name, width, height) => {
        const newProject: Project = {
          id: generateId(),
          name,
          width,
          height,
          background: "#0d0d1a",
          layers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          duration: 5,
        };
        set({ project: newProject, selectedLayerId: null, history: [], historyIndex: -1 });
      },

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      pushHistory: (description) => {
        const { project, history, historyIndex } = get();
        const entry: HistoryEntry = { layers: JSON.parse(JSON.stringify(project.layers)), description };
        const newHistory = [...history.slice(0, historyIndex + 1), entry].slice(-MAX_HISTORY);
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      undo: () => {
        const { history, historyIndex, project } = get();
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        const entry = history[newIndex];
        set({
          project: { ...project, layers: JSON.parse(JSON.stringify(entry.layers)) },
          historyIndex: newIndex,
          selectedLayerId: null,
        });
      },

      redo: () => {
        const { history, historyIndex, project } = get();
        if (historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        const entry = history[newIndex];
        set({
          project: { ...project, layers: JSON.parse(JSON.stringify(entry.layers)) },
          historyIndex: newIndex,
          selectedLayerId: null,
        });
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      addLayer: (type, overrides) => {
        get().pushHistory(`Add ${type} layer`);
        const layer = createDefaultLayer(type, overrides);
        set((s) => ({
          project: {
            ...s.project,
            layers: [layer, ...s.project.layers],
            updatedAt: new Date().toISOString(),
          },
          selectedLayerId: layer.id,
          activePropertiesTab: "transform",
        }));
      },

      removeLayer: (id) => {
        get().pushHistory("Remove layer");
        set((s) => ({
          project: { ...s.project, layers: s.project.layers.filter((l) => l.id !== id) },
          selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId,
        }));
      },

      duplicateLayer: (id) => {
        get().pushHistory("Duplicate layer");
        const layer = get().project.layers.find((l) => l.id === id);
        if (!layer) return;
        const newLayer = { ...layer, id: generateId(), name: `${layer.name} copy`, x: layer.x + 24, y: layer.y + 24 };
        const idx = get().project.layers.findIndex((l) => l.id === id);
        set((s) => {
          const layers = [...s.project.layers];
          layers.splice(idx, 0, newLayer);
          return { project: { ...s.project, layers }, selectedLayerId: newLayer.id };
        });
      },

      copyLayer: (id) => {
        const layer = get().project.layers.find((l) => l.id === id);
        if (layer) set({ copiedLayer: { ...layer } });
      },

      pasteLayer: () => {
        const { copiedLayer } = get();
        if (!copiedLayer) return;
        get().pushHistory("Paste layer");
        const newLayer = { ...copiedLayer, id: generateId(), name: `${copiedLayer.name} copy`, x: copiedLayer.x + 24, y: copiedLayer.y + 24 };
        set((s) => ({
          project: { ...s.project, layers: [newLayer, ...s.project.layers] },
          selectedLayerId: newLayer.id,
        }));
      },

      selectLayer: (id) => set({ selectedLayerId: id }),
      hoverLayer: (id) => set({ hoveredLayerId: id }),

      updateLayer: (id, updates) =>
        set((s) => ({
          project: {
            ...s.project,
            layers: s.project.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
            updatedAt: new Date().toISOString(),
          },
        })),

      reorderLayers: (fromIndex, toIndex) => {
        const layers = [...get().project.layers];
        const [moved] = layers.splice(fromIndex, 1);
        layers.splice(toIndex, 0, moved);
        set((s) => ({ project: { ...s.project, layers } }));
      },

      toggleLayerVisibility: (id) => {
        const layer = get().project.layers.find((l) => l.id === id);
        if (layer) get().updateLayer(id, { visible: !layer.visible });
      },

      toggleLayerLock: (id) => {
        const layer = get().project.layers.find((l) => l.id === id);
        if (layer) get().updateLayer(id, { locked: !layer.locked });
      },

      moveLayerUp: (id) => {
        const layers = get().project.layers;
        const idx = layers.findIndex((l) => l.id === id);
        if (idx > 0) get().reorderLayers(idx, idx - 1);
      },

      moveLayerDown: (id) => {
        const layers = get().project.layers;
        const idx = layers.findIndex((l) => l.id === id);
        if (idx < layers.length - 1) get().reorderLayers(idx, idx + 1);
      },

      clearSelection: () => set({ selectedLayerId: null }),

      groupSelectedLayers: () => {
        // Future: group multiple layers
      },

      setActiveTool: (tool) => set({ activeTool: tool }),
      setActivePanelTab: (tab) => set({ activePanelTab: tab }),
      setActivePropertiesTab: (tab) => set({ activePropertiesTab: tab }),
      setCanvasTransform: (transform) =>
        set((s) => ({ canvasTransform: { ...s.canvasTransform, ...transform } })),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setShowExportModal: (show) => set({ showExportModal: show }),
      setShowNewProjectModal: (show) => set({ showNewProjectModal: show }),
      setShowShortcutsModal: (show) => set({ showShortcutsModal: show }),
      setShowTemplatesModal: (show) => set({ showTemplatesModal: show }),
      setShowCSSPanel: (show) => set({ showCSSPanel: show }),
      setAnimationSearchQuery: (q) => set({ animationSearchQuery: q }),
      setAnimationCategoryFilter: (cat) => set({ animationCategoryFilter: cat }),
      setSnapToGrid: (snap) => set({ snapToGrid: snap }),
      setShowGrid: (show) => set({ showGrid: show }),
      setShowRulers: (show) => set({ showRulers: show }),

      zoomIn: () => set((s) => ({ canvasTransform: { ...s.canvasTransform, scale: Math.min(s.canvasTransform.scale * 1.25, 5) } })),
      zoomOut: () => set((s) => ({ canvasTransform: { ...s.canvasTransform, scale: Math.max(s.canvasTransform.scale / 1.25, 0.08) } })),
      zoomFit: () => set({ canvasTransform: { scale: 0.7, offsetX: 0, offsetY: 0 } }),
      zoomTo: (scale) => set((s) => ({ canvasTransform: { ...s.canvasTransform, scale } })),

      getSelectedLayer: () => {
        const { project, selectedLayerId } = get();
        return project.layers.find((l) => l.id === selectedLayerId) || null;
      },
    }),
    { name: "animastudio-v2", partialize: (s) => ({ projects: s.projects, project: s.project }) }
  )
);
