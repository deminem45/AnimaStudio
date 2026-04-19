import Header from "@/components/layout/Header";
import LeftPanel from "@/components/layout/LeftPanel";
import RightPanel from "@/components/layout/RightPanel";
import BottomTimeline from "@/components/layout/BottomTimeline";
import Canvas from "@/components/features/Canvas";
import NewProjectModal from "@/components/features/NewProjectModal";
import { useEditorStore } from "@/stores/editorStore";
import { useEffect } from "react";

export default function EditorPage() {
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, project } = useEditorStore();

  // Playback logic
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

      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const { selectedLayerId, removeLayer } = useEditorStore.getState();
        if (selectedLayerId) removeLayer(selectedLayerId);
      }
      if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const { selectedLayerId, duplicateLayer } = useEditorStore.getState();
        if (selectedLayerId) duplicateLayer(selectedLayerId);
      }
      if (e.key === "Escape") {
        useEditorStore.getState().selectLayer(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying]);

  return (
    <div className="h-screen flex flex-col bg-studio-bg overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <Canvas />
        <RightPanel />
      </div>

      <BottomTimeline />
      <NewProjectModal />
    </div>
  );
}
