/**
 * Inicializa los componentes de Bootstrap que requieren JavaScript explícito.
 * Si Bootstrap no está disponible, el resto de módulos sigue funcionando.
 */
export function initBootstrapComponents() {
  if (!window.bootstrap) {
    console.warn('[barbaro] Bootstrap JS no está disponible; se omiten sus componentes interactivos.');
    return;
  }

  document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((element) => new window.bootstrap.Tooltip(element));

  document
    .querySelectorAll('[data-bs-toggle="popover"]')
    .forEach((element) => new window.bootstrap.Popover(element));

  const toastButton = document.getElementById('btnToast');
  const toastElement = document.getElementById('toastDemo');

  if (toastButton && toastElement) {
    toastButton.addEventListener('click', () => {
      window.bootstrap.Toast.getOrCreateInstance(toastElement).show();
    });
  }
}
