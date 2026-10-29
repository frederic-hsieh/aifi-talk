const stories = publishedStories;
const catalog = new Map(stories.map(story => [story.id, story]));
const storageKey = 'aifitalk-prototype-saved-v1';
const languageStorageKey = 'aifitalk-prototype-language-v1';
let saved = new Set();
let locale = 'en';
try { const stored = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(stored)) saved = new Set(stored.filter(id => catalog.has(id))); } catch {}
try { const stored = localStorage.getItem(languageStorageKey); if (stored === 'en' || stored === 'zh-Hant') locale = stored; } catch {}
const state = {view:'magazine', format:'all', query:'', topic:'all', saved, locale, detail:null};
const featuredStoryId = stories[0].id;
const cards = document.querySelector('#cards');
const dialog = document.querySelector('#detail');
let opener = null;
let toastTimer;
const coverAssets = {agents:'creative-desk',wallet:'creative-desk',finance:'working-notes',prototype:'taipei-street',tools:'working-notes',notes:'working-notes'};
const coverKeys = {'creative-desk':'deskCover','working-notes':'notesCover','taipei-street':'streetCover'};
const topicKeys = {'AI & building':'topicAi','Money & systems':'topicMoney','Creative process':'topicCreative'};
function t(key) { return messages[state.locale][key]; }
function localizedStory(story) { return state.locale === 'zh-Hant' ? {...story, ...storyTranslations[story.id]} : story; }
function topicLabel(topic) { return t(topicKeys[topic]); }
function dateLabel(story) { return new Date(story.date+'T12:00:00').toLocaleDateString(state.locale, {year:'numeric',month:'short',day:'numeric'}); }
function readingLabel(story) { return state.locale === 'zh-Hant' ? `閱讀約 ${story.length.split(' ')[0]} 分鐘` : story.length; }
function art(type, decorative = true) {
  const asset = coverAssets[type];
  return `<img src="assets/${asset}.png" alt="${decorative ? '' : t(coverKeys[asset])}" width="1536" height="1024" loading="eager" decoding="async">`;
}
function notify(message) { document.querySelector('#toast').textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => document.querySelector('#toast').textContent = '', 3000); }
function render() {
  const omitFeatured = state.view === 'magazine' && state.format === 'all' && state.topic === 'all' && !state.query.trim();
  const matches = stories.filter(story => {
    const translated = storyTranslations[story.id] || story;
    const searchable = `${story.title} ${story.summary} ${story.topic} ${translated.title} ${translated.summary} ${messages['zh-Hant'][topicKeys[story.topic]]}`.toLowerCase();
    return (!omitFeatured || story.id !== featuredStoryId) && (state.format === 'all' || (state.format === 'saved' ? state.saved.has(story.id) : story.kind === state.format)) && (state.topic === 'all' || story.topic === state.topic) && searchable.includes(state.query.toLowerCase().trim());
  });
  cards.innerHTML = matches.map(original => {
    const story = localizedStory(original);
    return `<article class="card" data-story="${story.id}"><div class="meta"><span>${t(story.kind === 'video' ? 'videoConcept' : 'article')}</span><span>·</span><span>${topicLabel(story.topic)}</span></div><h3><button data-open="${story.id}">${story.title}</button></h3><p>${story.summary}</p><button class="cover card-art" data-open="${story.id}" aria-label="${t('previewVerb')} ${story.title}">${art(story.art)}${story.kind === 'video' ? `<span class="play" aria-hidden="true"><span class="ui-icon icon-play"></span></span><span class="duration">${story.length}</span>` : ''}</button><div class="card-bottom"><span>${dateLabel(story)} · ${story.kind === 'article' ? readingLabel(story) : t('sampleEpisode')}</span><button class="bookmark" data-save="${story.id}" title="${t(state.saved.has(story.id) ? 'unsave' : 'save')}" aria-label="${t(state.saved.has(story.id) ? 'unsave' : 'save')} ${story.title}" aria-pressed="${state.saved.has(story.id)}"><span class="ui-icon icon-bookmark" aria-hidden="true"></span></button></div></article>`;
  }).join('') || `<div class="empty"><h3>${t('emptyTitle')}</h3><p>${t('emptyBody')}</p><button class="text-link" id="reset">${t('reset')}</button></div>`;
  document.querySelector('#result-count').textContent = state.locale === 'zh-Hant' ? `${matches.length} 則內容` : `${matches.length} ${matches.length === 1 ? 'story' : 'stories'}`;
  document.querySelector('#saved-count').textContent = state.saved.size;
  document.querySelectorAll('[data-format]').forEach(button => button.setAttribute('aria-pressed', button.dataset.format === state.format));
  document.querySelector('#topic').value = state.topic;
}
function renderLanguage() {
  document.documentElement.lang = state.locale;
  document.title = t('pageTitle');
  document.querySelector('meta[name="description"]').content = t('description');
  document.querySelectorAll('[data-i18n]').forEach(element => { element.innerHTML = t(element.dataset.i18n); });
  ['aria-label','placeholder','alt','title'].forEach(attribute => {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`))));
  });
  document.querySelectorAll('[data-locale]').forEach(button => button.setAttribute('aria-pressed', button.dataset.locale === state.locale));
  document.querySelectorAll('[data-socials]').forEach(group => {
    group.innerHTML = socials.map(social => `<a class="social-link" title="${social.name} · ${social.handle}" href="${social.url}" target="_blank" rel="noopener noreferrer" aria-label="${social.name} ${social.handle}, ${t('newTab')}"><span class="brand-icon" style="--brand-icon:url(assets/icons/${social.name.toLowerCase()}.svg)" aria-hidden="true"></span></a>`).join('');
  });
  document.querySelector('#hero-art').innerHTML = art(catalog.get(featuredStoryId).art, false);
  document.querySelector('#recent-videos').innerHTML = stories.filter(story => story.kind === 'video').map(localizedStory).map(story => `<article class="recent-video"><button class="video-art cover" data-open="${story.id}" aria-label="${t('openVideo')} ${story.title}">${art(story.art)}<span class="play" aria-hidden="true"><span class="ui-icon icon-play"></span></span></button><div class="video-copy"><div class="meta">${topicLabel(story.topic)}</div><h3><button data-open="${story.id}">${story.title}</button></h3><span class="video-time">${story.length} · ${t('videoConcept')}</span></div></article>`).join('');
  document.querySelector('[data-i18n=featuredTitle]').textContent = stories[0].title;
  document.querySelector('[data-i18n=featuredSummary]').textContent = stories[0].summary;
  document.querySelector('.featured [data-open]').dataset.open = featuredStoryId;
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
  const detailSave = document.querySelector('#detail-save');
  if (detailSave?.dataset.save === id) {
    detailSave.textContent = t(state.saved.has(id) ? 'savedDetail' : 'saveLater');
    detailSave.setAttribute('aria-pressed', state.saved.has(id));
  }
  notify(t(persisted ? (state.saved.has(id) ? 'savedToast' : 'removedToast') : 'storageToast'));
  if (!dialog.open) (document.querySelector(`[data-save="${id}"]`) || document.querySelector('#search')).focus();
}
function openStory(id) {
  if (catalog.has(id)) window.location.href = catalog.get(id).url;
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('button,a'); if(!trigger) return;
  if(trigger.dataset.locale) changeLanguage(trigger.dataset.locale);
  else if(trigger.dataset.open) openStory(trigger.dataset.open, trigger);
  else if(trigger.dataset.save) save(trigger.dataset.save);
  else if(trigger.dataset.view) { state.view = trigger.dataset.view; document.body.dataset.view = state.view; document.querySelectorAll('.switch button').forEach(button => button.setAttribute('aria-pressed', button === trigger)); render(); }
  else if(trigger.dataset.format) { state.format = trigger.dataset.format; render(); }
  else if(trigger.dataset.nav) { state.format = trigger.dataset.nav; state.topic = 'all'; state.query = ''; document.querySelector('#search').value = ''; render(); }
  else if(trigger.dataset.topic) { state.topic = trigger.dataset.topic; state.format = 'all'; state.query = ''; document.querySelector('#search').value = ''; render(); document.querySelector('#library').scrollIntoView(); }
  else if(trigger.id === 'saved-nav') { state.format = 'saved'; state.topic = 'all'; state.query = ''; document.querySelector('#search').value = ''; render(); document.querySelector('#library').scrollIntoView(); }
  else if(trigger.id === 'reset') { state.format = 'all'; state.topic = 'all'; state.query = ''; document.querySelector('#search').value = ''; render(); document.querySelector('#search').focus(); }
  else if(trigger.id === 'close-dialog' || trigger.hasAttribute('data-close')) dialog.close();

});
document.querySelector('#search').addEventListener('input', event => { state.query = event.target.value; render(); });
document.querySelector('#topic').addEventListener('change', event => { state.topic = event.target.value; render(); });
dialog.addEventListener('close', () => {
  state.detail = null;
  const replacement = opener?.dataset.open ? document.querySelector(`.card [data-open="${opener.dataset.open}"]`) || document.querySelector(`[data-open="${opener.dataset.open}"]`) : null;
  (opener?.isConnected ? opener : replacement || document.querySelector('#search')).focus();
});
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
