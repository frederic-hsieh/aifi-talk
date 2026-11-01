import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const base = (process.env.SITE_URL || 'https://aifitalk.com').replace(/\/$/, '');
export const read = file => readFile(file, 'utf8');
export const readJson = async file => JSON.parse(await read(file));
export const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export const hash = content => createHash('sha256').update(content).digest('hex').slice(0, 10);

export async function write(path, content) {
  await mkdir(dirname(`dist/${path}`), { recursive: true });
  await writeFile(`dist/${path}`, content);
}

// Both editions share the story ID; Chinese fields override English ones.
export function editions(post) {
  return [
    { ...post, language: 'en', chinese: false, path: `/posts/${post.id}/` },
    { ...post, ...post.zh, language: 'zh-Hant', chinese: true, path: `/posts/${post.id}/zh/` },
  ];
}

// About 400 CJK characters or 220 English words per minute.
export function readingMinutes(markdown) {
  const cjk = (markdown.match(/[㐀-鿿]/g) || []).length;
  const words = markdown.replace(/[㐀-鿿]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(cjk / 400 + words / 220));
}

export function longDate(date, language) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(language, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// Fingerprinted CSS and JS live in /static/ and are cached as immutable.
const manifest = new Map();
export async function publishStatic(name, content) {
  const [stem, extension] = name.split('.');
  const path = `static/${stem}.${hash(content)}.${extension}`;
  await write(path, content);
  manifest.set(name, `/${path}`);
}
export function staticUrl(name) {
  if (!manifest.has(name)) throw new Error(`Static file not published: ${name}`);
  return manifest.get(name);
}
