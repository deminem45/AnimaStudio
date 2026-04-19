import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, Layer, LayerType, CanvasTransform, PanelTab, PropertiesTab, ActiveTool } from "@/types";
import { generateId } from "@/lib/utils";

interface EditorStore {
  // Project state
  project: Project;
  projects: Project[];
  selectedLayerId: string | null;
  hoveredLayerId: string | null;

  // UI state
  activeTool: ActiveTool;
  activePanelTab: PanelTab;
  activePropertiesTab: PropertiesTab;
  canvasTransform: CanvasTransform;
  isPlaying: boolean;
  currentTime: number;
  showExportModal: boolean;
  showNewProjectModal: boolean;
  animationSearchQuery: string;
  animationCategoryFilter: string;

  // Actions
  setProject: (project: Project) => void;
  updateProjectMeta: (meta: Partial<Pick<Project, "name" | "width" | "height" | "background" | "duration">>) => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  createNewProject: (name: string, width: number, height: number) => void;
  deleteProject: (id: string) => void;

  // Layer actions
  addLayer: (type: LayerType, overrides?: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  hoverLayer: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  clearSelection: () => void;

  // UI actions
  setActiveTool: (tool: ActiveTool) => void;
  setActivePanelTab: (tab: PanelTab) => void;
  setActivePropertiesTab: (tab: PropertiesTab) => void;
  setCanvasTransform: (transform: Partial<CanvasTransform>) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setShowExportModal: (show: boolean) => void;
  setShowNewProjectModal: (show: boolean) => void;
  setAnimationSearchQuery: (q: string) => void;
  setAnimationCategoryFilter: (cat: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;

  // Getters
  getSelectedLayer: () => Layer | null;
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
    return { ...base, width: 300, height: 60, content: "Double click to edit", color: "#ffffff", fontSize: 28, fontFamily: "Inter, sans-serif", fontWeight: "600", textAlign: "left", ...overrides };
  }
  if (type === "shape") {
    return { ...base, shape: "rect", fill: "#00d4ff", width: 150, height: 150, ...overrides };
  }
  if (type === "icon") {
    return { ...base, width: 80, height: 80, content: "★", color: "#00d4ff", fontSize: 64, ...overrides };
  }
  if (type === "image") {
    return { ...base, src: "", width: 300, height: 200, ...overrides };
  }
  if (type === "html") {
    return { ...base, content: "<div style='padding:16px;background:rgba(0,212,255,0.1);border:1px solid #00d4ff;border-radius:8px;color:#fff'>HTML Element</div>", width: 300, height: 120, ...overrides };
  }
  return base;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      project: DEFAULT_PROJECT,
      projects: [],
      selectedLayerId: null,
      hoveredLayerId: null,
      activeTool: "select",
      activePanelTab: "layers",
      activePropertiesTab: "transform",
      canvasTransform: { scale: 0.75, offsetX: 0, offsetY: 0 },
      isPlaying: false,
      currentTime: 0,
      showExportModal: false,
      showNewProjectModal: false,
      animationSearchQuery: "",
      animationCategoryFilter: "All",

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
        if (p) set({ project: p, selectedLayerId: null });
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
        set({ project: newProject, selectedLayerId: null });
      },

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      addLayer: (type, overrides) => {
        const layer = createDefaultLayer(type, overrides);
        set((s) => ({
          project: {
            ...s.project,
            layers: [layer, ...s.project.layers],
            updatedAt: new Date().toISOString(),
          },
          selectedLayerId: layer.id,
        }));
      },

      removeLayer: (id) =>
        set((s) => ({
          project: { ...s.project, layers: s.project.layers.filter((l) => l.id !== id) },
          selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId,
        })),

      duplicateLayer: (id) => {
        const layer = get().project.layers.find((l) => l.id === id);
        if (!layer) return;
        const newLayer = { ...layer, id: generateId(), name: `${layer.name} (copy)`, x: layer.x + 20, y: layer.y + 20 };
        const idx = get().project.layers.findIndex((l) => l.id === id);
        set((s) => {
          const layers = [...s.project.layers];
          layers.splice(idx, 0, newLayer);
          return { project: { ...s.project, layers }, selectedLayerId: newLayer.id };
        });
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

      setActiveTool: (tool) => set({ activeTool: tool }),
      setActivePanelTab: (tab) => set({ activePanelTab: tab }),
      setActivePropertiesTab: (tab) => set({ activePropertiesTab: tab }),
      setCanvasTransform: (transform) =>
        set((s) => ({ canvasTransform: { ...s.canvasTransform, ...transform } })),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setShowExportModal: (show) => set({ showExportModal: show }),
      setShowNewProjectModal: (show) => set({ showNewProjectModal: show }),
      setAnimationSearchQuery: (q) => set({ animationSearchQuery: q }),
      setAnimationCategoryFilter: (cat) => set({ animationCategoryFilter: cat }),

      zoomIn: () => set((s) => ({ canvasTransform: { ...s.canvasTransform, scale: Math.min(s.canvasTransform.scale * 1.2, 4) } })),
      zoomOut: () => set((s) => ({ canvasTransform: { ...s.canvasTransform, scale: Math.max(s.canvasTransform.scale / 1.2, 0.1) } })),
      zoomFit: () => set({ canvasTransform: { scale: 0.75, offsetX: 0, offsetY: 0 } }),

      getSelectedLayer: () => {
        const { project, selectedLayerId } = get();
        return project.layers.find((l) => l.id === selectedLayerId) || null;
      },
    }),
    { name: "animastudio-store", partialize: (s) => ({ projects: s.projects, project: s.project }) }
  )
);
