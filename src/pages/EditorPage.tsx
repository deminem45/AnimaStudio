import Header from "@/components/layout/Header";
import LeftPanel from "@/components/layout/LeftPanel";
import RightPanel from "@/components/layout/RightPanel";
import BottomTimeline from "@/components/layout/BottomTimeline";
import Canvas from "@/components/features/Canvas";
import CSSPanel from "@/components/features/CSSPanel";
import NewProjectModal from "@/components/features/NewProjectModal";
import ShortcutsModal from "@/components/features/ShortcutsModal";
import TemplatesModal from "@/components/features/TemplatesModal";
import { useEditorStore } from "@/stores/editorStore";
import { useEffect } from "react";

export default function EditorPage() {
  const {
    isPlaying, setIsPlaying, currentTime, setCurrentTime, project,
    showShortcutsModal, setShowShortcutsModal,
    showTemplatesModal, setShowTemplatesModal,
    undo, redo, canUndo, canRedo,
    duplicateLayer, removeLayer, copyLayer, pasteLayer,
    selectedLayerId, selectLayer,
    setShowGrid, showGrid, setShowRulers, showRulers,
  } = useEditorStore();

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    let startTime = performance.now() - currentTime * 1000;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      if (elapsed >= project.duration) {
        setCurrentTime(0);
        setIsPlaying(false);
        return;
      }
      setCurrentTime(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === " ") { e.preventDefault(); setIsPlaying(!isPlaying); return; }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedLayerId) { removeLayer(selectedLayerId); return; }
      if (e.key === "Escape") { selectLayer(null); return; }

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); if (canUndo()) undo(); return; }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); if (canRedo()) redo(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") { e.preventDefault(); if (selectedLayerId) duplicateLayer(selectedLayerId); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "c") { if (selectedLayerId) copyLayer(selectedLayerId); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "v") { e.preventDefault(); pasteLayer(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "=") { e.preventDefault(); useEditorStore.getState().zoomIn(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") { e.preventDefault(); useEditorStore.getState().zoomOut(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "0") { e.preventDefault(); useEditorStore.getState().zoomFit(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); useEditorStore.getState().saveProject(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "t") { e.preventDefault(); setShowTemplatesModal(true); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") { e.preventDefault(); useEditorStore.getState().setShowNewProjectModal(true); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "p") { e.preventDefault(); /* handled in header */ return; }

      // Arrow key nudge
      if (selectedLayerId && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const nudge = e.shiftKey ? 10 : 1;
        const layer = useEditorStore.getState().project.layers.find(l => l.id === selectedLayerId);
        if (!layer) return;
        const dx = e.key === "ArrowLeft" ? -nudge : e.key === "ArrowRight" ? nudge : 0;
        const dy = e.key === "ArrowUp" ? -nudge : e.key === "ArrowDown" ? nudge : 0;
        useEditorStore.getState().updateLayer(selectedLayerId, { x: layer.x + dx, y: layer.y + dy });
        return;
      }

      if (e.key === "g" || e.key === "G") { setShowGrid(!showGrid); return; }
      if (e.key === "r" || e.key === "R") { setShowRulers(!showRulers); return; }
      if (e.key === "?") { setShowShortcutsModal(true); return; }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying, selectedLayerId, showGrid, showRulers]);

  return (
    <div className="h-screen flex flex-col bg-studio-bg overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <Canvas />
        <RightPanel />
        <CSSPanel />
      </div>
      <BottomTimeline />
      <NewProjectModal />
      {showShortcutsModal && <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />}
      {showTemplatesModal && <TemplatesModal onClose={() => setShowTemplatesModal(false)} />}
    </div>
  );
}
