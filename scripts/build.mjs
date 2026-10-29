import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { marked } from 'marked';

process.chdir(new URL('../', import.meta.url).pathname);
const base = (process.env.SITE_URL || 'https://aifi-talk.vercel.app').replace(/\/$/, '');
const posts = JSON.parse(await readFile('content/posts.json', 'utf8'));
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const records = [];
const read = file => readFile(file, 'utf8');
const articleUrl = post => `${base}/posts/${post.id}/`;

function head(title, description, url, image, prefix = '../../', type = 'article') {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · AiFi Talk</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}"><meta property="og:type" content="${type}"><meta property="og:site_name" content="AiFi Talk"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${base}/${image}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${prefix}assets/favicon.svg"><link rel="alternate" type="application/rss+xml" title="AiFi Talk RSS" href="${prefix}feed.xml"><link rel="stylesheet" href="${prefix}tokens.css"><link rel="stylesheet" href="${prefix}style.css">`;
}

await rm('dist', { recursive: true, force: true });
await mkdir('dist/posts', { recursive: true });
for (const file of ['index.html', 'style.css', 'tokens.css', 'app.js', 'i18n.js']) {
  await cp(file, `dist/${file}`, { recursive: true });
}

await mkdir('dist/assets', { recursive: true });
for (const asset of ['favicon.svg', 'icons', 'posts']) await cp(`assets/${asset}`, `dist/assets/${asset}`, { recursive: true });

for (const post of posts) {
  const markdown = await read(`content/${post.file}`);
  const html = marked.parse(markdown);
  const minutes = Math.max(1, Math.ceil(markdown.split(/\s+/).length / 220));
  records.push({ ...post, kind: 'article', topic: 'AI & building', length: `${minutes} min read`, url: `posts/${post.id}/` });
  const related = posts.filter(other => other.id !== post.id).map(other => `<li><a href="../${other.id}/">${esc(other.title)}</a></li>`).join('');
  const structured = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.summary, image: `${base}/${post.image}`, datePublished: post.date, author: { '@type': 'Person', name: 'Frederic', url: `${base}/about/` }, mainEntityOfPage: articleUrl(post), inLanguage: 'en' }).replaceAll('<', '\\u003c');
  await mkdir(`dist/posts/${post.id}`, { recursive: true });
  await writeFile(`dist/posts/${post.id}/index.html`, `<!doctype html><html lang="en"><head>${head(post.title, post.summary, articleUrl(post), post.image)}<script type="application/ld+json">${structured}</script></head>
<body><a class="skip-link" href="#article">Skip to article</a><div class="wrap"><header><a class="logo" href="../../">AiFi Talk</a><a href="../../#library">All articles / 所有文章 ↗</a></header>
<main class="article-page" id="article" tabindex="-1"><p class="eyebrow">Frederic · <time datetime="${post.date}">${new Date(post.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time> · ${minutes} min read · English</p>
${html}
<section class="article-author" aria-label="About the author"><div><h2>Written by Frederic</h2><p>I build products, explore AI and finance, and write about what I learn.</p><a href="../../about/">More about me ↗</a></div></section>
<nav class="article-related" aria-label="More in the pstack series"><h2>Keep reading</h2><ul>${related}</ul></nav>
<footer><p>Originally published on <a href="${esc(post.source)}">${new URL(post.source).hostname}</a>. Republished from my archived copy.</p><a href="../../#library">← Back to articles</a></footer></main></div></body></html>`);
}

await writeFile('dist/posts.js', `const publishedStories = ${JSON.stringify(records)};\n`);
let homepage = await read('dist/index.html');
const metadata = `<link rel="canonical" href="${base}/"><meta property="og:type" content="website"><meta property="og:title" content="AiFi Talk · Frederic's field notes"><meta property="og:description" content="AI, money, and making things. A personal publication by Frederic."><meta property="og:url" content="${base}/"><meta property="og:image" content="${base}/assets/posts/pstack-03-x-cover.png"><meta name="twitter:card" content="summary_large_image">`;
const featured = records[0];
homepage = homepage.replace('</head>', `${metadata}</head>`)
  .replace(/<a([^>]*id="hero-art"[^>]*)><\/a>/, `<a class="cover feature-art" id="hero-art" href="${featured.url}" aria-label="Read ${esc(featured.title)}"><img src="${featured.image}" alt="" decoding="async"></a>`)
  .replace(/<a([^>]*id="featured-title"[^>]*)><\/a>/, `<a id="featured-title" href="${featured.url}" lang="en">${esc(featured.title)}</a>`)
  .replace('<p id="featured-summary"></p>', `<p id="featured-summary" lang="en">${esc(featured.summary)}</p>`)
  .replace(/id="featured-link" href="[^"]*"/, `id="featured-link" href="${featured.url}"`)
  .replace('<div class="grid" id="cards"></div>', `<div class="grid" id="cards">${records.map(post => `<article class="card"><div class="meta">Article · AI &amp; building</div><h3><a href="${post.url}">${esc(post.title)}</a></h3><p>${esc(post.summary)}</p><a class="cover card-art" href="${post.url}" aria-label="Read ${esc(post.title)}"><img src="${post.image}" alt="" loading="lazy"></a><div class="card-bottom">${post.date} · ${post.length}</div></article>`).join('')}</div>`);
await writeFile('dist/index.html', homepage);
await writeFile('dist/posts/index.html', `<!doctype html><html lang="en"><head>${head('Articles', 'Notes on AI, money, and making things.', `${base}/posts/`, 'assets/posts/pstack-03-x-cover.png', '../', 'website')}</head><body><main class="article-page"><a class="logo" href="../">AiFi Talk</a><h1>Articles</h1>${posts.map(post => `<h2><a href="${post.id}/">${esc(post.title)}</a></h2><p>${esc(post.summary)}</p>`).join('')}</main></body></html>`);
await writeFile('dist/feed.xml', `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>AiFi Talk</title><link>${base}/</link><description>AI, money, and making things.</description>${posts.map(post => `<item><title>${esc(post.title)}</title><link>${articleUrl(post)}</link><guid>${articleUrl(post)}</guid><description>${esc(post.summary)}</description><pubDate>${new Date(post.date + 'T12:00:00Z').toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/posts/', '/about/', '/about/zh/', ...posts.map(post => `/posts/${post.id}/`)].map(path => `<url><loc>${base}${path}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);

const aboutEditions = [
  { dir:'about', lang:'en', prefix:'../', title:'A little about me', eyebrow:'THE PERSON BEHIND AIFI', greeting:'I’m Frederic.<br>I build, then write.', paragraphs:["I’m building Bloomtrade and SupWallet. AiFi Talk is where I share the decisions, experiments, and lessons behind the work.", "I explore AI and finance by building products and testing ideas. Writing helps me explain what I tried, what happened, and what I learned.", "I want to make AI and finance easier to understand through something you can inspect, try, or build yourself."], link:'Read my notes ↗', languageLink:'zh/', languageName:'繁體中文', back:'Home' },
  { dir:'about/zh', lang:'zh-Hant', prefix:'../../', title:'關於我', eyebrow:'AIFI 背後的人', greeting:'我是 Frederic。<br>先動手做，再寫下來。', paragraphs:["我正在做 Bloomtrade 和 SupWallet。在 AiFi Talk，我會分享過程中的決策、實驗，以及學到的事。", "我透過做產品、測試想法來探索 AI 與金融，並把過程中的心得寫下來。", "我希望透過能仔細看、親手試，甚至自己做出來的東西，讓 AI 和金融更容易理解。"], link:'閱讀我的筆記 ↗', languageLink:'../', languageName:'English', back:'首頁' }
];
for (const page of aboutEditions) {
  await mkdir(`dist/${page.dir}`, {recursive:true});
  await writeFile(`dist/${page.dir}/index.html`, `<!doctype html><html lang="${page.lang}"><head>${head(page.title, page.paragraphs[0], `${base}/${page.dir}/`, 'assets/posts/pstack-03-x-cover.png', page.prefix, 'website')}</head><body class="editorial-page"><div class="wrap"><header><a class="logo" href="${page.prefix}">AiFi Talk</a><nav aria-label="Navigation"><a href="${page.prefix}">${page.back}</a><a href="${page.languageLink}">${page.languageName}</a></nav></header><main class="article-page about-page"><p class="eyebrow">${page.eyebrow}</p><h1>${page.greeting}</h1>${page.paragraphs.map(text=>`<p>${text}</p>`).join('')}<p class="about-projects">Bloomtrade · SupWallet</p><a class="text-link" href="${page.prefix}#library">${page.link}</a></main></div></body></html>`);
}

await writeFile('dist/.nojekyll', '');
console.log(`Built ${posts.length} articles for ${base}`);
