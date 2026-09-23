import {
  changeKpiValue,
  initKpis,
  refreshKpi,
  setKpiValue
} from './components/kpis.js';

export {
  changeKpiValue,
  initKpis,
  refreshKpi,
  setKpiValue
};

const COLOR_MODE_KEY = 'barbarian-color-mode';
const LEGACY_COLOR_MODE_KEY = 'tema-barbaro';
const VARIANT_KEY = 'barbarian-variant';
const VALID_COLOR_MODES = new Set(['light', 'dark', 'auto']);
const systemColorMode = matchMedia('(prefers-color-scheme: dark)');

let activeColorMode = 'auto';

export const variants = Object.freeze([
  'desert',
  'nordic',
  'blood',
  'ice',
  'dark-kingdom'
]);

function getRoot() {
  return document.documentElement;
}

export function getSystemColorMode() {
  return systemColorMode.matches ? 'dark' : 'light';
}

export function getStoredColorMode() {
  try {
    return localStorage.getItem(COLOR_MODE_KEY)
      || localStorage.getItem(LEGACY_COLOR_MODE_KEY);
  } catch {
    return null;
  }
}

export function getStoredVariant() {
  try {
    return localStorage.getItem(VARIANT_KEY);
  } catch {
    return null;
  }
}

export function setColorMode(mode = 'auto', { persist = true } = {}) {
  const requested = VALID_COLOR_MODES.has(mode) ? mode : 'auto';
  const resolved = requested === 'auto' ? getSystemColorMode() : requested;

  activeColorMode = requested;
  getRoot().setAttribute('data-bs-theme', resolved);

  if (persist) {
    try {
      localStorage.setItem(COLOR_MODE_KEY, requested);
      localStorage.removeItem(LEGACY_COLOR_MODE_KEY);
    } catch {}
  }

  document.dispatchEvent(new CustomEvent('barbarian:themechange', {
    detail: { mode: requested, resolved }
  }));

  // Compatibility event consumed by the optional desert effect.
  document.dispatchEvent(new CustomEvent('tema-cambiado', { detail: resolved }));

  return resolved;
}

export function toggleColorMode(options) {
  const current = getRoot().getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light';
  return setColorMode(current === 'dark' ? 'light' : 'dark', options);
}

export function setVariant(variant = 'desert', { persist = true } = {}) {
  const next = variants.includes(variant) ? variant : 'desert';
  getRoot().setAttribute('data-barbarian-variant', next);

  if (persist) {
    try { localStorage.setItem(VARIANT_KEY, next); } catch {}
  }

  document.dispatchEvent(new CustomEvent('barbarian:variantchange', {
    detail: { variant: next }
  }));

  return next;
}

export function bindControls(scope = document) {
  scope.querySelectorAll('[data-barbarian-color-toggle]').forEach(button => {
    if (button.dataset.barbarianBound === 'true') return;
    button.dataset.barbarianBound = 'true';
    button.addEventListener('click', () => toggleColorMode());
  });

  scope.querySelectorAll('[data-barbarian-set-variant]').forEach(control => {
    if (control.dataset.barbarianBound === 'true') return;
    control.dataset.barbarianBound = 'true';
    control.addEventListener('click', () => {
      setVariant(control.getAttribute('data-barbarian-set-variant'));
    });
  });
}

export function init({
  colorMode = getStoredColorMode() || 'auto',
  variant = getStoredVariant() || 'desert',
  controls = true,
  kpis = true
} = {}) {
  setColorMode(colorMode, { persist: false });
  setVariant(variant, { persist: false });
  if (controls) bindControls();
  if (kpis) initKpis();
  return { colorMode, variant };
}

systemColorMode.addEventListener?.('change', () => {
  if (activeColorMode === 'auto') {
    setColorMode('auto', { persist: false });
  }
});
