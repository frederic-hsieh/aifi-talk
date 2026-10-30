(() => {
  const covers = [...document.querySelectorAll('.feature-art, .card-art')];
  const checks = covers.map(cover => {
    const image = cover.querySelector('img');
    const box = cover.getBoundingClientRect();
    const style = image ? getComputedStyle(image) : null;
    const loaded = Boolean(image?.complete && image.naturalWidth > 0);
    const ratio = box.width / box.height;
    return {
      image: image?.getAttribute('src'),
      width: box.width,
      height: box.height,
      loaded,
      status: loaded && box.width > 0 && Math.abs(ratio - 16 / 9) < 0.01 && Math.abs(image.naturalWidth / image.naturalHeight - 16 / 9) < 0.01 && style.objectFit === 'contain' ? 'PASS' : 'FAIL'
    };
  });
  const cards = [...document.querySelectorAll('.card-art')].map(el => el.getBoundingClientRect());
  const equalCards = cards.every(box => Math.abs(box.width - cards[0].width) < 1 && Math.abs(box.height - cards[0].height) < 1);
  const status = checks.length > 0 && cards.length > 0 && equalCards && checks.every(check => check.status === 'PASS') ? 'PASS' : 'FAIL';
  return { status, viewport: { width: innerWidth, height: innerHeight }, equalCards, checks };
})()
