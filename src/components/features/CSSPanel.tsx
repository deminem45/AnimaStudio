import { useEditorStore } from "@/stores/editorStore";
import { ANIMATION_PRESETS } from "@/constants/animations";
import { generateLayerCSS } from "@/lib/exportUtils";

export default function CSSPanel() {
  const { selectedLayerId, project, showCSSPanel, setShowCSSPanel } = useEditorStore();
  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);

  if (!showCSSPanel) return null;

  const cssCode = selectedLayer ? generateLayerCSS(selectedLayer) : `/* Select a layer to see its CSS */`;
  const animPreset = selectedLayer?.animation?.presetId
    ? ANIMATION_PRESETS.find(p => p.id === selectedLayer.animation!.presetId)
    : null;

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
  };

  return (
    <div className="w-60 bg-studio-panel border-l border-studio-border flex flex-col overflow-hidden shrink-0 animate-slide-in-right">
      <div className="flex items-center justify-between px-3 py-2 border-b border-studio-border">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold font-mono text-studio-accent">CSS</span>
          <span className="text-xs text-studio-muted">Live Preview</span>
        </div>
        <div className="flex gap-1">
          <button onClick={copyCSS} title="Copy CSS"
            className="studio-btn-icon w-6 h-6 text-[10px]">
            ⧉
          </button>
          <button onClick={() => setShowCSSPanel(false)} className="studio-btn-icon w-6 h-6 text-[10px]">✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-studio p-3">
        {/* CSS Code Block */}
        <div className="bg-studio-bg rounded-lg border border-studio-border p-3 font-mono text-[10px] leading-relaxed overflow-x-auto">
          <pre className="text-studio-text whitespace-pre-wrap break-all">{cssCode}</pre>
        </div>

        {/* Animation keyframe info */}
        {animPreset && (
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-studio-subtle mb-2">Animation: {animPreset.name}</div>
            <div className="bg-studio-bg rounded-lg border border-studio-border p-3 font-mono text-[10px] leading-relaxed">
              <pre className="text-studio-accent whitespace-pre-wrap">{`@keyframes ${animPreset.id} {
  /* ${animPreset.category} preset */
  /* Duration: ${animPreset.duration}s */
  /* Easing: ${animPreset.easing} */
}`}</pre>
            </div>
          </div>
        )}

        {/* Layer summary */}
        {selectedLayer && (
          <div className="mt-3 space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-studio-subtle">Properties</div>
            {[
              { k: "type", v: selectedLayer.type },
              { k: "opacity", v: `${selectedLayer.opacity}%` },
              { k: "blend", v: selectedLayer.blendMode },
              ...(selectedLayer.filters?.length ? [{ k: "filters", v: `${selectedLayer.filters.length} active` }] : []),
              ...(selectedLayer.glowColor ? [{ k: "glow", v: selectedLayer.glowColor }] : []),
            ].map(({ k, v }) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-[10px] text-studio-subtle font-mono">{k}</span>
                <span className="text-[10px] text-studio-text font-mono">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
