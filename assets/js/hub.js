(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('.motion-toggle');
  const canvas = document.getElementById('stars');
  const context = canvas && canvas.getContext('2d');
  let savedPause = false;
  try { savedPause = localStorage.getItem('batata:effects') === 'paused'; } catch (_) {}
  let paused = savedPause || reduced.matches;
  let width = 0, height = 0, particles = [], frame = 0, previous = 0;

  function sizeCanvas() {
    if (!context) return;
    width = window.innerWidth;
    height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particles = Array.from({ length: Math.min(125, Math.max(50, Math.round(width / 11))) }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      size: Math.random() * .95 + .35,
      opacity: Math.random() * .38 + .08,
      offset: Math.random() * Math.PI * 2,
      tint: Math.random() > .8 ? '199,177,242' : '234,227,247'
    }));
    paint(performance.now());
  }

  function paint(time) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (const p of particles) {
      const opacity = paused ? p.opacity : p.opacity * (.75 + .25 * Math.sin(time / 2300 + p.offset));
      context.beginPath();
      context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(${p.tint},${opacity})`;
      context.fill();
    }
  }

  function animate(time) {
    if (paused || document.hidden || !context) { frame = 0; return; }
    if (time - previous > 50) { previous = time; paint(time); }
    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    document.documentElement.classList.toggle('effects-paused', paused);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.querySelector('span').textContent = paused ? 'Ativar efeitos' : 'Pausar efeitos';
    }
    cancelAnimationFrame(frame);
    frame = 0;
    if (context) {
      paint(performance.now());
      if (!paused && !document.hidden) frame = requestAnimationFrame(animate);
    }
  }

  sizeCanvas();
  updateMotion();
  window.addEventListener('resize', sizeCanvas, { passive: true });
  document.addEventListener('visibilitychange', updateMotion);
  if (motionButton) motionButton.addEventListener('click', () => {
    paused = !paused;
    savedPause = paused;
    try { localStorage.setItem('batata:effects', paused ? 'paused' : 'running'); } catch (_) {}
    updateMotion();
  });
  reduced.addEventListener('change', (event) => { paused = savedPause || event.matches; updateMotion(); });

  if (!paused && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .06 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }

  let toastTimer;
  window.showToast = function (message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  };

  window.getScriptText = function () {
    const code = document.getElementById('scriptCode');
    return code ? code.textContent.trim() : '';
  };

  window.selectScript = function () {
    const code = document.getElementById('scriptCode');
    if (!code) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    code.scrollIntoView({ behavior: paused ? 'instant' : 'smooth', block: 'center' });
    window.showToast('Texto selecionado. Use Ctrl+C para copiar.');
  };

  window.copyScript = async function () {
    const text = window.getScriptText();
    if (!text) return;
    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { await navigator.clipboard.writeText(text); copied = true; } catch (_) {}
    }
    if (!copied) {
      const input = document.createElement('textarea');
      input.value = text;
      input.setAttribute('readonly', '');
      input.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.appendChild(input);
      input.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      input.remove();
    }
    if (copied) {
      window.showToast('Script copiado. Tudo pronto!');
      document.querySelectorAll('[data-copy]').forEach((button) => {
        const original = button.innerHTML;
        button.textContent = 'Copiado!';
        button.disabled = true;
        setTimeout(() => { button.innerHTML = original; button.disabled = false; }, 1900);
      });
    } else {
      window.selectScript();
    }
  };
  document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', window.copyScript));
  document.querySelectorAll('[data-select]').forEach((button) => button.addEventListener('click', window.selectScript));
})();
