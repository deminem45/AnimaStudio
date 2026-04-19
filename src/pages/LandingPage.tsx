import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero-editor.jpg";
import logoIcon from "@/assets/logo-icon.png";

const FEATURES = [
  { icon: "✦", title: "300+ Animation Presets", desc: "Entrance, Exit, Attention, Text, Motion & Special effects. Fully customizable." },
  { icon: "⊞", title: "Layer Composition", desc: "Photoshop-style layer stack with blend modes, opacity, filters, and locking." },
  { icon: "⏱", title: "Timeline Editor", desc: "Hybrid preset picker + visual timeline scrubber with keyframe control." },
  { icon: "🖼", title: "AI Background Removal", desc: "Upload any image and instantly remove or swap backgrounds with AI." },
  { icon: "◈", title: "3D Object Library", desc: "30+ 3D assets in GLTF/OBJ format — Geometric, Characters, Space, UI & more." },
  { icon: "⬇", title: "One-Click HTML Export", desc: "Export self-contained .html files with all animations and styling preserved." },
];

const STATS = [
  { label: "Animation Presets", value: "300+" },
  { label: "3D Objects", value: "30+" },
  { label: "Icon Library", value: "60+" },
  { label: "Export Formats", value: "3" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-studio-bg text-studio-text overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-studio-bg/80 backdrop-blur-xl border-b border-studio-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="AnimaStudio" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-bold text-base text-studio-text">AnimaStudio</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-studio-muted hover:text-studio-text transition-colors hidden md:block">Features</a>
            <a href="#pricing" className="text-sm text-studio-muted hover:text-studio-text transition-colors hidden md:block">Pricing</a>
            <button
              onClick={() => navigate("/editor")}
              className="studio-btn-primary text-sm"
            >
              Open Editor →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-studio-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-studio-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-studio-accent/10 border border-studio-accent/20 rounded-full px-4 py-1.5 text-xs text-studio-accent font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-studio-accent rounded-full animate-pulse" />
            Professional Web Animation Studio — 300+ Presets
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl text-studio-text leading-tight mb-6 animate-fade-in">
            Create Stunning
            <br />
            <span className="bg-gradient-to-r from-studio-accent via-blue-400 to-studio-purple bg-clip-text text-transparent">
              Animated Web Content
            </span>
          </h1>

          <p className="text-lg text-studio-muted max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in">
            A browser-based studio combining layered composition, 300+ animation presets, AI background removal, and one-click HTML export — built for web designers.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in">
            <button
              onClick={() => navigate("/editor")}
              className="bg-studio-accent text-studio-bg font-bold text-base px-8 py-3.5 rounded-xl hover:bg-studio-accent-dim transition-all neon-glow hover:scale-105 duration-200"
            >
              Start Creating Free →
            </button>
            <a href="#features" className="text-sm text-studio-muted hover:text-studio-text border border-studio-border px-6 py-3.5 rounded-xl hover:border-studio-hover transition-all">
              See Features
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-6 max-w-xl mx-auto mt-12 animate-fade-in">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-2xl text-studio-accent">{s.value}</div>
                <div className="text-xs text-studio-subtle mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Screenshot */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-studio-border shadow-2xl animate-fade-in">
            {/* Fake browser chrome */}
            <div className="bg-studio-panel px-4 py-2.5 flex items-center gap-2 border-b border-studio-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 bg-studio-bg rounded-md mx-4 px-3 py-1 text-xs text-studio-subtle">animastudio.app/editor</div>
            </div>
            <img src={heroImg} alt="AnimaStudio Editor" className="w-full object-cover" style={{ maxHeight: 420 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-studio-bg/30 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-studio-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-studio-accent mb-3">Everything You Need</div>
            <h2 className="font-display font-bold text-4xl text-studio-text">
              Built for Professional Web Designers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="bg-studio-surface border border-studio-border rounded-xl p-5 hover:border-studio-accent/30 transition-all duration-200 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-display font-semibold text-base text-studio-text mb-2">{feature.title}</h3>
                <p className="text-sm text-studio-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-studio-accent/10 to-studio-purple/10 border border-studio-accent/20 rounded-2xl p-10">
          <h2 className="font-display font-bold text-3xl text-studio-text mb-4">
            Ready to Build Animated Web Content?
          </h2>
          <p className="text-studio-muted mb-6">Start free — no signup required. Open the editor and start creating.</p>
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
          <span className="text-xs text-studio-subtle">© 2026 AnimaStudio. Professional animated web content editor.</span>
        </div>
      </footer>
    </div>
  );
}
