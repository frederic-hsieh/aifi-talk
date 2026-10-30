import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
process.chdir(new URL('../',import.meta.url).pathname);
const posts=JSON.parse(await readFile('content/posts.json','utf8'));
assert(posts.length > 0);
for(const p of posts){
 const html=await readFile(`dist/posts/${p.id}/index.html`,'utf8');
 assert(html.includes(p.title)); assert(html.includes(p.source));
 assert(!html.includes('substack_draft:')); assert(!html.includes('/Users/'));
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https?:|#)/.test(m[1])) continue;
  const target=path.resolve(`dist/posts/${p.id}`,m[1].split("#")[0]);
  assert((await stat(target)).isFile() || (await stat(target)).isDirectory());
 }
}
for(const file of ['feed.xml','sitemap.xml','robots.txt','posts.js']) assert((await readFile('dist/'+file,'utf8')).length>0);
assert(!(await readdir('dist')).includes('content'));
console.log(`PASS: ${posts.length} full articles, source links, local asset paths, metadata files, and private-frontmatter exclusion.`);
const home=await readFile('dist/index.html','utf8');
assert(!home.includes('assets/author/'));
assert(!(await readdir('dist/assets')).includes('author'));
assert((await readFile('dist/about/index.html','utf8')).includes('I’m Frederic'));
assert((await readFile('dist/about/zh/index.html','utf8')).includes('我是 Frederic'));
assert(!home.includes('AI-generated illustration'));
for(const post of posts) {
 const html=await readFile(`dist/posts/${post.id}/index.html`,'utf8');
 assert(html.includes(`content="https://aifitalk.com/${post.image}"`));
 assert(html.includes('application/ld+json'));
 assert(html.includes('article-author'));
 const related = html.match(/<nav class="article-related"[\s\S]*?<\/nav>/)?.[0] || '';
 assert.equal((related.match(/<li><a href=/g)||[]).length,posts.length-1);
}
console.log('PASS: no personal photos published, separate About pages, per-article share images, and related reading links.');

for (const post of posts) assert(home.includes(`href="posts/${post.id}/"`));
assert(!home.includes('id="featured-title" href="posts/"></a>'));

const approvedCovers = JSON.parse(await readFile('verification/covers.json', 'utf8'));
for (const [id, image] of Object.entries(approvedCovers)) {
 const post = posts.find(post => post.id === id);
 assert(post, `Missing article: ${id}`);
 assert.equal(post.image, image, `${id}: use the reviewed series cover, not an internal diagram or platform banner`);
 const bytes = await readFile(`dist/${image}`);
 assert.equal(bytes.subarray(1,4).toString(), 'PNG', `${id}: expected a PNG cover`);
 const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
 assert(Math.abs(width / height - 16 / 9) < 0.01, `${id}: unexpected source proportions (${width} × ${height}); review before publishing`);
 assert(home.includes(`src="${image}"`), `${id}: cover missing from rendered homepage`);
 const article = await readFile(`dist/posts/${id}/index.html`, 'utf8');
 assert(article.includes(`src="../../${image}"`), `${id}: selected cover missing from reading page`);
}
console.log('PASS: reviewed pstack series covers, source proportions, and homepage/reading-page consistency. Browser geometry requires the separate layout check.');

const rfs = posts.find(post => post.id === 'yc-rfs-winter-2027');
if (rfs) {
 for (const suffix of ['', 'zh/']) {
  const html = await readFile(`dist/posts/${rfs.id}/${suffix}index.html`, 'utf8');
  const sections = [...html.matchAll(/<h2 id="([^"]+)" tabindex="-1">(\d+)\. ([^<]+)<\/h2>/g)];
  assert.equal(sections.length, 11, 'All RFS sections must be present');
  assert.equal(sections[6][3], 'Plaid for Government Benefits');
  assert.equal(sections[7][3], 'Data Center Supply Chain');
  for (const [, id, , title] of sections) assert(html.includes(`<a href="#${id}">${title}</a>`), 'Contents must link to each section');
  assert.equal((html.match(/<strong>My idea/g)||[]).length, 11);
  assert(!html.includes('source_master:') && !html.includes('source_idea:') && !html.includes('/Users/'));
  assert(!html.includes('Republished from my archived copy') && !html.includes('本文依保存的原稿刊載'));
 }
 console.log('PASS: bilingual RFS contents, 11 sections and ideas, current order, original-publication attribution, no private metadata.');
}
