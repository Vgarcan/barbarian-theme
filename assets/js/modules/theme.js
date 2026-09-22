/**
 * Gestiona el cambio día/noche y persiste la preferencia del usuario.
 * Emite `tema-cambiado` para desacoplar el tema de otros módulos.
 */
export function initTheme() {
  const btn = document.getElementById('toggleTema');
  function pintarBoton(tema) {
    if (!btn) return;
    const noche = tema === 'dark';
    btn.setAttribute('aria-pressed', String(noche));
    btn.querySelector('i').className = noche ? 'bi bi-sun-fill me-1' : 'bi bi-moon-stars-fill me-1';
    btn.querySelector('span').textContent = noche ? 'Modo día' : 'Modo noche';
  }
  function aplicar(tema) {
    document.documentElement.setAttribute('data-bs-theme', tema);
    try { localStorage.setItem('tema-barbaro', tema); } catch (e) {}
    pintarBoton(tema);
    document.dispatchEvent(new CustomEvent('tema-cambiado', { detail: tema }));
  }
  pintarBoton(document.documentElement.getAttribute('data-bs-theme'));
  if (btn) btn.addEventListener('click', () => aplicar(document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark'));
}
