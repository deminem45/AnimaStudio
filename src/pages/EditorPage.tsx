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

      // Play/Pause
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
        return;
      }

      // Delete layer
      if ((e.key === "Delete" || e.key === "Backspace") && selectedLayerId) {
        removeLayer(selectedLayerId);
        return;
      }

      // Escape
      if (e.key === "Escape") {
        selectLayer(null);
        return;
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) redo();
        return;
      }

      // Duplicate
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        if (selectedLayerId) duplicateLayer(selectedLayerId);
        return;
      }

      // Copy
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        if (selectedLayerId) copyLayer(selectedLayerId);
        return;
      }

      // Paste
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        e.preventDefault();
        pasteLayer();
        return;
      }

      // Zoom
      if ((e.metaKey || e.ctrlKey) && e.key === "=") {
        e.preventDefault();
        useEditorStore.getState().zoomIn();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault();
        useEditorStore.getState().zoomOut();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault();
        useEditorStore.getState().zoomFit();
        return;
      }

      // Toggle grid/rulers
      if (e.key === "g" || e.key === "G") { setShowGrid(!showGrid); return; }
      if (e.key === "r" || e.key === "R") { setShowRulers(!showRulers); return; }

      // Shortcuts modal
      if (e.key === "?") {
        setShowShortcutsModal(true);
        return;
      }

      // Templates
      if ((e.metaKey || e.ctrlKey) && e.key === "t") {
        e.preventDefault();
        setShowTemplatesModal(true);
        return;
      }

      // New project
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        useEditorStore.getState().setShowNewProjectModal(true);
        return;
      }

      // Save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        useEditorStore.getState().saveProject();
        return;
      }
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
