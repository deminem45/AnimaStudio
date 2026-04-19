import { useState, useRef, useCallback } from "react";
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
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

export function useCanvas() {
  const { project, canvasTransform, selectedLayerId, selectLayer, updateLayer, setCanvasTransform } = useEditorStore();
  const dragState = useRef<DragState>({ isDragging: false, startX: 0, startY: 0, layerStartX: 0, layerStartY: 0 });
  const resizeState = useRef<ResizeState>({ isResizing: false, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const canvasToScreen = useCallback((x: number, y: number) => ({
    x: x * canvasTransform.scale + canvasTransform.offsetX,
    y: y * canvasTransform.scale + canvasTransform.offsetY,
  }), [canvasTransform]);

  const screenToCanvas = useCallback((sx: number, sy: number) => ({
    x: (sx - canvasTransform.offsetX) / canvasTransform.scale,
    y: (sy - canvasTransform.offsetY) / canvasTransform.scale,
  }), [canvasTransform]);

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
        x: Math.round(dragState.current.layerStartX + dx),
        y: Math.round(dragState.current.layerStartY + dy),
      });
    };

    const onUp = () => {
      dragState.current.isDragging = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [canvasTransform.scale, selectLayer, updateLayer]);

  const startResize = useCallback((e: React.MouseEvent, layer: Layer) => {
    if (layer.locked) return;
    e.stopPropagation();
    e.preventDefault();
    resizeState.current = {
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: layer.width,
      startHeight: layer.height,
    };

    const onMove = (me: MouseEvent) => {
      if (!resizeState.current.isResizing) return;
      const dx = (me.clientX - resizeState.current.startX) / canvasTransform.scale;
      const dy = (me.clientY - resizeState.current.startY) / canvasTransform.scale;
      updateLayer(layer.id, {
        width: Math.max(20, Math.round(resizeState.current.startWidth + dx)),
        height: Math.max(20, Math.round(resizeState.current.startHeight + dy)),
      });
    };

    const onUp = () => {
      resizeState.current.isResizing = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [canvasTransform.scale, updateLayer]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setCanvasTransform({ scale: Math.max(0.1, Math.min(4, canvasTransform.scale * factor)) });
    } else {
      setCanvasTransform({
        offsetX: canvasTransform.offsetX - e.deltaX,
        offsetY: canvasTransform.offsetY - e.deltaY,
      });
    }
  }, [canvasTransform, setCanvasTransform]);

  const startEditText = useCallback((layerId: string) => {
    setEditingTextId(layerId);
  }, []);

  const stopEditText = useCallback(() => {
    setEditingTextId(null);
  }, []);

  return {
    project,
    canvasTransform,
    selectedLayerId,
    editingTextId,
    startDrag,
    startResize,
    handleWheel,
    startEditText,
    stopEditText,
    canvasToScreen,
    screenToCanvas,
  };
}
