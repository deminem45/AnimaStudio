export default function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const SHORTCUTS = [
    { section: "Selection" },
    { key: "Click", desc: "Select layer" },
    { key: "Esc", desc: "Deselect all" },
    { key: "Delete / ⌫", desc: "Remove selected layer" },
    { section: "Edit" },
    { key: "⌘Z", desc: "Undo" },
    { key: "⇧⌘Z", desc: "Redo" },
    { key: "⌘D", desc: "Duplicate layer" },
    { key: "⌘C", desc: "Copy layer" },
    { key: "⌘V", desc: "Paste layer" },
    { section: "View" },
    { key: "⌘+", desc: "Zoom In" },
    { key: "⌘-", desc: "Zoom Out" },
    { key: "⌘0", desc: "Fit to screen" },
    { key: "G", desc: "Toggle grid" },
    { key: "R", desc: "Toggle rulers" },
    { section: "Playback" },
    { key: "Space", desc: "Play / Pause preview" },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-studio-panel border border-studio-border rounded-2xl shadow-2xl w-full max-w-sm p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-studio-text">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="studio-btn-icon w-7 h-7">✕</button>
        </div>

        <div className="space-y-0.5">
          {SHORTCUTS.map((item, i) => (
            "section" in item ? (
              <div key={i} className="text-[10px] font-semibold uppercase tracking-widest text-studio-subtle pt-3 pb-1 first:pt-0">
                {item.section}
              </div>
            ) : (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-studio-border/40">
                <span className="text-xs text-studio-muted">{item.desc}</span>
                <kbd className="bg-studio-hover border border-studio-border text-studio-text text-[10px] font-mono px-2 py-0.5 rounded">
                  {item.key}
                </kbd>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
