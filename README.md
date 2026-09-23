# barbarian-theme

<p align="center">
  <a href="https://vgarcan.github.io/barbarian-theme/"><strong>🌐 Visita la página</strong></a>
</p>

<p align="center">
  <a href="https://vgarcan.github.io/barbarian-theme/">
    <img src="assets/img/readme/barbarian-theme-screenshot.jpg" alt="Barbarian Theme live preview" width="100%">
  </a>
</p>

A modular barbarian-inspired Bootstrap 5.3 theme with day/night modes, textured surfaces, runic details, reusable UI components, and an animated desert background.

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Project structure](#project-structure)
4. [Architecture](#architecture)
5. [Quick start](#quick-start)
6. [CSS entry point](#css-entry-point)
7. [JavaScript entry point](#javascript-entry-point)
8. [Theme system](#theme-system)
9. [Bootstrap integration](#bootstrap-integration)
10. [Performance notes](#performance-notes)
11. [Development guidelines](#development-guidelines)

## Overview

`barbarian-theme` is a reusable front-end theme built on top of Bootstrap 5.3. The project keeps the HTML entry point simple while separating CSS and JavaScript by responsibility.

The page imports only one local stylesheet and one local JavaScript entry point:

```html
<link href="assets/css/base.css" rel="stylesheet">
<script type="module" src="assets/js/base.js"></script>
```

Those two files coordinate the rest of the theme modules.

## Features

- Bootstrap 5.3 foundation.
- Responsive layout and components.
- Light and dark theme support.
- Persistent theme preference through `localStorage`.
- Runic typography and barbarian-inspired visual language.
- Modular CSS architecture.
- ES module-based JavaScript architecture.
- Bootstrap tooltips, popovers, toast, modal, offcanvas, tabs, accordion, carousel and navigation examples.
- Bootstrap form validation helpers.
- Animated canvas desert scene with wind controls.
- Reduced-motion support.
- Local SVG textures.

## Project structure

```text
barbarian-theme/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   ├── base.css
    │   └── modules/
    │       ├── tokens.css
    │       ├── foundation.css
    │       ├── surfaces.css
    │       ├── runes.css
    │       ├── navbar.css
    │       ├── buttons.css
    │       ├── cards.css
    │       ├── forms.css
    │       ├── alerts-badges.css
    │       ├── tables.css
    │       ├── navigation.css
    │       ├── collections.css
    │       ├── overlays.css
    │       ├── feedback.css
    │       ├── layout.css
    │       └── demo.css
    ├── img/
    │   └── texturas/
    │       ├── borde-pelaje.svg
    │       ├── cuero-noche.svg
    │       ├── cuero.svg
    │       ├── grano.svg
    │       ├── pelaje.svg
    │       └── vetas.svg
    └── js/
        ├── base.js
        └── modules/
            ├── bootstrap-components.js
            ├── desert-scene.js
            ├── form-validation.js
            └── theme.js
```

## Architecture

The project follows a simple rule:

> `index.html` knows the entry points. The entry points know the modules.

This keeps the HTML independent from implementation details and makes individual responsibilities easier to maintain or replace.

### CSS responsibilities

`assets/css/base.css` is the only local stylesheet imported by the page. It imports the CSS modules in a deliberate order so later modules can specialize earlier rules.

The modules are grouped by responsibility rather than by arbitrary file size:

- `tokens.css`: design tokens and shared CSS custom properties.
- `foundation.css`: global document and element foundations.
- `surfaces.css`: reusable themed surfaces and textures.
- `runes.css`: runic visual elements.
- `navbar.css`: navigation bar styling.
- `buttons.css`: button variants.
- `cards.css`: card styling.
- `forms.css`: form controls and validation appearance.
- `alerts-badges.css`: alerts and badges.
- `tables.css`: table presentation.
- `navigation.css`: tabs, breadcrumb and related navigation components.
- `collections.css`: lists and grouped content.
- `overlays.css`: modal, offcanvas and dropdown-related presentation.
- `feedback.css`: toast, progress and feedback elements.
- `layout.css`: page-level layout rules.
- `demo.css`: styles used specifically by the component showcase page.

## Quick start

The project is static and does not require a build step.

Because the JavaScript uses native ES modules, serve the directory through a local HTTP server instead of opening `index.html` directly with `file://`.

For example, with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## CSS entry point

The page loads:

```html
<link href="assets/css/base.css" rel="stylesheet">
```

`base.css` imports every CSS responsibility:

```css
@import url('./modules/tokens.css');
@import url('./modules/foundation.css');
@import url('./modules/surfaces.css');
/* ... */
```

When adding a new visual responsibility, create a module under `assets/css/modules/` and import it from `base.css` in the correct cascade position.

## JavaScript entry point

The page loads:

```html
<script type="module" src="assets/js/base.js"></script>
```

`base.js` is the application bootstrapper:

```js
import { initBootstrapComponents } from './modules/bootstrap-components.js';
import { initFormValidation } from './modules/form-validation.js';
import { initTheme } from './modules/theme.js';
import { initDesertScene } from './modules/desert-scene.js';
```

Each module exposes its own initialization function and owns one responsibility.

### JavaScript modules

- `bootstrap-components.js`: explicit Bootstrap component initialization and toast behaviour.
- `form-validation.js`: Bootstrap validation state and reset handling.
- `theme.js`: day/night state, persistence and theme events.
- `desert-scene.js`: animated canvas background and wind behaviour.

The modules are intentionally decoupled. For example, Bootstrap initialization checks that `window.bootstrap` exists before using it, so a failed external Bootstrap script does not automatically prevent the other local modules from starting.

## Theme system

The active theme is stored in:

```text
tema-barbaro
```

inside `localStorage`.

The page applies the saved theme before the first render to reduce visible theme flashing.

The theme module also dispatches a custom event:

```text
tema-cambiado
```

Other modules can react to theme changes without directly depending on the theme toggle implementation.

## Bootstrap integration

External dependencies currently loaded from CDN are:

- Bootstrap 5.3.3 CSS.
- Bootstrap 5.3.3 JavaScript bundle.
- Bootstrap Icons 1.11.3.
- Google Fonts.

The custom theme stylesheet is loaded after Bootstrap so it can intentionally override framework defaults.

## Performance notes

The animated desert scene is the most computationally expensive part of the theme. On desktop it uses a throttled `<canvas>` animation; on mobile the scene starts static by default to prioritize scrolling and UI responsiveness, and animation can be enabled manually with the wind control.

If interaction performance becomes a priority, `assets/js/modules/desert-scene.js` should be profiled before changing unrelated UI modules. Useful optimization directions include:

- limiting device pixel ratio;
- reducing per-frame particle counts;
- caching static canvas layers;
- pausing animation while the page is hidden;
- reducing animation work on smaller or slower devices;
- lowering the target frame rate when full 60 FPS animation is unnecessary.

The scene already observes the user's reduced-motion preference and exposes a wind control in the UI.

## Development guidelines

When extending the theme:

1. Keep `index.html` dependent only on the public entry points where possible.
2. Add CSS to the module that owns the visual responsibility.
3. Add JavaScript to the module that owns the behaviour.
4. Create a new module when a responsibility is genuinely independent.
5. Import new modules through `base.css` or `base.js` rather than directly from the HTML.
6. Guard optional DOM elements before attaching listeners.
7. Avoid making one optional dependency capable of stopping unrelated functionality.
8. Prefer events or small public functions for communication between modules instead of cross-module DOM coupling.

