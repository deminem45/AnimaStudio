import { useRef, useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { useCanvas } from "@/hooks/useCanvas";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { Layer } from "@/types";

function getLayerStyle(layer: Layer, isPlaying: boolean): React.CSSProperties {
  const filters = layer.filters?.map(f => {
    if (f.type === "drop-shadow") return `drop-shadow(0 ${f.value}px ${f.value * 2}px rgba(0,0,0,0.5))`;
    if (f.type === "hue-rotate") return `hue-rotate(${f.value}deg)`;
    return `${f.type}(${f.value}${f.type === "blur" ? "px" : "%"})`;
  }).join(" ") || undefined;

  const anim = layer.animation;

  return {
    position: "absolute",
    left: layer.x,
    top: layer.y,
    width: layer.width,
    height: layer.height,
    transform: `rotate(${layer.rotation}deg)`,
    opacity: layer.opacity / 100,
    mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
    filter: filters,
    borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
    display: layer.visible ? undefined : "none",
    cursor: layer.locked ? "not-allowed" : "move",
    animation: isPlaying && anim?.presetId
      ? `${anim.presetId} ${anim.duration}s ${anim.easing} ${anim.delay}s ${anim.iterationCount} ${anim.direction}`
      : undefined,
  };
}

function TextLayerContent({ layer }: { layer: Layer }) {
  const { updateLayer } = useEditorStore();
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={e => updateLayer(layer.id, { content: e.currentTarget.textContent || "" })}
      style={{
        width: "100%",
        height: "100%",
        color: layer.color || "#ffffff",
        fontSize: layer.fontSize || 24,
        fontFamily: layer.fontFamily || "Inter, sans-serif",
        fontWeight: layer.fontWeight || "400",
        textAlign: (layer.textAlign as React.CSSProperties["textAlign"]) || "left",
        display: "flex",
        alignItems: "center",
        outline: "none",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {layer.content || ""}
    </div>
  );
}

function ShapeLayerContent({ layer }: { layer: Layer }) {
  if (layer.shape === "circle") {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: layer.fill || "#00d4ff",
        border: layer.strokeWidth ? `${layer.strokeWidth}px solid ${layer.stroke || "#fff"}` : undefined,
      }} />
    );
  }
  if (layer.shape === "triangle") {
    return (
      <div style={{
        width: 0,
        height: 0,
        borderLeft: `${layer.width / 2}px solid transparent`,
        borderRight: `${layer.width / 2}px solid transparent`,
        borderBottom: `${layer.height}px solid ${layer.fill || "#00d4ff"}`,
      }} />
    );
  }
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: layer.fill || "#00d4ff",
      border: layer.strokeWidth ? `${layer.strokeWidth}px solid ${layer.stroke || "#fff"}` : undefined,
      borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
    }} />
  );
}

function LayerRenderer({ layer, isSelected, isPlaying, onMouseDown, onDoubleClick, onResizeStart }: {
  layer: Layer;
  isSelected: boolean;
  isPlaying: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
}) {
  const style = getLayerStyle(layer, isPlaying);

  return (
    <div
      style={style}
      className={`canvas-element ${isSelected ? "selected" : ""}`}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {layer.type === "text" && <TextLayerContent layer={layer} />}
      {layer.type === "shape" && <ShapeLayerContent layer={layer} />}
      {layer.type === "image" && layer.src && (
        <img src={layer.src} alt={layer.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} draggable={false} />
      )}
      {layer.type === "icon" && (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: layer.color || "#00d4ff",
          fontSize: layer.fontSize || 48,
          userSelect: "none",
        }}>
          {layer.content || "★"}
        </div>
      )}
      {layer.type === "html" && (
        <div
          style={{ width: "100%", height: "100%", overflow: "hidden" }}
          dangerouslySetInnerHTML={{ __html: layer.content || "" }}
        />
      )}

      {/* Resize handle */}
      {isSelected && !layer.locked && (
        <div className="resize-handle" onMouseDown={onResizeStart} />
      )}
    </div>
  );
}

export default function Canvas() {
  const {
    project, selectedLayerId, selectLayer, isPlaying,
    activeTool,
  } = useEditorStore();
  const { canvasTransform, startDrag, startResize, handleWheel, startEditText } = useCanvas();
  const { isDragOver, handleDrop, handleDragOver, handleDragLeave } = useFileUpload();
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan with middle mouse or space+drag
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectLayer(null);
    }
  }, [selectLayer]);

  const canvasStyle: React.CSSProperties = {
    position: "relative",
    width: project.width,
    height: project.height,
    background: project.background,
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.8)",
  };

  const wrapperStyle: React.CSSProperties = {
    transform: `scale(${canvasTransform.scale}) translate(${canvasTransform.offsetX / canvasTransform.scale}px, ${canvasTransform.offsetY / canvasTransform.scale}px)`,
    transformOrigin: "center center",
  };

  const sortedLayers = [...project.layers].reverse();

  return (
    <div
      ref={containerRef}
      className={`flex-1 canvas-workspace flex items-center justify-center overflow-hidden relative ${isDragOver ? "ring-2 ring-studio-accent ring-inset" : ""}`}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drop overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-studio-accent/5 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-studio-panel border-2 border-studio-accent border-dashed rounded-xl px-8 py-6 text-center">
            <div className="text-3xl mb-2">🖼</div>
            <div className="text-sm font-semibold text-studio-accent">Drop images to add layers</div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div style={wrapperStyle}>
        <div style={canvasStyle}>
          {sortedLayers.map(layer => (
            <LayerRenderer
              key={layer.id}
              layer={layer}
              isSelected={layer.id === selectedLayerId}
              isPlaying={isPlaying}
              onMouseDown={(e) => startDrag(e, layer)}
              onDoubleClick={(e) => { if (layer.type === "text") startEditText(layer.id); }}
              onResizeStart={(e) => startResize(e, layer)}
            />
          ))}

          {/* Empty state */}
          {project.layers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
              <div className="text-5xl opacity-10 select-none">◈</div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-studio-muted opacity-50">Empty canvas</p>
                <p className="text-xs text-studio-subtle opacity-40">Add layers from the left panel</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas overlay info */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] text-studio-subtle pointer-events-none select-none">
        <span>{project.width} × {project.height}px</span>
        <span>·</span>
        <span>{project.layers.length} layers</span>
        <span>·</span>
        <span>Scroll to zoom · Ctrl+Scroll to zoom</span>
      </div>
    </div>
  );
}
