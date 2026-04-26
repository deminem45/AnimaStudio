import { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { toast } from "sonner";

export default function ProjectManager({ onClose }: { onClose: () => void }) {
  const { projects, project, loadProject, deleteProject, createNewProject, saveProject } = useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const sorted = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleLoad = (id: string) => {
    if (id === project.id) { onClose(); return; }
    saveProject();
    loadProject(id);
    onClose();
    toast.success("Project loaded");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === project.id) { toast.error("Cannot delete the active project"); return; }
    deleteProject(id);
    toast.success("Project deleted");
  };

  const handleRenameStart = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const handleRenameCommit = (id: string) => {
    if (editName.trim() && id === project.id) {
      useEditorStore.getState().updateProjectMeta({ name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleNew = () => {
    saveProject();
    createNewProject("New Project", 1280, 720);
    onClose();
    toast.success("New project created");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-studio-panel border border-studio-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border">
          <div>
            <h2 className="font-display font-bold text-base text-studio-text">Projects</h2>
            <p className="text-xs text-studio-subtle mt-0.5">{projects.length} saved project{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNew}
              className="studio-btn-primary text-xs px-3 h-8 flex items-center gap-1.5"
            >
              <span>+</span> New Project
            </button>
            <button onClick={onClose} className="studio-btn-icon w-8 h-8">✕</button>
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto scrollbar-studio p-3 space-y-2">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="text-4xl opacity-20">◈</div>
              <p className="text-sm text-studio-subtle">No saved projects yet</p>
              <button onClick={handleNew} className="studio-btn-primary text-xs px-4 h-8">
                Create First Project
              </button>
            </div>
          ) : (
            sorted.map(p => {
              const isActive = p.id === project.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleLoad(p.id)}
                  className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-studio-accent/8 border-studio-accent/30"
                      : "bg-studio-surface border-studio-border hover:border-studio-accent/20 hover:bg-studio-hover"
                  }`}
                >
                  {/* Canvas mini-preview */}
                  <div
                    className="w-16 h-10 rounded-lg flex items-center justify-center shrink-0 border border-studio-border/50 relative overflow-hidden"
                    style={{
                      background: p.background.startsWith("linear") || p.background.startsWith("radial")
                        ? p.background : p.background === "transparent"
                        ? "repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 8px 8px"
                        : p.background,
                    }}
                  >
                    <span className="text-[8px] font-mono text-white/40 absolute bottom-0.5 right-1">
                      {p.layers.length}L
                    </span>
                    {isActive && (
                      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-studio-accent" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {editingId === p.id ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={() => handleRenameCommit(p.id)}
                        onKeyDown={e => { if (e.key === "Enter") handleRenameCommit(p.id); if (e.key === "Escape") setEditingId(null); }}
                        className="property-input text-sm h-7 w-full"
                        autoFocus
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-studio-text truncate">{p.name}</span>
                        {isActive && (
                          <span className="text-[9px] bg-studio-accent/20 text-studio-accent px-1.5 py-0.5 rounded-full font-semibold">Active</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-studio-subtle font-mono">{p.width}×{p.height}</span>
                      <span className="text-studio-border">·</span>
                      <span className="text-[10px] text-studio-subtle">{p.layers.length} layers</span>
                      <span className="text-studio-border">·</span>
                      <span className="text-[10px] text-studio-subtle">{formatDate(p.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => handleRenameStart(p.id, p.name, e)}
                      className="studio-btn-icon w-7 h-7 text-xs"
                      title="Rename"
                    >
                      ✎
                    </button>
                    <button
                      onClick={e => handleDelete(p.id, e)}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-studio-error/15 hover:text-studio-error text-studio-subtle transition-all text-xs"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-studio-border px-5 py-3 flex items-center justify-between">
          <span className="text-[10px] text-studio-subtle">Projects are saved locally in your browser</span>
          <button
            onClick={() => { saveProject(); toast.success("Project saved"); }}
            className="text-xs text-studio-accent hover:text-studio-accent-dim transition-colors"
          >
            Save Current ↑
          </button>
        </div>
      </div>
    </div>
  );
}
