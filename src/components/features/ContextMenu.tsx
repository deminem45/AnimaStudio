import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";

interface ContextMenuProps {
  x: number;
  y: number;
  layerId: string;
  onClose: () => void;
}

export default function ContextMenu({ x, y, layerId, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { duplicateLayer, removeLayer, copyLayer, toggleLayerVisibility, toggleLayerLock, moveLayerUp, moveLayerDown, project } = useEditorStore();
  const layer = project.layers.find(l => l.id === layerId);
  if (!layer) return null;

  useEffect(() => {
    const handleClick = () => onClose();
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, [onClose]);

  // Clamp to viewport
  const menuWidth = 180;
  const menuHeight = 260;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);

  const items = [
    {
      label: layer.visible ? "Hide Layer" : "Show Layer",
      icon: layer.visible ? "○" : "◉",
      action: () => { toggleLayerVisibility(layerId); onClose(); },
    },
    {
      label: layer.locked ? "Unlock Layer" : "Lock Layer",
      icon: layer.locked ? "🔓" : "🔒",
      action: () => { toggleLayerLock(layerId); onClose(); },
    },
    { divider: true },
    {
      label: "Copy",
      icon: "⊕",
      shortcut: "⌘C",
      action: () => { copyLayer(layerId); onClose(); },
    },
    {
      label: "Duplicate",
      icon: "⧉",
      shortcut: "⌘D",
      action: () => { duplicateLayer(layerId); onClose(); },
    },
    { divider: true },
    {
      label: "Bring Forward",
      icon: "↑",
      action: () => { moveLayerUp(layerId); onClose(); },
    },
    {
      label: "Send Backward",
      icon: "↓",
      action: () => { moveLayerDown(layerId); onClose(); },
    },
    { divider: true },
    {
      label: "Delete",
      icon: "✕",
      shortcut: "Del",
      danger: true,
      action: () => { removeLayer(layerId); onClose(); },
    },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-[100] bg-studio-panel border border-studio-border rounded-xl shadow-2xl py-1.5 overflow-hidden"
      style={{ left: clampedX, top: clampedY, width: menuWidth, minWidth: menuWidth }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Layer name header */}
      <div className="px-3 py-1.5 border-b border-studio-border mb-1">
        <div className="text-[10px] text-studio-subtle truncate">{layer.name}</div>
        <div className="text-[9px] text-studio-muted uppercase tracking-wider">{layer.type}</div>
      </div>

      {items.map((item, i) => {
        if ("divider" in item && item.divider) {
          return <div key={i} className="border-t border-studio-border my-1" />;
        }
        return (
          <button
            key={i}
            onClick={item.action}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
              item.danger
                ? "text-studio-error hover:bg-studio-error/10"
                : "text-studio-muted hover:text-studio-text hover:bg-studio-hover"
            }`}
          >
            <span className="w-4 text-center text-[12px]">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <kbd className="text-[9px] text-studio-subtle font-mono">{item.shortcut}</kbd>
            )}
          </button>
        );
      })}
    </div>
  );
}
