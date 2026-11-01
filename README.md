# AiFi Talk

Public editorial website: https://aifitalk.com/

Vercel fallback: https://aifi-talk.vercel.app/

Run `npm ci`, `npm run build`, then `npm test`. Serve `dist/` with a static HTTP server, for example `python3 -m http.server 4328 --directory dist`. Push to `main` to deploy through the connected Vercel project, which runs the same build and tests. Set `SITE_URL` to the deployment origin for previews; canonical, share, RSS, and sitemap URLs follow it.

The publication allowlist is `content/posts.json`. Article copies in `content/` contain public prose only. Source documents remain in the author's private library. Add selected approved copies and required assets explicitly; never import or publish the whole vault.

All original writing and artwork remain copyright their respective owners. This repository does not grant a content reuse license.

## Structure

| Path | Role |
| --- | --- |
| `content/posts.json` | Published posts: titles, summaries, dates, cover, optional audience `topic` (`builders` or `founders`, labeled through `topicKeys` in `i18n.js`; omit for everyday readers), and optional `outline` (a Contents table that links to numbered sections and collapses). Chinese fields live under `zh`. |
| `content/*.md`, `content/about.json` | Article editions and About copy |
| `scripts/build.mjs` | Build entry: copies brand assets, prepares images, publishes static files, renders pages |
| `scripts/build/` | `site.mjs` helpers and fingerprinting, `images.mjs` WebP variants, `layout.mjs` shared head/header/page, `markdown.mjs` article rendering, `article.mjs`, `home.mjs`, `pages.mjs` (About, archive, Assets, RSS, sitemap) |
| `tokens.css`, `style.css`, `newsletter.css` | Bundled in that order into one fingerprinted stylesheet |
| `app.js`, `i18n.js`, `header.js`, `article-contents.js`, `newsletter.js` | Browser scripts, fingerprinted at build |
| `api/`, `lib/` | Newsletter function (see NEWSLETTER.md) |

All site URLs are root-relative. CSS and JS are served from `/static/<name>.<hash>.<ext>` and resized images from `/assets/img/`; both are cached as immutable (see `vercel.json`). Source PNGs in `assets/posts/` are masters and are not published; pages use 800px and 1600px WebP copies and a 1200px JPEG share image.

## Covers

All banners use a 16:9 composition (1792×1008 recommended for new exports). Adapt wider source artwork by extending its background, preserving text and illustrated content. Never fix a mismatch with CSS cropping or plain white bars. The cover in an article is the post's `image`: an image directly under the Markdown title is replaced by it, otherwise it is inserted there.

## Tests

`npm test` checks the built site: every local reference and in-page anchor resolves, CSS/JS are fingerprinted, no private paths leak, both editions of each post have canonical/hreflang/share/structured metadata, the sitemap and RSS list every post, the featured story is not repeated in the grid, and every cover is 16:9. The newsletter tests mock Resend.

Build checks do not prove browser layout. For UI changes, also run `verification/cover-layout.js` in the browser on the built homepage (Magazine and Library, desktop and 390px, both languages) and record PASS, FAIL, or NOT TESTED under `evidence/`.
