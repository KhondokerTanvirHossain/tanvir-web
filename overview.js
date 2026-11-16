// Overview bento: live Dhaka clock, quote carousel, burndown reveal.
// Pure helpers are exported for tests; nothing touches the DOM at import time.

const dateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', weekday: 'long', day: 'numeric', month: 'long' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });

/** @returns {{date: string, time: string}} e.g. { date: 'Tuesday 17 November', time: '01:33:28' } */
export function dhakaClock(date) {
  return { date: dateFmt.format(date).replace(',', ''), time: timeFmt.format(date) };
}

/** Steps an index by delta and wraps within 0..count-1. */
export function nextIndex(current, delta, count) {
  return (((current + delta) % count) + count) % count;
}

export function initOverview(doc) {
  const reduce = doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dateEl = doc.getElementById('clock-date');
  const timeEl = doc.getElementById('clock-time');
  if (dateEl && timeEl) {
    const tick = () => { const c = dhakaClock(new Date()); dateEl.textContent = `${c.date} in Dhaka`; timeEl.textContent = c.time; };
    tick();
    setInterval(tick, 1000);
  }

  const box = doc.querySelector('.bx--quotes');
  const quotes = [...doc.querySelectorAll('.tp-quote')];
  const dots = doc.querySelector('.tp-quotes__dots');
  if (box && quotes.length && dots) {
    let current = Math.max(0, quotes.findIndex((q) => q.classList.contains('is-on')));
    let timer = 0;
    dots.innerHTML = quotes.map((_, i) => `<button type="button" aria-label="Quote ${i + 1}"></button>`).join('');
    const dotButtons = [...dots.children];
    const show = (i) => {
      current = i;
      quotes.forEach((q, k) => { q.classList.toggle('is-on', k === i); q.setAttribute('aria-hidden', String(k !== i)); });
      dotButtons.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-current', String(k === i)); });
    };
    const stop = () => { clearInterval(timer); timer = 0; };
    const start = () => { stop(); if (!reduce) timer = setInterval(() => show(nextIndex(current, 1, quotes.length)), 7000); };
    dotButtons.forEach((b, k) => b.addEventListener('click', () => { show(k); start(); }));
    doc.getElementById('quote-prev')?.addEventListener('click', () => { show(nextIndex(current, -1, quotes.length)); start(); });
    doc.getElementById('quote-next')?.addEventListener('click', () => { show(nextIndex(current, 1, quotes.length)); start(); });
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', start);
    box.addEventListener('focusin', stop);
    box.addEventListener('focusout', (e) => { if (!box.contains(e.relatedTarget)) start(); });
    show(current);
    start();
  }

  const burn = doc.getElementById('burndown');
  if (burn && 'IntersectionObserver' in doc.defaultView) {
    const io = new doc.defaultView.IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { burn.classList.add('is-in'); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(burn);
  } else if (burn) {
    burn.classList.add('is-in');
  }
}

if (typeof document !== 'undefined') initOverview(document);
