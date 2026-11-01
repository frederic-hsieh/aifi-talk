import { base, esc, staticUrl } from './site.mjs';
import { imageData, img } from './images.mjs';

const fonts = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap';

export function head({ title, fullTitle, description, path, image, type = 'article', ogTitle, ogDescription, alternates, extra = '' }) {
  const url = `${base}${path}`;
  const hreflang = alternates ? `<link rel="alternate" hreflang="en" href="${base}${alternates.en}"><link rel="alternate" hreflang="zh-Hant" href="${base}${alternates.zh}"><link rel="alternate" hreflang="x-default" href="${base}${alternates.en}">` : '';
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fullTitle || `${title} · AiFi Talk`)}</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}"><meta property="og:type" content="${type}"><meta property="og:site_name" content="AiFi Talk"><meta property="og:title" content="${esc(ogTitle || title)}"><meta property="og:description" content="${esc(ogDescription || description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${base}${imageData(image).share}"><meta name="twitter:card" content="summary_large_image">${hreflang}
<link rel="icon" href="/assets/brand/favicon-32.png" type="image/png" sizes="32x32"><link rel="icon" href="/assets/brand/favicon-16.png" type="image/png" sizes="16x16"><link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png"><link rel="alternate" type="application/rss+xml" title="AiFi Talk RSS" href="/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${fonts}"><link rel="stylesheet" href="${staticUrl('site.css')}">${extra}`;
}

export const wordmark = (size = '116px') => img('assets/brand/aifi-wordmark.png', { alt: 'AiFi', size, className: 'aifi-wordmark', eager: true });

export function languageLinks(current, hrefs, { article = false } = {}) {
  const link = (language, label, name) => `<a${article ? ` data-article-language="${language}"` : ''} href="${hrefs[language]}" lang="${language}" aria-label="${name}" title="${name}"${current === language ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<div class="article-language" aria-label="Language">${link('en', 'En', 'English')}${link('zh-Hant', '中', '繁體中文')}</div>`;
}

export function editorialHeader(navLabel, links, logoLabel) {
  return `<header><a class="logo" href="/"${logoLabel ? ` aria-label="${logoLabel}"` : ''}>${wordmark()}</a><nav aria-label="${navLabel}">${links}</nav></header>`;
}

export const assetsLink = chinese => `<a class="assets-footer-link" href="/assets/" data-i18n="assets">${chinese ? '品牌資源' : 'Assets'}</a>`;

// External links open in a new tab on every generated page, including Markdown source credits.
function externalLinks(html) {
  return html.replace(/<a\b[^>]*>/g, tag => {
    const href = tag.match(/\bhref="([^"]+)"/)?.[1];
    if (!href) return tag;
    const url = new URL(href.replaceAll('&amp;', '&'), base);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin === new URL(base).origin) return tag;
    return tag.replace(/\s(?:target|rel)="[^"]*"/g, '').replace(/>$/, ' target="_blank" rel="noopener noreferrer">');
  });
}

export function page({ language = 'en', head: headHtml, bodyAttributes = 'class="editorial-page"', body, scripts = [] }) {
  const scriptTags = [...scripts, 'header.js'].map(name => `<script src="${staticUrl(name)}"></script>`).join('');
  return externalLinks(`<!doctype html><html lang="${language}"><head>${headHtml}</head>
<body ${bodyAttributes}>${body}${scriptTags}</body></html>`);
}
