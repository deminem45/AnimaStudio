import { useEditorStore } from "@/stores/editorStore";
import { exportToHTML, exportToJS } from "@/lib/exportUtils";
import { downloadFile } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";

export default function Header() {
  const {
    project, saveProject, setShowExportModal, setShowNewProjectModal,
    isPlaying, setIsPlaying, zoomIn, zoomOut, zoomFit, canvasTransform,
  } = useEditorStore();

  const handleExportHTML = () => {
    const html = exportToHTML(project);
    downloadFile(html, `${project.name}.html`, "text/html");
  };

  const handleExportJS = () => {
    const js = exportToJS(project);
    downloadFile(js, `${project.name}.js`, "text/javascript");
  };

  return (
    <header className="flex items-center justify-between px-4 h-12 bg-studio-panel border-b border-studio-border shrink-0 z-50">
      {/* Left: Logo + Project */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src={logoIcon} alt="AnimaStudio" className="w-7 h-7 rounded-md" />
          <span className="font-display font-bold text-sm text-studio-text tracking-tight">AnimaStudio</span>
        </div>
        <div className="w-px h-5 bg-studio-border" />
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="studio-btn text-xs"
          title="New Project"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
        <button
          onClick={saveProject}
          className="studio-btn text-xs"
          title="Save (Ctrl+S)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </button>

        {/* Editable project name */}
        <input
          value={project.name}
          onChange={(e) => useEditorStore.getState().updateProjectMeta({ name: e.target.value })}
          className="bg-transparent text-sm text-studio-text font-medium border-b border-transparent hover:border-studio-border focus:border-studio-accent/60 focus:outline-none px-1 py-0.5 w-40 transition-colors"
          spellCheck={false}
        />
      </div>

      {/* Center: Playback + Zoom */}
      <div className="flex items-center gap-1">
        <button onClick={zoomOut} className="studio-btn-icon" title="Zoom Out">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button onClick={zoomFit} className="text-xs text-studio-muted hover:text-studio-text transition-colors font-mono w-12 text-center">
          {Math.round(canvasTransform.scale * 100)}%
        </button>
        <button onClick={zoomIn} className="studio-btn-icon" title="Zoom In">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>

        <div className="w-px h-5 bg-studio-border mx-2" />

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isPlaying ? "bg-studio-error/20 text-studio-error hover:bg-studio-error/30" : "bg-studio-accent/10 text-studio-accent hover:bg-studio-accent/20"}`}
        >
          {isPlaying ? (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
              Pause Preview
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Preview
            </>
          )}
        </button>
      </div>

      {/* Right: Canvas Size + Export */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-studio-subtle font-mono">
          {project.width} × {project.height}
        </span>
        <div className="w-px h-5 bg-studio-border" />

        <div className="relative group">
          <button className="studio-btn-primary text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="absolute right-0 top-full mt-1 w-44 bg-studio-panel border border-studio-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
            <button onClick={handleExportHTML} className="w-full text-left px-3 py-2.5 text-sm text-studio-text hover:bg-studio-hover rounded-t-lg flex items-center gap-2 transition-colors">
              <span className="text-orange-400 font-mono text-xs">HTML</span>
              Export as HTML file
            </button>
            <button onClick={handleExportJS} className="w-full text-left px-3 py-2.5 text-sm text-studio-text hover:bg-studio-hover flex items-center gap-2 transition-colors">
              <span className="text-yellow-400 font-mono text-xs">JS</span>
              Export as JavaScript
            </button>
            <button
              onClick={() => { handleExportHTML(); handleExportJS(); }}
              className="w-full text-left px-3 py-2.5 text-sm text-studio-text hover:bg-studio-hover rounded-b-lg flex items-center gap-2 transition-colors border-t border-studio-border"
            >
              <span className="text-studio-accent font-mono text-xs">PKG</span>
              Export Package (HTML+JS)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
