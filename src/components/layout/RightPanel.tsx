import { useEditorStore } from "@/stores/editorStore";
import { ANIMATION_PRESETS } from "@/constants/animations";
import { BLEND_MODES, FONT_FAMILIES, BACKGROUND_PRESETS } from "@/constants/assets";
import { useBackgroundRemoval } from "@/hooks/useBackgroundRemoval";
import type { PropertiesTab } from "@/types";

const PROP_TABS: { id: PropertiesTab; label: string }[] = [
  { id: "transform", label: "Transform" },
  { id: "style", label: "Style" },
  { id: "animation", label: "Animate" },
  { id: "filters", label: "Filters" },
];

function NumberInput({ label, value, onChange, min, max, step = 1, unit = "" }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-studio-subtle w-14 shrink-0">{label}</label>
      <div className="flex items-center flex-1">
        <input
          type="number"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="property-input text-xs h-7 flex-1"
        />
        {unit && <span className="text-[10px] text-studio-subtle ml-1">{unit}</span>}
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

  if (!selectedLayerId || !selectedLayer) {
    return (
      <div className="w-56 bg-studio-panel border-l border-studio-border flex flex-col overflow-hidden shrink-0">
        {/* Canvas properties */}
        <div className="p-3 border-b border-studio-border">
          <div className="text-xs font-semibold text-studio-text mb-3">Canvas</div>
          <div className="space-y-2">
            <NumberInput label="Width" value={project.width} onChange={v => updateProjectMeta({ width: v })} min={100} max={4000} />
            <NumberInput label="Height" value={project.height} onChange={v => updateProjectMeta({ height: v })} min={100} max={4000} />
            <NumberInput label="Duration" value={project.duration} onChange={v => updateProjectMeta({ duration: v })} min={0.5} max={60} step={0.5} unit="s" />
          </div>
        </div>
        <div className="p-3 border-b border-studio-border">
          <div className="text-xs font-semibold text-studio-text mb-2">Background</div>
          <input
            type="text"
            value={project.background}
            onChange={e => updateProjectMeta({ background: e.target.value })}
            className="property-input text-xs mb-2"
            placeholder="#000000 or gradient"
          />
          <div className="grid grid-cols-4 gap-1">
            {BACKGROUND_PRESETS.map(bg => (
              <button
                key={bg.name}
                onClick={() => updateProjectMeta({ background: bg.value })}
                className="aspect-square rounded-md border border-studio-border hover:border-studio-accent/60 transition-all"
                style={{ background: bg.value === "transparent" ? "repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 0 0 / 8px 8px" : bg.value }}
                title={bg.name}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <p className="text-xs text-studio-subtle">Select a layer to edit its properties</p>
        </div>
      </div>
    );
  }

  const update = (updates: Parameters<typeof updateLayer>[1]) => updateLayer(selectedLayer.id, updates);

  const { removeBg, status: bgStatus, progress: bgProgress } = useBackgroundRemoval(
    (dataUrl) => update({ src: dataUrl })
  );

  return (
    <div className="w-56 bg-studio-panel border-l border-studio-border flex flex-col overflow-hidden shrink-0">
      {/* Layer header */}
      <div className="px-3 py-2.5 border-b border-studio-border">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
            selectedLayer.type === "text" ? "bg-blue-500/20 text-blue-400" :
            selectedLayer.type === "image" ? "bg-green-500/20 text-green-400" :
            selectedLayer.type === "shape" ? "bg-purple-500/20 text-purple-400" :
            "bg-studio-hover text-studio-muted"
          }`}>{selectedLayer.type}</span>
          <input
            value={selectedLayer.name}
            onChange={e => update({ name: e.target.value })}
            className="bg-transparent text-xs text-studio-text flex-1 border-b border-transparent hover:border-studio-border focus:border-studio-accent/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-studio-border">
        {PROP_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePropertiesTab(tab.id)}
            className={`flex-1 py-2 text-[10px] font-medium transition-all ${activePropertiesTab === tab.id ? "text-studio-accent border-b-2 border-studio-accent" : "text-studio-muted hover:text-studio-text"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-studio p-3 space-y-3">

        {/* TRANSFORM TAB */}
        {activePropertiesTab === "transform" && (
          <>
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-studio-subtle uppercase tracking-wider">Position</div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[10px] text-studio-subtle">X</label>
                  <input type="number" value={selectedLayer.x} onChange={e => update({ x: +e.target.value })}
                    className="property-input text-xs h-7 w-full mt-0.5" />
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle">Y</label>
                  <input type="number" value={selectedLayer.y} onChange={e => update({ y: +e.target.value })}
                    className="property-input text-xs h-7 w-full mt-0.5" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-studio-subtle uppercase tracking-wider">Size</div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[10px] text-studio-subtle">W</label>
                  <input type="number" value={selectedLayer.width} min={1} onChange={e => update({ width: +e.target.value })}
                    className="property-input text-xs h-7 w-full mt-0.5" />
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle">H</label>
                  <input type="number" value={selectedLayer.height} min={1} onChange={e => update({ height: +e.target.value })}
                    className="property-input text-xs h-7 w-full mt-0.5" />
                </div>
              </div>
            </div>
            <NumberInput label="Rotation" value={selectedLayer.rotation} onChange={v => update({ rotation: v })} min={-360} max={360} unit="°" />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] text-studio-subtle">Opacity</label>
                <span className="text-[10px] text-studio-text font-mono">{selectedLayer.opacity}%</span>
              </div>
              <input type="range" min={0} max={100} value={selectedLayer.opacity}
                onChange={e => update({ opacity: +e.target.value })}
                className="w-full h-1.5 accent-studio-accent" />
            </div>
            <div>
              <label className="text-[10px] text-studio-subtle block mb-1">Blend Mode</label>
              <select value={selectedLayer.blendMode} onChange={e => update({ blendMode: e.target.value })}
                className="property-input text-xs">
                {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {selectedLayer.type !== "text" && (
              <NumberInput label="Radius" value={selectedLayer.borderRadius || 0} onChange={v => update({ borderRadius: v })} min={0} max={200} unit="px" />
            )}
          </>
        )}

        {/* STYLE TAB */}
        {activePropertiesTab === "style" && (
          <>
            {selectedLayer.type === "text" && (
              <>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Content</label>
                  <textarea
                    value={selectedLayer.content || ""}
                    onChange={e => update({ content: e.target.value })}
                    className="property-input text-xs min-h-[60px] resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={selectedLayer.color || "#ffffff"} onChange={e => update({ color: e.target.value })}
                      className="w-8 h-7 rounded cursor-pointer border-0" />
                    <input type="text" value={selectedLayer.color || "#ffffff"} onChange={e => update({ color: e.target.value })}
                      className="property-input text-xs h-7 flex-1" />
                  </div>
                </div>
                <NumberInput label="Font Size" value={selectedLayer.fontSize || 24} onChange={v => update({ fontSize: v })} min={8} max={200} unit="px" />
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Font Family</label>
                  <select value={selectedLayer.fontFamily || "Inter, sans-serif"} onChange={e => update({ fontFamily: e.target.value })}
                    className="property-input text-xs">
                    {FONT_FAMILIES.map(f => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Font Weight</label>
                  <select value={selectedLayer.fontWeight || "400"} onChange={e => update({ fontWeight: e.target.value })}
                    className="property-input text-xs">
                    {["300", "400", "500", "600", "700", "800", "900"].map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Text Align</label>
                  <div className="grid grid-cols-3 gap-1">
                    {["left", "center", "right"].map(align => (
                      <button key={align} onClick={() => update({ textAlign: align })}
                        className={`py-1 text-xs rounded-md transition-all ${selectedLayer.textAlign === align ? "bg-studio-accent/20 text-studio-accent border border-studio-accent/40" : "bg-studio-hover text-studio-muted hover:text-studio-text"}`}>
                        {align === "left" ? "⟵" : align === "center" ? "↔" : "⟶"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedLayer.type === "shape" && (
              <>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Shape</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["rect", "circle", "triangle"] as const).map(s => (
                      <button key={s} onClick={() => update({ shape: s })}
                        className={`py-1.5 text-xs rounded-md transition-all ${selectedLayer.shape === s ? "bg-studio-accent/20 text-studio-accent border border-studio-accent/40" : "bg-studio-hover text-studio-muted hover:text-studio-text"}`}>
                        {s === "rect" ? "▣" : s === "circle" ? "●" : "▲"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Fill Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={selectedLayer.fill?.startsWith("#") ? selectedLayer.fill : "#00d4ff"}
                      onChange={e => update({ fill: e.target.value })}
                      className="w-8 h-7 rounded cursor-pointer border-0" />
                    <input type="text" value={selectedLayer.fill || "#00d4ff"} onChange={e => update({ fill: e.target.value })}
                      className="property-input text-xs h-7 flex-1" placeholder="Color or gradient" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Stroke</label>
                  <div className="flex gap-2">
                    <input type="color" value={selectedLayer.stroke || "#ffffff"}
                      onChange={e => update({ stroke: e.target.value })}
                      className="w-8 h-7 rounded cursor-pointer border-0" />
                    <input type="number" value={selectedLayer.strokeWidth || 0} min={0} max={20}
                      onChange={e => update({ strokeWidth: +e.target.value })}
                      className="property-input text-xs h-7 flex-1" placeholder="Width px" />
                  </div>
                </div>
              </>
            )}

            {selectedLayer.type === "icon" && (
              <>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Icon</label>
                  <input type="text" value={selectedLayer.content || "★"} onChange={e => update({ content: e.target.value })}
                    className="property-input text-xs text-xl text-center" />
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={selectedLayer.color || "#ffffff"} onChange={e => update({ color: e.target.value })}
                      className="w-8 h-7 rounded cursor-pointer border-0" />
                    <input type="text" value={selectedLayer.color || "#ffffff"} onChange={e => update({ color: e.target.value })}
                      className="property-input text-xs h-7 flex-1" />
                  </div>
                </div>
                <NumberInput label="Size" value={selectedLayer.fontSize || 48} onChange={v => update({ fontSize: v })} min={8} max={200} unit="px" />
              </>
            )}

            {selectedLayer.type === "html" && (
              <div>
                <label className="text-[10px] text-studio-subtle block mb-1">HTML Content</label>
                <textarea
                  value={selectedLayer.content || ""}
                  onChange={e => update({ content: e.target.value })}
                  className="property-input text-xs font-mono min-h-[120px] resize-none"
                  rows={6}
                />
              </div>
            )}

            {selectedLayer.type === "image" && selectedLayer.src && (
              <div className="space-y-2">
                <img src={selectedLayer.src} alt="Preview" className="w-full rounded-md opacity-80 border border-studio-border" style={{ background: "repeating-conic-gradient(#333 0% 25%, #444 0% 50%) 0 0 / 12px 12px" }} />

                {bgStatus === "loading" ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-studio-accent">Removing background…</span>
                      <span className="text-[10px] text-studio-accent font-mono">{bgProgress}%</span>
                    </div>
                    <div className="h-1 bg-studio-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-studio-accent rounded-full transition-all duration-300"
                        style={{ width: `${bgProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-studio-subtle text-center">
                      {bgProgress < 30 ? "Loading AI model…" : bgProgress < 80 ? "Analyzing image…" : "Finalizing…"}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => removeBg(selectedLayer.src!)}
                    disabled={bgStatus === "loading"}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border transition-all
                      bg-gradient-to-r from-studio-accent/10 to-studio-purple/10
                      border-studio-accent/40 text-studio-accent
                      hover:from-studio-accent/20 hover:to-studio-purple/20 hover:border-studio-accent/70
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">✦</span>
                    Remove Background (AI)
                  </button>
                )}

                {bgStatus === "done" && (
                  <p className="text-[10px] text-studio-success text-center">✓ Background removed — transparent PNG applied</p>
                )}
              </div>
            )}
          </>
        )}

        {/* ANIMATION TAB */}
        {activePropertiesTab === "animation" && (
          <>
            {appliedPreset ? (
              <div className="bg-studio-accent/10 border border-studio-accent/30 rounded-lg p-2.5 mb-2">
                <div className="text-xs font-semibold text-studio-accent mb-0.5">{appliedPreset.name}</div>
                <div className="text-[10px] text-studio-muted">{appliedPreset.category} preset applied</div>
              </div>
            ) : (
              <div className="bg-studio-hover rounded-lg p-2.5 mb-2">
                <div className="text-xs text-studio-subtle">No animation applied</div>
                <div className="text-[10px] text-studio-muted mt-0.5">Choose a preset from the Animations panel</div>
              </div>
            )}

            {currentAnimation && (
              <>
                <NumberInput label="Duration" value={currentAnimation.duration} onChange={v => update({ animation: { ...currentAnimation, duration: v } })} min={0.1} max={30} step={0.1} unit="s" />
                <NumberInput label="Delay" value={currentAnimation.delay} onChange={v => update({ animation: { ...currentAnimation, delay: v } })} min={0} max={10} step={0.1} unit="s" />
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Repeat</label>
                  <select value={currentAnimation.iterationCount} onChange={e => update({ animation: { ...currentAnimation, iterationCount: e.target.value } })}
                    className="property-input text-xs">
                    <option value="1">Once</option>
                    <option value="2">2×</option>
                    <option value="3">3×</option>
                    <option value="5">5×</option>
                    <option value="infinite">Infinite</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Direction</label>
                  <select value={currentAnimation.direction} onChange={e => update({ animation: { ...currentAnimation, direction: e.target.value as "normal" | "reverse" | "alternate" | "alternate-reverse" } })}
                    className="property-input text-xs">
                    <option value="normal">Normal</option>
                    <option value="reverse">Reverse</option>
                    <option value="alternate">Alternate</option>
                    <option value="alternate-reverse">Alternate Reverse</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-studio-subtle block mb-1">Easing</label>
                  <select value={currentAnimation.easing} onChange={e => update({ animation: { ...currentAnimation, easing: e.target.value } })}
                    className="property-input text-xs">
                    {[
                      ["linear", "Linear"],
                      ["ease", "Ease"],
                      ["ease-in", "Ease In"],
                      ["ease-out", "Ease Out"],
                      ["ease-in-out", "Ease In Out"],
                      ["cubic-bezier(0.34, 1.56, 0.64, 1)", "Bounce"],
                      ["cubic-bezier(0.68, -0.55, 0.265, 1.55)", "Spring"],
                    ].map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => update({ animation: undefined })}
                  className="w-full py-1.5 text-xs text-studio-error hover:bg-studio-error/10 rounded-md transition-all border border-studio-error/30 hover:border-studio-error/60"
                >
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
              { type: "blur" as const, label: "Blur", min: 0, max: 50, unit: "px" },
              { type: "brightness" as const, label: "Brightness", min: 0, max: 200, unit: "%" },
              { type: "contrast" as const, label: "Contrast", min: 0, max: 200, unit: "%" },
              { type: "saturate" as const, label: "Saturation", min: 0, max: 300, unit: "%" },
              { type: "hue-rotate" as const, label: "Hue Rotate", min: 0, max: 360, unit: "°" },
              { type: "grayscale" as const, label: "Grayscale", min: 0, max: 100, unit: "%" },
            ].map(({ type, label, min, max, unit }) => {
              const filter = selectedLayer.filters?.find(f => f.type === type);
              const value = filter?.value ?? (type === "brightness" || type === "contrast" || type === "saturate" ? 100 : 0);
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-studio-subtle">{label}</label>
                    <span className="text-[10px] text-studio-text font-mono">{value}{unit}</span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={e => {
                      const newVal = +e.target.value;
                      const filters = [...(selectedLayer.filters || [])];
                      const idx = filters.findIndex(f => f.type === type);
                      if (idx >= 0) filters[idx] = { type, value: newVal };
                      else filters.push({ type, value: newVal });
                      update({ filters });
                    }}
                    className="w-full h-1.5 accent-studio-accent"
                  />
                </div>
              );
            })}
            <button
              onClick={() => update({ filters: [] })}
              className="w-full py-1.5 text-xs text-studio-muted hover:text-studio-text hover:bg-studio-hover rounded-md transition-all"
            >
              Reset Filters
            </button>
          </>
        )}
      </div>
    </div>
  );
}
