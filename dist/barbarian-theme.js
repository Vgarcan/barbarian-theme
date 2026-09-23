var BarbarianTheme = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/barbarian-theme.js
  var barbarian_theme_exports = {};
  __export(barbarian_theme_exports, {
    bindControls: () => bindControls,
    getStoredColorMode: () => getStoredColorMode,
    getStoredVariant: () => getStoredVariant,
    getSystemColorMode: () => getSystemColorMode,
    init: () => init,
    setColorMode: () => setColorMode,
    setVariant: () => setVariant,
    toggleColorMode: () => toggleColorMode,
    variants: () => variants
  });
  var COLOR_MODE_KEY = "barbarian-color-mode";
  var LEGACY_COLOR_MODE_KEY = "tema-barbaro";
  var VARIANT_KEY = "barbarian-variant";
  var VALID_COLOR_MODES = /* @__PURE__ */ new Set(["light", "dark", "auto"]);
  var systemColorMode = matchMedia("(prefers-color-scheme: dark)");
  var activeColorMode = "auto";
  var variants = Object.freeze([
    "desert",
    "nordic",
    "blood",
    "ice",
    "dark-kingdom"
  ]);
  function getRoot() {
    return document.documentElement;
  }
  function getSystemColorMode() {
    return systemColorMode.matches ? "dark" : "light";
  }
  function getStoredColorMode() {
    try {
      return localStorage.getItem(COLOR_MODE_KEY) || localStorage.getItem(LEGACY_COLOR_MODE_KEY);
    } catch {
      return null;
    }
  }
  function getStoredVariant() {
    try {
      return localStorage.getItem(VARIANT_KEY);
    } catch {
      return null;
    }
  }
  function setColorMode(mode = "auto", { persist = true } = {}) {
    const requested = VALID_COLOR_MODES.has(mode) ? mode : "auto";
    const resolved = requested === "auto" ? getSystemColorMode() : requested;
    activeColorMode = requested;
    getRoot().setAttribute("data-bs-theme", resolved);
    if (persist) {
      try {
        localStorage.setItem(COLOR_MODE_KEY, requested);
        localStorage.removeItem(LEGACY_COLOR_MODE_KEY);
      } catch {
      }
    }
    document.dispatchEvent(new CustomEvent("barbarian:themechange", {
      detail: { mode: requested, resolved }
    }));
    document.dispatchEvent(new CustomEvent("tema-cambiado", { detail: resolved }));
    return resolved;
  }
  function toggleColorMode(options) {
    const current = getRoot().getAttribute("data-bs-theme") === "dark" ? "dark" : "light";
    return setColorMode(current === "dark" ? "light" : "dark", options);
  }
  function setVariant(variant = "desert", { persist = true } = {}) {
    const next = variants.includes(variant) ? variant : "desert";
    getRoot().setAttribute("data-barbarian-variant", next);
    if (persist) {
      try {
        localStorage.setItem(VARIANT_KEY, next);
      } catch {
      }
    }
    document.dispatchEvent(new CustomEvent("barbarian:variantchange", {
      detail: { variant: next }
    }));
    return next;
  }
  function bindControls(scope = document) {
    scope.querySelectorAll("[data-barbarian-color-toggle]").forEach((button) => {
      if (button.dataset.barbarianBound === "true") return;
      button.dataset.barbarianBound = "true";
      button.addEventListener("click", () => toggleColorMode());
    });
    scope.querySelectorAll("[data-barbarian-set-variant]").forEach((control) => {
      if (control.dataset.barbarianBound === "true") return;
      control.dataset.barbarianBound = "true";
      control.addEventListener("click", () => {
        setVariant(control.getAttribute("data-barbarian-set-variant"));
      });
    });
  }
  function init({
    colorMode = getStoredColorMode() || "auto",
    variant = getStoredVariant() || "desert",
    controls = true
  } = {}) {
    setColorMode(colorMode, { persist: false });
    setVariant(variant, { persist: false });
    if (controls) bindControls();
    return { colorMode, variant };
  }
  systemColorMode.addEventListener?.("change", () => {
    if (activeColorMode === "auto") {
      setColorMode("auto", { persist: false });
    }
  });
  return __toCommonJS(barbarian_theme_exports);
})();
