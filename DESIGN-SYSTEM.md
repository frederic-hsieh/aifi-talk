# AiFi Talk design standards

AiFi Talk is a warm, personal, article-led publication about AI, money, and making things. Use a quiet editorial layout, generous whitespace, thin rules, and restrained rust accents.

AiFi Talk 採用溫暖、簡潔、以文章為主的編輯風格。保留留白、細分隔線與低調的磚紅色點綴；設計更新時，也要同步維護這份規範。

## Brand marks

- **AiFi Talk:** the complete approved mark, with the curved “talk” speech bubble tilted toward AiFi. Use it in the homepage header. Preserve the image as one composition; do not rebuild the bubble in CSS, change its angle, crop, stretch, or recolor it.
- **AiFi:** use the original wordmark in the footer and on article, About, and other pages.
- Keep both marks on a light, uncluttered background. Preserve their aspect ratios and leave clear space around them.
- Homepage mark: 170px wide on desktop. The compact navigation at 800px and below uses an 82px mark. The standard AiFi mark is 116px on desktop; the footer uses 96px.
- **af butterfly:** the approved standalone icon is concept 01 selected on October 31, 2026. Its flowing lowercase `a` and `f` form asymmetric butterfly wings through open loops, a broad curved stroke, and fine tapered terminals. Use `assets/brand/af-icon.png` as the transparent master. This replaces the previous af icon; the AiFi and AiFi Talk wordmarks remain the approved text marks.
- Preserve the butterfly's exact proportions, asymmetry, open spaces, and stroke contrast. Do not mirror, rotate, stretch, add antennae, enclose it in book pages, or typeset a replacement `af`. Keep the built-in clear space and place the black artwork on a light, uncluttered background.
- **Browser icon — 05 Blue tile:** use the near-black butterfly (`#16140F`) on a pale-blue (`#BCDDF2`) rounded-square background in both light and dark browser themes. The background keeps the black mark visible on dark tabs. The selected master is `assets/brand/af-icon-blue.svg`, an SVG composition embedding the original raster silhouette, with a PNG download at `af-icon-blue.png`. The transparent black master remains available for light-background brand use.
- Browser icons use the blue-tile `favicon-16.png` and `favicon-32.png` exports; the touch icon uses `apple-touch-icon.png` at 180×180. Keep the rounded tile and padding. The finest terminals soften at favicon sizes; do not claim full letter readability at 16px or improvise a different small-size symbol.
- Original writing and artwork retain their respective copyrights; downloadable files do not grant a reuse license.

## Color palette

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#f5f5ee` | Page background |
| `--paper-hover` | `#eeede6` | Card hover background |
| `--ink` | `#16140f` | Primary text |
| `--muted` | `#5c5a54` | Secondary text |
| `--line` | `#d8d7cf` | Dividers and borders |
| `--line-strong` | `#aaa79c` | Card hover border |
| `--orange` | `#a24432` | Links, active accents, focus |
| `--control` | `#24231f` | Filled controls |

Use the shared values in `tokens.css`. Avoid paper-noise textures, green text, heavy shadows, and decorative stickers.

## Typography

- English headlines: **Source Serif 4**, with Georgia and serif fallbacks.
- English body and controls: **Outfit**, with Arial and sans-serif fallbacks.
- Chinese headlines: Songti TC, Noto Serif TC, PMingLiU. Chinese body/UI: PingFang TC, Noto Sans TC, Arial.
- Article body: 18px, line-height 1.75 in English and 1.9 in Chinese, within a 760px reading column. Mobile article text remains 18px.
- Homepage summaries: 17px/1.75. Primary controls: 14–15px. Article section headings use sans-serif.
- Article paragraphs have 28px bottom spacing. H2 sections have 64px top spacing (48px mobile), a 1px divider, and 32px padding above the heading (24px mobile).
- English fonts load from Google Fonts. Native Chinese font availability affects rendering; check both languages visually.

## Layout

The main container is at most 1320px including 48px side padding. Padding becomes 30px below 1050px and 22px below 560px. Main breakpoints are 1050, 800, and 560px. Article grids change from three to two to one column.

Use flat warm backgrounds, square article-card edges, and thin dividers. Spacing is component-specific; reuse existing component rules rather than inventing a new spacing system.

## Article previews

- Magazine cards show **photo → title → categories → summary → date and bookmark**.
- The default Magazine grid omits the featured article shown above it. Library, search, topic filters, and Saved include every article.
- The whole card opens its article. The bookmark remains a separate 44px control above the card link.
- Cards have a 1px border and 22px padding, reduced to 16px below 560px.
- Fine-pointer hover changes the background to `--paper-hover`, the border to `--line-strong`, raises the card 3px, and accents its title. Transitions last 200ms. Reduced-motion mode removes the lift.
- Keyboard focus outlines the card in rust. Hover is never required to access content or controls.
- Desktop Library rows place the thumbnail beside the text; mobile stacks photo, title, categories, summary, and footer.
- Covers use a 16:9 composition (1792×1008 recommended for new exports). Preserve all artwork without cropping or stretching. Adapt mismatched artwork by extending its designed background, not adding plain bars.

## Navigation and controls

Desktop headers contain the wordmark, positioning, navigation, Follow, Saved, and language controls. At 800px and below, use a compact header with a 44px menu control; hide the header while scrolling down and reveal it while scrolling up. Escape and outside click dismiss the menu.

Prefer recognizable icons for social links and familiar utility controls. Use local brand SVGs and consistent 24px outline icons, accessible names, localized titles, visible focus, and at least 44px touch targets. Editorial navigation and language names remain text.

Follow is a disclosure, not an application menu. Support click, tap, keyboard, and hover. Escape restores trigger focus. Reuse the single social-link registry.

Article contents use quiet margin rules on desktop and a 48px button on mobile. Section links focus their headings; opening the outline must not move the article scroll position. Respect reduced motion.

## Language and accessibility

Use English and Traditional Chinese (`en`, `zh-Hant`) with native language labels. Keep story IDs independent of translated text. Language changes preserve search, filters, layout, and saved stories. Locale and saves persist in this browser; they are not account features.

Use semantic headings, meaningful image alternatives, visible keyboard focus, and accessible disclosures. Never hide initial content behind scroll animations. Verify long Chinese titles and narrow layouts without horizontal overflow.

## Keeping this guide current

The public Assets page is generated from this file during every build. Logo previews use the same files as the website; palette swatches read the live CSS tokens.

When updating the design, update this guide in the same change, including any affected values, asset usage, layout, interaction, and responsive rules. Replace the approved source assets when needed and keep the download links current. Build and verify the Assets page alongside the affected pages before deployment.

Implementation sources: `tokens.css` for colors and fonts, `style.css` for components, `scripts/build/home.mjs` for homepage markup, `scripts/build/layout.mjs` for shared page chrome, `i18n.js` for localized copy and social links, `app.js` for story state, and `header.js` for responsive navigation. If implementation and documentation disagree, resolve the discrepancy before release.

Verify desktop and 390px layouts, English and Chinese, keyboard access, download links, and relevant reload persistence. Run the build and automated checks. Record PASS, FAIL, or NOT TESTED, with screenshots where useful.
