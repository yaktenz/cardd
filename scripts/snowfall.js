(function () {
  function isSnowSeason() {
    const now = new Date();
    const year = now.getFullYear();

    const seasonStart = new Date(year, 11, 1);
    let seasonEnd = new Date(year + 1, 0, 2, 23, 59, 59, 999);

    if (now >= seasonStart && now <= seasonEnd) {
      return true;
    }

    if (now.getMonth() === 0 && now.getDate() <= 2) {
      const prevSeasonStart = new Date(year - 1, 11, 1);
      const prevSeasonEnd = new Date(year, 0, 2, 23, 59, 59, 999);
      if (now >= prevSeasonStart && now <= prevSeasonEnd) {
        return true;
      }
    }

    return false;
  }

  if (!isSnowSeason()) return;

  if (window.__snowFallLoaded) return;
  window.__snowFallLoaded = true;

  const canvas = document.createElement('canvas');
  canvas.id = 'snow-fall-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.pointerEvents = 'none';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = 9999;
  canvas.style.userSelect = 'none';
  canvas.style.opacity = 0.7;
  document.body.appendChild(canvas);

  let ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const flakesCount = isMobile ?
    Math.max(30, Math.floor(window.innerWidth / 15)) :
    Math.max(80, Math.floor(window.innerWidth / 7));

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }
  function createFlake(width, height) {
    return {
      x: randomBetween(0, width),
      y: randomBetween(-height, 0),
      r: randomBetween(isMobile ? 0.8 : 1.2, isMobile ? 2.2 : 3.3),
      d: randomBetween(0.7, 2.4),
      drift: randomBetween(-0.9, 0.8),
      a: randomBetween(0, 2 * Math.PI),
      swayAmp: randomBetween(0.6, 2.2),
      swaySpeed: randomBetween(0.9, 1.7)
    }
  }

  let flakes = [];
  function resetFlakes() {
    flakes = [];
    for (let i = 0; i < flakesCount; i++) {
      flakes.push(createFlake(canvas.width, canvas.height));
    }
  }
  resetFlakes();
  window.addEventListener('resize', resetFlakes);

  function drawSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let f of flakes) {
      f.a += 0.01 * f.swaySpeed;
      let sway = Math.sin(f.a) * f.swayAmp;

      ctx.beginPath();
      ctx.arc(f.x + sway, f.y, f.r, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,255,255,0.90)';
      ctx.shadowColor = 'rgba(200,200,255,0.17)';
      ctx.shadowBlur = Math.round(f.r * 3.2);
      ctx.fill();

      f.y += f.d;
      f.x += f.drift;

      if (f.y > canvas.height + 5 || f.x < -20 || f.x > canvas.width + 20) {
        Object.assign(f, createFlake(canvas.width, canvas.height));
        f.y = -randomBetween(2, canvas.height * 0.2);
      }
    }
    requestAnimationFrame(drawSnow);
  }
  drawSnow();

  window.addEventListener('pagehide', () => {
    try {
      canvas.remove();
    } catch (e) {}
    window.__snowFallLoaded = false;
  });
})();