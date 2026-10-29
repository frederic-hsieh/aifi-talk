# AiFi Talk

Public editorial website: https://aifi-talk.vercel.app/

Run `npm ci`, `npm run build`, then `npm test`. Serve `dist/` with a static HTTP server. Push to `main` to deploy through the connected Vercel project. GitHub Actions is not required.

The publication allowlist is `content/posts.json`. Article copies in `content/` contain public prose only. Source documents remain in the author's private library. Add selected approved copies and required assets explicitly; never import or publish the whole vault. The build copies only named website files, assets, and generated reading pages into `dist/`.

All three pstack articles have English and Traditional Chinese editions. English keeps `/posts/<id>/`; Chinese uses `/posts/<id>/zh/`. The homepage language selects the matching title, summary and reading URL. Article language links preserve section anchors, and each edition links to its original publication. Copies reflect the archived edition; the original platform may have subsequent edits. Saves and interface language persist in this browser only. RSS and sitemap are generated during build. No newsletter backend is connected.

All original writing and artwork remain copyright their respective owners. This repository does not grant a content reuse license.

Personal photographs are withheld from publication. The About page has English and Traditional Chinese editions. Article covers come from the published articles and use consistent display proportions.

## Cover verification

`npm test` checks the reviewed series artwork in `verification/covers.json`, confirms the files exist with suitable source proportions, and checks that the homepage and reading pages use them. A different image requires visual review before updating that contract. Vercel runs this gate before publishing.

For UI changes, evaluate the read-only script in `verification/cover-layout.js` in the browser on the built homepage. Clear search and select Everything first. Scroll the archive into view so lazy images load. Run in Magazine and Library layouts at desktop and 390px, in both interface languages. Require PASS: images loaded, original image proportions, equal card widths, automatic image height, and `object-fit: contain` without fixed-height frames (no cropping or letterboxing). Inspect a screenshot too: correct artwork, legible titles, no clipping, no unintended empty space. Save results and screenshots under `evidence/`. Repeat on production after deploying affected changes. Automated build checks alone do not prove browser layout or image loading; report any unrun browser/device checks as NOT TESTED.
