// Film slots. A .tp-film[data-film] shows its HTML poster until the film is marked ready with
// data-film-ready; then a muted looping video plays over the poster while on screen.
// Adding a film: drop assets/films/<name>.webm, <name>.mp4 and <name>-poster.jpg, add data-film-ready.

export function filmSources(name) {
  return [
    { src: `assets/films/${name}.webm`, type: 'video/webm' },
    { src: `assets/films/${name}.mp4`, type: 'video/mp4' },
  ];
}

/** Whether a film should be playing. Inside the live product show only the shown chapter plays. */
export function shouldPlay({ ratio, wanted, inShow, active }) {
  if (!wanted) return false;
  return inShow ? active : ratio >= 0.5;
}

/** True once the browser has tried every <source> and none works (HTMLMediaElement.NETWORK_NO_SOURCE). */
export function allSourcesFailed(networkState) {
  return networkState === 3;
}

const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/></svg>';

export function initFilms(doc) {
  const win = doc.defaultView;
  const reduce = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const slot of doc.querySelectorAll('.tp-film[data-film][data-film-ready]')) {
    const name = slot.dataset.film;
    const label = slot.querySelector('[aria-label]')?.getAttribute('aria-label') || `${name} film`;
    const video = doc.createElement('video');
    Object.assign(video, { muted: true, loop: true, playsInline: true, preload: 'none' });
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('poster', `assets/films/${name}-poster.jpg`);
    video.setAttribute('aria-label', label);
    video.className = 'tp-film__video';
    for (const s of filmSources(name)) {
      const source = doc.createElement('source');
      source.src = s.src; source.type = s.type;
      video.append(source);
    }
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'tp-play';
    let wanted = !reduce;
    const sync = () => {
      button.innerHTML = video.paused ? PLAY : PAUSE;
      button.setAttribute('aria-label', `${video.paused ? 'Play' : 'Pause'} the ${name} film`);
      button.setAttribute('aria-pressed', String(!video.paused));
    };
    // A missing or broken film leaves the HTML poster in place, but only once every source has failed.
    const giveUp = () => { video.remove(); button.remove(); };
    video.addEventListener('error', () => setTimeout(() => { if (allSourcesFailed(video.networkState)) giveUp(); }, 0), true);
    let loaded = false;
    video.addEventListener('loadeddata', () => { loaded = true; });
    video.addEventListener('stalled', () => setTimeout(() => { if (!loaded) giveUp(); }, 8000));
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    const show = slot.closest('.tp-show');
    const chapter = slot.closest('.tp-chapter');
    let ratio = 0;
    const decide = () => {
      const inShow = !!show?.classList.contains('is-live');
      const active = inShow && [...show.querySelectorAll('.tp-chapter')].indexOf(chapter) === Number(show.dataset.active);
      if (shouldPlay({ ratio, wanted, inShow, active })) video.play().catch(() => {});
      else video.pause();
    };
    button.addEventListener('click', () => { wanted = video.paused; decide(); if (wanted && video.paused) video.play().catch(() => {}); });
    slot.append(video, button);
    sync();
    new win.IntersectionObserver(([entry]) => { ratio = entry.intersectionRatio; decide(); }, { threshold: [0, 0.5, 1] }).observe(slot);
    show?.addEventListener('tp:active', decide);
  }
}

if (typeof document !== 'undefined') initFilms(document);
