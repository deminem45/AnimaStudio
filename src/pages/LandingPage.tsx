import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero-editor.jpg";
import logoIcon from "@/assets/logo-icon.png";

const FEATURES = [
  { icon: "✦", title: "300+ Animation Presets", desc: "Entrance, Exit, Attention, Text, Motion & Special effects. Fully customizable timing, easing & direction.", color: "text-studio-accent" },
  { icon: "⊞", title: "Layer Composition", desc: "Photoshop-style layer stack. Blend modes, opacity, filters, locking, glow effects.", color: "text-purple-400" },
  { icon: "⏱", title: "Visual Timeline", desc: "Scrub through time, adjust animation bars, set delays and durations per layer.", color: "text-blue-400" },
  { icon: "✨", title: "AI Background Removal", desc: "Upload any image and remove the background instantly with WebAssembly AI — no server needed.", color: "text-green-400" },
  { icon: "◈", title: "Gradient Editor", desc: "Create linear and radial gradients with unlimited color stops, live preview on any shape.", color: "text-yellow-400" },
  { icon: "⬇", title: "One-Click HTML Export", desc: "Self-contained .html with all animations, CSS, and assets embedded. Ready to deploy.", color: "text-orange-400" },
  { icon: "📐", title: "Smart Grid & Rulers", desc: "Snap to grid, pixel rulers, and multi-handle resize for pixel-perfect compositions.", color: "text-pink-400" },
  { icon: "⌘", title: "Undo/Redo + History", desc: "Full 50-step undo/redo history. Copy, paste, duplicate layers with keyboard shortcuts.", color: "text-cyan-400" },
  { icon: "CSS", title: "Live CSS Preview", desc: "See the generated CSS for any layer in real time. Copy and use in your own codebase.", color: "text-studio-accent" },
];

const STATS = [
  { label: "Animation Presets", value: "300+" },
  { label: "Export Formats", value: "3" },
  { label: "Icon Library", value: "60+" },
  { label: "Canvas Templates", value: "12" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-studio-bg text-studio-text overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-studio-bg/90 backdrop-blur-xl border-b border-studio-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="AnimaStudio" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-bold text-base text-studio-text">AnimaStudio</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-studio-muted hover:text-studio-text transition-colors hidden md:block">Features</a>
            <button
              onClick={() => navigate("/editor")}
              className="bg-studio-accent text-studio-bg text-sm font-bold px-5 py-2 rounded-lg hover:bg-studio-accent-dim transition-all neon-glow"
            >
              Open Editor →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-studio-accent/4 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-48 left-1/3 w-[300px] h-[300px] bg-studio-purple/4 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-studio-accent/10 border border-studio-accent/20 rounded-full px-4 py-1.5 text-xs text-studio-accent font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-studio-accent rounded-full animate-pulse" />
            Professional Animated Web Content Studio
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl text-studio-text leading-[1.05] mb-5 animate-fade-in">
            Create Stunning
            <br />
            <span className="bg-gradient-to-r from-studio-accent via-blue-300 to-studio-purple bg-clip-text text-transparent">
              Animated Web Content
            </span>
          </h1>

          <p className="text-lg text-studio-muted max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in">
            A browser-based studio with layered canvas, 300+ animation presets, AI background removal, gradient editor, live CSS preview, and one-click HTML export.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-in">
            <button
              onClick={() => navigate("/editor")}
              className="bg-studio-accent text-studio-bg font-bold text-base px-8 py-3.5 rounded-xl hover:bg-studio-accent-dim transition-all neon-glow hover:scale-105 duration-200"
            >
              Start Creating Free →
            </button>
            <button
              onClick={() => navigate("/editor")}
              className="text-sm text-studio-muted border border-studio-border px-6 py-3.5 rounded-xl hover:border-studio-accent/40 hover:text-studio-text transition-all"
            >
              View Templates
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mt-12 animate-fade-in">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-2xl text-studio-accent">{s.value}</div>
                <div className="text-[10px] text-studio-subtle mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Screenshot */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-studio-border shadow-[0_0_80px_rgba(0,212,255,0.08)] animate-fade-in">
            <div className="bg-studio-panel px-4 py-2.5 flex items-center gap-2 border-b border-studio-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 bg-studio-bg rounded px-3 py-1 text-xs text-studio-subtle mx-4">
                animastudio.app/editor
              </div>
            </div>
            <img src={heroImg} alt="AnimaStudio Editor" className="w-full object-cover" style={{ maxHeight: 440 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-studio-bg/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-studio-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-studio-accent mb-3">Full Feature Set</div>
            <h2 className="font-display font-bold text-4xl text-studio-text">
              Everything a Web Designer Needs
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="bg-studio-surface border border-studio-border rounded-xl p-5 hover:border-studio-border/80 hover:bg-studio-hover/30 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className={`text-2xl mb-3 ${f.color}`}>{f.icon}</div>
                <h3 className="font-display font-semibold text-sm text-studio-text mb-1.5">{f.title}</h3>
                <p className="text-xs text-studio-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center bg-gradient-to-br from-studio-accent/8 to-studio-purple/8 border border-studio-accent/20 rounded-2xl p-10">
          <div className="text-3xl mb-4">◈</div>
          <h2 className="font-display font-bold text-3xl text-studio-text mb-3">
            Ready to Build?
          </h2>
          <p className="text-studio-muted text-sm mb-6 leading-relaxed">No signup. No subscription. Open the editor and start creating animated web content now.</p>
          <button
            onClick={() => navigate("/editor")}
            className="bg-studio-accent text-studio-bg font-bold text-base px-10 py-4 rounded-xl hover:bg-studio-accent-dim transition-all neon-glow hover:scale-105 duration-200"
          >
            Open AnimaStudio →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-studio-border px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="AnimaStudio" className="w-5 h-5 rounded" />
            <span className="text-sm text-studio-muted font-medium">AnimaStudio</span>
          </div>
          <span className="text-xs text-studio-subtle">© 2026 AnimaStudio — Professional animated web content editor.</span>
        </div>
      </footer>
    </div>
  );
}
