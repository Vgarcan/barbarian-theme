/**
 * KPI helpers for character sheets and dashboards.
 *
 * Static markup works without JavaScript. These helpers only synchronize
 * values, accessibility metadata and CSS progress variables.
 */

const KPI_SELECTOR = '[data-barbarian-kpi]';

function resolveElement(target, scope = document) {
  if (target instanceof Element) return target;
  if (typeof target === 'string') return scope.querySelector(target);
  return null;
}

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value, format = 'number', decimals = 0, locale) {
  if (format === 'percent') {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
      style: 'percent'
    }).format(value / 100);
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(value);
}

function setDeltaState(element) {
  const delta = element.querySelector('[data-kpi-delta]');
  if (!delta) return;

  const value = toFiniteNumber(delta.dataset.kpiDelta, NaN);

  if (!Number.isFinite(value)) {
    delta.dataset.kpiDirection = 'flat';
    return;
  }

  delta.dataset.kpiDirection = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';

  if (!delta.textContent.trim()) {
    delta.textContent = value > 0 ? `+${value}` : String(value);
  }
}

export function refreshKpi(target, options = {}) {
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

  const decimals = Math.max(0, Math.min(6,
    Math.trunc(toFiniteNumber(
      options.decimals ?? element.dataset.kpiDecimals,
      0
    ))
  ));

  const format = options.format
    ?? element.dataset.kpiFormat
    ?? 'number';

  const unit = options.unit
    ?? element.dataset.kpiUnit
    ?? '';

  const locale = options.locale
    ?? element.dataset.kpiLocale
    ?? document.documentElement.lang
    ?? undefined;

  element.dataset.kpiValue = String(value);
  element.style.setProperty('--barbarian-kpi-progress', `${percentage}%`);

  element.setAttribute('role', element.getAttribute('role') || 'meter');
  element.setAttribute('aria-valuemin', String(min));
  element.setAttribute('aria-valuemax', String(safeMax));
  element.setAttribute('aria-valuenow', String(value));

  const display = element.querySelector('[data-kpi-display]');

  if (display) {
    const rendered = formatNumber(value, format, decimals, locale);
    display.textContent = unit ? `${rendered} ${unit}` : rendered;
  }

  const current = element.querySelector('[data-kpi-current]');
  if (current) current.textContent = formatNumber(value, 'number', decimals, locale);

  const maxDisplay = element.querySelector('[data-kpi-max-display]');
  if (maxDisplay) {
    maxDisplay.textContent = formatNumber(safeMax, 'number', decimals, locale);
  }

  setDeltaState(element);

  element.dispatchEvent(new CustomEvent('barbarian:kpiupdate', {
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

export function setKpiValue(target, value, options = {}) {
  return refreshKpi(target, { ...options, value });
}

export function changeKpiValue(target, delta, options = {}) {
  const element = resolveElement(target, options.scope);
  if (!element) return null;

  const current = toFiniteNumber(element.dataset.kpiValue, 0);
  return refreshKpi(element, {
    ...options,
    value: current + toFiniteNumber(delta, 0)
  });
}

export function initKpis(scope = document) {
  const elements = [...scope.querySelectorAll(KPI_SELECTOR)];

  elements.forEach(element => {
    refreshKpi(element);

    if (element.dataset.barbarianKpiInitialized === 'true') return;
    element.dataset.barbarianKpiInitialized = 'true';
  });

  return elements;
}
