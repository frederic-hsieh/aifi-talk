import { validEmail, tokenFor, readToken, resend, page, escapeHtml } from '../lib/newsletter.js';

const attempts = new Map();
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const json = req.headers.accept?.includes('application/json');
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}; }
  catch { return res.status(400).json({ error: 'Invalid request' }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Invalid request' });
  const chinese = body.language === 'zh-Hant';
  const reply = (code, message) => json ? res.status(code).json({ message }) : res.status(code).setHeader('Content-Type', 'text/html; charset=utf-8').end(page(message, chinese));
  if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); return reply(405, 'Method not allowed'); }
  if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_FROM || !process.env.NEWSLETTER_TOKEN_SECRET) return reply(503, 'Newsletter signup is temporarily unavailable. Please try again later.');
  const origin = (process.env.SITE_URL || 'https://aifitalk.com').replace(/\/$/, '');
  const allowedOrigins = [origin, ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])];
  const token = req.method === 'GET' ? req.query?.token : body.token;
  // Only new signups need the same-origin check. Confirm and unsubscribe are authorized by their encrypted token,
  // and their page's no-referrer policy makes browsers send `Origin: null`.
  if (req.method === 'POST' && !token && req.headers.origin && !allowedOrigins.includes(req.headers.origin)) return reply(403, 'Request not allowed');
  if (token) {
    let payload;
    try { payload = readToken(token); } catch { return reply(400, 'This link is invalid or expired. Please request a new confirmation email.'); }
    const zh = payload.language === 'zh-Hant';
    if (req.method === 'GET') {
      const label = payload.action === 'confirm' ? (zh ? '確認訂閱' : 'Confirm subscription') : (zh ? '取消訂閱' : 'Unsubscribe');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).end(page(label, zh, `<form method="post" action="/api/newsletter"><input type="hidden" name="token" value="${escapeHtml(token)}"><input type="hidden" name="language" value="${zh ? 'zh-Hant' : 'en'}"><button style="padding:14px 24px;font:inherit" type="submit">${label}</button></form>`));
    }
    try {
      const contactPath = `/contacts/${encodeURIComponent(payload.email)}`;
      const existing = await resend(contactPath);
      if (payload.action === 'unsubscribe') {
        if (existing) await resend(contactPath, 'PATCH', { unsubscribed: true });
        return reply(200, zh ? '已取消訂閱。' : 'You have been unsubscribed.');
      }
      // An old confirmation link must never reverse a later unsubscribe.
      if (existing?.unsubscribed) return reply(409, zh ? '這個 Email 已取消訂閱，請聯絡作者重新加入。' : 'This address previously unsubscribed. Please contact the author to rejoin.');
      if (!existing) await resend('/contacts', 'POST', { email: payload.email, unsubscribed: false });
      return reply(200, zh ? '訂閱成功，謝謝你！' : 'You’re subscribed. Thank you!');
    } catch (error) { console.error('Newsletter contact update failed:', error.message); return reply(502, 'We couldn’t update your subscription. Please try again.'); }
  }
  if (req.method !== 'POST') return reply(400, 'A confirmation link is required.');
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!validEmail(email)) return reply(400, 'Please enter a valid email address.');
  if (body.website) return reply(200, 'Check your inbox for a confirmation email.');
  const now = Date.now();
  for (const [ip, entry] of attempts) if (entry.until < now) attempts.delete(ip);
  const ip = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const attempt = attempts.get(ip) || { count: 0, until: now + 60000 };
  if (attempt.count >= 5 || attempts.size >= 10000) return reply(429, 'Please wait a minute before trying again.');
  attempt.count++; attempts.set(ip, attempt);
  try {
    const language = chinese ? 'zh-Hant' : 'en';
    const confirm = `${origin}/api/newsletter?token=${tokenFor(email, 'confirm', language)}`;
    const unsubscribe = `${origin}/api/newsletter?token=${tokenFor(email, 'unsubscribe', language)}`;
    await resend('/emails', 'POST', {
      from: process.env.NEWSLETTER_FROM, to: [email],
      subject: chinese ? '確認訂閱 AiFi Talk' : 'Confirm your AiFi Talk subscription',
      text: chinese ? `請在一小時內點開連結，並按下確認訂閱：\n${confirm}\n\n如果你沒有要求訂閱，請忽略這封信。\n取消訂閱：${unsubscribe}` : `Open this link within one hour, then press Confirm subscription:\n${confirm}\n\nIf you didn’t request this, ignore this email.\nUnsubscribe: ${unsubscribe}`
    });
    return reply(200, 'Check your inbox for a confirmation email.');
  } catch (error) { console.error('Newsletter confirmation email failed:', error.message); return reply(502, 'We couldn’t send your confirmation email. Please try again later.'); }
}
