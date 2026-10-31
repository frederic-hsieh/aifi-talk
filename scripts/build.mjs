import { buildAssetsPage } from './assets-page.mjs';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, cp, rm, readdir } from 'node:fs/promises';
import { marked } from 'marked';

process.chdir(new URL('../', import.meta.url).pathname);
const base = (process.env.SITE_URL || 'https://aifitalk.com').replace(/\/$/, '');
const posts = JSON.parse(await readFile('content/posts.json', 'utf8'));
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const records = [];
const read = file => readFile(file, 'utf8');
const articleUrl = post => `${base}/posts/${post.id}/`;

function head(title, description, url, image, prefix = '../../', type = 'article') {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · AiFi Talk</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}"><meta property="og:type" content="${type}"><meta property="og:site_name" content="AiFi Talk"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${base}/${image}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${prefix}assets/brand/favicon-32.png" type="image/png" sizes="32x32"><link rel="icon" href="${prefix}assets/brand/favicon-16.png" type="image/png" sizes="16x16"><link rel="apple-touch-icon" href="${prefix}assets/brand/apple-touch-icon.png"><link rel="alternate" type="application/rss+xml" title="AiFi Talk RSS" href="${prefix}feed.xml"><link rel="stylesheet" href="${prefix}tokens.css"><link rel="stylesheet" href="${prefix}style.css">`;
}

await rm('dist', { recursive: true, force: true });
await mkdir('dist/posts', { recursive: true });
for (const file of ['header.js', 'index.html', 'style.css', 'tokens.css', 'app.js', 'i18n.js', 'article-contents.js']) {
  await cp(file, `dist/${file}`, { recursive: true });
}

await mkdir('dist/assets', { recursive: true });
for (const asset of ['brand', 'icons', 'posts']) await cp(`assets/${asset}`, `dist/assets/${asset}`, { recursive: true });

for (const post of posts) {
  records.push({ ...post, kind: 'article', topic: 'AI & building', url: `posts/${post.id}/` });
  for (const language of ['en', 'zh-Hant']) {
    const chinese = language === 'zh-Hant';
    const edition = chinese ? { ...post, ...post.zh } : post;
    const prefix = chinese ? '../../../' : '../../';
    const route = `posts/${post.id}/${chinese ? 'zh/' : ''}`;
    const url = `${base}/${route}`;
    const markdown = await read(`content/${edition.file}`);
    let html = marked.parse(markdown);
    let sectionIndex = 0;
    html = html.replace(/<h2>/g, () => `<h2 id="section-${++sectionIndex}" tabindex="-1">`);
    if (post.id === 'pstack-practice') html = html.replace('../../assets/posts/pstack-03-x-cover.png', '../../' + post.image);
    if (chinese || post.original || post.id === 'pstack-introduction') html = html.replace('</h1>', `</h1><p><img src="../../${post.image}" alt="${esc(post.imageAlt)}"></p>`);
    if (chinese) html = html.replaceAll('../../assets/', '../../../assets/');
    if (post.original) {
      const sections = [...html.matchAll(/<h2 id="([^"]+)" tabindex="-1">\d+\. (.*?)<\/h2>/g)];
      html = html.replace('<table>', '<table class="article-outline">');
      for (const [, id, title] of sections) {
        html = html.replace(`<td>${title}</td>`, `<td><a href="#${id}">${title}</a></td>`);
      }
    }
    if (post.id === 'yc-rfs-winter-2027') {
      html = html.replace(/(<h2[^>]*>Contents<\/h2>)\s*(<table class="article-outline">[\s\S]*?<\/table>)/, '<details class="article-outline-disclosure"><summary>$1</summary>$2</details>');
    }
    const minutes = Math.max(1, Math.ceil(chinese ? (markdown.match(/[\u3400-\u9fff]/g) || []).length / 400 + markdown.split(/\s+/).length / 220 : markdown.split(/\s+/).length / 220));
    const record = records.at(-1);
    if (chinese) record.zh = { ...post.zh, url: route, length: `${minutes} min read` };
    else record.length = `${minutes} min read`;
    const related = posts.filter(other => other.id !== post.id).map(other => `<li><a href="${chinese ? '../../' : '../'}${other.id}/${chinese ? 'zh/' : ''}">${esc(chinese ? other.zh.title : other.title)}</a></li>`).join('');
    const structured = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: edition.title, description: edition.summary, image: `${base}/${post.image}`, datePublished: edition.date, author: { '@type': 'Person', name: 'Frederic', url: `${base}/about/` }, mainEntityOfPage: url, inLanguage: language }).replaceAll('<', '\\u003c');
    await mkdir(`dist/${route}`, { recursive: true });
    await writeFile(`dist/${route}index.html`, `<!doctype html><html lang="${language}"><head>${head(edition.title, edition.summary, url, post.image, prefix)}
<link rel="alternate" hreflang="en" href="${articleUrl(post)}"><link rel="alternate" hreflang="zh-Hant" href="${articleUrl(post)}zh/"><script type="application/ld+json">${structured}</script></head>
<body class="editorial-page"><a class="skip-link" href="#article">${chinese ? '跳至文章' : 'Skip to article'}</a><div class="wrap"><header><a class="logo" href="${prefix}"><img class="aifi-wordmark" src="${prefix}assets/brand/aifi-wordmark.png" width="480" height="250" alt="AiFi"></a><nav aria-label="${chinese ? '文章導覽' : 'Article navigation'}"><a href="${prefix}#library">${chinese ? '所有文章' : 'All articles'} ↗</a><div class="article-language" aria-label="Language"><a data-article-language="en" lang="en" aria-label="English" title="English" href="${chinese ? '../' : './'}" ${chinese ? '' : 'aria-current="page"'}>En</a><a data-article-language="zh-Hant" lang="zh-Hant" aria-label="繁體中文" title="繁體中文" href="${chinese ? './' : 'zh/'}" ${chinese ? 'aria-current="page"' : ''}>中</a></div></nav></header>
<main class="article-page" id="article" tabindex="-1"><p class="eyebrow">Frederic · <time datetime="${edition.date}">${new Date(edition.date + 'T12:00:00Z').toLocaleDateString(language, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time> · ${chinese ? `閱讀約 ${minutes} 分鐘 · 繁體中文` : `${minutes} min read · English`}</p>
<div class="article-body">${html}</div>
<section class="article-author" aria-label="${chinese ? '關於作者' : 'About the author'}"><div><h2>${chinese ? '作者 Frederic' : 'Written by Frederic'}</h2><p>${chinese ? '我透過做產品、測試想法來探索 AI 與金融，並把過程中的心得寫下來。' : 'I build products, explore AI and finance, and write about what I learn.'}</p><a href="${prefix}about/${chinese ? 'zh/' : ''}">${chinese ? '關於我' : 'More about me'} ↗</a></div></section>
<nav class="article-related" aria-label="${chinese ? '更多文章' : 'More articles'}"><h2>${chinese ? '繼續閱讀' : 'Keep reading'}</h2><ul>${related}</ul></nav>
<footer><p>${post.original ? (chinese ? '本文首發於 AiFi Talk。' : 'First published on AiFi Talk.') : `${chinese ? '原文刊登於' : 'Originally published on'} <a href="${esc(edition.source)}">${new URL(edition.source).hostname}</a>${chinese ? '。本文依保存的原稿刊載。' : '. Republished from my archived copy.'}`}</p><a href="${prefix}#library">← ${chinese ? '回到文章列表' : 'Back to articles'}</a></footer></main></div><script src="${prefix}article-contents.js"></script></body></html>`);
  }
}

await writeFile('dist/posts.js', `const publishedStories = ${JSON.stringify(records)};\n`);
let homepage = await read('dist/index.html');
const metadata = `<link rel="canonical" href="${base}/"><meta property="og:type" content="website"><meta property="og:title" content="AiFi Talk · Frederic's field notes"><meta property="og:description" content="AI, money, and making things. A personal publication by Frederic."><meta property="og:url" content="${base}/"><meta property="og:image" content="${base}/assets/posts/pstack-03-blueprint-cover.png"><meta name="twitter:card" content="summary_large_image">`;
const featured = records[0];
homepage = homepage.replace('</head>', `${metadata}</head>`)
  .replace(/<a([^>]*id="hero-art"[^>]*)><\/a>/, `<a class="cover feature-art" id="hero-art" href="${featured.url}" aria-label="Read ${esc(featured.title)}"><img src="${featured.image}" alt="" decoding="async"></a>`)
  .replace(/<a([^>]*id="featured-title"[^>]*)><\/a>/, `<a id="featured-title" href="${featured.url}" lang="en">${esc(featured.title)}</a>`)
  .replace('<p id="featured-summary"></p>', `<p id="featured-summary" lang="en">${esc(featured.summary)}</p>`)
  .replace(/id="featured-link" href="[^"]*"/, `id="featured-link" href="${featured.url}"`)
  .replace('<div class="grid" id="cards"></div>', `<div class="grid" id="cards">${records.map(post => `<article class="card"><div class="cover card-art"><img src="${post.image}" alt="" loading="lazy"></div><h3><a class="card-link" href="${post.url}">${esc(post.title)}</a></h3><div class="meta">Article · AI &amp; building</div><p>${esc(post.summary)}</p><div class="card-bottom">${post.date} · ${post.length}</div></article>`).join('')}</div>`);
await writeFile('dist/index.html', homepage);
await writeFile('dist/posts/index.html', `<!doctype html><html lang="en"><head>${head('Articles', 'Notes on AI, money, and making things.', `${base}/posts/`, 'assets/posts/pstack-03-blueprint-cover.png', '../', 'website')}</head><body><main class="article-page"><a class="logo" href="../"><img class="aifi-wordmark" src="../assets/brand/aifi-wordmark.png" width="480" height="250" alt="AiFi"></a><h1>Articles</h1>${posts.map(post => `<h2><a href="${post.id}/">${esc(post.title)}</a></h2><p>${esc(post.summary)}</p>`).join('')}</main></body></html>`);
await writeFile('dist/feed.xml', `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>AiFi Talk</title><link>${base}/</link><description>AI, money, and making things.</description>${posts.map(post => `<item><title>${esc(post.title)}</title><link>${articleUrl(post)}</link><guid>${articleUrl(post)}</guid><description>${esc(post.summary)}</description><pubDate>${new Date(post.date + 'T12:00:00Z').toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/posts/', '/about/', '/about/zh/', '/assets/', ...posts.flatMap(post => [`/posts/${post.id}/`, `/posts/${post.id}/zh/`])].map(path => `<url><loc>${base}${path}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);

const aboutEditions = [
  { dir:'about', lang:'en', prefix:'../', title:'A little about me', eyebrow:'THE PERSON BEHIND AIFI', greeting:'I’m Frederic.<br>I build, then write.', paragraphs:["I’m building Bloomtrade and SupWallet. AiFi Talk is where I share the decisions, experiments, and lessons behind the work.", "I explore AI and finance by building products and testing ideas. Writing helps me explain what I tried, what happened, and what I learned.", "I want to make AI and finance easier to understand through something you can inspect, try, or build yourself."], link:'Read my notes ↗', languageLink:'zh/', languageName:'繁體中文', back:'Home' },
  { dir:'about/zh', lang:'zh-Hant', prefix:'../../', title:'關於我', eyebrow:'AIFI 背後的人', greeting:'我是 Frederic。<br>先動手做，再寫下來。', paragraphs:["我正在做 Bloomtrade 和 SupWallet。在 AiFi Talk，我會分享過程中的決策、實驗，以及學到的事。", "我透過做產品、測試想法來探索 AI 與金融，並把過程中的心得寫下來。", "我希望透過能仔細看、親手試，甚至自己做出來的東西，讓 AI 和金融更容易理解。"], link:'閱讀我的筆記 ↗', languageLink:'../', languageName:'English', back:'首頁' }
];
for (const page of aboutEditions) {
  await mkdir(`dist/${page.dir}`, {recursive:true});
  await writeFile(`dist/${page.dir}/index.html`, `<!doctype html><html lang="${page.lang}"><head>${head(page.title, page.paragraphs[0], `${base}/${page.dir}/`, 'assets/posts/pstack-03-blueprint-cover.png', page.prefix, 'website')}</head><body class="editorial-page"><div class="wrap"><header><a class="logo" href="${page.prefix}"><img class="aifi-wordmark" src="${page.prefix}assets/brand/aifi-wordmark.png" width="480" height="250" alt="AiFi"></a><nav aria-label="Navigation"><a href="${page.prefix}">${page.back}</a><div class="article-language" aria-label="Language"><a href="${page.lang === 'en' ? './' : '../'}" lang="en" aria-label="English" title="English" ${page.lang === 'en' ? 'aria-current="page"' : ''}>En</a><a href="${page.lang === 'en' ? 'zh/' : './'}" lang="zh-Hant" aria-label="繁體中文" title="繁體中文" ${page.lang === 'zh-Hant' ? 'aria-current="page"' : ''}>中</a></div></nav></header><main class="article-page about-page"><p class="eyebrow">${page.eyebrow}</p><h1>${page.greeting}</h1>${page.paragraphs.map(text=>`<p>${text}</p>`).join('')}<p class="about-projects">Bloomtrade · SupWallet</p><a class="text-link" href="${page.prefix}#library">${page.link}</a></main></div></body></html>`);
}

await buildAssetsPage(head, base);

// Apply the same external-link behavior to every generated page, including source credits.
async function prepareExternalLinks(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await prepareExternalLinks(path);
    else if (entry.name.endsWith('.html')) {
      const source = await read(path);
      const chinese = source.includes('lang="zh-Hant"');
      const assetLink = `<a class="assets-footer-link" href="${'../'.repeat(path.split('/').length - 2)}assets/" data-i18n="assets">${chinese ? '品牌資源' : 'Assets'}</a>`;
      const withAssets = source.includes('<footer') ? source.replace('</footer>', `${assetLink}</footer>`) : source.replace('</main>', `</main><footer>${assetLink}</footer>`);
      const html = withAssets.replace('</body>', `<script src="${'../'.repeat(path.split('/').length - 2)}header.js"></script></body>`);
      const updated = html.replace(/<a\b[^>]*>/g, tag => {
        const href = tag.match(/\bhref="([^"]+)"/)?.[1];
        if (!href) return tag;
        const url = new URL(href.replaceAll('&amp;', '&'), base);
        if (!['http:', 'https:'].includes(url.protocol) || url.origin === new URL(base).origin) return tag;
        const clean = tag.replace(/\s(?:target|rel)="[^"]*"/g, '');
        return clean.replace(/>$/, ' target="_blank" rel="noopener noreferrer">');
      });
      await writeFile(path, updated);
    }
  }
}
await prepareExternalLinks('dist');

await writeFile('dist/.nojekyll', '');
console.log(`Built ${posts.length} articles for ${base}`);

// Fingerprinted assets prevent stale presentation after a rebuild or deployment.
for (const [name, extension] of [['tokens', 'css'], ['style', 'css'], ['app', 'js'], ['header', 'js']]) {
  const css = await readFile(`dist/${name}.${extension}`, 'utf8');
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 10);
  const versioned = `${name}.${hash}.${extension}`;
  await writeFile(`dist/${versioned}`, css);
  for (const file of await readdir('dist', { recursive: true })) {
    if (!file.endsWith('.html')) continue;
    const path = `dist/${file}`;
    const html = await readFile(path, 'utf8');
    await writeFile(path, html.replaceAll(`${name}.${extension}"`, `${versioned}"`));
  }
}
