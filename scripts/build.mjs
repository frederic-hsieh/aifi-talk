import { cp, readFile, rm } from 'node:fs/promises';
import { base, publishStatic, readJson } from './build/site.mjs';
import { imageAttributes, prepareImages, sizes } from './build/images.mjs';
import { buildArticles } from './build/article.mjs';
import { buildHome } from './build/home.mjs';
import { buildAbout, buildArchive, buildAssetsPage, buildFeeds } from './build/pages.mjs';

process.chdir(new URL('../', import.meta.url).pathname);
const posts = await readJson('content/posts.json');

await rm('dist', { recursive: true, force: true });
for (const folder of ['brand', 'icons']) await cp(`assets/${folder}`, `dist/assets/${folder}`, { recursive: true });
await prepareImages();

// One stylesheet: tokens first, then components in cascade order. Icon URLs become root-relative because the bundle lives in /static/.
const styles = ['tokens.css', 'style.css', 'newsletter.css'];
const css = (await Promise.all(styles.map(file => readFile(file, 'utf8')))).join('\n').replaceAll('url(assets/', 'url(/assets/');
await publishStatic('site.css', css);
for (const file of ['i18n.js', 'app.js', 'header.js', 'article-contents.js', 'newsletter.js']) await publishStatic(file, await readFile(file, 'utf8'));

const lengths = await buildArticles(posts);
const stories = posts.map(post => {
  const length = language => `${lengths.get(`${post.id}:${language}`)} min read`;
  return {
    id: post.id, kind: 'article', topic: post.topic, date: post.date, title: post.title, summary: post.summary,
    url: `/posts/${post.id}/`, length: length('en'), image: post.image, cover: imageAttributes(post.image, sizes.card),
    zh: { title: post.zh.title, summary: post.zh.summary, date: post.zh.date, url: `/posts/${post.id}/zh/`, length: length('zh-Hant') },
  };
});
await publishStatic('posts.js', `const publishedStories = ${JSON.stringify(stories)};\n`);

await buildHome(stories);
await buildAbout();
await buildArchive(posts);
await buildAssetsPage();
await buildFeeds(posts);
console.log(`Built ${posts.length} articles for ${base}`);
