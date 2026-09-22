/**
 * Punto de entrada único del JavaScript del tema Bárbaro.
 * Cada módulo mantiene una responsabilidad independiente.
 */
import { initBootstrapComponents } from './modules/bootstrap-components.js';
import { initFormValidation } from './modules/form-validation.js';
import { initTheme } from './modules/theme.js';
import { initDesertScene } from './modules/desert-scene.js';

function initApp() {
  initBootstrapComponents();
  initFormValidation();
  initTheme();
  initDesertScene();
}

initApp();
