import { base, editions, esc, longDate, read, readingMinutes, write } from './site.mjs';
import { assetsLink, editorialHeader, head, languageLinks, page } from './layout.mjs';
import { renderArticle } from './markdown.mjs';

function sourceCredit(edition) {
  if (edition.original) return edition.chinese ? '本文首發於 AiFi Talk。' : 'First published on AiFi Talk.';
  const link = `<a href="${esc(edition.source)}">${new URL(edition.source).hostname}</a>`;
  return edition.chinese ? `原文刊登於 ${link}。本文依保存的原稿刊載。` : `Originally published on ${link}. Republished from my archived copy.`;
}

function articlePage(edition, posts, minutes, html) {
  const { chinese, language, path } = edition;
  const t = (en, zh) => (chinese ? zh : en);
  const alternates = { en: `/posts/${edition.id}/`, zh: `/posts/${edition.id}/zh/` };
  const related = posts.filter(other => other.id !== edition.id).map(other => `<li><a href="/posts/${other.id}/${chinese ? 'zh/' : ''}">${esc(chinese ? other.zh.title : other.title)}</a></li>`).join('');
  const structured = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: edition.title, description: edition.summary, image: `${base}/${edition.image}`, datePublished: edition.date, author: { '@type': 'Person', name: 'Frederic', url: `${base}/about/` }, mainEntityOfPage: `${base}${path}`, inLanguage: language }).replaceAll('<', '\\u003c');
  const nav = `<a href="/#library">${t('All articles', '所有文章')} ↗</a>${languageLinks(language, { en: alternates.en, 'zh-Hant': alternates.zh }, { article: true })}`;
  return page({
    language,
    head: head({ title: edition.title, description: edition.summary, path, image: edition.image, alternates, extra: `<script type="application/ld+json">${structured}</script>` }),
    scripts: ['article-contents.js', 'newsletter.js'],
    body: `<a class="skip-link" href="#article">${t('Skip to article', '跳至文章')}</a><div class="wrap">${editorialHeader(t('Article navigation', '文章導覽'), nav)}
<main class="article-page" id="article" tabindex="-1"><p class="eyebrow">Frederic · <time datetime="${edition.date}">${longDate(edition.date, language)}</time> · ${t(`${minutes} min read · English`, `閱讀約 ${minutes} 分鐘 · 繁體中文`)}</p>
<div class="article-body">${html}</div>
<section class="article-author" aria-label="${t('About the author', '關於作者')}"><div><h2>${t('Written by Frederic', '作者 Frederic')}</h2><p>${t('I build products, explore AI and finance, and write about what I learn.', '我透過做產品、測試想法來探索 AI 與金融，並把過程中的心得寫下來。')}</p><a href="/about/${chinese ? 'zh/' : ''}">${t('More about me', '關於我')} ↗</a></div></section>
<nav class="article-related" aria-label="${t('More articles', '更多文章')}"><h2>${t('Keep reading', '繼續閱讀')}</h2><ul>${related}</ul></nav>
<footer><p>${sourceCredit(edition)}</p><a href="/#library">← ${t('Back to articles', '回到文章列表')}</a>${assetsLink(chinese)}</footer></main></div>`,
  });
}

// Writes both editions of every post and returns the reading time per edition for the story catalog.
export async function buildArticles(posts) {
  const lengths = new Map();
  for (const post of posts) {
    for (const edition of editions(post)) {
      const markdown = await read(`content/${edition.file}`);
      const minutes = readingMinutes(markdown);
      lengths.set(`${post.id}:${edition.language}`, minutes);
      await write(`${edition.path.slice(1)}index.html`, articlePage(edition, posts, minutes, renderArticle(markdown, edition)));
    }
  }
  return lengths;
}
