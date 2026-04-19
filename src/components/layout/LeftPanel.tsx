import { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { ICON_LIBRARY, OBJECTS_3D, WEB_ELEMENTS } from "@/constants/assets";
import { ANIMATION_PRESETS, ANIMATION_CATEGORIES } from "@/constants/animations";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { PanelTab } from "@/types";

const PANEL_TABS: { id: PanelTab; label: string; icon: string }[] = [
  { id: "layers", label: "Layers", icon: "L" },
  { id: "assets", label: "Assets", icon: "A" },
  { id: "animations", label: "Anims", icon: "✦" },
  { id: "elements", label: "Elements", icon: "E" },
];

export default function LeftPanel() {
  const {
    project, activePanelTab, setActivePanelTab,
    selectedLayerId, selectLayer, removeLayer, duplicateLayer,
    toggleLayerVisibility, toggleLayerLock, moveLayerUp, moveLayerDown,
    addLayer, updateLayer,
    animationSearchQuery, setAnimationSearchQuery,
    animationCategoryFilter, setAnimationCategoryFilter,
  } = useEditorStore();
  const { fileRef, handleFileChange, triggerFileOpen } = useFileUpload();
  const [assetTab, setAssetTab] = useState<"icons" | "3d" | "web">("icons");
  const [iconSearch, setIconSearch] = useState("");

  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);

  const filteredAnimations = ANIMATION_PRESETS.filter(p => {
    const matchCat = animationCategoryFilter === "All" || p.category === animationCategoryFilter;
    const matchQ = p.name.toLowerCase().includes(animationSearchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const filteredIcons = ICON_LIBRARY.filter(i => i.name.toLowerCase().includes(iconSearch.toLowerCase()));

  const applyAnimation = (presetId: string) => {
    if (!selectedLayerId) return;
    const preset = ANIMATION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    updateLayer(selectedLayerId, {
      animation: {
        presetId,
        keyframes: [],
        duration: preset.duration,
        delay: preset.delay,
        easing: preset.easing,
        iterationCount: preset.iterationCount,
        direction: "normal",
      },
    });
  };

  return (
    <div className="w-56 bg-studio-panel border-r border-studio-border flex flex-col overflow-hidden shrink-0">
      {/* Tab Bar */}
      <div className="flex border-b border-studio-border">
        {PANEL_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePanelTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-all ${activePanelTab === tab.id ? "text-studio-accent border-b-2 border-studio-accent bg-studio-accent/5" : "text-studio-muted hover:text-studio-text"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LAYERS PANEL */}
      {activePanelTab === "layers" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Add Layer Buttons */}
          <div className="p-2 border-b border-studio-border">
            <div className="grid grid-cols-3 gap-1">
              {[
                { type: "text" as const, label: "Text", icon: "T" },
                { type: "image" as const, label: "Image", icon: "🖼" },
                { type: "shape" as const, label: "Shape", icon: "▣" },
                { type: "icon" as const, label: "Icon", icon: "★" },
                { type: "html" as const, label: "HTML", icon: "</>" },
              ].map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => type === "image" ? triggerFileOpen() : addLayer(type)}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded-md text-xs text-studio-muted hover:text-studio-text hover:bg-studio-hover transition-all"
                >
                  <span className="text-sm leading-none">{icon}</span>
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
              <button
                onClick={triggerFileOpen}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-md text-xs text-studio-muted hover:text-studio-text hover:bg-studio-hover transition-all"
              >
                <span className="text-sm leading-none">↑</span>
                <span className="text-[10px]">Upload</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </div>

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto scrollbar-studio py-1">
            {project.layers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 px-4 text-center">
                <div className="text-2xl opacity-30">⊕</div>
                <p className="text-xs text-studio-subtle">Add a layer to get started</p>
              </div>
            ) : (
              project.layers.map((layer, idx) => (
                <div
                  key={layer.id}
                  className={`layer-item mx-1 ${layer.id === selectedLayerId ? "selected" : ""}`}
                  onClick={() => selectLayer(layer.id)}
                >
                  {/* Layer type indicator */}
                  <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center text-xs font-bold ${
                    layer.type === "text" ? "bg-blue-500/20 text-blue-400" :
                    layer.type === "image" ? "bg-green-500/20 text-green-400" :
                    layer.type === "shape" ? "bg-purple-500/20 text-purple-400" :
                    layer.type === "icon" ? "bg-yellow-500/20 text-yellow-400" :
                    layer.type === "html" ? "bg-orange-500/20 text-orange-400" :
                    "bg-studio-hover text-studio-muted"
                  }`}>
                    {layer.type === "text" ? "T" : layer.type === "image" ? "🖼" : layer.type === "shape" ? "▣" : layer.type === "icon" ? "★" : layer.type === "html" ? "<>" : "3D"}
                  </div>

                  <span className="text-xs text-studio-text truncate flex-1 min-w-0">{layer.name}</span>

                  {/* Layer actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                      className={`w-5 h-5 flex items-center justify-center rounded hover:bg-studio-hover text-[10px] transition-all ${layer.visible ? "text-studio-muted" : "text-studio-subtle opacity-50"}`}
                      title={layer.visible ? "Hide" : "Show"}
                    >
                      {layer.visible ? "👁" : "◌"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                      className={`w-5 h-5 flex items-center justify-center rounded hover:bg-studio-hover text-[10px] transition-all ${layer.locked ? "text-studio-warning" : "text-studio-subtle"}`}
                      title={layer.locked ? "Unlock" : "Lock"}
                    >
                      {layer.locked ? "🔒" : "🔓"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Layer actions for selected */}
          {selectedLayer && (
            <div className="border-t border-studio-border p-2 flex gap-1">
              <button onClick={() => moveLayerUp(selectedLayer.id)} className="studio-btn-icon flex-1 rounded text-xs" title="Move Up">↑</button>
              <button onClick={() => moveLayerDown(selectedLayer.id)} className="studio-btn-icon flex-1 rounded text-xs" title="Move Down">↓</button>
              <button onClick={() => duplicateLayer(selectedLayer.id)} className="studio-btn-icon flex-1 rounded text-xs" title="Duplicate">⧉</button>
              <button onClick={() => removeLayer(selectedLayer.id)} className="flex-1 flex items-center justify-center w-7 h-7 rounded-md hover:bg-studio-error/20 hover:text-studio-error text-studio-muted transition-all text-xs" title="Delete">✕</button>
            </div>
          )}
        </div>
      )}

      {/* ASSETS PANEL */}
      {activePanelTab === "assets" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex border-b border-studio-border">
            {(["icons", "3d", "web"] as const).map(t => (
              <button key={t} onClick={() => setAssetTab(t)}
                className={`flex-1 py-2 text-xs font-medium transition-all ${assetTab === t ? "text-studio-accent border-b-2 border-studio-accent" : "text-studio-muted hover:text-studio-text"}`}>
                {t === "icons" ? "Icons" : t === "3d" ? "3D Objects" : "Elements"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-studio p-2">
            {assetTab === "icons" && (
              <>
                <input value={iconSearch} onChange={e => setIconSearch(e.target.value)}
                  className="property-input mb-2 text-xs" placeholder="Search icons..." />
                <div className="grid grid-cols-4 gap-1">
                  {filteredIcons.map(icon => (
                    <button
                      key={icon.id}
                      onClick={() => addLayer("icon", { content: icon.content, name: icon.name, width: 80, height: 80, fontSize: 48 })}
                      className="aspect-square flex flex-col items-center justify-center gap-0.5 p-1 rounded-md hover:bg-studio-hover border border-transparent hover:border-studio-border transition-all"
                      title={icon.name}
                    >
                      <span className="text-xl leading-none">{icon.content}</span>
                      <span className="text-[8px] text-studio-subtle truncate w-full text-center">{icon.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {assetTab === "3d" && (
              <div className="grid grid-cols-2 gap-1.5">
                {OBJECTS_3D.map(obj => (
                  <button
                    key={obj.id}
                    onClick={() => addLayer("shape", { name: obj.name, shape: "rect", fill: "linear-gradient(135deg,#00d4ff,#7c3aed)", width: 120, height: 120, borderRadius: 12 })}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-studio-hover border border-studio-border hover:border-studio-accent/40 transition-all"
                    title={obj.name}
                  >
                    <img src={obj.thumbnail} alt={obj.name} className="w-full aspect-square rounded-md object-cover opacity-80" />
                    <span className="text-[10px] text-studio-muted">{obj.name}</span>
                  </button>
                ))}
              </div>
            )}
            {assetTab === "web" && (
              <div className="flex flex-col gap-1.5">
                {WEB_ELEMENTS.map(el => (
                  <button
                    key={el.id}
                    onClick={() => addLayer("html", { name: el.name, content: el.content, width: 300, height: 80 })}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-studio-hover border border-studio-border hover:border-studio-accent/40 transition-all"
                  >
                    <div className="text-xs font-medium text-studio-text mb-1">{el.name}</div>
                    <div className="text-[10px] text-studio-subtle bg-studio-bg rounded px-1.5 py-0.5 font-mono truncate">{el.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANIMATIONS PANEL */}
      {activePanelTab === "animations" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-2 border-b border-studio-border space-y-1.5">
            <input
              value={animationSearchQuery}
              onChange={e => setAnimationSearchQuery(e.target.value)}
              className="property-input text-xs"
              placeholder="Search 300+ presets..."
            />
            <select
              value={animationCategoryFilter}
              onChange={e => setAnimationCategoryFilter(e.target.value)}
              className="property-input text-xs"
            >
              {ANIMATION_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat} {cat === "All" ? `(${ANIMATION_PRESETS.length})` : ""}</option>
              ))}
            </select>
          </div>

          {!selectedLayerId && (
            <div className="px-3 py-2 text-xs text-studio-warning bg-studio-warning/10 border-b border-studio-warning/20">
              Select a layer to apply animations
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-studio p-1.5 grid grid-cols-2 gap-1 content-start">
            {filteredAnimations.map(preset => {
              const isActive = selectedLayer?.animation?.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyAnimation(preset.id)}
                  className={`preset-card ${isActive ? "active" : ""}`}
                  title={`${preset.name} — ${preset.duration}s`}
                >
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                    preset.category === "Entrance" ? "bg-green-500/20 text-green-400" :
                    preset.category === "Exit" ? "bg-red-500/20 text-red-400" :
                    preset.category === "Attention" ? "bg-yellow-500/20 text-yellow-400" :
                    preset.category === "Text" ? "bg-blue-500/20 text-blue-400" :
                    preset.category === "Motion" ? "bg-purple-500/20 text-purple-400" :
                    "bg-studio-accent/20 text-studio-accent"
                  }`}>
                    {preset.category === "Entrance" ? "▶" : preset.category === "Exit" ? "◀" : preset.category === "Attention" ? "✦" : preset.category === "Text" ? "T" : preset.category === "Motion" ? "⟳" : "★"}
                  </div>
                  <span className="text-[10px] text-studio-muted leading-tight">{preset.name}</span>
                </button>
              );
            })}
            {filteredAnimations.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-studio-subtle">No presets found</div>
            )}
          </div>

          <div className="border-t border-studio-border px-3 py-2">
            <div className="text-xs text-studio-subtle">{filteredAnimations.length} of {ANIMATION_PRESETS.length} presets</div>
          </div>
        </div>
      )}

      {/* ELEMENTS PANEL */}
      {activePanelTab === "elements" && (
        <div className="flex flex-col flex-1 overflow-hidden p-2 gap-2">
          <div className="studio-section-label px-0">Quick Add</div>
          {[
            { label: "Heading Text", action: () => addLayer("text", { content: "Your Heading", fontSize: 48, fontWeight: "700", color: "#ffffff" }) },
            { label: "Body Text", action: () => addLayer("text", { content: "Your body text here...", fontSize: 18, color: "#9ca3af" }) },
            { label: "Rectangle", action: () => addLayer("shape", { shape: "rect", fill: "#00d4ff", width: 200, height: 120, borderRadius: 8 }) },
            { label: "Circle", action: () => addLayer("shape", { shape: "circle", fill: "#7c3aed", width: 120, height: 120 }) },
            { label: "Triangle", action: () => addLayer("shape", { shape: "triangle", fill: "#10b981", width: 120, height: 100 }) },
            { label: "HTML Block", action: () => addLayer("html") },
            { label: "Icon Star", action: () => addLayer("icon", { content: "★", color: "#f59e0b" }) },
            { label: "Upload Image", action: triggerFileOpen },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full text-left px-3 py-2 rounded-md text-xs text-studio-muted hover:text-studio-text hover:bg-studio-hover border border-transparent hover:border-studio-border transition-all"
            >
              + {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
