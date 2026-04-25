import { useEditorStore } from "@/stores/editorStore";
import { ANIMATION_PRESETS } from "@/constants/animations";
import type { Layer } from "@/types";

function buildLayerCSS(layer: Layer): string {
  const filters: string[] = [];
  if (layer.filters) {
    layer.filters.forEach(f => {
      if (f.type === "blur") filters.push(`blur(${f.value}px)`);
      else if (f.type === "hue-rotate") filters.push(`hue-rotate(${f.value}deg)`);
      else if (f.type === "drop-shadow") filters.push(`drop-shadow(0 ${f.value}px ${f.value * 2}px rgba(0,0,0,0.5))`);
      else filters.push(`${f.type}(${f.value}%)`);
    });
  }
  if (layer.glowColor && layer.glowIntensity) {
    const i = layer.glowIntensity;
    filters.push(`drop-shadow(0 0 ${i}px ${layer.glowColor}) drop-shadow(0 0 ${i * 2}px ${layer.glowColor}50)`);
  }

  const anim = layer.animation;
  const lines: string[] = [
    `position: absolute;`,
    `left: ${layer.x}px;`,
    `top: ${layer.y}px;`,
    `width: ${layer.width}px;`,
    `height: ${layer.height}px;`,
    `transform: rotate(${layer.rotation}deg);`,
    `opacity: ${layer.opacity / 100};`,
    `mix-blend-mode: ${layer.blendMode};`,
  ];

  if (filters.length) lines.push(`filter: ${filters.join(" ")};`);
  if (layer.boxShadow) lines.push(`box-shadow: ${layer.boxShadow};`);
  if (layer.borderRadius) lines.push(`border-radius: ${layer.borderRadius}px;`);
  if (!layer.visible) lines.push(`display: none;`);
  if (anim?.presetId) lines.push(`animation: ${anim.presetId} ${anim.duration}s ${anim.easing} ${anim.delay}s ${anim.iterationCount} ${anim.direction};`);

  return lines.join("\n    ");
}

function buildGradientCSS(grad: NonNullable<Layer["gradient"]>): string {
  const stops = grad.stops.map(s => `${s.color} ${s.position}%`).join(", ");
  if (grad.type === "radial") return `radial-gradient(circle, ${stops})`;
  return `linear-gradient(${grad.angle}deg, ${stops})`;
}

function renderLayerHTML(layer: Layer): string {
  const css = buildLayerCSS(layer);

  if (layer.type === "text") {
    const shadow = layer.textShadow ? `text-shadow: ${layer.textShadow};` : "";
    const ls = layer.letterSpacing ? `letter-spacing: ${layer.letterSpacing}px;` : "";
    const lh = layer.lineHeight ? `line-height: ${layer.lineHeight};` : "";
    return `<div style="${css}; color: ${layer.color || "#fff"}; font-size: ${layer.fontSize || 24}px; font-family: ${layer.fontFamily || "Inter, sans-serif"}; font-weight: ${layer.fontWeight || "400"}; text-align: ${layer.textAlign || "left"}; white-space: pre-wrap; display: flex; align-items: center; padding: 4px; ${shadow} ${ls} ${lh}">${layer.content || ""}</div>`;
  }

  if (layer.type === "image") {
    return `<img src="${layer.src || ""}" style="${css}; object-fit: ${layer.objectFit || "contain"};" alt="${layer.name}" />`;
  }

  if (layer.type === "shape") {
    const fill = layer.gradient ? buildGradientCSS(layer.gradient) : (layer.fill || "#00d4ff");
    const border = layer.stroke ? `border: ${layer.strokeWidth || 2}px solid ${layer.stroke};` : "";
    if (layer.shape === "circle") return `<div style="${css}; background: ${fill}; border-radius: 50%; ${border}"></div>`;
    if (layer.shape === "triangle") return `<div style="position: absolute; left: ${layer.x}px; top: ${layer.y}px; width: 0; height: 0; border-left: ${layer.width / 2}px solid transparent; border-right: ${layer.width / 2}px solid transparent; border-bottom: ${layer.height}px solid ${layer.fill || "#00d4ff"}; transform: rotate(${layer.rotation}deg); opacity: ${layer.opacity / 100};"></div>`;
    return `<div style="${css}; background: ${fill}; ${border}"></div>`;
  }

  if (layer.type === "html") return `<div style="${css};">${layer.content || ""}</div>`;

  if (layer.type === "icon") {
    const shadow = layer.textShadow ? `text-shadow: ${layer.textShadow};` : "";
    return `<div style="${css}; display: flex; align-items: center; justify-content: center; color: ${layer.color || "#fff"}; font-size: ${layer.fontSize || 48}px; ${shadow}">${layer.content || "★"}</div>`;
  }

  return `<div style="${css};"></div>`;
}

const ANIMATION_CSS = `
<style>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slide-from-left { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slide-from-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slide-from-top { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes slide-from-bottom { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes zoom-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes zoom-out-in { from { transform: scale(1.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes rotate-in { from { transform: rotate(-180deg) scale(0); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }
@keyframes bounce-in { 0% { transform: scale(0); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
@keyframes flip-in-x { from { transform: rotateX(-90deg); opacity: 0; } to { transform: rotateX(0); opacity: 1; } }
@keyframes flip-in-y { from { transform: rotateY(-90deg); opacity: 0; } to { transform: rotateY(0); opacity: 1; } }
@keyframes light-speed-in { from { transform: translateX(-100%) skewX(-30deg); opacity: 0; } 60% { transform: skewX(20deg); opacity: 1; } 80% { transform: skewX(-5deg); } 100% { transform: translateX(0); } }
@keyframes pulse-scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
@keyframes swing { 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } 100% { transform: rotate(0); } }
@keyframes rubber-band { 0% { transform: scaleX(1); } 30% { transform: scaleX(1.25) scaleY(0.75); } 60% { transform: scaleX(0.75) scaleY(1.25); } 100% { transform: scaleX(1); } }
@keyframes heart-beat { 0% { transform: scale(1); } 14% { transform: scale(1.3); } 28% { transform: scale(1); } 42% { transform: scale(1.3); } 70% { transform: scale(1); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
@keyframes jello { 0%, 100% { transform: skewX(0) skewY(0); } 30% { transform: skewX(-12.5deg) skewY(-12.5deg); } 60% { transform: skewX(6.25deg) skewY(6.25deg); } }
@keyframes tada { 0% { transform: scale(1); } 10%, 20% { transform: scale(0.9) rotate(-3deg); } 30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); } 40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); } 100% { transform: scale(1) rotate(0); } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes zoomOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0.3); opacity: 0; } }
@keyframes slideOutLeft { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
@keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
@keyframes neonGlow { 0%, 100% { filter: drop-shadow(0 0 5px #00d4ff) drop-shadow(0 0 15px #00d4ff); } 50% { filter: drop-shadow(0 0 20px #00d4ff) drop-shadow(0 0 40px #00d4ff); } }
@keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-3px, 3px); } 40% { transform: translate(3px, -3px); } 60% { transform: translate(-3px, -3px); } 80% { transform: translate(3px, 3px); } 100% { transform: translate(0); } }
@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
@keyframes ripple { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
@keyframes typewriter { from { width: 0; } to { width: 100%; } }
@keyframes blink-caret { 0%, 100% { border-color: transparent; } 50% { border-color: currentColor; } }
@keyframes morph { 0%, 100% { border-radius: 50%; } 50% { border-radius: 0; } }
@keyframes spin-fast { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes shimmer-slide { from { background-position: -200% 0; } to { background-position: 200% 0; } }
</style>
`;

export function exportToHTML(project: import("@/types").Project): string {
  const sortedLayers = [...project.layers].reverse().filter(l => l.visible);
  const layersHTML = sortedLayers.map(renderLayerHTML).join("\n    ");

  const bgStyle = project.background.startsWith("linear") || project.background.startsWith("radial")
    ? `background: ${project.background};`
    : project.background === "transparent"
      ? "background: transparent;"
      : `background-color: ${project.background};`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  ${ANIMATION_CSS}
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #0a0a14;
      font-family: Inter, system-ui, sans-serif;
    }
    .canvas-container {
      position: relative;
      width: ${project.width}px;
      height: ${project.height}px;
      ${bgStyle}
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="canvas-container">
    ${layersHTML}
  </div>
</body>
</html>`;
}

export function exportToJS(project: import("@/types").Project): string {
  return `// AnimaStudio Export — ${project.name}
// Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

const project = ${JSON.stringify(project, null, 2)};

function render(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return console.error("Container not found:", containerId);
  
  container.style.cssText = \`
    position: relative;
    width: \${project.width}px;
    height: \${project.height}px;
    background: \${project.background};
    overflow: hidden;
  \`;

  const visibleLayers = [...project.layers].reverse().filter(l => l.visible);
  
  visibleLayers.forEach(layer => {
    const el = document.createElement(layer.type === "image" ? "img" : "div");
    el.style.position = "absolute";
    el.style.left = layer.x + "px";
    el.style.top = layer.y + "px";
    el.style.width = layer.width + "px";
    el.style.height = layer.height + "px";
    el.style.transform = "rotate(" + layer.rotation + "deg)";
    el.style.opacity = layer.opacity / 100;
    el.style.mixBlendMode = layer.blendMode;
    if (layer.borderRadius) el.style.borderRadius = layer.borderRadius + "px";
    if (layer.boxShadow) el.style.boxShadow = layer.boxShadow;
    
    if (layer.type === "image") {
      el.src = layer.src || "";
      el.style.objectFit = layer.objectFit || "contain";
    }
    if (layer.type === "text") {
      el.textContent = layer.content || "";
      el.style.color = layer.color || "#fff";
      el.style.fontSize = (layer.fontSize || 24) + "px";
      el.style.fontFamily = layer.fontFamily || "Inter, sans-serif";
      el.style.fontWeight = layer.fontWeight || "400";
      el.style.textAlign = layer.textAlign || "left";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.whiteSpace = "pre-wrap";
      if (layer.textShadow) el.style.textShadow = layer.textShadow;
      if (layer.letterSpacing) el.style.letterSpacing = layer.letterSpacing + "px";
    }
    if (layer.type === "html") el.innerHTML = layer.content || "";
    if (layer.type === "icon") {
      el.textContent = layer.content || "★";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.color = layer.color || "#fff";
      el.style.fontSize = (layer.fontSize || 48) + "px";
    }
    if (layer.animation?.presetId) {
      el.style.animation = \`\${layer.animation.presetId} \${layer.animation.duration}s \${layer.animation.easing} \${layer.animation.delay}s \${layer.animation.iterationCount} \${layer.animation.direction}\`;
    }
    container.appendChild(el);
  });
}

export { project, render };
`;
}

// Live CSS preview for selected layer
export function generateLayerCSS(layer: import("@/types").Layer): string {
  return `.layer-${layer.id.slice(0, 6)} {
  position: absolute;
  left: ${layer.x}px;
  top: ${layer.y}px;
  width: ${layer.width}px;
  height: ${layer.height}px;
  transform: rotate(${layer.rotation}deg);
  opacity: ${layer.opacity / 100};
  mix-blend-mode: ${layer.blendMode};${layer.borderRadius ? `\n  border-radius: ${layer.borderRadius}px;` : ""}${layer.boxShadow ? `\n  box-shadow: ${layer.boxShadow};` : ""}${layer.animation?.presetId ? `\n  animation: ${layer.animation.presetId} ${layer.animation.duration}s ${layer.animation.easing} ${layer.animation.delay}s ${layer.animation.iterationCount} ${layer.animation.direction};` : ""}
}`;
}
