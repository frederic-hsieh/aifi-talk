import { marked } from 'marked';
import { base, esc, read, readJson, write } from './site.mjs';
import { assetsLink, editorialHeader, head, languageLinks, page } from './layout.mjs';

const shareImage = 'assets/posts/pstack-03-blueprint-cover.png';

export async function buildAbout() {
  const editions = await readJson('content/about.json');
  for (const [language, about] of Object.entries(editions)) {
    const chinese = language === 'zh-Hant';
    const nav = `<a href="/">${about.back}</a>${languageLinks(language, { en: '/about/', 'zh-Hant': '/about/zh/' })}`;
    await write(`${about.dir}/index.html`, page({
      language,
      head: head({ title: about.title, description: about.paragraphs[0], path: `/${about.dir}/`, image: shareImage, type: 'website', alternates: { en: '/about/', zh: '/about/zh/' } }),
      body: `<div class="wrap">${editorialHeader('Navigation', nav)}<main class="article-page about-page"><p class="eyebrow">${about.eyebrow}</p><h1>${about.greeting}</h1>${about.paragraphs.map(text => `<p>${text}</p>`).join('')}<p class="about-projects">${about.projects}</p><a class="text-link" href="/#library">${about.link}</a></main><footer>${assetsLink(chinese)}</footer></div>`,
    }));
  }
}

export async function buildArchive(posts) {
  await write('posts/index.html', page({
    head: head({ title: 'Articles', description: 'Notes on AI, money, and making things.', path: '/posts/', image: shareImage, type: 'website' }),
    body: `<div class="wrap">${editorialHeader('Navigation', '<a href="/">Home</a>')}<main class="article-page"><h1>Articles</h1>${posts.map(post => `<h2><a href="/posts/${post.id}/">${esc(post.title)}</a></h2><p>${esc(post.summary)}</p>`).join('')}</main><footer>${assetsLink(false)}</footer></div>`,
  }));
}

// The public Assets page is generated from DESIGN-SYSTEM.md so the standards are never copied by hand.
export async function buildAssetsPage() {
  const standard = await read('DESIGN-SYSTEM.md');
  const assets = [
    ['aifi-talk-curved.png', 'AiFi Talk', 'Homepage header · 首頁標誌'],
    ['aifi-wordmark.png', 'AiFi', 'Other pages and footer · 其他頁面與頁尾'],
    ['af-icon.png', 'af butterfly', 'Standalone icon · 品牌圖示'],
    ['af-icon-blue.png', 'af butterfly · Blue tile', 'Selected browser identity · 瀏覽器品牌圖示'],
    ['favicon-32.png', 'af butterfly favicon', 'Browser icon · 瀏覽器圖示'],
  ];
  const swatches = ['paper', 'paper-hover', 'ink', 'muted', 'line', 'line-strong', 'orange', 'control'];
  await write('assets/design-standard.md', standard);
  await write('assets/index.html', page({
    head: head({ title: 'Assets & design standards', description: 'Approved AiFi logos and the current website design standards.', path: '/assets/', image: shareImage, type: 'website' }),
    body: `<div class="wrap">${editorialHeader('Navigation', '<a href="/">Home / 首頁</a><a href="#standards">Design standards / 設計規範</a>', 'AiFi home')}<main class="brand-assets"><p class="eyebrow">THE AIFI IDENTITY · 品牌資源</p><h1>Assets &amp; design standards</h1><p lang="zh-Hant">品牌素材與設計規範。這裡保留目前網站使用的標誌與設計標準，隨網站設計一起更新。</p><p>Approved artwork and the standards behind AiFi Talk. Updated with the website.</p><section class="brand-downloads" aria-label="Logo downloads">${assets.map(([file, name, usage]) => `<article class="brand-download"><div class="brand-preview"><img src="/assets/brand/${file}" alt="${name}" loading="lazy"></div><h2>${name}</h2><p>${usage}</p><a href="/assets/brand/${file}" download>Download PNG / 下載 <span class="sr-only">${name}</span> ↗</a></article>`).join('')}</section><section aria-label="Website palette"><h2>Palette / 色彩</h2><div class="brand-palette">${swatches.map(name => `<div><span class="brand-swatch" style="background:var(--${name})"></span><code>--${name}</code></div>`).join('')}</div></section><section id="standards" class="brand-standard"><a class="text-link" href="/assets/design-standard.md" download>Download standards / 下載規範 ↗</a>${marked.parse(standard).replace('<h1>', '<h2>').replace('</h1>', '</h2>')}</section></main><footer><a href="/">← AiFi Talk</a><p>© 2026 Frederic · AiFi Talk</p>${assetsLink(false)}</footer></div>`,
  }));
}

export async function buildFeeds(posts) {
  const url = post => `${base}/posts/${post.id}/`;
  await write('feed.xml', `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>AiFi Talk</title><link>${base}/</link><description>AI, money, and making things.</description>${posts.map(post => `<item><title>${esc(post.title)}</title><link>${url(post)}</link><guid>${url(post)}</guid><description>${esc(post.summary)}</description><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
  const paths = ['/', '/posts/', '/about/', '/about/zh/', '/assets/', ...posts.flatMap(post => [`/posts/${post.id}/`, `/posts/${post.id}/zh/`])];
  await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${base}${path}</loc></url>`).join('')}</urlset>`);
  await write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
}
