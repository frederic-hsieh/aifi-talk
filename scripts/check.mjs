// Build-output checks: structural guarantees only, so editing article prose never breaks the build.
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import sharp from 'sharp';

process.chdir(new URL('../', import.meta.url).pathname);
const base = (process.env.SITE_URL || 'https://aifitalk.com').replace(/\/$/, '');
const posts = JSON.parse(await readFile('content/posts.json', 'utf8'));
const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const exists = path => stat(path).then(() => true, () => false);
const pages = (await readdir('dist', { recursive: true })).filter(file => file.endsWith('.html'));
const html = Object.fromEntries(await Promise.all(pages.map(async file => [file, await readFile(`dist/${file}`, 'utf8')])));

// Every local link, image, script, and stylesheet resolves; every in-page anchor has a target.
for (const [file, source] of Object.entries(html)) {
  const ids = new Set([...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const references = [...source.matchAll(/\b(?:href|src)="([^"]+)"/g), ...source.matchAll(/\bsrcset="([^"]+)"/g)].flatMap(match => match[1].split(', ').map(entry => entry.split(' ')[0]));
  for (const reference of references) {
    if (/^(https?:|mailto:)/.test(reference) || reference === '#') continue;
    if (reference.startsWith('#')) { assert(ids.has(reference.slice(1)) || reference === '#top', `${file}: missing anchor ${reference}`); continue; }
    assert(reference.startsWith('/'), `${file}: use a root-relative URL for ${reference}`);
    const path = `dist${reference.split('#')[0]}`;
    assert(await exists(path.endsWith('/') ? `${path}index.html` : path), `${file}: broken reference ${reference}`);
  }
  assert(!/\/Users\/|substack_draft:|source_master:|source_idea:/.test(source), `${file}: private path or source metadata leaked`);
  for (const match of source.matchAll(/<(?:link rel="stylesheet"|script) [^>]*(?:href|src)="(\/[^"]+)"/g)) assert(match[1].startsWith('/static/'), `${file}: ${match[1]} is not fingerprinted`);
}
assert(!(await exists('dist/content')) && !(await exists('dist/assets/author')), 'Private folders must not be published');
console.log(`PASS: ${pages.length} pages, local references, anchors, fingerprinted CSS/JS, no private data.`);

// Both editions of every post exist with canonical, language, share, and structured metadata.
const home = html['index.html'];
for (const post of posts) {
  for (const [suffix, title] of [['', post.title], ['zh/', post.zh.title]]) {
    const page = html[`posts/${post.id}/${suffix}index.html`];
    assert(page, `${post.id}: missing ${suffix || 'English'} edition`);
    assert(page.includes(`<link rel="canonical" href="${base}/posts/${post.id}/${suffix}">`), `${post.id}: canonical URL`);
    assert(page.includes(`hreflang="zh-Hant" href="${base}/posts/${post.id}/zh/"`), `${post.id}: hreflang`);
    assert(page.includes(`<meta property="og:image" content="${base}/assets/img/`), `${post.id}: share image`);
    assert(page.includes(`<title>${esc(title)} · AiFi Talk</title>`) && page.includes('application/ld+json'), `${post.id}: title and structured data`);
  }
  assert(home.includes(`href="/posts/${post.id}/"`), `${post.id}: missing from homepage`);
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const post of posts) assert(sitemap.includes(`${base}/posts/${post.id}/zh/`), `${post.id}: missing from sitemap`);
assert((await readFile('dist/feed.xml', 'utf8')).split('<item>').length - 1 === posts.length, 'RSS has one item per post');
assert.equal((home.match(new RegExp(`href="/posts/${posts[0].id}/"`, 'g')) || []).length, 3, 'Featured story appears only in the featured block, not the grid');
console.log(`PASS: ${posts.length} posts in two languages with metadata, sitemap, RSS, and homepage links.`);

// Banner rule: every cover is a 16:9 source image (see README).
for (const post of posts) {
  const { width, height } = await sharp(post.image).metadata();
  assert(Math.abs(width / height - 16 / 9) < 0.01, `${post.id}: cover is ${width}×${height}; covers must be 16:9`);
}
console.log('PASS: every cover uses 16:9 source artwork.');
