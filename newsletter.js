(() => {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  const chinese = document.documentElement.lang === 'zh-Hant';
  const status = form.querySelector('[role="status"]');
  const button = form.querySelector('button');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled) return;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = chinese ? '正在寄出確認信…' : 'Sending confirmation…';
    try {
      const response = await fetch(form.action, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: AbortSignal.timeout(20000)
      });
      if (!response.ok) throw new Error('Signup unavailable');
      status.textContent = chinese ? '請查看信箱，點開確認連結完成訂閱。' : 'Check your inbox and follow the confirmation link to subscribe.';
      form.reset();
    } catch {
      status.textContent = chinese ? '目前無法完成訂閱，請稍後再試。' : 'We couldn’t complete your request. Please try again later.';
    } finally {
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
