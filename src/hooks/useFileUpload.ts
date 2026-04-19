import { useState, useRef, useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";

export function useFileUpload() {
  const { addLayer } = useEditorStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = 600;
        const ratio = Math.min(1, maxW / img.width);
        addLayer("image", {
          name: file.name.replace(/\.[^.]+$/, ""),
          src,
          width: Math.round(img.width * ratio),
          height: Math.round(img.height * ratio),
          x: 50,
          y: 50,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [addLayer]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const triggerFileOpen = useCallback(() => fileRef.current?.click(), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(processFile);
    if (fileRef.current) fileRef.current.value = "";
  }, [processFile]);

  return { isDragOver, fileRef, handleDrop, handleDragOver, handleDragLeave, triggerFileOpen, handleFileChange };
}
