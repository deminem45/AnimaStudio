import { useRef, useCallback, memo } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { useCanvas } from "@/hooks/useCanvas";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { Layer } from "@/types";

function getFilterString(layer: Layer): string | undefined {
  if (!layer.filters?.length && !layer.glowColor) return undefined;
  const parts: string[] = [];
  if (layer.filters) {
    layer.filters.forEach(f => {
      if (f.type === "drop-shadow") parts.push(`drop-shadow(0 ${f.value}px ${f.value * 2}px rgba(0,0,0,0.5))`);
      else if (f.type === "hue-rotate") parts.push(`hue-rotate(${f.value}deg)`);
      else if (f.type === "blur") parts.push(`blur(${f.value}px)`);
      else parts.push(`${f.type}(${f.value}%)`);
    });
  }
  if (layer.glowColor && layer.glowIntensity) {
    const i = layer.glowIntensity;
    parts.push(`drop-shadow(0 0 ${i}px ${layer.glowColor}) drop-shadow(0 0 ${i * 2}px ${layer.glowColor}50)`);
  }
  return parts.length ? parts.join(" ") : undefined;
}

function getLayerStyle(layer: Layer, isPlaying: boolean): React.CSSProperties {
  const anim = layer.animation;
  const filter = getFilterString(layer);
  const shadow = layer.boxShadow;

  return {
    position: "absolute",
    left: layer.x,
    top: layer.y,
    width: layer.width,
    height: layer.height,
    transform: `rotate(${layer.rotation}deg)`,
    opacity: layer.opacity / 100,
    mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
    filter,
    boxShadow: shadow || undefined,
    borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
    display: layer.visible ? undefined : "none",
    cursor: layer.locked ? "not-allowed" : "move",
    animation: isPlaying && anim?.presetId
      ? `${anim.presetId} ${anim.duration}s ${anim.easing} ${anim.delay}s ${anim.iterationCount} ${anim.direction}`
      : undefined,
    willChange: "transform",
  };
}

const TextLayerContent = memo(({ layer }: { layer: Layer }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      color: layer.color || "#ffffff",
      fontSize: layer.fontSize || 24,
      fontFamily: layer.fontFamily || "Inter, sans-serif",
      fontWeight: layer.fontWeight || "400",
      textAlign: (layer.textAlign as React.CSSProperties["textAlign"]) || "left",
      letterSpacing: layer.letterSpacing ? `${layer.letterSpacing}px` : undefined,
      lineHeight: layer.lineHeight || 1.4,
      textShadow: layer.textShadow || undefined,
      display: "flex",
      alignItems: "center",
      outline: "none",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      userSelect: "none",
      pointerEvents: "none",
      padding: "4px",
    }}
  >
    {layer.content || ""}
  </div>
));

const ShapeLayerContent = memo(({ layer }: { layer: Layer }) => {
  const fillStyle = layer.gradient
    ? buildGradientCSS(layer.gradient)
    : (layer.fill || "#00d4ff");

  if (layer.shape === "circle") {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: fillStyle,
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
      background: fillStyle,
      border: layer.strokeWidth ? `${layer.strokeWidth}px solid ${layer.stroke || "#fff"}` : undefined,
      borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
    }} />
  );
});

function buildGradientCSS(grad: NonNullable<Layer["gradient"]>): string {
  const stops = grad.stops.map(s => `${s.color} ${s.position}%`).join(", ");
  if (grad.type === "radial") return `radial-gradient(circle, ${stops})`;
  return `linear-gradient(${grad.angle}deg, ${stops})`;
}

const LayerRenderer = memo(({ layer, isSelected, isPlaying, onMouseDown, onResizeStart }: {
  layer: Layer;
  isSelected: boolean;
  isPlaying: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, corner: string) => void;
}) => {
  const style = getLayerStyle(layer, isPlaying);

  return (
    <div
      style={style}
      className={`canvas-element ${isSelected ? "selected" : ""}`}
      onMouseDown={onMouseDown}
    >
      {layer.type === "text" && <TextLayerContent layer={layer} />}
      {layer.type === "shape" && <ShapeLayerContent layer={layer} />}
      {layer.type === "image" && layer.src && (
        <img
          src={layer.src}
          alt={layer.name}
          style={{ width: "100%", height: "100%", objectFit: layer.objectFit || "contain", display: "block" }}
          draggable={false}
        />
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
          textShadow: layer.textShadow || undefined,
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

      {/* Multi-corner resize handles */}
      {isSelected && !layer.locked && !isPlaying && (
        <>
          {/* Corners */}
          {[
            { cursor: "nw-resize", style: { top: -4, left: -4 }, corner: "nw" },
            { cursor: "ne-resize", style: { top: -4, right: -4 }, corner: "ne" },
            { cursor: "se-resize", style: { bottom: -4, right: -4 }, corner: "se" },
            { cursor: "sw-resize", style: { bottom: -4, left: -4 }, corner: "sw" },
          ].map(h => (
            <div
              key={h.corner}
              onMouseDown={(e) => onResizeStart(e, h.corner)}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                background: "#00d4ff",
                border: "2px solid #0a0b0f",
                borderRadius: 2,
                cursor: h.cursor,
                ...h.style,
                zIndex: 10,
              }}
            />
          ))}
          {/* Edge midpoints */}
          {[
            { cursor: "n-resize", style: { top: -4, left: "50%", transform: "translateX(-50%)" }, corner: "n" },
            { cursor: "s-resize", style: { bottom: -4, left: "50%", transform: "translateX(-50%)" }, corner: "s" },
            { cursor: "e-resize", style: { right: -4, top: "50%", transform: "translateY(-50%)" }, corner: "e" },
            { cursor: "w-resize", style: { left: -4, top: "50%", transform: "translateY(-50%)" }, corner: "w" },
          ].map(h => (
            <div
              key={h.corner}
              onMouseDown={(e) => onResizeStart(e, h.corner)}
              style={{
                position: "absolute",
                width: 6,
                height: 6,
                background: "#00d4ff",
                border: "1.5px solid #0a0b0f",
                borderRadius: 1,
                cursor: h.cursor,
                ...h.style as React.CSSProperties,
                zIndex: 10,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
});

function CanvasRuler({ width, height, scale, show }: { width: number; height: number; scale: number; show: boolean }) {
  if (!show) return null;
  const RULER_SIZE = 20;
  const markStep = scale < 0.5 ? 100 : scale < 1 ? 50 : 25;
  const hMarks: number[] = [];
  const vMarks: number[] = [];
  for (let x = 0; x <= width; x += markStep) hMarks.push(x);
  for (let y = 0; y <= height; y += markStep) vMarks.push(y);

  return (
    <>
      {/* Top ruler */}
      <div style={{
        position: "absolute", top: 0, left: RULER_SIZE, right: 0, height: RULER_SIZE,
        background: "#111218", borderBottom: "1px solid #252736", overflow: "hidden", zIndex: 5, pointerEvents: "none",
      }}>
        {hMarks.map(x => (
          <div key={x} style={{ position: "absolute", left: x * scale, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ width: 1, height: 4, background: "#4b5563", marginTop: 8 }} />
            <span style={{ fontSize: 8, color: "#4b5563", marginLeft: 2, whiteSpace: "nowrap" }}>{x}</span>
          </div>
        ))}
      </div>
      {/* Left ruler */}
      <div style={{
        position: "absolute", top: RULER_SIZE, left: 0, width: RULER_SIZE, bottom: 0,
        background: "#111218", borderRight: "1px solid #252736", overflow: "hidden", zIndex: 5, pointerEvents: "none",
      }}>
        {vMarks.map(y => (
          <div key={y} style={{ position: "absolute", top: y * scale, display: "flex", alignItems: "flex-start" }}>
            <div style={{ height: 1, width: 4, background: "#4b5563", marginLeft: 8 }} />
            <span style={{ fontSize: 8, color: "#4b5563", marginTop: 2, writingMode: "vertical-lr", whiteSpace: "nowrap" }}>{y}</span>
          </div>
        ))}
      </div>
      {/* Corner */}
      <div style={{ position: "absolute", top: 0, left: 0, width: RULER_SIZE, height: RULER_SIZE, background: "#111218", borderRight: "1px solid #252736", borderBottom: "1px solid #252736", zIndex: 6 }} />
    </>
  );
}

export default function Canvas() {
  const {
    project, selectedLayerId, selectLayer, isPlaying, showGrid, showRulers,
  } = useEditorStore();
  const { canvasTransform, startDrag, startResize, handleWheel } = useCanvas();
  const { isDragOver, handleDrop, handleDragOver, handleDragLeave } = useFileUpload();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectLayer(null);
    }
  }, [selectLayer]);

  const bgStyle: React.CSSProperties = {
    background: project.background.startsWith("linear") || project.background.startsWith("radial")
      ? project.background
      : undefined,
    backgroundColor: !project.background.startsWith("linear") && !project.background.startsWith("radial") && project.background !== "transparent"
      ? project.background
      : undefined,
  };

  const canvasStyle: React.CSSProperties = {
    position: "relative",
    width: project.width,
    height: project.height,
    ...bgStyle,
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.9)",
    backgroundImage: project.background === "transparent"
      ? "repeating-conic-gradient(#1a1c26 0% 25%, #111218 0% 50%) 0 0 / 16px 16px"
      : showGrid
        ? `${project.background !== "transparent" ? "" : ""}linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)`
        : undefined,
    backgroundSize: showGrid ? "32px 32px" : undefined,
  };

  const RULER_SIZE = showRulers ? 20 : 0;

  const wrapperStyle: React.CSSProperties = {
    transform: `scale(${canvasTransform.scale}) translate(${canvasTransform.offsetX / canvasTransform.scale}px, ${canvasTransform.offsetY / canvasTransform.scale}px)`,
    transformOrigin: "center center",
  };

  const sortedLayers = [...project.layers].reverse();

  return (
    <div
      ref={containerRef}
      className={`flex-1 canvas-workspace flex items-center justify-center overflow-hidden relative ${isDragOver ? "ring-2 ring-studio-accent ring-inset" : ""}`}
      style={{ paddingLeft: RULER_SIZE, paddingTop: RULER_SIZE }}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Rulers */}
      {showRulers && (
        <CanvasRuler
          width={project.width}
          height={project.height}
          scale={canvasTransform.scale}
          show={showRulers}
        />
      )}

      {/* Drop overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-studio-accent/5 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-studio-panel border-2 border-studio-accent border-dashed rounded-2xl px-10 py-8 text-center">
            <div className="text-4xl mb-3">🖼</div>
            <div className="text-sm font-semibold text-studio-accent">Drop images to add layers</div>
            <div className="text-xs text-studio-muted mt-1">PNG, JPG, SVG, WebP supported</div>
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
              onResizeStart={(e, corner) => startResize(e, layer, corner)}
            />
          ))}

          {/* Empty state */}
          {project.layers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center pointer-events-none">
              <div className="text-6xl opacity-8 select-none">◈</div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-studio-muted opacity-40">Canvas is empty</p>
                <p className="text-xs text-studio-subtle opacity-30">Add layers from the left panel · Drop images here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas status bar */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2.5 text-[10px] text-studio-subtle pointer-events-none select-none bg-studio-panel/80 backdrop-blur px-3 py-1.5 rounded-full border border-studio-border/50">
        <span className="font-mono">{project.width} × {project.height}</span>
        <span className="text-studio-border">·</span>
        <span>{project.layers.length} layer{project.layers.length !== 1 ? "s" : ""}</span>
        <span className="text-studio-border">·</span>
        <span className="font-mono">{Math.round(canvasTransform.scale * 100)}%</span>
        {showGrid && <><span className="text-studio-border">·</span><span className="text-studio-accent">Grid</span></>}
      </div>
    </div>
  );
}
