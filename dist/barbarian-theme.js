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
    changeKpiValue: () => changeKpiValue,
    getStoredColorMode: () => getStoredColorMode,
    getStoredVariant: () => getStoredVariant,
    getSystemColorMode: () => getSystemColorMode,
    init: () => init,
    initKpis: () => initKpis,
    refreshKpi: () => refreshKpi,
    setColorMode: () => setColorMode,
    setKpiValue: () => setKpiValue,
    setVariant: () => setVariant,
    toggleColorMode: () => toggleColorMode,
    variants: () => variants
  });

  // src/components/kpis.js
  var KPI_SELECTOR = "[data-barbarian-kpi]";
  function resolveElement(target, scope = document) {
    if (target instanceof Element) return target;
    if (typeof target === "string") return scope.querySelector(target);
    return null;
  }
  function toFiniteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function formatNumber(value, format = "number", decimals = 0, locale) {
    if (format === "percent") {
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
        style: "percent"
      }).format(value / 100);
    }
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    }).format(value);
  }
  function setDeltaState(element) {
    const delta = element.querySelector("[data-kpi-delta]");
    if (!delta) return;
    const value = toFiniteNumber(delta.dataset.kpiDelta, NaN);
    if (!Number.isFinite(value)) {
      delta.dataset.kpiDirection = "flat";
      return;
    }
    delta.dataset.kpiDirection = value > 0 ? "up" : value < 0 ? "down" : "flat";
    if (!delta.textContent.trim()) {
      delta.textContent = value > 0 ? `+${value}` : String(value);
    }
  }
  function refreshKpi(target, options = {}) {
    const element = resolveElement(target, options.scope);
    if (!element) return null;
    const min = toFiniteNumber(
      options.min ?? element.dataset.kpiMin,
      0
    );
    const max = toFiniteNumber(
      options.max ?? element.dataset.kpiMax,
      100
    );
    const rawValue = toFiniteNumber(
      options.value ?? element.dataset.kpiValue,
      min
    );
    const safeMax = max > min ? max : min + 1;
    const value = clamp(rawValue, min, safeMax);
    const ratio = clamp((value - min) / (safeMax - min), 0, 1);
    const percentage = ratio * 100;
    const decimals = Math.max(0, Math.min(
      6,
      Math.trunc(toFiniteNumber(
        options.decimals ?? element.dataset.kpiDecimals,
        0
      ))
    ));
    const format = options.format ?? element.dataset.kpiFormat ?? "number";
    const unit = options.unit ?? element.dataset.kpiUnit ?? "";
    const locale = options.locale ?? element.dataset.kpiLocale ?? document.documentElement.lang ?? void 0;
    element.dataset.kpiValue = String(value);
    element.style.setProperty("--barbarian-kpi-progress", `${percentage}%`);
    element.setAttribute("role", element.getAttribute("role") || "meter");
    element.setAttribute("aria-valuemin", String(min));
    element.setAttribute("aria-valuemax", String(safeMax));
    element.setAttribute("aria-valuenow", String(value));
    const display = element.querySelector("[data-kpi-display]");
    if (display) {
      const rendered = formatNumber(value, format, decimals, locale);
      display.textContent = unit ? `${rendered} ${unit}` : rendered;
    }
    const current = element.querySelector("[data-kpi-current]");
    if (current) current.textContent = formatNumber(value, "number", decimals, locale);
    const maxDisplay = element.querySelector("[data-kpi-max-display]");
    if (maxDisplay) {
      maxDisplay.textContent = formatNumber(safeMax, "number", decimals, locale);
    }
    setDeltaState(element);
    element.dispatchEvent(new CustomEvent("barbarian:kpiupdate", {
      bubbles: true,
      detail: {
        value,
        min,
        max: safeMax,
        ratio,
        percentage
      }
    }));
    return {
      element,
      value,
      min,
      max: safeMax,
      ratio,
      percentage
    };
  }
  function setKpiValue(target, value, options = {}) {
    return refreshKpi(target, { ...options, value });
  }
  function changeKpiValue(target, delta, options = {}) {
    const element = resolveElement(target, options.scope);
    if (!element) return null;
    const current = toFiniteNumber(element.dataset.kpiValue, 0);
    return refreshKpi(element, {
      ...options,
      value: current + toFiniteNumber(delta, 0)
    });
  }
  function initKpis(scope = document) {
    const elements = [...scope.querySelectorAll(KPI_SELECTOR)];
    elements.forEach((element) => {
      refreshKpi(element);
      if (element.dataset.barbarianKpiInitialized === "true") return;
      element.dataset.barbarianKpiInitialized = "true";
    });
    return elements;
  }

  // src/barbarian-theme.js
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
    controls = true,
    kpis = true
  } = {}) {
    setColorMode(colorMode, { persist: false });
    setVariant(variant, { persist: false });
    if (controls) bindControls();
    if (kpis) initKpis();
    return { colorMode, variant };
  }
  systemColorMode.addEventListener?.("change", () => {
    if (activeColorMode === "auto") {
      setColorMode("auto", { persist: false });
    }
  });
  return __toCommonJS(barbarian_theme_exports);
})();
