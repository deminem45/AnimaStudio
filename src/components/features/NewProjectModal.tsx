import { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { CANVAS_PRESETS } from "@/constants/assets";

export default function NewProjectModal() {
  const { showNewProjectModal, setShowNewProjectModal, createNewProject } = useEditorStore();
  const [name, setName] = useState("Untitled Project");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);

  if (!showNewProjectModal) return null;

  const handleCreate = () => {
    createNewProject(name || "Untitled Project", width, height);
    setShowNewProjectModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-studio-panel border border-studio-border rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-display font-bold text-xl text-studio-text mb-1">New Project</h2>
        <p className="text-sm text-studio-muted mb-5">Configure your canvas dimensions</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-studio-subtle block mb-1.5">Project Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="property-input w-full"
              placeholder="My Project"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-studio-subtle block mb-1.5">Canvas Presets</label>
            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto scrollbar-studio">
              {CANVAS_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => { setWidth(preset.width); setHeight(preset.height); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    width === preset.width && height === preset.height
                      ? "bg-studio-accent/10 border border-studio-accent/40 text-studio-accent"
                      : "bg-studio-hover hover:bg-studio-hover/80 text-studio-muted border border-transparent"
                  }`}
                >
                  <span className="font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-studio-subtle block mb-1.5">Width (px)</label>
              <input type="number" value={width} onChange={e => setWidth(+e.target.value)} min={100} max={4000}
                className="property-input w-full" />
            </div>
            <div>
              <label className="text-xs text-studio-subtle block mb-1.5">Height (px)</label>
              <input type="number" value={height} onChange={e => setHeight(+e.target.value)} min={100} max={4000}
                className="property-input w-full" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowNewProjectModal(false)}
            className="flex-1 py-2 rounded-lg text-sm text-studio-muted hover:text-studio-text hover:bg-studio-hover transition-all border border-studio-border">
            Cancel
          </button>
          <button onClick={handleCreate}
            className="flex-1 studio-btn-primary py-2 rounded-lg">
            Create Project →
          </button>
        </div>
      </div>
    </div>
  );
}
