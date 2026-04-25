import { useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";

const RULER_COUNT = 12;

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
    if (isPlaying) setIsPlaying(false);
  };

  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);
  const scrubPct = project.duration > 0 ? (currentTime / project.duration) * 100 : 0;

  const marks = Array.from({ length: RULER_COUNT + 1 }, (_, i) => i / RULER_COUNT);

  return (
    <div className="h-32 bg-studio-panel border-t border-studio-border flex flex-col shrink-0">
      {/* Timeline header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-studio-border">
        <button
          onClick={() => { setCurrentTime(0); setIsPlaying(false); }}
          className="studio-btn-icon w-6 h-6"
          title="Reset"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${isPlaying ? "bg-studio-error/15 text-studio-error" : "bg-studio-accent/15 text-studio-accent border border-studio-accent/20"}`}
        >
          {isPlaying ? (
            <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>Pause</>
          ) : (
            <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Play</>
          )}
        </button>

        {/* Time display */}
        <div className="font-mono text-xs text-studio-muted bg-studio-bg border border-studio-border rounded px-2 py-0.5">
          {currentTime.toFixed(2)}s
        </div>
        <span className="text-studio-border text-xs">/</span>
        <div className="font-mono text-xs text-studio-muted">
          {project.duration.toFixed(1)}s
        </div>

        <div className="flex-1" />

        {/* Quick duration adjust */}
        <div className="flex items-center gap-1 text-xs text-studio-subtle">
          <span>Duration:</span>
          <input
            type="number"
            value={project.duration}
            min={0.5}
            max={120}
            step={0.5}
            onChange={e => useEditorStore.getState().updateProjectMeta({ duration: +e.target.value })}
            className="bg-studio-bg border border-studio-border text-studio-text text-xs font-mono w-14 px-1.5 py-0.5 rounded focus:outline-none focus:border-studio-accent/60"
          />
          <span className="text-studio-subtle">s</span>
        </div>

        {selectedLayer && (
          <span className="text-[10px] text-studio-muted border-l border-studio-border pl-2 ml-1">
            <span className="text-studio-accent">●</span> {selectedLayer.name}
          </span>
        )}
      </div>

      {/* Ruler */}
      <div className="flex" style={{ height: 16 }}>
        <div className="w-36 shrink-0 border-r border-studio-border bg-studio-surface" />
        <div className="flex-1 relative overflow-hidden bg-studio-surface border-b border-studio-border">
          {marks.map((m, i) => {
            const pct = m * 100;
            const time = m * project.duration;
            const isMajor = i % 3 === 0;
            return (
              <div key={i} className="absolute top-0 bottom-0 flex flex-col items-start" style={{ left: `${pct}%` }}>
                <div className={`w-px mt-auto ${isMajor ? "h-3 bg-studio-border" : "h-2 bg-studio-border/50"}`} />
                {isMajor && (
                  <span className="absolute bottom-3 text-[8px] text-studio-subtle font-mono" style={{ left: 2 }}>
                    {time.toFixed(1)}s
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracks area */}
      <div className="flex-1 overflow-y-auto scrollbar-studio relative">
        {/* Scrubber overlay */}
        <div
          ref={trackRef}
          className="absolute top-0 bottom-0 left-36 right-0 cursor-crosshair z-20"
          onClick={handleScrubberClick}
        >
          {/* Scrubber line */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: `${scrubPct}%` }}
          >
            <div className="absolute top-0 bottom-0 w-px bg-studio-accent/80" />
            <div className="absolute -top-0 -left-1.5 w-3 h-3 bg-studio-accent rounded-sm transform rotate-45 scale-75" />
          </div>
        </div>

        {project.layers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-studio-subtle">
            Add layers to see them in the timeline
          </div>
        ) : (
          project.layers.map((layer) => {
            const anim = layer.animation;
            const delayPct = anim ? (anim.delay / project.duration) * 100 : 0;
            const durationPct = anim ? Math.min((anim.duration / project.duration) * 100, 100 - delayPct) : 0;

            return (
              <div key={layer.id} className={`timeline-track flex items-center ${layer.id === selectedLayerId ? "bg-studio-accent/5 border-l border-studio-accent/30" : ""}`}>
                {/* Layer label */}
                <div
                  className="w-36 px-2 shrink-0 flex items-center gap-1.5 border-r border-studio-border h-full cursor-pointer hover:bg-studio-hover transition-colors"
                  onClick={() => useEditorStore.getState().selectLayer(layer.id)}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${layer.visible ? "bg-studio-accent" : "bg-studio-subtle"}`} />
                  <span className="text-[10px] text-studio-muted truncate">{layer.name}</span>
                  {layer.animation && (
                    <span className="ml-auto text-[8px] text-studio-accent shrink-0">✦</span>
                  )}
                </div>

                {/* Animation bar */}
                <div className="flex-1 relative h-full">
                  {/* Base track */}
                  <div className="absolute inset-y-1.5 left-0 right-0 bg-studio-bg/30 rounded-sm" />

                  {anim?.presetId && (
                    <div
                      className="absolute top-1 h-6 rounded cursor-pointer transition-colors group/bar"
                      style={{
                        left: `${delayPct}%`,
                        width: `${durationPct}%`,
                        minWidth: 24,
                        background: "linear-gradient(90deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))",
                        border: "1px solid rgba(0,212,255,0.4)",
                      }}
                      onClick={() => useEditorStore.getState().selectLayer(layer.id)}
                      title={`${anim.presetId} — ${anim.duration}s delay:${anim.delay}s`}
                    >
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-studio-accent font-medium truncate max-w-full pr-3">
                        {anim.presetId}
                      </span>
                      <div className="keyframe-dot" style={{ left: -4, right: "auto" }} />
                      <div className="keyframe-dot" style={{ right: -4, left: "auto" }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
