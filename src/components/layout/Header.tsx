import { useEditorStore } from "@/stores/editorStore";
import { exportToHTML, exportToJS } from "@/lib/exportUtils";
import { downloadFile } from "@/lib/utils";
import { toast } from "sonner";
import logoIcon from "@/assets/logo-icon.png";
import { useState } from "react";
import ProjectManager from "@/components/features/ProjectManager";

const ZOOM_LEVELS = [10, 25, 50, 75, 100, 125, 150, 200];

export default function Header() {
  const {
    project, saveProject, setShowNewProjectModal,
    isPlaying, setIsPlaying, zoomIn, zoomOut, zoomFit, zoomTo, canvasTransform,
    undo, redo, canUndo, canRedo,
    setShowShortcutsModal, setShowTemplatesModal, setShowCSSPanel, showCSSPanel,
    snapToGrid, setSnapToGrid, showGrid, setShowGrid, showRulers, setShowRulers,
    historyIndex, history,
  } = useEditorStore();

  const [showProjectManager, setShowProjectManager] = useState(false);

  const handleExportHTML = () => {
    const html = exportToHTML(project);
    downloadFile(html, `${project.name}.html`, "text/html");
    toast.success(`Exported "${project.name}.html"`, { description: `${project.layers.length} layers · ${project.width}×${project.height}` });
  };

  const handleExportJS = () => {
    const js = exportToJS(project);
    downloadFile(js, `${project.name}.js`, "text/javascript");
    toast.success(`Exported "${project.name}.js"`);
  };

  const handleCopyHTML = () => {
    const html = exportToHTML(project);
    navigator.clipboard.writeText(html).then(() => {
      toast.success("HTML copied to clipboard", { description: "Paste it anywhere to embed your animation" });
    });
  };

  const handleSave = () => {
    saveProject();
    toast.success("Project saved", { description: "Stored locally in your browser" });
  };

  const zoomPct = Math.round(canvasTransform.scale * 100);
  const canUndoVal = canUndo();
  const canRedoVal = canRedo();

  return (
    <>
      <header className="flex items-center justify-between px-3 h-11 bg-studio-panel border-b border-studio-border shrink-0 z-50 gap-2">
        {/* Left: Logo + Menus */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <img src={logoIcon} alt="AnimaStudio" className="w-6 h-6 rounded" />
            <span className="font-display font-bold text-sm text-studio-text tracking-tight hidden md:block">AnimaStudio</span>
          </div>

          <div className="w-px h-4 bg-studio-border shrink-0" />

          {/* File Menu */}
          <div className="relative group shrink-0">
            <button className="studio-btn text-xs px-2.5 py-1.5 h-7">File</button>
            <div className="header-dropdown">
              <button onClick={() => setShowNewProjectModal(true)} className="dropdown-item">
                <kbd className="shortcut-key">⌘N</kbd>
                <span>New Project</span>
              </button>
              <button onClick={() => setShowProjectManager(true)} className="dropdown-item">
                <kbd className="shortcut-key">⌘P</kbd>
                <span>Projects…</span>
              </button>
              <button onClick={() => setShowTemplatesModal(true)} className="dropdown-item">
                <kbd className="shortcut-key">⌘T</kbd>
                <span>Templates</span>
              </button>
              <div className="border-t border-studio-border my-1" />
              <button onClick={handleSave} className="dropdown-item">
                <kbd className="shortcut-key">⌘S</kbd>
                <span>Save</span>
              </button>
              <div className="border-t border-studio-border my-1" />
              <button onClick={handleExportHTML} className="dropdown-item">
                <span className="text-orange-400 font-mono text-[10px] bg-orange-400/10 px-1.5 py-0.5 rounded">HTML</span>
                <span>Export HTML</span>
              </button>
              <button onClick={handleCopyHTML} className="dropdown-item">
                <span className="text-cyan-400 font-mono text-[10px] bg-cyan-400/10 px-1.5 py-0.5 rounded">⧉</span>
                <span>Copy HTML</span>
              </button>
            </div>
          </div>

          <div className="relative group shrink-0">
            <button className="studio-btn text-xs px-2.5 py-1.5 h-7">Edit</button>
            <div className="header-dropdown">
              <button onClick={() => { if (canUndoVal) undo(); }} disabled={!canUndoVal} className="dropdown-item disabled:opacity-40">
                <kbd className="shortcut-key">⌘Z</kbd>
                <span>Undo {history[historyIndex]?.description}</span>
              </button>
              <button onClick={() => { if (canRedoVal) redo(); }} disabled={!canRedoVal} className="dropdown-item disabled:opacity-40">
                <kbd className="shortcut-key">⇧⌘Z</kbd>
                <span>Redo</span>
              </button>
            </div>
          </div>

          <div className="relative group shrink-0">
            <button className="studio-btn text-xs px-2.5 py-1.5 h-7">View</button>
            <div className="header-dropdown">
              <button onClick={() => setShowGrid(!showGrid)} className="dropdown-item">
                <span className={`w-3 h-3 rounded-sm border ${showGrid ? "bg-studio-accent border-studio-accent" : "border-studio-border"}`} />
                <span>Grid  <kbd className="ml-1 text-[9px] font-mono text-studio-subtle">G</kbd></span>
              </button>
              <button onClick={() => setShowRulers(!showRulers)} className="dropdown-item">
                <span className={`w-3 h-3 rounded-sm border ${showRulers ? "bg-studio-accent border-studio-accent" : "border-studio-border"}`} />
                <span>Rulers  <kbd className="ml-1 text-[9px] font-mono text-studio-subtle">R</kbd></span>
              </button>
              <button onClick={() => setSnapToGrid(!snapToGrid)} className="dropdown-item">
                <span className={`w-3 h-3 rounded-sm border ${snapToGrid ? "bg-studio-accent border-studio-accent" : "border-studio-border"}`} />
                <span>Snap to Grid</span>
              </button>
              <div className="border-t border-studio-border my-1" />
              <button onClick={() => setShowCSSPanel(!showCSSPanel)} className="dropdown-item">
                <span className={`w-3 h-3 rounded-sm border ${showCSSPanel ? "bg-studio-accent border-studio-accent" : "border-studio-border"}`} />
                <span>CSS Panel</span>
              </button>
            </div>
          </div>

          <div className="w-px h-4 bg-studio-border shrink-0" />

          {/* Undo/Redo */}
          <button onClick={() => { if (canUndoVal) undo(); }} disabled={!canUndoVal} title="Undo (⌘Z)"
            className="studio-btn-icon w-7 h-7 disabled:opacity-30 shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button onClick={() => { if (canRedoVal) redo(); }} disabled={!canRedoVal} title="Redo (⇧⌘Z)"
            className="studio-btn-icon w-7 h-7 disabled:opacity-30 shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>

          {/* Projects Button */}
          <button
            onClick={() => setShowProjectManager(true)}
            title="Project Manager (⌘P)"
            className="studio-btn-icon w-7 h-7 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>

          {/* Editable project name */}
          <input
            value={project.name}
            onChange={e => useEditorStore.getState().updateProjectMeta({ name: e.target.value })}
            className="bg-transparent text-sm text-studio-text font-medium border-b border-transparent hover:border-studio-border focus:border-studio-accent/60 focus:outline-none px-1 py-0.5 w-32 md:w-40 transition-colors"
            spellCheck={false}
          />
        </div>

        {/* Center: Zoom + Playback */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={zoomOut} className="studio-btn-icon w-7 h-7" title="Zoom Out (-)">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <div className="relative group">
            <button className="text-xs text-studio-muted hover:text-studio-text transition-colors font-mono w-12 text-center py-1 hover:bg-studio-hover rounded">
              {zoomPct}%
            </button>
            <div className="header-dropdown left-1/2 -translate-x-1/2 w-28">
              {ZOOM_LEVELS.map(z => (
                <button key={z} onClick={() => zoomTo(z / 100)} className={`dropdown-item ${zoomPct === z ? "text-studio-accent" : ""}`}>
                  <span className="font-mono">{z}%</span>
                </button>
              ))}
              <div className="border-t border-studio-border my-1" />
              <button onClick={zoomFit} className="dropdown-item">Fit to Screen</button>
            </div>
          </div>
          <button onClick={zoomIn} className="studio-btn-icon w-7 h-7" title="Zoom In (+)">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          <div className="w-px h-4 bg-studio-border mx-1" />
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all h-7 ${isPlaying ? "bg-studio-error/20 text-studio-error hover:bg-studio-error/30" : "bg-studio-accent/15 text-studio-accent hover:bg-studio-accent/25 border border-studio-accent/30"}`}
          >
            {isPlaying ? (
              <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>Pause</>
            ) : (
              <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Preview</>
            )}
          </button>
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setShowCSSPanel(!showCSSPanel)} title="CSS Preview"
            className={`studio-btn-icon w-7 h-7 text-[10px] font-bold font-mono ${showCSSPanel ? "text-studio-accent bg-studio-accent/10" : ""}`}>
            CSS
          </button>
          <button onClick={() => setShowShortcutsModal(true)} title="Keyboard Shortcuts (?)"
            className="studio-btn-icon w-7 h-7">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
            </svg>
          </button>
          <div className="w-px h-4 bg-studio-border" />
          <span className="text-xs text-studio-subtle font-mono hidden lg:block">{project.width}×{project.height}</span>

          {/* Export dropdown */}
          <div className="relative group">
            <button className="studio-btn-primary text-xs flex items-center gap-1.5 h-7 px-3">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
              <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="header-dropdown right-0 w-52">
              <button onClick={handleExportHTML} className="dropdown-item">
                <span className="text-orange-400 font-mono text-[10px] bg-orange-400/10 px-1.5 py-0.5 rounded">HTML</span>
                <span>Export as HTML file</span>
              </button>
              <button onClick={handleExportJS} className="dropdown-item">
                <span className="text-yellow-400 font-mono text-[10px] bg-yellow-400/10 px-1.5 py-0.5 rounded">JS</span>
                <span>Export as JavaScript</span>
              </button>
              <div className="border-t border-studio-border my-1" />
              <button onClick={handleCopyHTML} className="dropdown-item">
                <span className="text-studio-accent font-mono text-[10px] bg-studio-accent/10 px-1.5 py-0.5 rounded">⧉</span>
                <span>Copy HTML to clipboard</span>
              </button>
              <div className="border-t border-studio-border my-1" />
              <button onClick={handleSave} className="dropdown-item">
                <span className="text-green-400 font-mono text-[10px] bg-green-400/10 px-1.5 py-0.5 rounded">↑</span>
                <span>Save project</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {showProjectManager && <ProjectManager onClose={() => setShowProjectManager(false)} />}
    </>
  );
}
