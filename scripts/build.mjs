import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {marked} from 'marked';
const root=new URL('../',import.meta.url); process.chdir(root.pathname);
const base=process.env.SITE_URL || 'https://frederic-hsieh.github.io/aifi-talk';
const posts=JSON.parse(await readFile('content/posts.json','utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
await rm('dist',{recursive:true,force:true}); await mkdir('dist/posts',{recursive:true});
for(const f of ['index.html','style.css','tokens.css','app.js','i18n.js','assets']) await cp(f,`dist/${f}`,{recursive:true});
const records=[];
for(const p of posts){
 const md=await readFile(`content/${p.file}`,'utf8'); const html=marked.parse(md);
 const minutes=Math.max(1,Math.ceil(md.split(/\s+/).length/220));
 records.push({...p,kind:'article',topic:'AI & building',art:'agents',length:`${minutes} min read`,url:`posts/${p.id}/`});
 const url=`${base}/posts/${p.id}/`;
 await mkdir(`dist/posts/${p.id}`,{recursive:true});
 await writeFile(`dist/posts/${p.id}/index.html`,`<!doctype html><html lang="${p.language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)} · AiFi Talk</title><meta name="description" content="${esc(p.summary)}"><link rel="canonical" href="${url}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.summary)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${base}/assets/creative-desk.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="../../assets/favicon.svg"><link rel="stylesheet" href="../../tokens.css"><link rel="stylesheet" href="../../style.css"></head><body><a class="skip-link" href="#article">Skip to article</a><div class="wrap"><header><a class="logo" href="../../">AiFi Talk</a><a href="../../#library">All articles / 所有文章 ↗</a></header><main class="article-page" id="article"><p class="eyebrow">Frederic · <time datetime="${p.date}">${p.date}</time> · ${minutes} min read · English</p>${html}<footer><p>Originally published on <a href="${esc(p.source)}">${new URL(p.source).hostname}</a>. Republished from the author's archived copy.</p><a href="../../#library">← Back to articles</a></footer></main></div></body></html>`);
}
await writeFile('dist/posts.js',`const publishedStories = ${JSON.stringify(records)};\n`);
await writeFile('dist/posts/index.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Articles · AiFi Talk</title><link rel="stylesheet" href="../tokens.css"><link rel="stylesheet" href="../style.css"><main class="article-page"><a class="logo" href="../">AiFi Talk</a><h1>Articles</h1>${posts.map(p=>`<h2><a href="${p.id}/">${esc(p.title)}</a></h2><p>${esc(p.summary)}</p>`).join('')}</main></html>`);
await writeFile('dist/feed.xml',`<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>AiFi Talk</title><link>${base}/</link><description>AI, money, and making things.</description>${posts.map(p=>`<item><title>${esc(p.title)}</title><link>${base}/posts/${p.id}/</link><guid>${base}/posts/${p.id}/</guid><description>${esc(p.summary)}</description><pubDate>${new Date(p.date+'T12:00:00Z').toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/',...posts.map(p=>`/posts/${p.id}/`)].map(path=>`<url><loc>${base}${path}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
await writeFile('dist/.nojekyll','');
console.log(`Built ${posts.length} articles for ${base}`);
