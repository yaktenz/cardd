(function () {
  if (window.__rainFallLoaded) return;
  window.__rainFallLoaded = true;

  const canvas = document.createElement('canvas');
  canvas.id = 'rain-fall-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.pointerEvents = 'none';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = 9999;
  canvas.style.userSelect = 'none';
  canvas.style.opacity = 0.8;
  document.body.appendChild(canvas);

  let ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const dropsCount = isMobile ?
    Math.max(60, Math.floor(window.innerWidth / 8)) :
    Math.max(150, Math.floor(window.innerWidth / 5));

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createDrop(width, height) {
    return {
      x: randomBetween(0, width),
      y: randomBetween(-height, 0),
      length: randomBetween(10, 25),
      thickness: randomBetween(0.5, 1.5),
      speedY: randomBetween(12, 24),
      speedX: randomBetween(-0.5, 1.5)
    };
  }

  let drops = [];
  function resetDrops() {
    drops = [];
    for (let i = 0; i < dropsCount; i++) {
      drops.push(createDrop(canvas.width, canvas.height));
    }
  }
  resetDrops();
  window.addEventListener('resize', resetDrops);

  let scrollPercent = 0;
  function updateScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll(); 

  let lightningOpacity = 0;
  let activeBolts = [];

  function createLightningBolt(startX) {
    const segments = [];
    let currentX = startX;
    let currentY = 0;
    
    segments.push({ x: currentX, y: currentY });

    while (currentY < canvas.height) {
      currentX += randomBetween(-40, 40);
      currentY += randomBetween(15, 60);
      segments.push({ x: currentX, y: currentY });
    }

    return {
      segments: segments,
      opacity: 1.0,
      fadeRate: randomBetween(0.03, 0.1)
    };
  }

  function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (scrollPercent > 0.1) {
      const lightningChance = scrollPercent * 0.012; 
      if (lightningOpacity <= 0 && activeBolts.length === 0 && Math.random() < lightningChance) {
        lightningOpacity = randomBetween(0.3, 0.7);
        const numBolts = Math.floor(randomBetween(1, 4));
        for (let i = 0; i < numBolts; i++) {
          activeBolts.push(createLightningBolt(randomBetween(0, canvas.width)));
        }
      }
    }

    if (lightningOpacity > 0) {
      ctx.fillStyle = `rgba(220, 240, 255, ${lightningOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (Math.random() > 0.8) {
        lightningOpacity = randomBetween(0.1, 0.6);
      } else {
        lightningOpacity -= 0.1;
      }
    }

    if (activeBolts.length > 0) {
      ctx.lineJoin = 'miter';
      for (let i = activeBolts.length - 1; i >= 0; i--) {
        let bolt = activeBolts[i];
        
        ctx.beginPath();
        ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y);
        for (let j = 1; j < bolt.segments.length; j++) {
          ctx.lineTo(bolt.segments[j].x, bolt.segments[j].y);
        }

        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(180, 220, 255, ${bolt.opacity})`;
        ctx.lineWidth = randomBetween(2, 4);
        ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.opacity})`;
        ctx.stroke();
        
        ctx.shadowBlur = 0;

        bolt.opacity -= bolt.fadeRate;
        if (bolt.opacity <= 0) {
          activeBolts.splice(i, 1);
        }
      }
    }

    ctx.strokeStyle = 'rgba(150, 200, 255, 0.6)';
    ctx.lineCap = 'round';
    ctx.lineWidth = 1;

    for (let d of drops) {
      ctx.lineWidth = d.thickness;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + (d.speedX * (d.length / 10)), d.y + d.length);
      ctx.stroke();

      d.y += d.speedY;
      d.x += d.speedX;

      if (d.y > canvas.height || d.x < -20 || d.x > canvas.width + 20) {
        Object.assign(d, createDrop(canvas.width, canvas.height));
        d.y = -randomBetween(10, 50);
      }
    }
    
    requestAnimationFrame(drawRain);
  }
  drawRain();

  window.addEventListener('pagehide', () => {
    try {
      canvas.remove();
    } catch (e) {}
    window.__rainFallLoaded = false;
  });
})();