import { useEditorStore } from "@/stores/editorStore";

export default function AlignmentPanel() {
  const { project, selectedLayerId, updateLayer } = useEditorStore();
  const layer = project.layers.find(l => l.id === selectedLayerId);
  if (!layer) return null;

  const W = project.width;
  const H = project.height;

  const align = (action: string) => {
    switch (action) {
      case "left":       return updateLayer(layer.id, { x: 0 });
      case "center-h":   return updateLayer(layer.id, { x: Math.round((W - layer.width) / 2) });
      case "right":      return updateLayer(layer.id, { x: W - layer.width });
      case "top":        return updateLayer(layer.id, { y: 0 });
      case "center-v":   return updateLayer(layer.id, { y: Math.round((H - layer.height) / 2) });
      case "bottom":     return updateLayer(layer.id, { y: H - layer.height });
      case "center-both":return updateLayer(layer.id, { x: Math.round((W - layer.width) / 2), y: Math.round((H - layer.height) / 2) });
    }
  };

  const ALIGN_ACTIONS = [
    { id: "left",        title: "Align Left",       icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <rect x="0" y="2" width="2" height="12" /><rect x="3" y="4" width="8" height="3" /><rect x="3" y="9" width="10" height="3" />
      </svg>
    )},
    { id: "center-h",   title: "Center Horizontally", icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <rect x="7" y="0" width="2" height="16" opacity="0.4"/><rect x="3" y="4" width="10" height="3" /><rect x="4" y="9" width="8" height="3" />
      </svg>
    )},
    { id: "right",      title: "Align Right",      icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <rect x="14" y="2" width="2" height="12" /><rect x="5" y="4" width="8" height="3" /><rect x="3" y="9" width="10" height="3" />
      </svg>
    )},
    { id: "top",        title: "Align Top",         icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <rect x="2" y="0" width="12" height="2" /><rect x="4" y="3" width="3" height="8" /><rect x="9" y="3" width="3" height="10" />
      </svg>
    )},
    { id: "center-v",   title: "Center Vertically", icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <rect x="0" y="7" width="16" height="2" opacity="0.4"/><rect x="4" y="2" width="3" height="12" /><rect x="9" y="3" width="3" height="10" />
      </svg>
    )},
    { id: "bottom",     title: "Align Bottom",      icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <rect x="2" y="14" width="12" height="2" /><rect x="4" y="5" width="3" height="8" /><rect x="9" y="3" width="3" height="10" />
      </svg>
    )},
    { id: "center-both",title: "Center in Canvas",  icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <rect x="0" y="7" width="16" height="2" opacity="0.4"/><rect x="7" y="0" width="2" height="16" opacity="0.4"/>
        <rect x="5" y="5" width="6" height="6" rx="1" />
      </svg>
    )},
  ];

  return (
    <div className="border-t border-studio-border pt-2 mt-1">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-studio-subtle mb-1.5 px-0">Align to Canvas</div>
      <div className="grid grid-cols-7 gap-0.5">
        {ALIGN_ACTIONS.map(a => (
          <button
            key={a.id}
            onClick={() => align(a.id)}
            title={a.title}
            className="flex items-center justify-center h-7 rounded hover:bg-studio-hover text-studio-muted hover:text-studio-text transition-all"
          >
            {a.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
