import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { Quality } from './renderer';

/**
 * Cheap bloom (high quality only). On 'low' it renders straight to screen.
 * Use instead of renderer.render(scene, camera).
 */
export class PostFX {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private quality: Quality;
  private w = 1;
  private h = 1;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, quality: Quality = 'high') {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.quality = quality;
    const size = renderer.getSize(new THREE.Vector2());
    this.w = Math.max(1, size.x); this.h = Math.max(1, size.y);
    this.setQuality(quality);
  }

  setQuality(q: Quality): void {
    this.quality = q;
    if (q === 'low') { this.disposeComposer(); return; }
    if (this.composer) return;
    const pr = Math.min(this.renderer.getPixelRatio(), 1.5);
    const rt = new THREE.WebGLRenderTarget(this.w * pr, this.h * pr, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(this.renderer, rt);
    composer.setPixelRatio(pr);
    composer.setSize(this.w, this.h);
    composer.addPass(new RenderPass(this.scene, this.camera));
    // bloom at reduced resolution; threshold high so only the blade, sparks and flashes glow
    this.bloom = new UnrealBloomPass(new THREE.Vector2(this.w / 2, this.h / 2), 0.5, 0.4, 1.35);
    composer.addPass(this.bloom);
    composer.addPass(new OutputPass());
    this.composer = composer;
  }

  /** Bloom strength (e.g. pump it briefly on explosions). */
  setBloom(strength: number): void { if (this.bloom) this.bloom.strength = strength; }

  setSize(w: number, h: number): void {
    this.w = Math.max(1, w); this.h = Math.max(1, h);
    w = this.w; h = this.h;
    if (this.composer) {
      this.composer.setPixelRatio(Math.min(this.renderer.getPixelRatio(), 1.5));
      this.composer.setSize(w, h);
    }
  }

  render(dt = 1 / 60): void {
    if (this.composer && this.quality === 'high') this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }

  private disposeComposer(): void {
    if (!this.composer) return;
    for (const p of this.composer.passes) (p as unknown as { dispose?: () => void }).dispose?.();
    this.composer.renderTarget1.dispose();
    this.composer.renderTarget2.dispose();
    this.composer = null;
    this.bloom = null;
  }

  dispose(): void { this.disposeComposer(); }
}
