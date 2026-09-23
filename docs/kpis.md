# KPI and character sheet components

Barbarian Theme includes reusable KPI components for RPG character sheets, game HUDs and normal business dashboards.

The CSS is always available from the main theme bundle. JavaScript is optional for static values, but it provides a small API for synchronizing values, progress, ARIA metadata and display text.

## Basic KPI

```html
<article
  class="barbarian-kpi"
  data-barbarian-kpi
  data-kpi-value="1240"
  data-kpi-max="2000"
  data-kpi-tone="primary"
  aria-label="Gold"
>
  <span class="barbarian-kpi__label">Gold</span>
  <strong class="barbarian-kpi__value" data-kpi-display>1240</strong>
  <div class="barbarian-kpi__meter" aria-hidden="true">
    <span class="barbarian-kpi__meter-fill"></span>
  </div>
</article>
```

## Resource KPI

Resources use current/max values such as HP, mana, stamina or rage.

```html
<article
  id="player-health"
  class="barbarian-kpi barbarian-kpi--resource"
  data-barbarian-kpi
  data-kpi-value="86"
  data-kpi-max="120"
  data-kpi-tone="danger"
  aria-label="Health"
>
  <span class="barbarian-kpi__label">Health</span>

  <strong class="barbarian-kpi__value">
    <span data-kpi-current>86</span>
    <small>/<span data-kpi-max-display>120</span> HP</small>
  </strong>

  <div class="barbarian-kpi__meter" aria-hidden="true">
    <span class="barbarian-kpi__meter-fill"></span>
  </div>
</article>
```

## Attribute KPI

```html
<div
  class="barbarian-kpi barbarian-kpi--attribute"
  data-barbarian-kpi
  data-kpi-value="18"
  data-kpi-max="20"
  data-kpi-tone="danger"
  aria-label="Strength"
>
  <span class="barbarian-kpi__label">Strength</span>
  <strong class="barbarian-kpi__value" data-kpi-display>18</strong>

  <div class="barbarian-kpi__meter" aria-hidden="true">
    <span class="barbarian-kpi__meter-fill"></span>
  </div>
</div>
```

## Radial KPI

```html
<article
  class="barbarian-kpi barbarian-kpi--radial"
  data-barbarian-kpi
  data-kpi-value="18"
  data-kpi-max="100"
  data-kpi-format="percent"
  data-kpi-tone="danger"
  aria-label="Critical chance"
>
  <div class="barbarian-kpi__ring">
    <strong class="barbarian-kpi__value" data-kpi-display>18%</strong>
  </div>
  <span class="barbarian-kpi__label">Critical</span>
</article>
```

## Data attributes

| Attribute | Default | Purpose |
| --- | --- | --- |
| `data-barbarian-kpi` | — | Marks an element as a KPI |
| `data-kpi-value` | `0` | Current numeric value |
| `data-kpi-min` | `0` | Lower bound |
| `data-kpi-max` | `100` | Upper bound |
| `data-kpi-format` | `number` | `number` or `percent` |
| `data-kpi-decimals` | `0` | Number of display decimals |
| `data-kpi-unit` | empty | Optional display unit |
| `data-kpi-tone` | primary | `primary`, `secondary`, `success`, `info`, `warning`, `danger` |
| `data-kpi-delta` | — | Optional positive/negative change |

The JavaScript automatically sets:

- `role="meter"`
- `aria-valuemin`
- `aria-valuemax`
- `aria-valuenow`
- `--barbarian-kpi-progress`

## JavaScript API

The production bundle exposes the KPI helpers on `window.BarbarianTheme`.

```js
BarbarianTheme.initKpis();

BarbarianTheme.setKpiValue('#player-health', 72);

BarbarianTheme.changeKpiValue('#player-health', -15);

const state = BarbarianTheme.refreshKpi('#player-health');
console.log(state.percentage);
```

### setKpiValue

```js
BarbarianTheme.setKpiValue(target, value, {
  min: 0,
  max: 120,
  decimals: 0,
  format: 'number',
  unit: 'HP'
});
```

Values are clamped between `min` and `max`.

### changeKpiValue

Useful for damage, healing, stamina costs or inventory changes:

```js
BarbarianTheme.changeKpiValue('#player-health', -20);
BarbarianTheme.changeKpiValue('#player-health', 10);
```

## Event

Every update dispatches:

```text
barbarian:kpiupdate
```

Example:

```js
document.addEventListener('barbarian:kpiupdate', event => {
  console.log(event.detail.value);
  console.log(event.detail.percentage);
});
```

The event bubbles from the KPI element.

## Character sheet layout

```html
<div class="barbarian-character-sheet">
  <header class="barbarian-character-sheet__header">
    <div class="barbarian-character-sheet__identity">
      <h2 class="barbarian-character-sheet__name">Kael Bonebreaker</h2>
      <p class="barbarian-character-sheet__meta">
        Barbarian · Serpent Clan
      </p>
    </div>

    <div class="barbarian-character-sheet__level">
      <small>Level</small>
      <strong>27</strong>
    </div>
  </header>

  <div class="barbarian-kpi-grid">
    <!-- KPIs -->
  </div>
</div>
```

The layout is responsive and deliberately contains no continuous JavaScript animation.
