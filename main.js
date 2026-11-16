// Shared on every page: marks JS as available, reveals the nav after the hero, runs the mobile menu.

export function initNav(doc) {
  doc.documentElement.classList.add('js');
  const nav = doc.querySelector('.tp-nav');
  if (!nav) return;

  // Reveal: on the home page the nav waits until the hero is out of view; elsewhere it shows at once.
  const hero = doc.getElementById('hero');
  const win = doc.defaultView;
  if (hero && 'IntersectionObserver' in win) {
    new win.IntersectionObserver(([entry]) => nav.classList.toggle('is-in', !entry.isIntersecting), { rootMargin: '-60px 0px 0px 0px' }).observe(hero);
  } else {
    nav.classList.add('is-in');
  }

  // Mobile menu: a full-screen list with a focus trap; Escape or a link closes it.
  const button = nav.querySelector('.tp-nav__menu');
  const links = nav.querySelector('.tp-nav__links');
  if (!button || !links) return;
  const focusables = () => [button, ...links.querySelectorAll('a')];
  const close = (refocus) => {
    nav.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Menu';
    if (refocus) button.focus();
  };
  const open = () => {
    nav.classList.add('is-open', 'is-in');
    button.setAttribute('aria-expanded', 'true');
    button.textContent = 'Close';
    links.querySelector('a')?.focus();
  };
  button.addEventListener('click', () => (nav.classList.contains('is-open') ? close(true) : open()));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
  doc.addEventListener('keydown', (e) => {
    if (!nav.classList.contains('is-open')) return;
    if (e.key === 'Escape') { close(true); return; }
    if (e.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

if (typeof document !== 'undefined') initNav(document);
