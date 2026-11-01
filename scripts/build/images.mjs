import sharp from 'sharp';
import { readFile, readdir } from 'node:fs/promises';
import { esc, hash, write } from './site.mjs';

// Source PNGs stay as masters; pages use resized WebP copies with content-hashed names.
const prepared = new Map();
const plans = [
  { directory: 'assets/posts', widths: [800, 1600], og: true },
  { files: ['assets/brand/aifi-talk-curved.png'], widths: [340, 510] },
  { files: ['assets/brand/aifi-wordmark.png'], widths: [240, 360] },
];

async function prepare(source, widths, og) {
  const input = await readFile(source);
  const { width, height } = await sharp(input).metadata();
  const name = source.split('/').pop().replace(/\.\w+$/, '');
  const version = hash(input);
  const variants = [];
  for (const target of [...new Set(widths.map(size => Math.min(size, width)))]) {
    const path = `assets/img/${name}-${target}.${version}.webp`;
    await write(path, await sharp(input).resize({ width: target }).webp({ quality: 80 }).toBuffer());
    variants.push({ url: `/${path}`, width: target });
  }
  let share;
  if (og) {
    share = `/assets/img/${name}-og.${version}.jpg`;
    await write(share.slice(1), await sharp(input).resize({ width: 1200 }).flatten({ background: '#f5f5ee' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer());
  }
  prepared.set(source, { width, height, variants, share });
}

export async function prepareImages() {
  const jobs = [];
  for (const plan of plans) {
    const files = plan.files || (await readdir(plan.directory)).filter(file => file.endsWith('.png')).map(file => `${plan.directory}/${file}`);
    for (const file of files) jobs.push(prepare(file, plan.widths, plan.og));
  }
  await Promise.all(jobs);
}

export function imageData(source) {
  const data = prepared.get(source.replace(/^\/|^(\.\.\/)+/g, ''));
  if (!data) throw new Error(`Image not prepared: ${source}`);
  return data;
}

export const sizes = {
  card: '(max-width: 560px) 100vw, (max-width: 1050px) 50vw, 420px',
  feature: '(max-width: 800px) 100vw, 640px',
  article: '(max-width: 800px) 100vw, 760px',
};

// Attributes shared by build templates and the client-side card renderer.
export function imageAttributes(source, size) {
  const { width, height, variants } = imageData(source);
  return { src: variants[0].url, srcset: variants.map(variant => `${variant.url} ${variant.width}w`).join(', '), sizes: size, width, height };
}

export function img(source, { alt = '', size, className, eager = false } = {}) {
  const attributes = imageAttributes(source, size);
  return `<img${className ? ` class="${className}"` : ''} src="${attributes.src}" srcset="${attributes.srcset}" sizes="${attributes.sizes}" width="${attributes.width}" height="${attributes.height}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
