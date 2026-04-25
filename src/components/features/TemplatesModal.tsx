import { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import type { ProjectTemplate } from "@/types";

const TEMPLATES: ProjectTemplate[] = [
  { id: "hero-banner", name: "Hero Banner", category: "Marketing", thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=170&fit=crop", width: 1280, height: 720, description: "Bold animated headline and CTA" },
  { id: "product-card", name: "Product Showcase", category: "E-Commerce", thumbnail: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=170&fit=crop", width: 800, height: 600, description: "Clean product presentation with highlights" },
  { id: "social-post", name: "Social Post", category: "Social", thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=170&fit=crop", width: 1080, height: 1080, description: "Square animated post for Instagram & Twitter" },
  { id: "web-story", name: "Web Story", category: "Social", thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&h=170&fit=crop", width: 1080, height: 1920, description: "Full-screen vertical story format" },
  { id: "logo-reveal", name: "Logo Reveal", category: "Branding", thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&h=170&fit=crop", width: 800, height: 400, description: "Cinematic logo reveal animation" },
  { id: "data-viz", name: "Data Card", category: "Dashboard", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=170&fit=crop", width: 600, height: 400, description: "Animated metric card with counters" },
  { id: "ad-banner", name: "Leaderboard Ad", category: "Advertising", thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=300&h=170&fit=crop", width: 728, height: 90, description: "Standard display leaderboard banner" },
  { id: "email-header", name: "Email Header", category: "Email", thumbnail: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=300&h=170&fit=crop", width: 600, height: 200, description: "Animated email header element" },
  { id: "loading-screen", name: "Loading Screen", category: "Web UI", thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=170&fit=crop", width: 1280, height: 720, description: "App splash screen with animation" },
  { id: "notification", name: "Notification Popup", category: "Web UI", thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=170&fit=crop", width: 400, height: 100, description: "Animated mobile-style notification" },
  { id: "og-image", name: "Social OG Image", category: "Marketing", thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=170&fit=crop", width: 1200, height: 628, description: "Open Graph image for link previews" },
  { id: "blank", name: "Blank Canvas", category: "Start Fresh", thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=170&fit=crop&blur=60&sat=-100", width: 1280, height: 720, description: "Start from scratch" },
];

const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

export default function TemplatesModal({ onClose }: { onClose: () => void }) {
  const { createNewProject } = useEditorStore();
  const [selectedCat, setSelectedCat] = useState("All");

  const filtered = selectedCat === "All" ? TEMPLATES : TEMPLATES.filter(t => t.category === selectedCat);

  const handleSelect = (tpl: ProjectTemplate) => {
    createNewProject(tpl.name, tpl.width, tpl.height);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-6" onClick={onClose}>
      <div className="bg-studio-panel border border-studio-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border">
          <div>
            <h2 className="font-display font-bold text-xl text-studio-text">Project Templates</h2>
            <p className="text-xs text-studio-muted mt-0.5">Pre-configured canvas sizes for every use case</p>
          </div>
          <button onClick={onClose} className="studio-btn-icon w-8 h-8 text-sm">✕</button>
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 px-6 py-3 border-b border-studio-border overflow-x-auto scrollbar-studio">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${selectedCat === cat ? "bg-studio-accent text-studio-bg" : "bg-studio-hover text-studio-muted hover:text-studio-text"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto scrollbar-studio p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleSelect(tpl)}
                className="text-left rounded-xl border border-studio-border hover:border-studio-accent/50 bg-studio-surface overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
              >
                <div className="relative overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                  <img src={tpl.thumbnail} alt={tpl.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-75" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-studio-surface/90 to-transparent" />
                  <span className="absolute bottom-2 right-2 text-[9px] bg-studio-bg/80 text-studio-muted font-mono px-2 py-0.5 rounded">
                    {tpl.width}×{tpl.height}
                  </span>
                  <span className="absolute top-2 left-2 text-[9px] bg-studio-accent/20 text-studio-accent border border-studio-accent/30 px-2 py-0.5 rounded-full font-medium">
                    {tpl.category}
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-studio-text">{tpl.name}</div>
                  <div className="text-[10px] text-studio-muted mt-0.5 leading-relaxed">{tpl.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
