(() => {
  const headings = [...document.querySelectorAll('.article-body h2')];
  if (headings.length < 2) return;
  const language = document.documentElement.lang;
  const chinese = language === 'zh-Hant';
  try { localStorage.setItem('aifitalk-prototype-language-v1', language); } catch {}
  document.querySelectorAll('[data-article-language]').forEach(link => {
    link.addEventListener('click', () => {
      // Matching section anchors retain the reader's place across editions.
      link.hash = location.hash;
    });
  });
  const label = chinese ? '文章目錄' : 'Contents';
  const trigger = document.createElement('button');
  trigger.className = 'contents-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', label);
  trigger.title = label;
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('popovertarget', 'article-contents');
  trigger.setAttribute('aria-controls', 'article-contents');
  const rail = document.createElement('span');
  rail.className = 'contents-rail';
  rail.setAttribute('aria-hidden', 'true');
  const panel = document.createElement('nav');
  panel.id = 'article-contents';
  panel.className = 'contents-panel';
  panel.setAttribute('popover', 'auto');
  panel.setAttribute('aria-label', label);
  panel.lang = chinese ? 'zh-Hant' : 'en';
  const title = document.createElement('div');
  title.className = 'contents-heading';
  title.textContent = label;
  panel.append(title);
  const links = headings.map(heading => {
    rail.append(document.createElement('span'));
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.lang = language;
    link.addEventListener('click', () => {
      panel.hidePopover();
      heading.focus({ preventScroll: true });
    });
    panel.append(link);
    return link;
  });
  trigger.append(rail);
  document.body.append(trigger, panel);
  let dismissTimer;
  for (const surface of [trigger, panel]) {
    surface.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      clearTimeout(dismissTimer);
      if (!panel.matches(':popover-open')) panel.showPopover();
    });
    surface.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      // Allow the pointer to cross the small gap between rail and panel.
      dismissTimer = setTimeout(() => panel.hidePopover(), 160);
    });
  }
  panel.addEventListener('toggle', event => {
    trigger.setAttribute('aria-expanded', String(event.newState === 'open'));
    if (event.newState === 'open') {
      const link = links[active];
      panel.scrollTop = Math.max(0, link.offsetTop - panel.clientHeight / 2);
    }
  });
  let active = -1;
  let scheduled = false;
  function update() {
    scheduled = false;
    let next = 0;
    headings.forEach((heading, index) => {
      if (heading.getBoundingClientRect().top <= window.innerHeight * 0.3) next = index;
    });
    if (next === active) return;
    active = next;
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      rail.children[index].classList.toggle('is-current', index === active);
    });
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  update();
})();
