import { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { ANIMATION_PRESETS } from "@/constants/animations";
import { BLEND_MODES, FONT_FAMILIES, BACKGROUND_PRESETS, CANVAS_PRESETS } from "@/constants/assets";
import { useBackgroundRemoval } from "@/hooks/useBackgroundRemoval";
import AlignmentPanel from "@/components/features/AlignmentPanel";
import type { PropertiesTab, GradientConfig } from "@/types";

const PROP_TABS: { id: PropertiesTab; label: string }[] = [
  { id: "transform", label: "Transform" },
  { id: "style", label: "Style" },
  { id: "animation", label: "Anim" },
  { id: "filters", label: "Filters" },
  { id: "effects", label: "FX" },
];

const COLOR_SWATCHES = [
  "#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#ec4899",
  "#ffffff", "#9ca3af", "#374151", "#000000", "#0d0d1a", "#1e1b4b",
];

function NumberInput({ label, value, onChange, min, max, step = 1, unit = "" }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-studio-subtle w-14 shrink-0">{label}</label>
      <div className="flex items-center flex-1 gap-1">
        <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
          min={min} max={max} step={step} className="property-input text-xs h-7 flex-1" />
        {unit && <span className="text-[10px] text-studio-subtle w-4 shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const handleChange = (color: string) => {
    onChange(color);
    setRecentColors(prev => [color, ...prev.filter(c => c !== color)].slice(0, 8));
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="text-[10px] text-studio-subtle block">{label}</label>}
      <div className="flex gap-2">
        <input type="color" value={value.startsWith("#") ? value : "#ffffff"}
          onChange={e => handleChange(e.target.value)} className="w-8 h-7 rounded cursor-pointer border-0" />
        <input type="text" value={value} onChange={e => handleChange(e.target.value)} className="property-input text-xs h-7 flex-1" />
      </div>
      {/* Swatches */}
      <div className="grid grid-cols-6 gap-1">
        {COLOR_SWATCHES.map(c => (
          <button key={c} onClick={() => handleChange(c)} title={c}
            className={`w-full aspect-square rounded border transition-all ${value === c ? "border-studio-accent scale-110" : "border-studio-border/50 hover:border-studio-accent/50"}`}
            style={{ background: c }} />
        ))}
      </div>
      {recentColors.length > 0 && (
        <div>
          <div className="text-[9px] text-studio-subtle mb-1">Recent</div>
          <div className="flex gap-1 flex-wrap">
            {recentColors.map((c, i) => (
              <button key={i} onClick={() => handleChange(c)} title={c}
                className="w-5 h-5 rounded border border-studio-border/50 hover:border-studio-accent/50 transition-all"
                style={{ background: c }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GradientEditor({ gradient, onChange }: { gradient: GradientConfig; onChange: (g: GradientConfig) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {(["linear", "radial"] as const).map(t => (
          <button key={t} onClick={() => onChange({ ...gradient, type: t })}
            className={`flex-1 py-1 text-[10px] rounded transition-all ${gradient.type === t ? "bg-studio-accent/20 text-studio-accent border border-studio-accent/40" : "bg-studio-hover text-studio-muted"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {gradient.type === "linear" && (
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-studio-subtle w-14">Angle</label>
          <input type="range" min={0} max={360} value={gradient.angle}
            onChange={e => onChange({ ...gradient, angle: +e.target.value })} className="flex-1 h-1.5 accent-studio-accent" />
          <span className="text-[10px] text-studio-text font-mono w-8">{gradient.angle}°</span>
        </div>
      )}
      {/* Gradient preview */}
      <div className="h-5 rounded border border-studio-border" style={{
        background: gradient.type === "radial"
          ? `radial-gradient(circle, ${gradient.stops.map(s => `${s.color} ${s.position}%`).join(",")})`
          : `linear-gradient(${gradient.angle}deg, ${gradient.stops.map(s => `${s.color} ${s.position}%`).join(",")})`,
      }} />
      <div className="space-y-1">
        {gradient.stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input type="color" value={stop.color} onChange={e => {
              const stops = [...gradient.stops];
              stops[i] = { ...stops[i], color: e.target.value };
              onChange({ ...gradient, stops });
            }} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
            <input type="range" min={0} max={100} value={stop.position} onChange={e => {
              const stops = [...gradient.stops];
              stops[i] = { ...stops[i], position: +e.target.value };
              onChange({ ...gradient, stops });
            }} className="flex-1 h-1.5 accent-studio-accent" />
            <span className="text-[10px] text-studio-muted font-mono w-6">{stop.position}%</span>
            {gradient.stops.length > 2 && (
              <button onClick={() => onChange({ ...gradient, stops: gradient.stops.filter((_, j) => j !== i) })}
                className="text-studio-error hover:bg-studio-error/10 rounded w-4 h-4 text-xs flex items-center justify-center">✕</button>
            )}
          </div>
        ))}
        <button onClick={() => onChange({ ...gradient, stops: [...gradient.stops, { color: "#7c3aed", position: 100 }] })}
          className="text-[10px] text-studio-muted hover:text-studio-accent transition-colors">
          + Add stop
        </button>
      </div>
    </div>
  );
}

export default function RightPanel() {
  const {
    project, activePropertiesTab, setActivePropertiesTab,
    selectedLayerId, updateLayer, updateProjectMeta,
  } = useEditorStore();

  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);
  const currentAnimation = selectedLayer?.animation;
  const appliedPreset = currentAnimation?.presetId
    ? ANIMATION_PRESETS.find(p => p.id === currentAnimation.presetId)
    : null;

  const { removeBg, status: bgStatus, progress: bgProgress } = useBackgroundRemoval(
    (dataUrl) => selectedLayerId && updateLayer(selectedLayerId, { src: dataUrl })
  );

  if (!selectedLayerId || !selectedLayer) {
    return (
      <div className="w-56 bg-studio-panel border-l border-studio-border flex flex-col overflow-hidden shrink-0">
        <div className="p-3 border-b border-studio-border">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-studio-subtle mb-3">Canvas</div>
          <div className="space-y-2">
            <NumberInput label="Width" value={project.width} onChange={v => updateProjectMeta({ width: v })} min={100} max={4000} />
            <NumberInput label="Height" value={project.height} onChange={v => updateProjectMeta({ height: v })} min={100} max={4000} />
            <NumberInput label="Duration" value={project.duration} onChange={v => updateProjectMeta({ duration: v })} min={0.5} max={60} step={0.5} unit="s" />
          </div>
          {/* Canvas size presets */}
          <div className="mt-2">
            <div className="text-[10px] text-studio-subtle mb-1.5">Size Presets</div>
            <div className="grid grid-cols-1 gap-1">
              {CANVAS_PRESETS.map(p => (
                <button key={p.name}
                  onClick={() => updateProjectMeta({ width: p.width, height: p.height })}
                  className={`text-left px-2 py-1.5 rounded text-[10px] transition-all border ${project.width === p.width && project.height === p.height ? "border-studio-accent/50 bg-studio-accent/5 text-studio-accent" : "border-transparent text-studio-muted hover:text-studio-text hover:bg-studio-hover"}`}
                >
                  <span className="font-mono">{p.width}×{p.height}</span>
                  <span className="text-studio-subtle ml-1.5">{p.name.split("(")[1]?.replace(")", "") || ""}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 border-b border-studio-border">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-studio-subtle mb-2">Background</div>
          <input type="text" value={project.background} onChange={e => updateProjectMeta({ background: e.target.value })}
            className="property-input text-xs mb-2" placeholder="#000000 or CSS gradient" />
          <div className="grid grid-cols-4 gap-1">
            {BACKGROUND_PRESETS.map(bg => (
              <button key={bg.name} onClick={() => updateProjectMeta({ background: bg.value })}
                className={`aspect-square rounded border transition-all ${project.background === bg.value ? "border-studio-accent" : "border-studio-border hover:border-studio-accent/60"}`}
                style={{ background: bg.value === "transparent" ? "repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 0 0 / 8px 8px" : bg.value }}
                title={bg.name} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <p className="text-xs text-studio-subtle leading-relaxed">Select a layer to<br />edit its properties</p>
        </div>
      </div>
    );
  }

  const update = (updates: Parameters<typeof updateLayer>[1]) => updateLayer(selectedLayer.id, updates);

  return (
    <div className="w-56 bg-studio-panel border-l border-studio-border flex flex-col overflow-hidden shrink-0">
      {/* Layer header */}
      <div className="px-3 py-2 border-b border-studio-border">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
            selectedLayer.type === "text" ? "bg-blue-500/15 text-blue-400" :
            selectedLayer.type === "image" ? "bg-green-500/15 text-green-400" :
            selectedLayer.type === "shape" ? "bg-purple-500/15 text-purple-400" :
            selectedLayer.type === "icon" ? "bg-yellow-500/15 text-yellow-400" :
            "bg-studio-hover text-studio-muted"
          }`}>{selectedLayer.type}</span>
          <input value={selectedLayer.name} onChange={e => update({ name: e.target.value })}
            className="bg-transparent text-xs text-studio-text flex-1 border-b border-transparent hover:border-studio-border focus:border-studio-accent/60 focus:outline-none min-w-0" />
        </div>
        <div className="flex gap-2 mt-1 text-[10px] text-studio-subtle font-mono">
          <span>x:{selectedLayer.x}</span>
          <span>y:{selectedLayer.y}</span>
          <span>{selectedLayer.width}×{selectedLayer.height}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-studio-border">
        {PROP_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActivePropertiesTab(tab.id)}
            className={`flex-1 py-2 text-[9px] font-semibold uppercase tracking-wide transition-all ${activePropertiesTab === tab.id ? "text-studio-accent border-b-2 border-studio-accent bg-studio-accent/5" : "text-studio-muted hover:text-studio-text"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-studio p-3 space-y-3">

        {/* TRANSFORM TAB */}
        {activePropertiesTab === "transform" && (
          <>
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-studio-subtle uppercase tracking-wider">Position</div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[10px] text-studio-subtle">X</label>
                  <input type="number" value={selectedLayer.x} onChange={e => update({ x: +e.target.value })} className="property-input text-xs h-7 w-full mt-0.5" />
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle">Y</label>
                  <input type="number" value={selectedLayer.y} onChange={e => update({ y: +e.target.value })} className="property-input text-xs h-7 w-full mt-0.5" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-studio-subtle uppercase tracking-wider">Size</div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[10px] text-studio-subtle">W</label>
                  <input type="number" value={selectedLayer.width} min={1} onChange={e => update({ width: +e.target.value })} className="property-input text-xs h-7 w-full mt-0.5" />
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle">H</label>
                  <input type="number" value={selectedLayer.height} min={1} onChange={e => update({ height: +e.target.value })} className="property-input text-xs h-7 w-full mt-0.5" />
                </div>
              </div>
            </div>
            <NumberInput label="Rotation" value={selectedLayer.rotation} onChange={v => update({ rotation: v })} min={-360} max={360} unit="°" />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] text-studio-subtle">Opacity</label>
                <span className="text-[10px] text-studio-text font-mono">{selectedLayer.opacity}%</span>
              </div>
              <input type="range" min={0} max={100} value={selectedLayer.opacity} onChange={e => update({ opacity: +e.target.value })} className="w-full h-1.5 accent-studio-accent" />
            </div>
            <div>
              <label className="text-[10px] text-studio-subtle block mb-1">Blend Mode</label>
              <select value={selectedLayer.blendMode} onChange={e => update({ blendMode: e.target.value })} className="property-input text-xs">
                {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <NumberInput label="Radius" value={selectedLayer.borderRadius || 0} onChange={v => update({ borderRadius: v })} min={0} max={500} unit="px" />

            {/* Alignment panel */}
            <AlignmentPanel />
          </>
        )}

        {/* STYLE TAB */}
        {activePropertiesTab === "style" && (
          <>
            {selectedLayer.type === "text" && (
              <>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Content</label>
                  <textarea value={selectedLayer.content || ""} onChange={e => update({ content: e.target.value })}
                    className="property-input text-xs min-h-[60px] resize-none" rows={3} />
                </div>
                <ColorPicker value={selectedLayer.color || "#ffffff"} onChange={v => update({ color: v })} label="Color" />
                <NumberInput label="Font Size" value={selectedLayer.fontSize || 24} onChange={v => update({ fontSize: v })} min={8} max={500} unit="px" />
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Font Family</label>
                  <select value={selectedLayer.fontFamily || "Inter, sans-serif"} onChange={e => update({ fontFamily: e.target.value })} className="property-input text-xs">
                    {FONT_FAMILIES.map(f => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Weight</label>
                  <div className="grid grid-cols-4 gap-1">
                    {["400", "500", "600", "700", "800", "900"].map(w => (
                      <button key={w} onClick={() => update({ fontWeight: w })}
                        className={`py-1 text-[10px] rounded transition-all ${selectedLayer.fontWeight === w ? "bg-studio-accent/20 text-studio-accent border border-studio-accent/40" : "bg-studio-hover text-studio-muted"}`}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Align</label>
                  <div className="grid grid-cols-3 gap-1">
                    {["left", "center", "right"].map(align => (
                      <button key={align} onClick={() => update({ textAlign: align })}
                        className={`py-1 text-xs rounded transition-all ${selectedLayer.textAlign === align ? "bg-studio-accent/20 text-studio-accent border border-studio-accent/40" : "bg-studio-hover text-studio-muted"}`}>
                        {align === "left" ? "⟵" : align === "center" ? "↔" : "⟶"}
                      </button>
                    ))}
                  </div>
                </div>
                <NumberInput label="Letter Sp." value={selectedLayer.letterSpacing || 0} onChange={v => update({ letterSpacing: v })} min={-10} max={50} step={0.5} unit="px" />
                <NumberInput label="Line H." value={selectedLayer.lineHeight || 1.4} onChange={v => update({ lineHeight: v })} min={0.5} max={5} step={0.05} />
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Text Shadow</label>
                  <input type="text" value={selectedLayer.textShadow || ""} onChange={e => update({ textShadow: e.target.value })}
                    className="property-input text-xs" placeholder="2px 2px 4px #000" />
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {[
                      { label: "Neon Cyan", value: "0 0 10px #00d4ff, 0 0 20px #00d4ff" },
                      { label: "Neon Purple", value: "0 0 10px #7c3aed, 0 0 20px #7c3aed" },
                      { label: "Hard Drop", value: "3px 3px 0 #000" },
                      { label: "Soft Glow", value: "0 2px 20px rgba(0,0,0,0.8)" },
                    ].map(p => (
                      <button key={p.label} onClick={() => update({ textShadow: p.value })}
                        className="text-[9px] px-1.5 py-1 bg-studio-hover text-studio-muted hover:text-studio-text rounded transition-all text-left">
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedLayer.type === "shape" && (
              <>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1.5">Shape</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["rect", "circle", "triangle"] as const).map(s => (
                      <button key={s} onClick={() => update({ shape: s })}
                        className={`py-1.5 text-xs rounded transition-all ${selectedLayer.shape === s ? "bg-studio-accent/20 text-studio-accent border border-studio-accent/40" : "bg-studio-hover text-studio-muted"}`}>
                        {s === "rect" ? "▣" : s === "circle" ? "●" : "▲"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-studio-subtle">Fill</label>
                    <button
                      onClick={() => {
                        if (selectedLayer.gradient) update({ gradient: undefined });
                        else update({ gradient: { type: "linear", angle: 135, stops: [{ color: "#00d4ff", position: 0 }, { color: "#7c3aed", position: 100 }] } });
                      }}
                      className={`text-[9px] px-2 py-0.5 rounded transition-all ${selectedLayer.gradient ? "bg-studio-accent/20 text-studio-accent" : "bg-studio-hover text-studio-muted"}`}>
                      {selectedLayer.gradient ? "Gradient ✓" : "Gradient"}
                    </button>
                  </div>
                  {selectedLayer.gradient ? (
                    <GradientEditor gradient={selectedLayer.gradient} onChange={g => update({ gradient: g })} />
                  ) : (
                    <ColorPicker value={selectedLayer.fill || "#00d4ff"} onChange={v => update({ fill: v })} />
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Stroke</label>
                  <div className="flex gap-2">
                    <input type="color" value={selectedLayer.stroke || "#ffffff"} onChange={e => update({ stroke: e.target.value })} className="w-8 h-7 rounded cursor-pointer border-0" />
                    <input type="number" value={selectedLayer.strokeWidth || 0} min={0} max={30} onChange={e => update({ strokeWidth: +e.target.value })} className="property-input text-xs h-7 flex-1" placeholder="px" />
                  </div>
                </div>
              </>
            )}

            {selectedLayer.type === "icon" && (
              <>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Symbol</label>
                  <input type="text" value={selectedLayer.content || "★"} onChange={e => update({ content: e.target.value })} className="property-input text-xs text-2xl text-center" />
                </div>
                <ColorPicker value={selectedLayer.color || "#ffffff"} onChange={v => update({ color: v })} label="Color" />
                <NumberInput label="Size" value={selectedLayer.fontSize || 48} onChange={v => update({ fontSize: v })} min={8} max={500} unit="px" />
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Text Shadow</label>
                  <input type="text" value={selectedLayer.textShadow || ""} onChange={e => update({ textShadow: e.target.value })} className="property-input text-xs" placeholder="0 0 20px #00d4ff" />
                </div>
              </>
            )}

            {selectedLayer.type === "html" && (
              <div>
                <label className="text-[10px] text-studio-subtle block mb-1">HTML Code</label>
                <textarea value={selectedLayer.content || ""} onChange={e => update({ content: e.target.value })}
                  className="property-input text-xs font-mono min-h-[160px] resize-none leading-relaxed" rows={8} />
                <p className="text-[9px] text-studio-subtle mt-1">Inline styles supported. CSS animations work in preview.</p>
              </div>
            )}

            {selectedLayer.type === "image" && selectedLayer.src && (
              <div className="space-y-2">
                <img src={selectedLayer.src} alt="Preview"
                  className="w-full rounded border border-studio-border"
                  style={{ background: "repeating-conic-gradient(#333 0% 25%, #444 0% 50%) 0 0 / 12px 12px", maxHeight: 100, objectFit: "contain" }} />
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Object Fit</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["contain", "cover", "fill"] as const).map(fit => (
                      <button key={fit} onClick={() => update({ objectFit: fit })}
                        className={`py-1 text-[10px] rounded transition-all ${(selectedLayer.objectFit || "contain") === fit ? "bg-studio-accent/20 text-studio-accent border border-studio-accent/40" : "bg-studio-hover text-studio-muted"}`}>
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>
                {bgStatus === "loading" ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-studio-accent">Removing background…</span>
                      <span className="text-[10px] text-studio-accent font-mono">{bgProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-studio-hover rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-studio-accent to-studio-purple rounded-full transition-all duration-300" style={{ width: `${bgProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-studio-subtle text-center">
                      {bgProgress < 30 ? "Loading AI model…" : bgProgress < 80 ? "Analyzing image…" : "Finalizing…"}
                    </p>
                  </div>
                ) : (
                  <button onClick={() => removeBg(selectedLayer.src!)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border transition-all bg-gradient-to-r from-studio-accent/10 to-studio-purple/10 border-studio-accent/40 text-studio-accent hover:from-studio-accent/20 hover:to-studio-purple/20 hover:border-studio-accent/70">
                    <span>✦</span> Remove Background (AI)
                  </button>
                )}
                {bgStatus === "done" && <p className="text-[10px] text-studio-success text-center">✓ Background removed</p>}
              </div>
            )}

            {/* Box Shadow */}
            <div className="border-t border-studio-border pt-2 mt-1">
              <label className="text-[10px] text-studio-subtle block mb-1">Box Shadow</label>
              <input type="text" value={selectedLayer.boxShadow || ""} onChange={e => update({ boxShadow: e.target.value })}
                className="property-input text-xs" placeholder="0 8px 32px rgba(0,212,255,0.4)" />
            </div>
          </>
        )}

        {/* ANIMATION TAB */}
        {activePropertiesTab === "animation" && (
          <>
            {appliedPreset ? (
              <div className="bg-studio-accent/10 border border-studio-accent/30 rounded-lg p-2.5 mb-2">
                <div className="text-xs font-semibold text-studio-accent">{appliedPreset.name}</div>
                <div className="text-[10px] text-studio-muted">{appliedPreset.category} · {appliedPreset.duration}s</div>
              </div>
            ) : (
              <div className="bg-studio-hover rounded-lg p-2.5 mb-2 text-center">
                <div className="text-xs text-studio-subtle">No animation applied</div>
                <div className="text-[10px] text-studio-muted mt-0.5">Go to Animations panel → apply preset</div>
              </div>
            )}
            {currentAnimation && (
              <>
                <NumberInput label="Duration" value={currentAnimation.duration} onChange={v => update({ animation: { ...currentAnimation, duration: v } })} min={0.1} max={60} step={0.1} unit="s" />
                <NumberInput label="Delay" value={currentAnimation.delay} onChange={v => update({ animation: { ...currentAnimation, delay: v } })} min={0} max={20} step={0.1} unit="s" />
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Repeat</label>
                  <select value={currentAnimation.iterationCount} onChange={e => update({ animation: { ...currentAnimation, iterationCount: e.target.value } })} className="property-input text-xs">
                    {["1", "2", "3", "5", "infinite"].map(v => <option key={v} value={v}>{v === "infinite" ? "∞ Loop" : `${v}×`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Direction</label>
                  <select value={currentAnimation.direction} onChange={e => update({ animation: { ...currentAnimation, direction: e.target.value as "normal" | "reverse" | "alternate" | "alternate-reverse" } })} className="property-input text-xs">
                    {[["normal", "Normal"], ["reverse", "Reverse"], ["alternate", "Alternate"], ["alternate-reverse", "Alt. Reverse"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Easing</label>
                  <select value={currentAnimation.easing} onChange={e => update({ animation: { ...currentAnimation, easing: e.target.value } })} className="property-input text-xs">
                    {[
                      ["linear", "Linear"], ["ease", "Ease"], ["ease-in", "Ease In"], ["ease-out", "Ease Out"],
                      ["ease-in-out", "Ease In Out"],
                      ["cubic-bezier(0.34, 1.56, 0.64, 1)", "Bounce"],
                      ["cubic-bezier(0.68, -0.55, 0.265, 1.55)", "Spring"],
                      ["steps(8)", "Stepped (8)"], ["steps(4)", "Stepped (4)"],
                    ].map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <button onClick={() => update({ animation: undefined })}
                  className="w-full py-1.5 text-xs text-studio-error hover:bg-studio-error/10 rounded border border-studio-error/30 hover:border-studio-error/60 transition-all">
                  Remove Animation
                </button>
              </>
            )}
          </>
        )}

        {/* FILTERS TAB */}
        {activePropertiesTab === "filters" && (
          <>
            {[
              { type: "blur" as const, label: "Blur", min: 0, max: 50, unit: "px", def: 0 },
              { type: "brightness" as const, label: "Brightness", min: 0, max: 300, unit: "%", def: 100 },
              { type: "contrast" as const, label: "Contrast", min: 0, max: 300, unit: "%", def: 100 },
              { type: "saturate" as const, label: "Saturation", min: 0, max: 400, unit: "%", def: 100 },
              { type: "hue-rotate" as const, label: "Hue", min: 0, max: 360, unit: "°", def: 0 },
              { type: "grayscale" as const, label: "Grayscale", min: 0, max: 100, unit: "%", def: 0 },
              { type: "sepia" as const, label: "Sepia", min: 0, max: 100, unit: "%", def: 0 },
              { type: "invert" as const, label: "Invert", min: 0, max: 100, unit: "%", def: 0 },
            ].map(({ type, label, min, max, unit, def }) => {
              const filter = selectedLayer.filters?.find(f => f.type === type);
              const value = filter?.value ?? def;
              const isActive = filter !== undefined && filter.value !== def;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-[10px] ${isActive ? "text-studio-accent" : "text-studio-subtle"}`}>{label}</label>
                    <span className="text-[10px] text-studio-text font-mono">{value}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} value={value} onChange={e => {
                    const newVal = +e.target.value;
                    const filters = [...(selectedLayer.filters || [])];
                    const idx = filters.findIndex(f => f.type === type);
                    if (idx >= 0) filters[idx] = { type, value: newVal };
                    else filters.push({ type, value: newVal });
                    update({ filters });
                  }} className="w-full h-1.5 accent-studio-accent" />
                </div>
              );
            })}
            <button onClick={() => update({ filters: [] })}
              className="w-full py-1.5 text-xs text-studio-muted hover:text-studio-text hover:bg-studio-hover rounded border border-studio-border transition-all mt-1">
              Reset All Filters
            </button>
          </>
        )}

        {/* EFFECTS TAB */}
        {activePropertiesTab === "effects" && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] text-studio-subtle font-semibold uppercase tracking-wide">Glow Effect</label>
                <button
                  onClick={() => update({ glowColor: selectedLayer.glowColor ? undefined : "#00d4ff", glowIntensity: selectedLayer.glowIntensity || 12 })}
                  className={`text-[9px] px-2 py-0.5 rounded transition-all ${selectedLayer.glowColor ? "bg-studio-accent/20 text-studio-accent" : "bg-studio-hover text-studio-muted"}`}>
                  {selectedLayer.glowColor ? "ON" : "OFF"}
                </button>
              </div>
              {selectedLayer.glowColor && (
                <div className="space-y-2">
                  <ColorPicker value={selectedLayer.glowColor} onChange={v => update({ glowColor: v })} />
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-studio-subtle w-14">Intensity</label>
                    <input type="range" min={2} max={60} value={selectedLayer.glowIntensity || 12}
                      onChange={e => update({ glowIntensity: +e.target.value })} className="flex-1 h-1.5 accent-studio-accent" />
                    <span className="text-[10px] font-mono text-studio-text w-5">{selectedLayer.glowIntensity || 12}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-studio-border pt-3">
              <label className="text-[10px] text-studio-subtle font-semibold uppercase tracking-wide block mb-2">Box Shadow</label>
              <textarea value={selectedLayer.boxShadow || ""} onChange={e => update({ boxShadow: e.target.value })}
                className="property-input text-xs font-mono min-h-[56px] resize-none" placeholder="0 8px 32px rgba(0,212,255,0.4)" />
              <div className="grid grid-cols-2 gap-1 mt-1.5">
                {[
                  { label: "Neon Cyan", value: "0 0 20px #00d4ff, 0 0 40px #00d4ff50" },
                  { label: "Neon Purple", value: "0 0 20px #7c3aed, 0 0 40px #7c3aed50" },
                  { label: "Soft Lift", value: "0 12px 40px rgba(0,0,0,0.5)" },
                  { label: "Inner Light", value: "inset 0 1px 0 rgba(255,255,255,0.1)" },
                  { label: "Pink Glow", value: "0 0 20px #ec4899, 0 0 40px #ec489950" },
                  { label: "Green Glow", value: "0 0 20px #10b981, 0 0 40px #10b98150" },
                ].map(preset => (
                  <button key={preset.label} onClick={() => update({ boxShadow: preset.value })}
                    className="text-[9px] px-2 py-1.5 bg-studio-hover hover:bg-studio-hover/80 text-studio-muted hover:text-studio-text rounded transition-all text-left">
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-studio-border pt-3">
              <label className="text-[10px] text-studio-subtle font-semibold uppercase tracking-wide block mb-2">Quick FX Presets</label>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: "Glass", apply: () => update({ boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)", filters: (selectedLayer.filters || []).filter(f => f.type !== "brightness").concat([{ type: "brightness" as const, value: 105 }]) }) },
                  { label: "Hologram", apply: () => update({ glowColor: "#00d4ff", glowIntensity: 16, filters: (selectedLayer.filters || []).filter(f => f.type !== "saturate" && f.type !== "hue-rotate").concat([{ type: "saturate" as const, value: 200 }, { type: "hue-rotate" as const, value: 0 }]) }) },
                  { label: "Retro", apply: () => update({ filters: (selectedLayer.filters || []).filter(f => f.type !== "sepia" && f.type !== "contrast").concat([{ type: "sepia" as const, value: 60 }, { type: "contrast" as const, value: 130 }]) }) },
                  { label: "Night Mode", apply: () => update({ filters: (selectedLayer.filters || []).filter(f => f.type !== "brightness" && f.type !== "saturate").concat([{ type: "brightness" as const, value: 50 }, { type: "saturate" as const, value: 50 }]) }) },
                  { label: "Neon Glow", apply: () => update({ glowColor: "#7c3aed", glowIntensity: 24, boxShadow: "0 0 30px #7c3aed40" }) },
                  { label: "Reset FX", apply: () => update({ filters: [], glowColor: undefined, glowIntensity: undefined, boxShadow: undefined }) },
                ].map(fx => (
                  <button key={fx.label} onClick={fx.apply}
                    className="text-[10px] px-2 py-2 bg-studio-hover hover:bg-studio-hover/80 text-studio-muted hover:text-studio-text rounded transition-all border border-transparent hover:border-studio-border">
                    {fx.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
