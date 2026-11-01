import { Marked } from 'marked';
import { esc } from './site.mjs';
import { img, sizes } from './images.mjs';
import { insertNewsletter } from '../newsletter.mjs';

function isImageParagraph(token) {
  return token?.type === 'paragraph' && token.tokens?.length === 1 && token.tokens[0].type === 'image';
}

// The article cover appears under the title: an image directly after the H1 becomes the cover, otherwise the cover is inserted.
function placeCover(tokens, post) {
  const title = tokens.findIndex(token => token.type === 'heading' && token.depth === 1);
  const next = tokens.slice(title + 1).find(token => token.type !== 'space');
  if (isImageParagraph(next)) next.tokens[0].href = post.image;
  else tokens.splice(title + 1, 0, { type: 'html', raw: '', block: true, text: `<p>${img(post.image, { alt: post.imageAlt, size: sizes.article, eager: true })}</p>` });
}

// A Contents table whose cells match numbered H2 titles links to those sections and collapses by default.
function linkOutline(html) {
  const sections = [...html.matchAll(/<h2 id="([^"]+)" tabindex="-1">\d+\. (.*?)<\/h2>/g)];
  html = html.replace('<table>', '<table class="article-outline">');
  for (const [, id, title] of sections) html = html.replace(`<td>${title}</td>`, `<td><a href="#${id}">${title}</a></td>`);
  return html.replace(/(<h2[^>]*>(?:Contents|目錄)<\/h2>)\s*(<table class="article-outline">[\s\S]*?<\/table>)/, '<details class="article-outline-disclosure"><summary>$1</summary>$2</details>');
}

export function renderArticle(markdown, edition) {
  let section = 0;
  const marked = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        return depth === 2 ? `<h2 id="section-${++section}" tabindex="-1">${text}</h2>\n` : `<h${depth}>${text}</h${depth}>\n`;
      },
      image({ href, text }) {
        if (/^https?:/.test(href)) return `<img src="${esc(href)}" alt="${esc(text)}" loading="lazy">`;
        return img(href, { alt: text, size: sizes.article, eager: href === edition.image });
      },
    },
  });
  const tokens = insertNewsletter(marked.lexer(markdown), edition.chinese);
  placeCover(tokens, edition);
  const html = marked.parser(tokens);
  return edition.outline ? linkOutline(html) : html;
}
