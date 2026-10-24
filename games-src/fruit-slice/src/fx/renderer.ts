import * as THREE from 'three';

export type Quality = 'low' | 'high';

/** WebGL renderer configured for the Table Slice look (sRGB, ACES, soft PCF shadows). */
export function createRenderer(canvas: HTMLCanvasElement, quality: Quality): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    stencil: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  // PCFSoftShadowMap was removed in r18x; PCF + light.shadow.radius gives soft edges.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x1b1410, 1);
  applyRendererQuality(renderer, quality);
  return renderer;
}

/** Update pixel ratio for a quality level (call after the user changes settings). */
export function applyRendererQuality(renderer: THREE.WebGLRenderer, quality: Quality): void {
  const cap = quality === 'high' ? 2 : 1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
}
