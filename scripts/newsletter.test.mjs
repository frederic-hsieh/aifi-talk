import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/newsletter.js';
import { tokenFor, readToken } from '../lib/newsletter.js';
import { readFile } from 'node:fs/promises';
const posts = JSON.parse(await readFile(new URL('../content/posts.json', import.meta.url)));
process.env.NEWSLETTER_TOKEN_SECRET = 'test-only-secret-not-for-production-123456789';
const call = async (body, method = 'POST', query = {}, origin = (process.env.SITE_URL || 'https://aifitalk.com').replace(/\/$/, '')) => {
 const response = { headers: {}, setHeader(k,v) { this.headers[k] = v; return this; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; }, end(data) { this.data = data; return this; } };
 await handler({ method, body, query, headers: { accept:'application/json', origin }, socket: { remoteAddress:'test' } }, response);
 return response;
};
test('All eight article editions include one form within the body', async () => {
 for (const post of posts) for (const lang of ['', 'zh/']) {
  const html = await readFile(new URL(`../dist/posts/${post.id}/${lang}index.html`, import.meta.url), 'utf8');
  assert.equal((html.match(/class="newsletter-form"/g) || []).length, 1);
  const index = html.indexOf('<aside class="newsletter"');
  assert(index > html.indexOf('<div class="article-body">'));
  assert(index < html.indexOf('<section class="article-author"'));
 }
});
test('Tokens hide email and reject tampering and expiration', () => {
 const token = tokenFor('reader@example.com','confirm','en',1000);
 assert(!token.includes('reader'));
 assert.equal(readToken(token,2000).email,'reader@example.com');
 assert.throws(() => readToken(token,3601001));
 const bytes = Buffer.from(token,'base64url'); bytes[15] ^= 1;
 assert.throws(() => readToken(bytes.toString('base64url'),2000));
});
test('Missing provider configuration fails without claiming success', async () => {
 delete process.env.RESEND_API_KEY;
 assert.equal((await call({email:'reader@example.com'})).code,503);
});
test('Confirmation, repeat confirmation, unsubscribe, replay, and provider failure', async () => {
 process.env.RESEND_API_KEY = 'mock'; process.env.NEWSLETTER_FROM = 'test@example.com';
 const original = globalThis.fetch;
 let contact = null, email, sends = 0;
 globalThis.fetch = async (url, options) => {
  if (url.endsWith('/emails')) { sends++; email = JSON.parse(options.body); return new Response('{"id":"test-email"}'); }
  if (url.endsWith('/contacts') && options.method === 'POST') { contact = JSON.parse(options.body); return new Response('{"id":"test-contact"}'); }
  if (options.method === 'PATCH') { contact = {...contact,...JSON.parse(options.body)}; return new Response('{"id":"test-contact"}'); }
  return contact ? new Response(JSON.stringify(contact)) : new Response('{}',{status:404});
 };
 try {
  assert.equal((await call({email:'invalid'})).code,400); assert.equal(sends,0);
  assert.equal((await call({email:'reader@example.com'})).code,200); assert.equal(contact,null);
  const tokens = [...email.text.matchAll(/token=([A-Za-z0-9_-]+)/g)].map(m=>m[1]);
  assert.equal((await call({},'GET',{token:tokens[0]})).code,200); assert.equal(contact,null);
  // The confirm page sends Origin: null (no-referrer); the token, not the origin, authorizes it.
  assert.equal((await call({token:tokens[0]}, 'POST', {}, 'null')).code,200); assert.equal(contact.unsubscribed,false);
  assert.equal((await call({email:'other@example.com'}, 'POST', {}, 'https://evil.example')).code,403);
  assert.equal((await call({token:tokens[0]})).code,200);
  assert.equal((await call({token:tokens[1]})).code,200); assert.equal(contact.unsubscribed,true);
  assert.equal((await call({token:tokens[0]})).code,409);
  globalThis.fetch = async () => new Response('{}',{status:500});
  assert.equal((await call({email:'failure@example.com'})).code,502);
 } finally { globalThis.fetch = original; }
});
