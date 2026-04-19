import { useState, useCallback } from "react";
import { toast } from "sonner";

type RemovalStatus = "idle" | "loading" | "done" | "error";

export function useBackgroundRemoval(onResult: (dataUrl: string) => void) {
  const [status, setStatus] = useState<RemovalStatus>("idle");
  const [progress, setProgress] = useState(0);

  const removeBg = useCallback(async (imageSrc: string) => {
    setStatus("loading");
    setProgress(0);

    try {
      const { removeBackground } = await import("@imgly/background-removal");

      // Fetch the image as a blob (handles both data URLs and URLs)
      let sourceBlob: Blob;
      if (imageSrc.startsWith("data:")) {
        const res = await fetch(imageSrc);
        sourceBlob = await res.blob();
      } else {
        const res = await fetch(imageSrc);
        sourceBlob = await res.blob();
      }

      const resultBlob = await removeBackground(sourceBlob, {
        progress: (key, current, total) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
        output: { format: "image/png", quality: 1 },
      });

      const url = URL.createObjectURL(resultBlob);
      // Convert to data URL for portability
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onResult(dataUrl);
        setStatus("done");
        setProgress(100);
        toast.success("Background removed successfully");
      };
      reader.readAsDataURL(resultBlob);
    } catch (err) {
      console.error("Background removal failed:", err);
      setStatus("error");
      toast.error("Background removal failed. Please try again.");
    }
  }, [onResult]);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
  }, []);

  return { removeBg, status, progress, reset };
}
