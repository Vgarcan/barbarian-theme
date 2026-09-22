/**
 * Activa la validación visual de Bootstrap en formularios marcados con
 * `.needs-validation` y limpia el estado visual al resetearlos.
 */
export function initFormValidation() {
  document.querySelectorAll('.needs-validation').forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    });

    form.addEventListener('reset', () => {
      form.classList.remove('was-validated');
    });
  });
}
