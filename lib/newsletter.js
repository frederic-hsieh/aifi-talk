import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export const validEmail = email => typeof email === 'string' && email.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);
export const escapeHtml = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function key() {
  if (!process.env.NEWSLETTER_TOKEN_SECRET || process.env.NEWSLETTER_TOKEN_SECRET.length < 32) throw new Error('Missing token secret');
  return createHash('sha256').update(process.env.NEWSLETTER_TOKEN_SECRET).digest();
}
export function tokenFor(email, action, language, now = Date.now()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify({ email, action, language, expires: action === 'confirm' ? now + 3600000 : null })), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64url');
}
export function readToken(token, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 2000) throw new Error('Invalid token');
  const bytes = Buffer.from(token, 'base64url');
  const decipher = createDecipheriv('aes-256-gcm', key(), bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  const payload = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString());
  if (!validEmail(payload.email) || !['confirm', 'unsubscribe'].includes(payload.action) || (payload.action === 'confirm' && !(payload.expires > now))) throw new Error('Invalid token');
  return payload;
}
export async function resend(path, method = 'GET', body, idempotency) {
  const response = await fetch(`https://api.resend.com${path}`, {
    method, signal: AbortSignal.timeout(12000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', ...(idempotency ? { 'Idempotency-Key': idempotency } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (response.status === 404 && method === 'GET') return null;
  if (!response.ok) throw new Error(`Email service status ${response.status}`);
  return response.json();
}
export function page(message, chinese, form = '') {
  return `<!doctype html><html lang="${chinese ? 'zh-Hant' : 'en'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>AiFi Talk · Newsletter</title><body style="max-width:640px;margin:64px auto;padding:24px;background:#f5f5ee;color:#16140f;font:18px/1.6 system-ui"><h1>AiFi Talk</h1><p>${escapeHtml(message)}</p>${form}<p><a href="/">${chinese ? '回到首頁' : 'Back to AiFi Talk'}</a></p></body></html>`;
}
