export function newsletterForm(chinese) {
  return `<aside class="newsletter" aria-labelledby="newsletter-title">
<h3 id="newsletter-title">${chinese ? '把下一篇文章寄給你' : 'Get the next article in your inbox'}</h3>
<p>${chinese ? '訂閱 AiFi Talk，收到我關於 AI、金融與做產品的筆記。隨時可以取消訂閱。' : 'Subscribe to AiFi Talk for my notes on AI, finance, and building products. Unsubscribe anytime.'}</p>
<form class="newsletter-form" action="/api/newsletter" method="post">
<input type="hidden" name="language" value="${chinese ? 'zh-Hant' : 'en'}">
<label for="newsletter-email">Email</label>
<div class="newsletter-fields"><input id="newsletter-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com" aria-describedby="newsletter-status"><button type="submit">${chinese ? '訂閱' : 'Subscribe'}</button></div>
<div class="newsletter-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
<p id="newsletter-status" class="newsletter-status" role="status" aria-live="polite">${chinese ? '我們會寄一封確認信給你。' : 'We’ll send you an email to confirm your subscription.'}</p>
</form></aside>`;
}

// Inserts the signup form at the top-level block boundary nearest the article's midpoint.
export function insertNewsletter(tokens, chinese) {
  const weights = tokens.map(token => token.type === 'space' ? 0 : token.raw.length);
  const total = weights.reduce((a, b) => a + b, 0);
  let consumed = 0;
  let boundary = 1;
  let distance = Infinity;
  for (let index = 1; index < tokens.length; index++) {
    consumed += weights[index - 1];
    if (['heading', 'space'].includes(tokens[index - 1].type)) continue;
    if (Math.abs(consumed - total / 2) < distance) {
      distance = Math.abs(consumed - total / 2);
      boundary = index;
    }
  }
  tokens.splice(boundary, 0, { type: 'html', raw: '', text: newsletterForm(chinese), block: true });
  return tokens;
}
