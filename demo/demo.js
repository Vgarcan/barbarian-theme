/**
 * Behaviour used only by the documentation/showcase page.
 * None of this file is required to use Barbarian Theme in another Bootstrap app.
 */
(() => {
  const theme = window.BarbarianTheme;
  const bootstrapApi = window.bootstrap;

  const themeButton = document.getElementById('toggleTema');
  const variantSelect = document.getElementById('variantSelector');
  const toastButton = document.getElementById('btnToast');
  const toastElement = document.getElementById('toastDemo');

  function paintThemeButton() {
    if (!themeButton) return;
    const dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));

    const icon = themeButton.querySelector('i');
    const label = themeButton.querySelector('span');

    if (icon) icon.className = dark ? 'bi bi-sun-fill me-1' : 'bi bi-moon-stars-fill me-1';
    if (label) label.textContent = dark ? 'Modo día' : 'Modo noche';
  }

  if (theme) {
    theme.init({ controls: false });
    paintThemeButton();

    if (themeButton) {
      themeButton.addEventListener('click', () => {
        theme.toggleColorMode();
        paintThemeButton();
      });
    }

    if (variantSelect) {
      variantSelect.value = document.documentElement.getAttribute('data-barbarian-variant') || 'desert';
      variantSelect.addEventListener('change', () => theme.setVariant(variantSelect.value));
    }
  }

  if (bootstrapApi) {
    document
      .querySelectorAll('[data-bs-toggle="tooltip"]')
      .forEach(element => new bootstrapApi.Tooltip(element));

    document
      .querySelectorAll('[data-bs-toggle="popover"]')
      .forEach(element => new bootstrapApi.Popover(element));

    if (toastButton && toastElement) {
      toastButton.addEventListener('click', () => {
        bootstrapApi.Toast.getOrCreateInstance(toastElement).show();
      });
    }
  }

  document.querySelectorAll('.needs-validation').forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    });

    form.addEventListener('reset', () => form.classList.remove('was-validated'));
  });

  document.querySelectorAll('[data-demo-kpi-delta]').forEach(button => {
    button.addEventListener('click', () => {
      if (!theme?.changeKpiValue) return;

      const target = button.dataset.demoKpiTarget;
      const delta = Number(button.dataset.demoKpiDelta);

      if (!target || !Number.isFinite(delta)) return;
      theme.changeKpiValue(target, delta);
    });
  });

  if (window.BarbarianDesert?.initDesertEffect) {
    window.BarbarianDesert.initDesertEffect();
  }
})();
