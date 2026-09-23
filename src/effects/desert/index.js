import { initDesertScene } from './desert-scene.js';

export { initDesertScene };

/**
 * Optional effect entry point. The core Barbarian Theme never imports this.
 * The current effect expects #escena and optionally #toggleViento.
 */
export function initDesertEffect() {
  return initDesertScene();
}
