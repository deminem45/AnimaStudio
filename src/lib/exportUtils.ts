import type { Project, Layer } from "@/types";

function getLayerCSS(layer: Layer): string {
  const filters = layer.filters?.map(f => {
    if (f.type === "drop-shadow") return `drop-shadow(0 ${f.value}px ${f.value * 2}px rgba(0,0,0,0.5))`;
    if (f.type === "hue-rotate") return `hue-rotate(${f.value}deg)`;
    return `${f.type}(${f.value}${f.type === "blur" ? "px" : "%"})`;
  }).join(" ") || "";

  const anim = layer.animation;
  const animCSS = anim?.presetId
    ? `animation: ${anim.presetId} ${anim.duration}s ${anim.easing} ${anim.delay}s ${anim.iterationCount} ${anim.direction};`
    : "";

  return `
    position: absolute;
    left: ${layer.x}px;
    top: ${layer.y}px;
    width: ${layer.width}px;
    height: ${layer.height}px;
    transform: rotate(${layer.rotation}deg);
    opacity: ${layer.opacity / 100};
    mix-blend-mode: ${layer.blendMode};
    ${filters ? `filter: ${filters};` : ""}
    ${layer.borderRadius ? `border-radius: ${layer.borderRadius}px;` : ""}
    ${animCSS}
    ${layer.visible ? "" : "display: none;"}
  `.trim();
}

function renderLayerHTML(layer: Layer): string {
  const style = getLayerCSS(layer);

  if (layer.type === "text") {
    return `<div style="${style}; color: ${layer.color || "#ffffff"}; font-size: ${layer.fontSize || 24}px; font-family: ${layer.fontFamily || "Inter, sans-serif"}; font-weight: ${layer.fontWeight || "400"}; text-align: ${layer.textAlign || "left"}; white-space: pre-wrap; display: flex; align-items: center;">${layer.content || ""}</div>`;
  }

  if (layer.type === "image") {
    return `<img src="${layer.src || ""}" style="${style}; object-fit: contain;" alt="layer" />`;
  }

  if (layer.type === "shape") {
    const fill = layer.fill || "#00d4ff";
    const border = layer.stroke ? `border: ${layer.strokeWidth || 2}px solid ${layer.stroke};` : "";
    if (layer.shape === "circle") {
      return `<div style="${style}; background: ${fill}; border-radius: 50%; ${border}"></div>`;
    }
    if (layer.shape === "triangle") {
      return `<div style="position: absolute; left: ${layer.x}px; top: ${layer.y}px; width: 0; height: 0; border-left: ${layer.width / 2}px solid transparent; border-right: ${layer.width / 2}px solid transparent; border-bottom: ${layer.height}px solid ${fill}; transform: rotate(${layer.rotation}deg); opacity: ${layer.opacity / 100};"></div>`;
    }
    return `<div style="${style}; background: ${fill}; ${border}"></div>`;
  }

  if (layer.type === "html") {
    return `<div style="${style};">${layer.content || ""}</div>`;
  }

  if (layer.type === "icon") {
    return `<div style="${style}; display: flex; align-items: center; justify-content: center; color: ${layer.color || "#ffffff"}; font-size: ${layer.fontSize || 48}px;">${layer.content || "★"}</div>`;
  }

  return `<div style="${style};"></div>`;
}

const ANIMATION_KEYFRAMES = `
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
@keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
@keyframes ripple { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
</style>
`;

export function exportToHTML(project: Project): string {
  const sortedLayers = [...project.layers].reverse().filter(l => l.visible);

  const layersHTML = sortedLayers.map(renderLayerHTML).join("\n    ");

  const bgStyle = project.background.startsWith("linear") || project.background.startsWith("radial")
    ? `background: ${project.background};`
    : `background-color: ${project.background};`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  ${ANIMATION_KEYFRAMES}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1a1a2e; font-family: Inter, sans-serif; }
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

export function exportToJS(project: Project): string {
  return `// AnimaStudio Export — ${project.name}
// Generated on ${new Date().toLocaleDateString()}

const project = ${JSON.stringify(project, null, 2)};

function render(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.style.position = 'relative';
  container.style.width = project.width + 'px';
  container.style.height = project.height + 'px';
  container.style.background = project.background;
  container.style.overflow = 'hidden';
  
  const visibleLayers = [...project.layers].reverse().filter(l => l.visible);
  visibleLayers.forEach(layer => {
    const el = document.createElement(layer.type === 'image' ? 'img' : 'div');
    el.style.position = 'absolute';
    el.style.left = layer.x + 'px';
    el.style.top = layer.y + 'px';
    el.style.width = layer.width + 'px';
    el.style.height = layer.height + 'px';
    el.style.transform = 'rotate(' + layer.rotation + 'deg)';
    el.style.opacity = layer.opacity / 100;
    if (layer.type === 'image') { el.src = layer.src || ''; }
    if (layer.type === 'text') { el.textContent = layer.content || ''; el.style.color = layer.color; el.style.fontSize = (layer.fontSize || 24) + 'px'; }
    if (layer.animation?.presetId) {
      el.style.animation = layer.animation.presetId + ' ' + layer.animation.duration + 's ' + layer.animation.easing + ' ' + layer.animation.delay + 's ' + layer.animation.iterationCount;
    }
    container.appendChild(el);
  });
}

export { project, render };
`;
}
