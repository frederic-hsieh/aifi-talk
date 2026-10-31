(() => {
  const header = document.querySelector('.wrap > header');
  const nav = header?.querySelector('nav');
  if (!nav) return;
  const mobile = matchMedia('(max-width: 800px)');
  const panel = document.createElement('div');
  panel.id = 'header-navigation';
  panel.className = 'header-navigation';
  nav.before(panel);
  panel.append(nav);
  const language = header.querySelector(':scope > .language-switch');
  if (language) panel.append(language);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'header-toggle';
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  header.insertBefore(toggle, panel);
  header.classList.add('responsive-header');
  let open = false;
  function label() {
    const zh = document.documentElement.lang === 'zh-Hant';
    toggle.setAttribute('aria-label', zh ? (open ? '關閉選單' : '開啟選單') : (open ? 'Close menu' : 'Open menu'));
  }
  function setOpen(value, restoreFocus = false) {
    open = value;
    header.classList.toggle('menu-open', open);
    header.classList.remove('header-hidden');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>' : '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    if (!open) panel.querySelectorAll('details[open]').forEach(item => { item.open = false; });
    if (restoreFocus) toggle.focus({ preventScroll: true });
    label();
  }
  label();
  new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  toggle.addEventListener('click', () => setOpen(!open));
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) { setOpen(false, true); event.preventDefault(); }
  });
  panel.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('a, #saved-nav')) setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (open && !event.composedPath().includes(header)) setOpen(false);
  });
  header.addEventListener('focusout', event => {
    if (open && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  header.addEventListener('focusin', () => header.classList.remove('header-hidden'));
  mobile.addEventListener('change', () => setOpen(false));
  let previousY = Math.max(0, scrollY);
  let direction = 0;
  let distance = 0;
  addEventListener('scroll', () => {
    const y = Math.max(0, scrollY);
    const delta = y - previousY;
    previousY = y;
    const nextDirection = Math.sign(delta);
    if (nextDirection !== direction) distance = 0;
    direction = nextDirection;
    distance += Math.abs(delta);
    if (!mobile.matches || open || y < 80 || header.querySelector(':focus-visible')) {
      header.classList.remove('header-hidden');
      return;
    }
    if (distance > 12) header.classList.toggle('header-hidden', direction > 0);
  }, { passive: true });
})();
