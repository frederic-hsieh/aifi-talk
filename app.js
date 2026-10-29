const stories = publishedStories;
const catalog = new Map(stories.map(story => [story.id, story]));
const storageKey = 'aifitalk-prototype-saved-v1';
const languageStorageKey = 'aifitalk-prototype-language-v1';
let saved = new Set();
let locale = 'en';
try { const stored = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(stored)) saved = new Set(stored.filter(id => catalog.has(id))); } catch {}
try { const stored = localStorage.getItem(languageStorageKey); if (stored === 'en' || stored === 'zh-Hant') locale = stored; } catch {}
const state = {view:'magazine', format:'all', query:'', topic:'all', saved, locale};
const featuredStoryId = stories[0].id;
const cards = document.querySelector('#cards');
let toastTimer;
const topicKeys = {'AI & building':'topicAi','Money & systems':'topicMoney','Creative process':'topicCreative'};
function t(key) { return messages[state.locale][key]; }
function localizedStory(story) { return state.locale === 'zh-Hant' ? {...story, ...story.zh} : story; }
function topicLabel(topic) { return t(topicKeys[topic]); }
function dateLabel(story) { return new Date(story.date+'T12:00:00').toLocaleDateString(state.locale, {year:'numeric',month:'short',day:'numeric'}); }
function readingLabel(story) { return state.locale === 'zh-Hant' ? `閱讀約 ${story.length.split(' ')[0]} 分鐘` : story.length; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character])); }
function art(story, eager = false) {
  if (!story.image) return '';
  return `<img src="${escapeHtml(story.image)}" alt="" width="1536" height="1024" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
}
function notify(message) { document.querySelector('#toast').textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => document.querySelector('#toast').textContent = '', 3000); }
function render() {
  const matches = stories.filter(story => {
    const translated = story.zh || story;
    const searchable = `${story.title} ${story.summary} ${story.topic} ${translated.title} ${translated.summary} ${messages['zh-Hant'][topicKeys[story.topic]]}`.toLowerCase();
    return (state.format === 'all' || (state.format === 'saved' ? state.saved.has(story.id) : story.kind === state.format)) && (state.topic === 'all' || story.topic === state.topic) && searchable.includes(state.query.toLowerCase().trim());
  });
  cards.innerHTML = matches.map(original => {
    const story = localizedStory(original);
    return `<article class="card" data-story="${story.id}"><div class="meta"><span>${t('article')}</span><span>·</span><span>${topicLabel(story.topic)}</span></div><h3><a href="${escapeHtml(story.url)}" lang="${state.locale}">${escapeHtml(story.title)}</a></h3><p lang="${state.locale}">${escapeHtml(story.summary)}</p><a class="cover card-art" href="${escapeHtml(story.url)}" aria-label="${escapeHtml(t('previewVerb') + ' ' + story.title)}">${art(story)}</a><div class="card-bottom"><span>${dateLabel(story)} · ${readingLabel(story)}</span><button class="bookmark" data-save="${story.id}" title="${t(state.saved.has(story.id) ? 'unsave' : 'save')}" aria-label="${escapeHtml(t(state.saved.has(story.id) ? 'unsave' : 'save') + ' ' + story.title)}" aria-pressed="${state.saved.has(story.id)}"><span class="ui-icon icon-bookmark" aria-hidden="true"></span></button></div></article>`;
  }).join('') || `<div class="empty"><h3>${t('emptyTitle')}</h3><p>${t('emptyBody')}</p><button class="text-link" id="reset">${t('reset')}</button></div>`;
  document.querySelector('#result-count').textContent = state.locale === 'zh-Hant' ? `${matches.length} 則內容` : `${matches.length} ${matches.length === 1 ? 'story' : 'stories'}`;
  document.querySelector('#saved-count').textContent = state.saved.size;
  document.querySelectorAll('[data-format]').forEach(button => button.setAttribute('aria-pressed', button.dataset.format === state.format));
  document.querySelector('#topic').value = state.topic;
}
function renderLanguage() {
  document.documentElement.lang = state.locale;
  document.title = t('pageTitle');
  document.querySelectorAll('[data-about-link]').forEach(link => { link.href = state.locale === 'zh-Hant' ? 'about/zh/' : 'about/'; });
  document.querySelector('meta[name="description"]').content = t('description');
  document.querySelectorAll('[data-i18n]').forEach(element => { element.innerHTML = t(element.dataset.i18n); });
  ['aria-label','placeholder','alt','title'].forEach(attribute => {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`))));
  });
  document.querySelectorAll('[data-locale]').forEach(button => button.setAttribute('aria-pressed', button.dataset.locale === state.locale));
  document.querySelectorAll('[data-socials]').forEach(group => {
    group.innerHTML = socials.map(social => `<a class="social-link" title="${social.name} · ${social.handle}" href="${social.url}" target="_blank" rel="noopener noreferrer" aria-label="${social.name} ${social.handle}, ${t('newTab')}"><span class="brand-icon" style="--brand-icon:url(assets/icons/${social.name.toLowerCase()}.svg)" aria-hidden="true"></span></a>`).join('');
  });
  const featured = localizedStory(catalog.get(featuredStoryId));
  document.querySelector('#hero-art').innerHTML = art(featured, true);
  document.querySelector('#hero-art').setAttribute('aria-label', `${t('previewVerb')} ${featured.title}`);
  document.querySelector('#featured-title').textContent = featured.title;
  document.querySelector('#featured-summary').textContent = featured.summary;
  document.querySelector('#featured-title').lang = state.locale;
  document.querySelector('#featured-summary').lang = state.locale;
  ['#hero-art', '#featured-title', '#featured-link'].forEach(selector => { document.querySelector(selector).href = featured.url; });
  render();

}
function changeLanguage(locale) {
  if (locale !== 'en' && locale !== 'zh-Hant') return;
  state.locale = locale;
  let persisted = true;
  try { localStorage.setItem(languageStorageKey, locale); } catch { persisted = false; }
  renderLanguage();
  notify(persisted ? '' : t('languageStorageToast'));
}
function save(id) {
  if (!catalog.has(id)) return;
  if(state.saved.has(id)) state.saved.delete(id); else state.saved.add(id);
  let persisted = true;
  try { localStorage.setItem(storageKey, JSON.stringify([...state.saved])); } catch { persisted = false; }
  render();
  notify(t(persisted ? (state.saved.has(id) ? 'savedToast' : 'removedToast') : 'storageToast'));
  (document.querySelector(`[data-save="${id}"]`) || document.querySelector('#search')).focus();
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('button,a'); if(!trigger) return;
  if(trigger.dataset.locale) changeLanguage(trigger.dataset.locale);
  else if(trigger.dataset.save) save(trigger.dataset.save);
  else if(trigger.dataset.view) { state.view = trigger.dataset.view; document.body.dataset.view = state.view; document.querySelectorAll('.switch button').forEach(button => button.setAttribute('aria-pressed', button === trigger)); render(); }
  else if(trigger.dataset.format) { state.format = trigger.dataset.format; render(); }
  else if(trigger.dataset.nav) { state.format = 'all'; state.topic = 'all'; state.query = ''; document.querySelector('#search').value = ''; render(); }
  else if(trigger.dataset.topic) { state.topic = trigger.dataset.topic; state.format = 'all'; state.query = ''; document.querySelector('#search').value = ''; render(); document.querySelector('#library').scrollIntoView(); }
  else if(trigger.id === 'saved-nav') { state.format = 'saved'; state.topic = 'all'; state.query = ''; document.querySelector('#search').value = ''; render(); document.querySelector('#library').scrollIntoView(); }
  else if(trigger.id === 'reset') { state.format = 'all'; state.topic = 'all'; state.query = ''; document.querySelector('#search').value = ''; render(); document.querySelector('#search').focus(); }

});
document.querySelector('#search').addEventListener('input', event => { state.query = event.target.value; render(); });
document.querySelector('#topic').addEventListener('change', event => { state.topic = event.target.value; render(); });
renderLanguage();

const followMenu = document.querySelector('.follow-menu');
followMenu.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') followMenu.open = true;
});
followMenu.addEventListener('pointerleave', event => {
  if (event.pointerType === 'mouse' && !followMenu.contains(document.activeElement)) followMenu.open = false;
});
followMenu.addEventListener('focusout', event => {
  if (!followMenu.contains(event.relatedTarget)) followMenu.open = false;
});
document.addEventListener('click', event => {
  if (!followMenu.contains(event.target)) followMenu.open = false;
});
followMenu.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    followMenu.open = false;
    followMenu.querySelector('summary').focus();
    event.preventDefault();
  }
});
