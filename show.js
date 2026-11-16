// Product show: Bolo's film grows from a small frame to fill the screen, settles into its frame,
// then the four products cross-fade as the reader scrolls. Pure maths is exported for tests;
// initShow wires it to the DOM. Without JavaScript the chapters stay stacked and readable.

export const PHASES = { expandEnd: 0.08, holdEnd: 0.14, settleEnd: 0.22 };
const FRAME_RADIUS = 28;

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;

export function smoothstep(x) {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
}

/** Scroll progress 0..1 through the show → the state every layer is drawn from. */
export function showState(progress, count, { reduce = false } = {}) {
  const p = clamp(progress);
  const expand = reduce ? 1 : smoothstep(p / PHASES.expandEnd);
  const settle = reduce ? (p > PHASES.holdEnd ? 1 : 0) : smoothstep((p - PHASES.holdEnd) / (PHASES.settleEnd - PHASES.holdEnd));
  const raw = clamp((p - PHASES.settleEnd) / (1 - PHASES.settleEnd)) * (count - 1);
  const index = Math.min(count - 2, Math.floor(raw));
  const f = raw - index;
  const mix = reduce ? Math.round(f) : smoothstep((f - 0.35) / 0.3);
  const t = index + mix;
  return { expand, settle, index, mix, t, active: Math.round(t) };
}

/** Where the first film sits: small and centred, full screen, or in its frame. Radius is pre-divided by scale. */
export function filmTransform(state, geom) {
  let scale; let x; let y; let visible;
  if (state.settle <= 0) {
    scale = lerp(geom.small, geom.full, state.expand); x = geom.cx; y = geom.cy; visible = lerp(FRAME_RADIUS, 0, state.expand);
  } else {
    scale = lerp(geom.full, 1, state.settle); x = lerp(geom.cx, 0, state.settle); y = lerp(geom.cy, 0, state.settle); visible = lerp(0, FRAME_RADIUS, state.settle);
  }
  return { scale, x, y, radius: Math.round((visible / scale) * 1000) / 1000 };
}

/** Per-chapter custom properties. The incoming layer fades in over an opaque outgoing one, so nothing dips. */
export function chapterVars(k, state) {
  const layer = k === state.index ? 1 : k === state.index + 1 ? state.mix : 0;
  const world = k === 0 && state.index === 0 ? state.expand : 1;
  const copy = clamp(1 - Math.abs(state.t - k) * 2.2) * (k === 0 ? clamp((state.settle - 0.5) / 0.5) : 1);
  return { layer, world, copy, copyY: -(state.t - k) * 40, inert: copy < 0.5 };
}

export function initShow(root) {
  const win = root.ownerDocument.defaultView;
  if (!('IntersectionObserver' in win) || !win.requestAnimationFrame) return;
  const doc = root.ownerDocument;
  const stage = root.querySelector('.tp-show__stage');
  const chapters = [...root.querySelectorAll('.tp-chapter')];
  const film = chapters[0]?.querySelector('.tp-film');
  const over = root.querySelector('.tp-show__over');
  const rail = root.querySelector('.tp-rail');
  const railButtons = rail ? [...rail.querySelectorAll('button')] : [];
  if (!stage || chapters.length < 2 || !film) return;
  const count = chapters.length;
  const reduce = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let geom = { cx: 0, cy: 0, small: 1, full: 1 };

  root.classList.add('is-live');

  // The film's untransformed box relative to the stage (offset* ignore transforms).
  function layout() {
    let x = 0; let y = 0; let el = film;
    while (el && el !== stage) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    const fw = film.offsetWidth; const fh = film.offsetHeight;
    const sw = stage.clientWidth; const sh = stage.clientHeight;
    if (!fw || !fh) return;
    geom = { cx: sw / 2 - (x + fw / 2), cy: sh / 2 - (y + fh / 2), small: Math.min((0.6 * sw) / fw, 1), full: Math.max(sw / fw, sh / fh) * 1.01 };
  }

  function progress() {
    const span = root.offsetHeight - win.innerHeight;
    return span > 0 ? clamp(-root.getBoundingClientRect().top / span) : 0;
  }

  function frame() {
    const s = showState(progress(), count, { reduce });
    chapters.forEach((ch, k) => {
      const v = chapterVars(k, s);
      ch.style.setProperty('--layer', v.layer);
      ch.style.setProperty('--world', v.world);
      ch.style.setProperty('--copy', v.copy);
      ch.style.setProperty('--copy-y', v.copyY.toFixed(2));
      ch.inert = v.inert;
    });
    const f = filmTransform(s, geom);
    film.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) scale(${f.scale})`;
    film.style.borderRadius = `${f.radius}px`;
    if (over) over.style.opacity = clamp((s.expand - 0.85) / 0.15) * (1 - clamp(s.settle * 2.5));
    if (rail) {
      const shown = clamp((s.settle - 0.6) / 0.4);
      rail.style.opacity = shown;
      rail.inert = shown < 0.5;
    }
    railButtons.forEach((b, k) => {
      b.classList.toggle('is-on', k === s.active);
      b.setAttribute('aria-current', String(k === s.active));
      b.style.setProperty('--fill', clamp(1 - Math.abs(s.t - k) * 1.2).toFixed(3));
    });
  }

  railButtons.forEach((b) => b.addEventListener('click', () => {
    const k = Number(b.dataset.index);
    const span = root.offsetHeight - win.innerHeight;
    const top = win.scrollY + root.getBoundingClientRect().top;
    win.scrollTo({ top: top + span * (PHASES.settleEnd + ((1 - PHASES.settleEnd) * k) / (count - 1)) + 2, behavior: reduce ? 'auto' : 'smooth' });
  }));

  let queued = false;
  win.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    win.requestAnimationFrame(() => { frame(); queued = false; });
  }, { passive: true });
  win.addEventListener('resize', () => { layout(); frame(); });
  doc.fonts?.ready.then(() => { layout(); frame(); });
  layout();
  frame();
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('.tp-show');
  if (root) initShow(root);
}
