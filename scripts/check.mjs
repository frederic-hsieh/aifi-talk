import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
process.chdir(new URL('../',import.meta.url).pathname);
const posts=JSON.parse(await readFile('content/posts.json','utf8'));
assert.equal(posts.length,3);
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
console.log('PASS: 3 full articles, source links, local asset paths, metadata files, and private-frontmatter exclusion.');
