/**
 * Renderiza y anima el fondo vivo del desierto sobre `#escena`.
 * Escucha el evento `tema-cambiado` y controla el modo de viento.
 */
export function initDesertScene() {
  const cv = document.getElementById('escena');
  if (!cv || !cv.getContext || cv.dataset.barbarianDesertInitialized === 'true') return;

  const ctx = cv.getContext('2d');
  if (!ctx) return;

  cv.dataset.barbarianDesertInitialized = 'true';
  const btnViento = document.getElementById('toggleViento');
  const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
  const RUNAS = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  const R = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  const perfil = (x, base, amp, f, s) => base + Math.sin(x * f + s) * amp + Math.sin(x * f * 2.3 + s * 1.7) * amp * .4 + Math.sin(x * f * 5.1 + s * .3) * amp * .12;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mezclar = (a, b, m) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * m)).join(',')})`; };
  const suave = x => x * x * (3 - 2 * x);

  /*
   * Perfil adaptativo de rendimiento. El canvas es decorativo, por lo que
   * priorizamos la respuesta de la interfaz sobre perseguir 60 FPS constantes.
   */
  function obtenerPerfilRendimiento() {
    const movil = matchMedia('(max-width: 767.98px)').matches;
    const pocosHilos = (navigator.hardwareConcurrency || 4) <= 4;
    const bajaPotencia = movil || pocosHilos;

    return {
      movil,
      fps: bajaPotencia ? 24 : 30,
      fpsInteraccion: 15,
      dprMax: movil ? 1 : (pocosHilos ? 1.1 : 1.25),
      divisorMatas: movil ? 52 : (pocosHilos ? 44 : 36),
      hojasMin: movil ? 5 : 6,
      hojasMax: movil ? 10 : 12,
      arenaMax: movil ? 80 : (pocosHilos ? 110 : 150),
      divisorArena: movil ? 13000 : 9500,
      polvo: movil ? 2 : 3,
      divisorTitilan: movil ? 34 : 24,
      viaLactea: movil ? 420 : (pocosHilos ? 650 : 900),
      divisorEstrellas: movil ? 3400 : 2500
    };
  }

  let rendimiento = obtenerPerfilRendimiento();

  /* ---------- Paletas ---------- */
  const DIA = {
    cielo: [[0, '#A7BBB3'], [.38, '#CBD2B3'], [.72, '#E8DDAB'], [1, '#F2E3AC']], relleno: '#F2E3AC',
    nube: 'rgba(252,248,232,A)', nubeSombra: 'rgba(150,152,118,A)',
    montana: '#B3B08A', meseta: '#9F9C75', llanura: '#BDB68A', bruma: '245,236,202',
    dunaMedia: ['#C49A55', '#8E713F'], bordeMedia: 'rgba(255,248,215,.75)',
    piedra: '#4B4330', bordePiedra: 'rgba(255,246,212,.6)',
    dunaCerca: ['#D8B062', '#A88344'], bordeCerca: 'rgba(255,249,222,.85)', ondas: 'rgba(110,80,30,.22)',
    suelo: ['#8A7B49', '#4E4428'], bordeSuelo: 'rgba(255,242,205,.5)', totem: '#2C2818', ojos: 'rgba(255,225,150,.35)'
  };
  const NOCHE = {
    cielo: [[0, '#060A1A'], [.45, '#0F1934'], [.8, '#213257'], [1, '#384C72']], relleno: '#384C72',
    nube: 'rgba(40,52,84,A)', nubeSombra: 'rgba(10,14,30,A)',
    montana: '#1B233E', meseta: '#151C33', llanura: '#1D2642', bruma: '110,135,185',
    dunaMedia: ['#29324E', '#13182A'], bordeMedia: 'rgba(190,210,245,.45)',
    piedra: '#0A0D19', bordePiedra: 'rgba(185,205,245,.4)',
    dunaCerca: ['#38425E', '#1A2034'], bordeCerca: 'rgba(205,220,250,.55)', ondas: 'rgba(8,12,28,.4)',
    suelo: ['#1B2032', '#0A0D17'], bordeSuelo: 'rgba(170,190,230,.32)', totem: '#06080E', ojos: 'rgba(255,190,100,.5)'
  };
  const HIERBA_DIA = ['#6B6636', '#8E8C4E', '#AAA56B', '#C9BD7A', '#E0D294'];
  const HIERBA_NOCHE = ['#2A332D', '#434E47', '#66726A', '#96A29B', '#C3CCC6'];
  const TABLA_HIERBA = Array.from({ length: 11 }, (_, k) => HIERBA_DIA.map((c, i) => mezclar(c, HIERBA_NOCHE[i], k / 10)));
  const ESPIGA = Array.from({ length: 11 }, (_, k) => mezclar('#E6D79A', '#D6DEE0', k / 10));
  const ESTANDARTE = Array.from({ length: 11 }, (_, k) => mezclar('#7A5A2E', '#2A2433', k / 10));

  // Constelaciones de los dioses (coordenadas relativas al cielo)
  const CONSTELACIONES = [
    { p: [[.07, .44], [.12, .31], [.17, .19], [.22, .09], [.27, .2], [.21, .26]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 2]] },       // Hacha de Varrok
    { p: [[.38, .32], [.41, .2], [.44, .1], [.475, .25], [.51, .1], [.54, .2], [.57, .32]], l: [[0, 1], [1, 2], [6, 5], [5, 4], [1, 3], [5, 3]] }, // Cuernos de Ghal-Tamur
    { p: [[.6, .7], [.64, .63], [.68, .7], [.665, .8], [.615, .8], [.64, .72]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },            // Pozo de Ondra
    { p: [[.9, .52], [.93, .44], [.955, .36], [.97, .5]], l: [[0, 1], [1, 2], [1, 3]] }                                                          // Lanza de Ishara
  ];

  let W = 0, H = 0, DPR = 1, esc = 1, horizonte = 0;
  let fondoDia = null, fondoNoche = null, circuloX = 0, piedras = [], brillos = [], totem = null;
  let matas = [], arena = [], rodadores = [], polvo = [], titilan = [], buitres = [], fugaces = [], constelaciones = [];
  // En móvil el fondo arranca estático: la interacción de la página tiene prioridad.
  let activo = !menosMovimiento.matches && !rendimiento.movil;
  let raf = 0, t = 0, prev = 0, ultimoPintado = 0;
  let interaccionHasta = 0;
  let ultimoAnchoConstruido = 0;
  let ultimoAltoConstruido = 0;
  let rafaga = 0, rafagaObj = 0, proxRafaga = 3, proxRodador = 4, proxFugaz = 3;
  const temaInicial = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 1 : 0;
  let mezclaLin = temaInicial, mezclaObj = temaInicial;
  const spriteDia = crearSpriteRodador([150, 120, 60], [205, 180, 110]);
  const spriteNoche = crearSpriteRodador([70, 80, 95], [140, 155, 175]);

  const dunaMedia = x => perfil(x, H * .705, H * .028, 4.2 / W, .7);
  const dunaCerca = x => perfil(x, H * .80, H * .032, 3.1 / W, 2.1);
  const suelo     = x => perfil(x, H * .9, H * .02, 2.4 / W, 1.3);

  function crearSpriteRodador(c1, c2) {
    const s = document.createElement('canvas'); s.width = s.height = 120;
    const g = s.getContext('2d'); g.translate(60, 60);
    for (let i = 0; i < 110; i++) {
      const r = R(8, 52), a0 = R(0, 6.28), m = Math.random();
      g.strokeStyle = `rgba(${c1.map((v, k) => Math.round(v + (c2[k] - v) * m)).join(',')},${R(.5, .95)})`;
      g.lineWidth = R(.7, 2);
      g.beginPath(); g.arc(R(-7, 7), R(-7, 7), r, a0, a0 + R(.5, 2.4)); g.stroke();
    }
    return s;
  }

  function capa(g, fn, colores, borde) {
    const grad = g.createLinearGradient(0, fn(W * .5) - H * .05, 0, H);
    grad.addColorStop(0, colores[0]); grad.addColorStop(1, colores[1]);
    g.fillStyle = grad; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) g.lineTo(x, fn(x));
    g.lineTo(W, H); g.closePath(); g.fill();
    g.strokeStyle = borde; g.lineWidth = 1.6; g.beginPath();
    for (let x = 0; x <= W + 8; x += 8) x === 0 ? g.moveTo(x, fn(x)) : g.lineTo(x, fn(x));
    g.stroke();
  }

  function trazoPiedra(g, x, base, bw, h, incl) {
    g.beginPath();
    g.moveTo(x - bw / 2, base + 6);
    g.lineTo(x - bw * .42 + incl * .3, base - h * .72);
    g.quadraticCurveTo(x - bw * .34 + incl, base - h * 1.02, x + incl * .8, base - h);
    g.quadraticCurveTo(x + bw * .46 + incl, base - h * .96, x + bw * .4 + incl * .3, base - h * .6);
    g.lineTo(x + bw / 2, base + 6); g.closePath();
  }

  function posicionLuna() {
    const r = Math.max(Math.min(W, H) * .17, 58);
    return { x: W * (W < 700 ? .74 : .77), y: H * (W < 700 ? .16 : .27), r };
  }

  /* ---------- Geometría compartida entre día y noche ---------- */
  function geometria() {
    horizonte = H * .64;
    const c0 = W < 700 ? .08 : .43;
    circuloX = W * (c0 + .075);
    piedras = []; brillos = [];
    [[c0, .75, .055], [c0 + .035, .9, .075], [c0 + .075, 1.25, .12, true], [c0 + .115, .95, .08], [c0 + .15, .7, .05]].forEach(([fx, ancho, alto, idolo], i) => {
      const x = W * fx, base = dunaMedia(x), bw = Math.max(16, W * .018) * ancho, h = H * alto;
      piedras.push({ x, base, bw, h, incl: (i - 2) * 1.5, idolo });
      if (idolo) {
        const cy = base - h - bw * .35;
        brillos.push({ x: x - bw * .14, y: cy - bw * .02, ojo: true, tam: bw * .09, fase: 0 });
        brillos.push({ x: x + bw * .2, y: cy - bw * .02, ojo: true, tam: bw * .09, fase: 0 });
      }
      for (let k = 0; k < (idolo ? 3 : 2); k++) {
        brillos.push({ x, y: base - h * (.25 + k * .22), runa: RUNAS[(i * 5 + k * 3) % RUNAS.length], tam: Math.max(10, bw * .55), fase: R(0, 6.28) });
      }
    });
    const tx = W * (W < 700 ? .74 : .84), tb = suelo(tx), th = Math.min(H * .24 * Math.min(1, esc + .1), W * .45);
    totem = { tx, tb, th, x: tx + 3, y: tb - th * .8, largo: Math.min(th * .42, W - tx - 14), alto: th * .3 };
    const luna = posicionLuna();
    constelaciones = CONSTELACIONES.map(c => ({ p: c.p.map(([x, y]) => [x * W, y * horizonte]), l: c.l, fase: R(0, 6.28) }))
      .filter(c => c.p.every(([x, y]) => Math.hypot(x - luna.x, y - luna.y) > luna.r * 1.15));
  }

  /* ---------- Pinta un escenario completo (día o noche) ---------- */
  function escenario(p, noche) {
    const cnv = document.createElement('canvas'); cnv.width = W * DPR; cnv.height = H * DPR;
    const g = cnv.getContext('2d'); g.scale(DPR, DPR);

    g.fillStyle = p.relleno; g.fillRect(0, 0, W, H);
    const cielo = g.createLinearGradient(0, 0, 0, horizonte);
    p.cielo.forEach(([o, c]) => cielo.addColorStop(o, c));
    g.fillStyle = cielo; g.fillRect(0, 0, W, horizonte + 4);

    if (!noche) {
      // Sol pálido, sin naranjas
      const sx = W * .74, sy = horizonte - H * .07, sr = Math.min(W, H) * .07;
      const halo = g.createRadialGradient(sx, sy, sr * .5, sx, sy, sr * 8);
      halo.addColorStop(0, 'rgba(255,252,232,.95)'); halo.addColorStop(.18, 'rgba(252,244,205,.5)'); halo.addColorStop(1, 'rgba(245,232,185,0)');
      g.fillStyle = halo; g.fillRect(0, 0, W, horizonte + 4);
      g.fillStyle = '#FFFCEE'; g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
    } else {
      // Vía láctea
      const x0 = W * -.05, y0 = horizonte * 1.05, x1 = W * .62, y1 = -horizonte * .1;
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, ang = Math.atan2(y1 - y0, x1 - x0), largo = Math.hypot(x1 - x0, y1 - y0);
      g.save(); g.translate(mx, my); g.rotate(ang); g.scale(1, .16);
      const banda = g.createRadialGradient(0, 0, 0, 0, 0, largo / 2);
      banda.addColorStop(0, 'rgba(175,190,255,.16)'); banda.addColorStop(.6, 'rgba(150,170,240,.07)'); banda.addColorStop(1, 'rgba(150,170,240,0)');
      g.fillStyle = banda; g.beginPath(); g.arc(0, 0, largo / 2, 0, 6.28); g.fill();
      g.restore();
      g.save(); g.translate(mx, my); g.rotate(ang); g.scale(1, .035); g.translate(0, largo * .12);
      const polvoOscuro = g.createRadialGradient(0, 0, 0, 0, 0, largo / 2.4);
      polvoOscuro.addColorStop(0, 'rgba(4,7,20,.35)'); polvoOscuro.addColorStop(1, 'rgba(4,7,20,0)');
      g.fillStyle = polvoOscuro; g.beginPath(); g.arc(0, 0, largo / 2.4, 0, 6.28); g.fill();
      g.restore();
      const luna = posicionLuna();
      const fuera = (x, y) => Math.hypot(x - luna.x, y - luna.y) > luna.r * 1.6;
      for (let i = 0; i < rendimiento.viaLactea; i++) {
        const u = Math.random(), d = gauss() * H * .07;
        const x = x0 + (x1 - x0) * u - Math.sin(ang) * d, y = y0 + (y1 - y0) * u + Math.cos(ang) * d;
        if (y > horizonte || !fuera(x, y)) continue;
        g.fillStyle = `rgba(225,232,255,${R(.15, .6)})`; g.fillRect(x, y, R(.5, 1.3), R(.5, 1.3));
      }
      // Estrellas fijas
      const n = Math.round(W * horizonte / rendimiento.divisorEstrellas);
      for (let i = 0; i < n; i++) {
        const x = R(0, W), y = Math.pow(Math.random(), 1.4) * horizonte * .95;
        if (!fuera(x, y)) continue;
        g.fillStyle = `rgba(235,240,255,${R(.2, .85)})`;
        g.beginPath(); g.arc(x, y, R(.35, 1.2), 0, 6.28); g.fill();
      }
      // Luna enorme con mares y cráteres
      const halo = g.createRadialGradient(luna.x, luna.y, luna.r * .9, luna.x, luna.y, luna.r * 4.5);
      halo.addColorStop(0, 'rgba(215,228,255,.35)'); halo.addColorStop(.35, 'rgba(170,190,240,.1)'); halo.addColorStop(1, 'rgba(150,170,230,0)');
      g.fillStyle = halo; g.fillRect(0, 0, W, horizonte + 4);
      const disco = g.createRadialGradient(luna.x - luna.r * .35, luna.y - luna.r * .35, luna.r * .1, luna.x, luna.y, luna.r);
      disco.addColorStop(0, '#FCFAF0'); disco.addColorStop(1, '#D6D5CA');
      g.fillStyle = disco; g.beginPath(); g.arc(luna.x, luna.y, luna.r, 0, 6.28); g.fill();
      g.save(); g.beginPath(); g.arc(luna.x, luna.y, luna.r, 0, 6.28); g.clip();
      [[-.3, -.15, .42], [.25, -.3, .3], [.1, .28, .36], [-.35, .35, .22], [.45, .15, .2]].forEach(([dx, dy, rr]) => {
        const mg = g.createRadialGradient(luna.x + dx * luna.r, luna.y + dy * luna.r, 0, luna.x + dx * luna.r, luna.y + dy * luna.r, rr * luna.r);
        mg.addColorStop(0, 'rgba(140,142,138,.35)'); mg.addColorStop(1, 'rgba(140,142,138,0)');
        g.fillStyle = mg; g.beginPath(); g.arc(luna.x + dx * luna.r, luna.y + dy * luna.r, rr * luna.r, 0, 6.28); g.fill();
      });
      for (let i = 0; i < 22; i++) {
        const a = R(0, 6.28), d = Math.sqrt(Math.random()) * luna.r * .85, cx = luna.x + Math.cos(a) * d, cy = luna.y + Math.sin(a) * d, rr = R(.015, .06) * luna.r;
        const cg = g.createRadialGradient(cx + rr * .25, cy + rr * .25, 0, cx, cy, rr);
        cg.addColorStop(0, 'rgba(150,150,140,.28)'); cg.addColorStop(.75, 'rgba(160,160,150,.12)'); cg.addColorStop(1, 'rgba(160,160,150,0)');
        g.fillStyle = cg; g.beginPath(); g.arc(cx, cy, rr, 0, 6.28); g.fill();
        g.strokeStyle = 'rgba(255,255,250,.18)'; g.lineWidth = .8; g.beginPath(); g.arc(cx, cy, rr * .85, 2.6, 4.8); g.stroke();
      }
      g.restore();
    }

    // Nubes alargadas
    for (let i = 0; i < (noche ? 5 : 8); i++) {
      const y = R(horizonte * .25, horizonte * .9), x = R(-W * .1, W * 1.05), w = R(W * .12, W * .4), h = R(1.5, 5);
      g.fillStyle = p.nubeSombra.replace('A', R(.25, .45).toFixed(2));
      g.beginPath(); g.ellipse(x, y + h * .8, w / 2, h, 0, 0, 6.28); g.fill();
      g.fillStyle = p.nube.replace('A', R(.45, .75).toFixed(2));
      g.beginPath(); g.ellipse(x, y, w / 2, h, 0, 0, 6.28); g.fill();
    }

    // Montañas y mesetas lejanas
    g.fillStyle = p.montana; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) g.lineTo(x, perfil(x, horizonte - H * .03, H * .018, 9 / W, 2));
    g.lineTo(W, H); g.closePath(); g.fill();
    g.fillStyle = p.meseta;
    [[.1, .12, .085], [.3, .07, .055], [.9, .15, .11]].forEach(([cx, w, h]) => {
      const x0 = W * (cx - w / 2), x1 = W * (cx + w / 2), top = horizonte - H * h, base = horizonte + 10;
      g.beginPath(); g.moveTo(x0 - W * .03, base); g.lineTo(x0, top + H * .012); g.lineTo(x0 + W * .01, top);
      g.lineTo(x1 - W * .015, top + H * .004); g.lineTo(x1, top + H * .016); g.lineTo(x1 + W * .035, base); g.closePath(); g.fill();
    });
    g.fillStyle = p.llanura; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) g.lineTo(x, perfil(x, horizonte + H * .006, H * .004, 14 / W, 4));
    g.lineTo(W, H); g.closePath(); g.fill();
    const bruma = g.createLinearGradient(0, horizonte - H * .09, 0, horizonte + H * .04);
    bruma.addColorStop(0, `rgba(${p.bruma},0)`); bruma.addColorStop(1, `rgba(${p.bruma},.55)`);
    g.fillStyle = bruma; g.fillRect(0, horizonte - H * .09, W, H * .13);

    // Duna media y círculo de piedras de los dioses
    capa(g, dunaMedia, p.dunaMedia, p.bordeMedia);
    piedras.forEach(s => {
      g.fillStyle = p.piedra; trazoPiedra(g, s.x, s.base, s.bw, s.h, s.incl); g.fill();
      g.strokeStyle = p.bordePiedra; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(s.x + s.bw * .4, s.base - s.h * .6); g.lineTo(s.x + s.bw * .45, s.base); g.stroke();
      if (s.idolo) {
        const cy = s.base - s.h - s.bw * .35, bw = s.bw, x = s.x;
        g.fillStyle = p.piedra; g.beginPath(); g.ellipse(x + 2, cy, bw * .42, bw * .5, 0, 0, 6.28); g.fill();
        g.lineWidth = bw * .16; g.lineCap = 'round'; g.strokeStyle = p.piedra;
        g.beginPath(); g.moveTo(x - bw * .3, cy - bw * .2); g.quadraticCurveTo(x - bw * .9, cy - bw * .5, x - bw * .75, cy - bw * 1.2); g.stroke();
        g.beginPath(); g.moveTo(x + bw * .34, cy - bw * .2); g.quadraticCurveTo(x + bw * .95, cy - bw * .5, x + bw * .8, cy - bw * 1.2); g.stroke();
      }
    });

    // Duna cercana con ondulaciones
    capa(g, dunaCerca, p.dunaCerca, p.bordeCerca);
    g.strokeStyle = p.ondas; g.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      const x0 = R(0, W), y0 = dunaCerca(x0) + R(10, H * .08), w = R(40, 140);
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + w / 2, y0 - R(2, 6), x0 + w, y0 + R(-2, 2)); g.stroke();
    }

    // Primer plano
    const pp = g.createLinearGradient(0, H * .86, 0, H);
    pp.addColorStop(0, p.suelo[0]); pp.addColorStop(1, p.suelo[1]);
    g.fillStyle = pp; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) g.lineTo(x, suelo(x));
    g.lineTo(W, H); g.closePath(); g.fill();
    g.strokeStyle = p.bordeSuelo; g.lineWidth = 1.2; g.beginPath();
    for (let x = 0; x <= W + 8; x += 8) x === 0 ? g.moveTo(x, suelo(x)) : g.lineTo(x, suelo(x));
    g.stroke();

    // Tótem con calavera cornuda
    const { tx, tb, th } = totem;
    g.strokeStyle = p.totem; g.lineCap = 'round';
    g.lineWidth = 7 * esc; g.beginPath(); g.moveTo(tx, tb + 4); g.lineTo(tx + 3, tb - th); g.stroke();
    g.lineWidth = 4 * esc; g.beginPath(); g.moveTo(tx - 4, tb - th * .78); g.lineTo(tx + th * .05, tb - th * .8); g.stroke();
    const kx = tx + 3, ky = tb - th - 8 * esc;
    g.fillStyle = p.totem; g.beginPath(); g.ellipse(kx, ky, 11 * esc, 13 * esc, 0, 0, 6.28); g.fill();
    g.lineWidth = 5 * esc;
    g.beginPath(); g.moveTo(kx - 8 * esc, ky - 6 * esc); g.bezierCurveTo(kx - 30 * esc, ky - 8 * esc, kx - 34 * esc, ky - 30 * esc, kx - 22 * esc, ky - 42 * esc); g.stroke();
    g.beginPath(); g.moveTo(kx + 8 * esc, ky - 6 * esc); g.bezierCurveTo(kx + 30 * esc, ky - 8 * esc, kx + 34 * esc, ky - 30 * esc, kx + 22 * esc, ky - 42 * esc); g.stroke();
    g.fillStyle = p.ojos; g.beginPath(); g.ellipse(kx - 4 * esc, ky - 1, 2.6 * esc, 3 * esc, 0, 0, 6.28); g.ellipse(kx + 5 * esc, ky - 1, 2.6 * esc, 3 * esc, 0, 0, 6.28); g.fill();
    return cnv;
  }

  function construir() {
    rendimiento = obtenerPerfilRendimiento();
    DPR = Math.min(window.devicePixelRatio || 1, rendimiento.dprMax);
    W = innerWidth; H = innerHeight; esc = Math.max(.6, Math.min(1.4, H / 900));
    cv.width = W * DPR; cv.height = H * DPR;
    ultimoAnchoConstruido = W;
    ultimoAltoConstruido = H;
    geometria();
    fondoDia = escenario(DIA, false);
    fondoNoche = escenario(NOCHE, true);
    iniciarElementos();
  }

  function iniciarElementos() {
    matas = [];
    for (let i = 0, n = Math.round(W / rendimiento.divisorMatas); i < n; i++) {
      const enSuelo = Math.random() < .72;
      const x = R(-10, W + 10), y = enSuelo ? suelo(x) + R(2, 14) : dunaCerca(x) + R(4, 20);
      const f = (enSuelo ? 1 : .55) * esc;
      const hojas = Array.from({ length: R(rendimiento.hojasMin, rendimiento.hojasMax + 1) | 0 }, () => ({ dx: R(-5, 5) * f, ang: R(-.7, .7), largo: R(18, 58) * f, rig: R(.6, 1.3), c: (Math.random() * 5) | 0, ancho: R(.9, 1.9) * Math.sqrt(f), espiga: Math.random() < .25 }));
      matas.push({ x, y, hojas, fase: R(0, 6.28) });
    }
    matas.sort((a, b) => a.y - b.y);
    arena = Array.from({ length: Math.min(rendimiento.arenaMax, Math.round(W * H / rendimiento.divisorArena)) }, () => nuevaArena(true));
    polvo = Array.from({ length: rendimiento.polvo }, () => ({ x: R(0, W), y: H * R(.62, .86), rx: W * R(.25, .45), ry: H * R(.05, .09), v: R(.6, 1.2) }));
    const luna = posicionLuna();
    titilan = [];
    while (titilan.length < Math.round(W / rendimiento.divisorTitilan)) {
      const x = R(0, W), y = R(0, horizonte * .75);
      if (Math.hypot(x - luna.x, y - luna.y) > luna.r * 1.5) titilan.push({ x, y, r: R(.6, 1.6), f: R(0, 6.28), v: R(.8, 2.4) });
    }
    buitres = [0, 1].map(i => ({ cx: circuloX + W * (i * .05 - .02), cy: horizonte - H * (.24 + i * .06), rx: W * .06, ry: H * .025, a: R(0, 6.28), v: R(.12, .2) * (i ? -1 : 1), tam: R(7, 10) * esc, aleteo: R(0, 6.28) }));
    rodadores = []; fugaces = [];
  }

  function nuevaArena(inicio) {
    const z = R(.3, 1), cresta = Math.random() < .3, x = inicio ? R(0, W) : R(-60, -5);
    return { x, y: cresta ? dunaCerca(Math.max(0, x)) - R(0, 12) : H * R(.55, .98), z, s: R(.6, 1.8) * z, a: R(.15, .55) * z, fase: R(0, 6.28) };
  }

  function dibujar(viento, dt, m) {
    const k = Math.round(m * 10);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(fondoDia, 0, 0, W, H);
    if (m > 0) { ctx.globalAlpha = m; ctx.drawImage(fondoNoche, 0, 0, W, H); ctx.globalAlpha = 1; }

    if (m > .02) {
      // Estrellas que titilan y constelaciones
      for (const e of titilan) {
        ctx.fillStyle = `rgba(240,244,255,${m * (.35 + .5 * (.5 + .5 * Math.sin(t * e.v + e.f)))})`;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 6.28); ctx.fill();
      }
      const mc = Math.max(0, (m - .3) / .7);
      for (const c of constelaciones) {
        const brillo = .55 + .2 * Math.sin(t * .5 + c.fase);
        ctx.strokeStyle = `rgba(180,200,255,${.22 * mc * brillo})`; ctx.lineWidth = 1;
        ctx.beginPath();
        for (const [a, b] of c.l) { ctx.moveTo(c.p[a][0], c.p[a][1]); ctx.lineTo(c.p[b][0], c.p[b][1]); }
        ctx.stroke();
        ctx.shadowColor = 'rgba(200,215,255,.9)'; ctx.shadowBlur = 6;
        ctx.fillStyle = `rgba(245,248,255,${.9 * mc})`;
        for (const [x, y] of c.p) { ctx.beginPath(); ctx.arc(x, y, 1.7, 0, 6.28); ctx.fill(); }
        ctx.shadowBlur = 0;
      }
      // Estrellas fugaces
      proxFugaz -= dt;
      if (proxFugaz <= 0 && m > .7) { fugaces.push({ x: R(W * .05, W * .7), y: R(0, horizonte * .35), a: R(.25, .6), v: R(700, 1100), vida: 0, max: R(.5, .9) }); proxFugaz = R(5, 12); }
      for (const f of fugaces) {
        f.vida += dt; const d = f.v * f.vida, x = f.x + Math.cos(f.a) * d, y = f.y + Math.sin(f.a) * d;
        const cola = Math.min(120, d), alfa = m * Math.sin(Math.PI * Math.min(1, f.vida / f.max));
        const gr = ctx.createLinearGradient(x, y, x - Math.cos(f.a) * cola, y - Math.sin(f.a) * cola);
        gr.addColorStop(0, `rgba(255,255,255,${alfa})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(f.a) * cola, y - Math.sin(f.a) * cola); ctx.stroke();
      }
      fugaces = fugaces.filter(f => f.vida < f.max);
    }

    // Runas y ojos del ídolo (más intensos de noche)
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = m > .5 ? 'rgba(255,150,60,.95)' : 'rgba(245,195,95,.9)';
    for (const b of brillos) {
      const pulso = (.45 + .45 * (.5 + .5 * Math.sin(t * .9 + b.fase)) + rafaga * .15) * (.85 + m * .35);
      ctx.shadowBlur = (8 + m * 8) * pulso;
      if (b.ojo) {
        ctx.fillStyle = `rgba(255,${190 - m * 20 | 0},90,${Math.min(1, .55 + .4 * Math.sin(t * .6))})`;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.tam, 0, 6.28); ctx.fill();
      } else {
        ctx.font = `${b.tam}px "Noto Sans Runic", serif`;
        ctx.fillStyle = `rgba(255,${185 - m * 15 | 0},${95 - m * 10 | 0},${Math.min(1, pulso)})`;
        ctx.fillText(b.runa, b.x, b.y);
      }
    }
    ctx.shadowBlur = 0;

    // Buitres (solo de día)
    if (m < .98) {
      ctx.strokeStyle = `rgba(55,50,32,${.85 * (1 - m)})`; ctx.lineCap = 'round';
      for (const v of buitres) {
        v.a += v.v * dt; v.aleteo += dt * 2.2;
        const x = v.cx + Math.cos(v.a) * v.rx, y = v.cy + Math.sin(v.a) * v.ry, f = Math.sin(v.aleteo) * .35;
        ctx.lineWidth = 1.8 * esc; ctx.beginPath();
        ctx.moveTo(x - v.tam, y - v.tam * (.25 + f)); ctx.quadraticCurveTo(x - v.tam * .4, y - v.tam * .35, x, y);
        ctx.quadraticCurveTo(x + v.tam * .4, y - v.tam * .35, x + v.tam, y - v.tam * (.25 + f)); ctx.stroke();
      }
    }

    // Cortinas de polvo
    const polvoRGB = m > .5 ? '150,170,215' : '252,244,215';
    for (const p of polvo) {
      p.x += viento * p.v * 45 * dt; if (p.x - p.rx > W) p.x = -p.rx;
      const alfa = (.06 + rafaga * .09) * (1 - m * .4);
      const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.rx);
      gr.addColorStop(0, `rgba(${polvoRGB},${alfa})`); gr.addColorStop(1, `rgba(${polvoRGB},0)`);
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, p.ry / p.rx); ctx.translate(-p.x, -p.y);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, p.rx, 0, 6.28); ctx.fill(); ctx.restore();
    }

    // Estandarte de piel
    if (totem) {
      const N = 14, L = totem.largo, A = totem.alto, arriba = [], abajo = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const ola = Math.sin(t * (4 + viento * 3) - u * 6) * A * .16 * u * (.4 + viento);
        const caida = (1 - Math.min(1, viento * .8)) * u * A * .5;
        const x = totem.x + u * L * (.75 + Math.min(.25, viento * .2));
        arriba.push([x, totem.y + ola + caida]);
        abajo.push([x, totem.y + A * (1 - u * .35) + ola * 1.2 + caida - ((i % 3 === 1 ? A * .12 : 0) + (i === N ? A * .2 : 0))]);
      }
      ctx.beginPath(); ctx.moveTo(arriba[0][0], arriba[0][1]);
      arriba.forEach(([x, y]) => ctx.lineTo(x, y));
      for (let i = abajo.length - 1; i >= 0; i--) ctx.lineTo(abajo[i][0], abajo[i][1]);
      ctx.closePath(); ctx.fillStyle = ESTANDARTE[k]; ctx.fill();
      ctx.strokeStyle = m > .5 ? 'rgba(190,210,245,.3)' : 'rgba(255,246,210,.45)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = `${A * .45}px "Noto Sans Runic", serif`; ctx.fillStyle = 'rgba(233,199,127,.9)';
      ctx.fillText('ᛏ', arriba[4][0], (arriba[4][1] + abajo[4][1]) / 2);
    }

    // Matojos rodando
    proxRodador -= dt;
    if (proxRodador <= 0 && rodadores.length < 2 && viento > .75) {
      rodadores.push({ x: -80, r: R(16, 28) * esc, rot: R(0, 6.28), fase: R(0, 6.28), v: R(.85, 1.2) });
      proxRodador = R(6, 13);
    }
    for (const rd of rodadores) {
      const vx = (55 + viento * 150) * rd.v * esc;
      rd.x += vx * dt; rd.fase += dt * (2.5 + viento * 2.5); rd.rot += (vx / rd.r) * dt;
      const y = suelo(rd.x) - rd.r * .75 - Math.abs(Math.sin(rd.fase)) * rd.r * .9;
      ctx.save(); ctx.translate(rd.x, y); ctx.rotate(rd.rot);
      ctx.globalAlpha = 1 - m; ctx.drawImage(spriteDia, -rd.r, -rd.r, rd.r * 2, rd.r * 2);
      ctx.globalAlpha = m; ctx.drawImage(spriteNoche, -rd.r, -rd.r, rd.r * 2, rd.r * 2);
      ctx.globalAlpha = 1; ctx.restore();
    }
    rodadores = rodadores.filter(rd => rd.x < W + 100);

    // Arena volando
    const arenaRGB = `${255 - m * 55 | 0},${250 - m * 35 | 0},${225 + m * 20 | 0}`;
    const arenaFactor = 1 - m * .45;
    ctx.lineCap = 'round';
    for (const p of arena) {
      const vx = (90 + viento * 260) * p.z;
      p.x += vx * dt; p.y += (Math.sin(t * 1.6 + p.fase) * 10 * p.z + 4) * dt;
      if (p.x > W + 20 || p.y > H + 10) Object.assign(p, nuevaArena(false));
      const largo = Math.min(28, vx * .045);
      ctx.strokeStyle = `rgba(${arenaRGB},${p.a * arenaFactor})`; ctx.lineWidth = p.s;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - largo, p.y - largo * .06); ctx.stroke();
    }

    // Hierbas secas
    const colores = TABLA_HIERBA[k], espiga = ESPIGA[k];
    for (const mt of matas) {
      const vaiven = Math.sin(t * 2.3 + mt.fase + mt.x * .01) * .14 * (.5 + viento);
      for (const h of mt.hojas) {
        const flex = (viento * .38 + vaiven) * h.rig * (h.largo / 50);
        const bx = mt.x + h.dx, by = mt.y, ang = h.ang + flex;
        const tx = bx + Math.sin(ang) * h.largo, ty = by - Math.cos(ang) * h.largo;
        ctx.strokeStyle = colores[h.c]; ctx.lineWidth = h.ancho;
        ctx.beginPath(); ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + Math.sin(h.ang + flex * .3) * h.largo * .55, by - Math.cos(h.ang) * h.largo * .6, tx, ty); ctx.stroke();
        if (h.espiga) { ctx.fillStyle = espiga; ctx.beginPath(); ctx.ellipse(tx, ty, 1.6 * h.ancho, 4 * h.ancho, ang, 0, 6.28); ctx.fill(); }
      }
    }
  }

  function avanzarMezcla(dt) {
    if (mezclaLin !== mezclaObj) {
      const paso = dt / 1.4;
      mezclaLin = mezclaObj > mezclaLin ? Math.min(mezclaObj, mezclaLin + paso) : Math.max(mezclaObj, mezclaLin - paso);
    }
    return suave(mezclaLin);
  }

  /*
   * requestAnimationFrame sigue sincronizando con el monitor, pero solo hacemos
   * el trabajo caro del canvas cuando toca el siguiente frame objetivo. Durante
   * clicks, scroll y transiciones de Bootstrap bajamos temporalmente a 15 FPS
   * para dejar libre el hilo principal.
   */
  function marcarInteraccion(duracion = 320) {
    if (!activo) return;
    interaccionHasta = Math.max(interaccionHasta, performance.now() + duracion);
  }

  function bucle(ahora) {
    const fpsObjetivo = ahora < interaccionHasta ? rendimiento.fpsInteraccion : rendimiento.fps;
    const intervalo = 1000 / fpsObjetivo;

    if (ultimoPintado && ahora - ultimoPintado < intervalo) {
      raf = requestAnimationFrame(bucle);
      return;
    }

    const dt = prev ? Math.min(.06, (ahora - prev) / 1000) : intervalo / 1000;
    prev = ahora;
    ultimoPintado = ahora;
    t += dt;
    proxRafaga -= dt;
    if (proxRafaga <= 0) { rafagaObj = R(.5, 1.4); proxRafaga = R(5, 11); }
    rafagaObj = Math.max(0, rafagaObj - dt * .18);
    rafaga += (rafagaObj - rafaga) * Math.min(1, dt * 1.2);
    dibujar(.55 + .2 * Math.sin(t * .21) + .1 * Math.sin(t * .77) + rafaga, dt, avanzarMezcla(dt));
    raf = requestAnimationFrame(bucle);
  }

  function arrancar() {
    cancelAnimationFrame(raf);
    prev = 0;
    ultimoPintado = 0;
    raf = requestAnimationFrame(bucle);
  }
  function parar() { cancelAnimationFrame(raf); raf = 0; }
  function fotoEstatica() { mezclaLin = mezclaObj; t = 3; dibujar(.6, 0, mezclaObj); }

  function ponerViento(v) {
    activo = v;

    if (btnViento) {
      btnViento.setAttribute('aria-pressed', String(v));
      const label = btnViento.querySelector('span');
      if (label) label.textContent = v ? 'Pausar viento' : 'Activar viento';
    }

    v ? arrancar() : (parar(), fotoEstatica());
  }

  document.addEventListener('tema-cambiado', e => {
    mezclaObj = e.detail === 'dark' ? 1 : 0;
    if (!activo) fotoEstatica();
  });
  let espera;
  addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      const cambioAncho = Math.abs(innerWidth - ultimoAnchoConstruido) > 8;
      const cambioAlto = Math.abs(innerHeight - ultimoAltoConstruido) > 80;

      /*
       * En móvil la barra del navegador cambia la altura del viewport durante
       * el scroll. Reconstruir ambos canvas por ese cambio provoca tirones.
       * Solo reconstruimos si cambia el ancho (rotación/cambio real de layout).
       */
      if (rendimiento.movil && !cambioAncho) return;
      if (!rendimiento.movil && !cambioAncho && !cambioAlto) return;

      construir();
      if (!activo) fotoEstatica();
    }, rendimiento.movil ? 280 : 150);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) parar();
    else if (activo) arrancar();
  });

  menosMovimiento.addEventListener?.('change', event => {
    if (event.matches && activo) ponerViento(false);
  });

  if (btnViento) btnViento.addEventListener('click', () => ponerViento(!activo));

  // Las interacciones de UI tienen prioridad sobre la animación decorativa.
  document.addEventListener('pointerdown', () => marcarInteraccion(), { passive: true });
  document.addEventListener('wheel', () => marcarInteraccion(220), { passive: true });
  document.addEventListener('scroll', () => marcarInteraccion(180), { passive: true });
  document.addEventListener('keydown', () => marcarInteraccion(), { passive: true });
  ['show.bs.modal', 'hide.bs.modal', 'show.bs.offcanvas', 'hide.bs.offcanvas', 'show.bs.collapse', 'hide.bs.collapse', 'slide.bs.carousel']
    .forEach(evento => document.addEventListener(evento, () => marcarInteraccion(480)));

  construir();
  fotoEstatica();
  ponerViento(activo);
  if (document.fonts && document.fonts.load) {
    document.fonts.load('20px "Noto Sans Runic"', 'ᚠᛏ').then(() => { construir(); if (!activo) fotoEstatica(); }).catch(() => {});
  }
}
