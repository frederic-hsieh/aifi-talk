import { readFile, writeFile } from 'node:fs/promises';
import { marked } from 'marked';

export async function buildAssetsPage(head, base) {
  const standard = await readFile('DESIGN-SYSTEM.md', 'utf8');
  const assets = [
    ['aifi-talk-curved.png', 'AiFi Talk', 'Homepage header · 首頁標誌'],
    ['aifi-wordmark.png', 'AiFi', 'Other pages and footer · 其他頁面與頁尾'],
    ['af-icon.png', 'af butterfly', 'Standalone icon · 品牌圖示'],
    ['af-icon-blue.png', 'af butterfly · Blue tile', 'Selected browser identity · 瀏覽器品牌圖示'],
    ['favicon-32.png', 'af butterfly favicon', 'Browser icon · 瀏覽器圖示'],
  ];
  const swatches = ['paper', 'ink', 'muted', 'line', 'orange', 'control'];
  await writeFile('dist/assets/design-standard.md', standard);
  await writeFile('dist/assets/index.html', `<!doctype html><html lang="en"><head>${head('Assets & design standards', 'Approved AiFi logos and the current website design standards.', `${base}/assets/`, 'assets/brand/aifi-talk-curved.png', '../', 'website')}</head><body class="editorial-page"><div class="wrap"><header><a class="logo" href="../" aria-label="AiFi home"><img class="aifi-wordmark" src="brand/aifi-wordmark.png" alt="AiFi"></a><nav aria-label="Navigation"><a href="../">Home / 首頁</a><a href="#standards">Design standards / 設計規範</a></nav></header><main class="brand-assets"><p class="eyebrow">THE AIFI IDENTITY · 品牌資源</p><h1>Assets & design standards</h1><p lang="zh-Hant">品牌素材與設計規範。這裡保留目前網站使用的標誌與設計標準，隨網站設計一起更新。</p><p>Approved artwork and the standards behind AiFi Talk. Updated with the website.</p><section class="brand-downloads" aria-label="Logo downloads">${assets.map(([file, name, usage]) => `<article class="brand-download"><div class="brand-preview"><img src="brand/${file}" alt="${name}"></div><h2>${name}</h2><p>${usage}</p><a href="brand/${file}" download>Download PNG / 下載 <span class="sr-only">${name}</span> ↗</a></article>`).join('')}</section><section aria-label="Website palette"><h2>Palette / 色彩</h2><div class="brand-palette">${swatches.map(name => `<div><span class="brand-swatch" style="background:var(--${name})"></span><code>--${name}</code></div>`).join('')}</div></section><section id="standards" class="brand-standard"><a class="text-link" href="design-standard.md" download>Download standards / 下載規範 ↗</a>${marked.parse(standard).replace('<h1>', '<h2>').replace('</h1>', '</h2>')}</section></main><footer><a href="../">← AiFi Talk</a><p>© 2026 Frederic · AiFi Talk</p></footer></div></body></html>`);
}
