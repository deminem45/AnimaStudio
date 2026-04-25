import { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { ICON_LIBRARY, OBJECTS_3D, WEB_ELEMENTS } from "@/constants/assets";
import { ANIMATION_PRESETS, ANIMATION_CATEGORIES } from "@/constants/animations";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { PanelTab } from "@/types";

const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: "layers", label: "Layers" },
  { id: "assets", label: "Assets" },
  { id: "animations", label: "Animate" },
  { id: "elements", label: "Quick Add" },
];

const LAYER_TYPE_COLORS: Record<string, string> = {
  text: "bg-blue-500/15 text-blue-400",
  image: "bg-green-500/15 text-green-400",
  shape: "bg-purple-500/15 text-purple-400",
  icon: "bg-yellow-500/15 text-yellow-400",
  html: "bg-orange-500/15 text-orange-400",
};

const LAYER_TYPE_ICON: Record<string, string> = {
  text: "T",
  image: "⊡",
  shape: "◆",
  icon: "★",
  html: "</>",
};

export default function LeftPanel() {
  const {
    project, activePanelTab, setActivePanelTab,
    selectedLayerId, selectLayer, removeLayer, duplicateLayer, copyLayer, pasteLayer,
    toggleLayerVisibility, toggleLayerLock, moveLayerUp, moveLayerDown,
    addLayer, updateLayer, copiedLayer,
    animationSearchQuery, setAnimationSearchQuery,
    animationCategoryFilter, setAnimationCategoryFilter,
  } = useEditorStore();
  const { fileRef, handleFileChange, triggerFileOpen } = useFileUpload();
  const [assetTab, setAssetTab] = useState<"icons" | "3d" | "web">("icons");
  const [iconSearch, setIconSearch] = useState("");
  const [iconCat, setIconCat] = useState("All");

  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);

  const filteredAnimations = ANIMATION_PRESETS.filter(p => {
    const matchCat = animationCategoryFilter === "All" || p.category === animationCategoryFilter;
    const matchQ = p.name.toLowerCase().includes(animationSearchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const iconCategories = ["All", ...Array.from(new Set(ICON_LIBRARY.map(i => i.category)))];
  const filteredIcons = ICON_LIBRARY.filter(i => {
    const matchCat = iconCat === "All" || i.category === iconCat;
    const matchQ = i.name.toLowerCase().includes(iconSearch.toLowerCase());
    return matchCat && matchQ;
  });

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
            className={`flex-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition-all ${activePanelTab === tab.id ? "text-studio-accent border-b-2 border-studio-accent bg-studio-accent/5" : "text-studio-muted hover:text-studio-text"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── LAYERS PANEL ── */}
      {activePanelTab === "layers" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Add Layer Buttons */}
          <div className="p-2 border-b border-studio-border">
            <div className="grid grid-cols-4 gap-1">
              {[
                { type: "text" as const, label: "Text", icon: "T" },
                { type: "shape" as const, label: "Shape", icon: "◆" },
                { type: "icon" as const, label: "Icon", icon: "★" },
                { type: "html" as const, label: "HTML", icon: "</>" },
              ].map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => addLayer(type)}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-md text-studio-muted hover:text-studio-text hover:bg-studio-hover transition-all"
                  title={`Add ${label} layer`}
                >
                  <span className="text-sm leading-none font-bold">{icon}</span>
                  <span className="text-[9px]">{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={triggerFileOpen}
              className="w-full mt-1.5 flex items-center justify-center gap-2 py-2 rounded-md text-xs text-studio-muted hover:text-studio-accent hover:bg-studio-accent/5 border border-dashed border-studio-border hover:border-studio-accent/40 transition-all"
            >
              <span>↑</span> Upload Image
            </button>
            <input ref={fileRef} type="file" accept="image/*,image/svg+xml" multiple className="hidden" onChange={handleFileChange} />
          </div>

          {/* Paste button if clipboard has layer */}
          {copiedLayer && (
            <button
              onClick={pasteLayer}
              className="mx-2 mt-1.5 flex items-center gap-2 px-2 py-1.5 rounded text-xs text-studio-accent bg-studio-accent/5 border border-studio-accent/20 hover:bg-studio-accent/10 transition-all"
            >
              <span>⧉</span>
              <span>Paste "{copiedLayer.name}"</span>
            </button>
          )}

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto scrollbar-studio py-1">
            {project.layers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 px-4 text-center">
                <div className="text-2xl opacity-20">⊕</div>
                <p className="text-xs text-studio-subtle">Add a layer to begin</p>
              </div>
            ) : (
              <div className="px-1 space-y-0.5">
                {project.layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`layer-item group ${layer.id === selectedLayerId ? "selected" : ""}`}
                    onClick={() => selectLayer(layer.id)}
                  >
                    <span className={`w-5 h-5 rounded shrink-0 flex items-center justify-center text-[9px] font-bold ${LAYER_TYPE_COLORS[layer.type] || "bg-studio-hover text-studio-muted"}`}>
                      {LAYER_TYPE_ICON[layer.type] || "?"}
                    </span>

                    <span className="text-xs text-studio-text truncate flex-1 min-w-0">{layer.name}</span>

                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                        className={`w-5 h-5 flex items-center justify-center rounded hover:bg-studio-hover text-[10px] transition-all ${!layer.visible ? "opacity-40" : ""}`}
                        title={layer.visible ? "Hide" : "Show"}
                      >
                        {layer.visible ? "◉" : "○"}
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
                ))}
              </div>
            )}
          </div>

          {/* Layer actions */}
          {selectedLayer && (
            <div className="border-t border-studio-border p-2 flex gap-1">
              <button onClick={() => moveLayerUp(selectedLayer.id)} className="studio-btn-icon flex-1 h-7 text-xs" title="Move Up (front)">↑</button>
              <button onClick={() => moveLayerDown(selectedLayer.id)} className="studio-btn-icon flex-1 h-7 text-xs" title="Move Down (back)">↓</button>
              <button onClick={() => copyLayer(selectedLayer.id)} className="studio-btn-icon flex-1 h-7 text-xs" title="Copy (⌘C)">⊕</button>
              <button onClick={() => duplicateLayer(selectedLayer.id)} className="studio-btn-icon flex-1 h-7 text-xs" title="Duplicate (⌘D)">⧉</button>
              <button onClick={() => removeLayer(selectedLayer.id)} className="flex-1 flex items-center justify-center h-7 rounded hover:bg-studio-error/15 hover:text-studio-error text-studio-muted transition-all text-xs" title="Delete (Del)">✕</button>
            </div>
          )}
        </div>
      )}

      {/* ── ASSETS PANEL ── */}
      {activePanelTab === "assets" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex border-b border-studio-border">
            {(["icons", "3d", "web"] as const).map(t => (
              <button key={t} onClick={() => setAssetTab(t)}
                className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wide transition-all ${assetTab === t ? "text-studio-accent border-b-2 border-studio-accent" : "text-studio-muted hover:text-studio-text"}`}>
                {t === "icons" ? "Icons" : t === "3d" ? "3D" : "Web"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-studio p-2">
            {assetTab === "icons" && (
              <>
                <input value={iconSearch} onChange={e => setIconSearch(e.target.value)}
                  className="property-input mb-2 text-xs" placeholder="Search icons..." />
                <div className="flex gap-1 flex-wrap mb-2">
                  {iconCategories.map(cat => (
                    <button key={cat} onClick={() => setIconCat(cat)}
                      className={`text-[9px] px-2 py-0.5 rounded-full transition-all ${iconCat === cat ? "bg-studio-accent/20 text-studio-accent" : "bg-studio-hover text-studio-muted"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
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
                  {filteredIcons.length === 0 && <div className="col-span-4 text-center py-6 text-xs text-studio-subtle">No icons found</div>}
                </div>
              </>
            )}
            {assetTab === "3d" && (
              <div className="grid grid-cols-2 gap-1.5">
                {OBJECTS_3D.map(obj => (
                  <button
                    key={obj.id}
                    onClick={() => addLayer("shape", { name: obj.name, shape: "rect", gradient: { type: "linear", angle: 135, stops: [{ color: "#00d4ff", position: 0 }, { color: "#7c3aed", position: 100 }] }, width: 120, height: 120, borderRadius: 16 })}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-studio-hover border border-studio-border hover:border-studio-accent/40 transition-all"
                    title={obj.name}
                  >
                    <img src={obj.thumbnail} alt={obj.name} className="w-full aspect-square rounded object-cover opacity-75" loading="lazy" />
                    <span className="text-[9px] text-studio-muted">{obj.name}</span>
                  </button>
                ))}
              </div>
            )}
            {assetTab === "web" && (
              <div className="flex flex-col gap-1.5">
                {WEB_ELEMENTS.map(el => (
                  <button
                    key={el.id}
                    onClick={() => addLayer("html", { name: el.name, content: el.content, width: 320, height: 80 })}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-studio-hover border border-studio-border hover:border-studio-accent/40 transition-all"
                  >
                    <div className="text-xs font-medium text-studio-text">{el.name}</div>
                    <div className="text-[10px] text-studio-subtle mt-0.5">{el.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ANIMATIONS PANEL ── */}
      {activePanelTab === "animations" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-2 border-b border-studio-border space-y-1.5">
            <input
              value={animationSearchQuery}
              onChange={e => setAnimationSearchQuery(e.target.value)}
              className="property-input text-xs"
              placeholder={`Search ${ANIMATION_PRESETS.length}+ presets…`}
            />
            <select value={animationCategoryFilter} onChange={e => setAnimationCategoryFilter(e.target.value)} className="property-input text-xs">
              {ANIMATION_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {!selectedLayerId && (
            <div className="px-3 py-2 text-xs text-studio-warning bg-studio-warning/10 border-b border-studio-warning/20 flex items-center gap-2">
              <span>⚠</span> Select a layer first
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-studio p-1.5 grid grid-cols-2 gap-1 content-start">
            {filteredAnimations.map(preset => {
              const isActive = selectedLayer?.animation?.presetId === preset.id;
              const catColors: Record<string, string> = {
                "Entrance": "bg-green-500/15 text-green-400",
                "Exit": "bg-red-500/15 text-red-400",
                "Attention": "bg-yellow-500/15 text-yellow-400",
                "Text": "bg-blue-500/15 text-blue-400",
                "Motion": "bg-purple-500/15 text-purple-400",
                "3D": "bg-cyan-500/15 text-cyan-400",
                "Special": "bg-pink-500/15 text-pink-400",
              };
              const catIcons: Record<string, string> = {
                "Entrance": "▶", "Exit": "◀", "Attention": "✦", "Text": "T", "Motion": "⟳", "3D": "◈", "Special": "✨",
              };
              return (
                <button
                  key={preset.id}
                  onClick={() => applyAnimation(preset.id)}
                  className={`preset-card ${isActive ? "active" : ""}`}
                  title={`${preset.name} (${preset.duration}s)`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs ${catColors[preset.category] || "bg-studio-hover text-studio-muted"}`}>
                    {catIcons[preset.category] || "★"}
                  </div>
                  <span className="text-[9px] text-studio-muted leading-tight line-clamp-2">{preset.name}</span>
                </button>
              );
            })}
            {filteredAnimations.length === 0 && (
              <div className="col-span-2 text-center py-10 text-xs text-studio-subtle">No presets match</div>
            )}
          </div>

          <div className="border-t border-studio-border px-3 py-1.5">
            <div className="text-[10px] text-studio-subtle">{filteredAnimations.length} / {ANIMATION_PRESETS.length} presets</div>
          </div>
        </div>
      )}

      {/* ── QUICK ADD PANEL ── */}
      {activePanelTab === "elements" && (
        <div className="flex flex-col flex-1 overflow-y-auto scrollbar-studio p-2 gap-1">
          <div className="studio-section-label px-0 pt-0">Text</div>
          {[
            { label: "Display Heading", action: () => addLayer("text", { content: "Display Heading", fontSize: 64, fontWeight: "800", color: "#ffffff", width: 500, height: 80 }) },
            { label: "Section Title", action: () => addLayer("text", { content: "Section Title", fontSize: 36, fontWeight: "700", color: "#ffffff", width: 400, height: 60 }) },
            { label: "Body Text", action: () => addLayer("text", { content: "Body text content goes here.", fontSize: 18, fontWeight: "400", color: "#9ca3af", width: 360, height: 50 }) },
            { label: "Caption", action: () => addLayer("text", { content: "Caption text", fontSize: 13, fontWeight: "400", color: "#6b7280", width: 200, height: 30 }) },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} className="w-full text-left px-2.5 py-2 rounded text-xs text-studio-muted hover:text-studio-text hover:bg-studio-hover transition-all">
              + {label}
            </button>
          ))}

          <div className="studio-section-label px-0">Shapes</div>
          {[
            { label: "Rectangle", action: () => addLayer("shape", { shape: "rect", fill: "#00d4ff", width: 200, height: 120, borderRadius: 8 }) },
            { label: "Rounded Rect", action: () => addLayer("shape", { shape: "rect", fill: "#7c3aed", width: 200, height: 120, borderRadius: 32 }) },
            { label: "Circle", action: () => addLayer("shape", { shape: "circle", fill: "#10b981", width: 120, height: 120 }) },
            { label: "Gradient Box", action: () => addLayer("shape", { shape: "rect", gradient: { type: "linear", angle: 135, stops: [{ color: "#00d4ff", position: 0 }, { color: "#7c3aed", position: 100 }] }, width: 200, height: 120, borderRadius: 16 }) },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} className="w-full text-left px-2.5 py-2 rounded text-xs text-studio-muted hover:text-studio-text hover:bg-studio-hover transition-all">
              + {label}
            </button>
          ))}

          <div className="studio-section-label px-0">Other</div>
          {[
            { label: "HTML Block", action: () => addLayer("html") },
            { label: "Icon Star", action: () => addLayer("icon", { content: "★", color: "#f59e0b", fontSize: 64 }) },
            { label: "Upload Image", action: triggerFileOpen },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} className="w-full text-left px-2.5 py-2 rounded text-xs text-studio-muted hover:text-studio-text hover:bg-studio-hover transition-all">
              + {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
