import { useState, useCallback, useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";
import type { Layer } from "@/types";

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  layerStartX: number;
  layerStartY: number;
}

interface ResizeState {
  isResizing: boolean;
  corner: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLayerX: number;
  startLayerY: number;
}

export function useCanvas() {
  const { project, canvasTransform, selectedLayerId, selectLayer, updateLayer, setCanvasTransform, snapToGrid, gridSize } = useEditorStore();
  const dragState = useRef<DragState>({ isDragging: false, startX: 0, startY: 0, layerStartX: 0, layerStartY: 0 });
  const resizeState = useRef<ResizeState>({ isResizing: false, corner: "se", startX: 0, startY: 0, startWidth: 0, startHeight: 0, startLayerX: 0, startLayerY: 0 });

  const snap = useCallback((v: number) => {
    if (!snapToGrid) return Math.round(v);
    return Math.round(v / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  const startDrag = useCallback((e: React.MouseEvent, layer: Layer) => {
    if (layer.locked) return;
    e.stopPropagation();
    e.preventDefault();
    selectLayer(layer.id);
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      layerStartX: layer.x,
      layerStartY: layer.y,
    };

    const onMove = (me: MouseEvent) => {
      if (!dragState.current.isDragging) return;
      const dx = (me.clientX - dragState.current.startX) / canvasTransform.scale;
      const dy = (me.clientY - dragState.current.startY) / canvasTransform.scale;
      updateLayer(layer.id, {
        x: snap(dragState.current.layerStartX + dx),
        y: snap(dragState.current.layerStartY + dy),
      });
    };

    const onUp = () => {
      dragState.current.isDragging = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [canvasTransform.scale, selectLayer, updateLayer, snap]);

  const startResize = useCallback((e: React.MouseEvent, layer: Layer, corner: string) => {
    if (layer.locked) return;
    e.stopPropagation();
    e.preventDefault();
    resizeState.current = {
      isResizing: true,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: layer.width,
      startHeight: layer.height,
      startLayerX: layer.x,
      startLayerY: layer.y,
    };

    const onMove = (me: MouseEvent) => {
      if (!resizeState.current.isResizing) return;
      const rs = resizeState.current;
      const dx = (me.clientX - rs.startX) / canvasTransform.scale;
      const dy = (me.clientY - rs.startY) / canvasTransform.scale;

      const updates: Partial<Layer> = {};

      if (rs.corner.includes("e")) {
        updates.width = Math.max(20, snap(rs.startWidth + dx));
      }
      if (rs.corner.includes("w")) {
        const newW = Math.max(20, snap(rs.startWidth - dx));
        updates.width = newW;
        updates.x = snap(rs.startLayerX + (rs.startWidth - newW));
      }
      if (rs.corner.includes("s")) {
        updates.height = Math.max(20, snap(rs.startHeight + dy));
      }
      if (rs.corner.includes("n")) {
        const newH = Math.max(20, snap(rs.startHeight - dy));
        updates.height = newH;
        updates.y = snap(rs.startLayerY + (rs.startHeight - newH));
      }

      // Edge midpoints
      if (rs.corner === "e") { updates.width = Math.max(20, snap(rs.startWidth + dx)); }
      if (rs.corner === "w") { const newW = Math.max(20, snap(rs.startWidth - dx)); updates.width = newW; updates.x = snap(rs.startLayerX + (rs.startWidth - newW)); }
      if (rs.corner === "s") { updates.height = Math.max(20, snap(rs.startHeight + dy)); }
      if (rs.corner === "n") { const newH = Math.max(20, snap(rs.startHeight - dy)); updates.height = newH; updates.y = snap(rs.startLayerY + (rs.startHeight - newH)); }

      updateLayer(layer.id, updates);
    };

    const onUp = () => {
      resizeState.current.isResizing = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [canvasTransform.scale, updateLayer, snap]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const factor = e.deltaY > 0 ? 0.9 : 1.11;
      const newScale = Math.max(0.08, Math.min(5, canvasTransform.scale * factor));
      setCanvasTransform({ scale: newScale });
    } else {
      setCanvasTransform({
        offsetX: canvasTransform.offsetX - e.deltaX * 0.8,
        offsetY: canvasTransform.offsetY - e.deltaY * 0.8,
      });
    }
  }, [canvasTransform, setCanvasTransform]);

  return {
    project,
    canvasTransform,
    selectedLayerId,
    startDrag,
    startResize,
    handleWheel,
  };
}
