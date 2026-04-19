import { useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";

const RULER_MARKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function BottomTimeline() {
  const {
    project, isPlaying, setIsPlaying, currentTime, setCurrentTime,
    selectedLayerId, updateLayer,
  } = useEditorStore();

  const trackRef = useRef<HTMLDivElement>(null);

  const handleScrubberClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(pct * project.duration);
  };

  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);
  const scrubPct = (currentTime / project.duration) * 100;

  return (
    <div className="h-36 bg-studio-panel border-t border-studio-border flex flex-col shrink-0">
      {/* Timeline header */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-studio-border">
        <button
          onClick={() => { setCurrentTime(0); setIsPlaying(false); }}
          className="studio-btn-icon"
          title="Go to start"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${isPlaying ? "bg-studio-error/20 text-studio-error" : "bg-studio-accent/10 text-studio-accent"}`}
        >
          {isPlaying ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>

        <span className="text-xs font-mono text-studio-muted">
          {currentTime.toFixed(2)}s / {project.duration.toFixed(1)}s
        </span>

        <div className="flex-1" />

        <div className="text-xs text-studio-subtle">
          {project.layers.length} layers
          {selectedLayer ? ` · ${selectedLayer.name}` : ""}
        </div>
      </div>

      {/* Ruler */}
      <div className="flex relative" style={{ height: 16 }}>
        <div className="w-32 shrink-0 border-r border-studio-border" />
        <div className="flex-1 relative overflow-hidden">
          <div className="flex items-end h-full">
            {RULER_MARKS.map(mark => (
              <div key={mark} className="flex-1 relative" style={{ minWidth: 0 }}>
                <div className="absolute bottom-0 left-0 w-px h-2 bg-studio-border" />
                <span className="absolute bottom-2 left-0.5 text-[8px] text-studio-subtle font-mono">
                  {((mark / 100) * project.duration).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="flex-1 overflow-y-auto scrollbar-studio relative">
        {/* Scrubber */}
        <div
          ref={trackRef}
          className="absolute inset-0 left-32 cursor-crosshair"
          onClick={handleScrubberClick}
        >
          <div
            className="absolute top-0 bottom-0 w-px bg-studio-accent z-10 pointer-events-none"
            style={{ left: `${scrubPct}%` }}
          >
            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-studio-accent rounded-full" />
          </div>
        </div>

        {project.layers.map((layer) => (
          <div key={layer.id} className={`timeline-track flex items-center ${layer.id === selectedLayerId ? "bg-studio-accent/5" : ""}`}>
            {/* Layer label */}
            <div
              className="w-32 px-2 shrink-0 flex items-center gap-1.5 border-r border-studio-border h-full cursor-pointer hover:bg-studio-hover transition-colors"
              onClick={() => useEditorStore.getState().selectLayer(layer.id)}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${layer.visible ? "bg-studio-accent" : "bg-studio-subtle"}`} />
              <span className="text-[10px] text-studio-muted truncate">{layer.name}</span>
            </div>

            {/* Animation bar */}
            <div className="flex-1 relative h-full">
              {layer.animation?.presetId && (
                <div
                  className="absolute top-1 h-6 rounded-sm bg-studio-accent/30 border border-studio-accent/50 flex items-center px-1.5 cursor-pointer hover:bg-studio-accent/40 transition-colors"
                  style={{
                    left: `${(layer.animation.delay / project.duration) * 100}%`,
                    width: `${Math.min((layer.animation.duration / project.duration) * 100, 100 - (layer.animation.delay / project.duration) * 100)}%`,
                  }}
                  onClick={() => useEditorStore.getState().selectLayer(layer.id)}
                  title={`${layer.animation.presetId} — ${layer.animation.duration}s`}
                >
                  <span className="text-[9px] text-studio-accent truncate font-medium">{layer.animation.presetId}</span>
                  {/* Keyframe dots */}
                  <div className="keyframe-dot" style={{ left: 0, right: "auto" }} />
                  <div className="keyframe-dot" style={{ right: 0, left: "auto" }} />
                </div>
              )}
            </div>
          </div>
        ))}

        {project.layers.length === 0 && (
          <div className="flex items-center justify-center h-full text-xs text-studio-subtle">
            Add layers to see them in the timeline
          </div>
        )}
      </div>
    </div>
  );
}
