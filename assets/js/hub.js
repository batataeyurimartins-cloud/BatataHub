(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const light = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || !!navigator.connection?.saveData;
  const motionButton = document.querySelector('.motion-toggle');
  const canvas = document.getElementById('stars');
  const context = canvas && canvas.getContext('2d');
  let savedPause = false;
  try { savedPause = localStorage.getItem('batata:effects') === 'paused'; } catch (_) {}
  let paused = savedPause || reduced.matches;
  let width = 0, height = 0, particles = [], frame = 0, previous = 0;
  const cursor = { x: 0, y: 0 }, drift = { x: 0, y: 0 };
  let comet = null, nextComet = performance.now() + 6500;
  let activeSurface = null, activeScene = null, pointerFrame = 0, lastPointer = null;

  function sizeCanvas() {
    if (!context) return;
    width = window.innerWidth;
    height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, light ? 1.2 : 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particles = Array.from({ length: Math.min(light ? 60 : 100, Math.max(30, Math.round(width / 14))) }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      size: Math.random() * .95 + .35,
      opacity: Math.random() * .38 + .08,
      offset: Math.random() * Math.PI * 2,
      tint: Math.random() > .8 ? '199,177,242' : '234,227,247',
      depth: .3 + Math.random() * .7
    }));
    comet = null;
    nextComet = performance.now() + 6500;
    paint(performance.now());
  }

  function paint(time) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    drift.x += (cursor.x - drift.x) * .08;
    drift.y += (cursor.y - drift.y) * .08;
    for (const p of particles) {
      const opacity = paused ? p.opacity : p.opacity * (.75 + .25 * Math.sin(time / 2300 + p.offset));
      context.beginPath();
      context.arc(p.x + drift.x * p.depth * 8, p.y + drift.y * p.depth * 8, p.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(${p.tint},${opacity})`;
      context.fill();
    }
    if (paused || light || document.hidden) return;
    if (!comet && time >= nextComet) {
      comet = { x: width * (.05 + Math.random() * .6), y: height * (.03 + Math.random() * .25), start: time };
      nextComet = time + 12000 + Math.random() * 8000;
    }
    if (comet) {
      const age = time - comet.start;
      if (age > 1700) { comet = null; return; }
      const x = comet.x + age * .36, y = comet.y + age * .18;
      const opacity = Math.sin(age / 1700 * Math.PI) * .6;
      const trail = context.createLinearGradient(x - 130, y - 65, x, y);
      trail.addColorStop(0, 'rgba(185,155,255,0)'); trail.addColorStop(1, `rgba(232,218,255,${opacity})`);
      context.beginPath(); context.moveTo(x - 130, y - 65); context.lineTo(x, y); context.strokeStyle = trail; context.lineWidth = 1; context.stroke();
    }
  }

  function animate(time) {
    if (paused || document.hidden || !context) { frame = 0; return; }
    if (time - previous > (light ? 70 : 32)) { previous = time; paint(time); }
    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    root.classList.toggle('effects-paused', paused);
    root.classList.toggle('effects-light', !!light);
    root.classList.toggle('tab-hidden', document.hidden);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.querySelector('span').textContent = paused ? 'Ativar efeitos' : 'Pausar efeitos';
      motionButton.title = reduced.matches ? 'Movimento reduzido segue a preferência do seu dispositivo.' : 'Ativar ou pausar as animações do site';
    }
    cancelAnimationFrame(frame);
    frame = 0;
    comet = null;
    nextComet = performance.now() + 6500;
    if (paused || document.hidden) {
      resetPointer();
      document.querySelectorAll('.motion-enter').forEach(node => node.classList.remove('motion-enter'));
    }
    if (context) {
      paint(performance.now());
      if (!paused && !document.hidden) frame = requestAnimationFrame(animate);
    }
  }

  sizeCanvas();
  updateMotion();
  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { resetPointer(); sizeCanvas(); });
  }, { passive: true });
  document.addEventListener('visibilitychange', updateMotion);
  if (motionButton) motionButton.addEventListener('click', () => {
    savedPause = !savedPause;
    paused = savedPause || reduced.matches;
    try { localStorage.setItem('batata:effects', savedPause ? 'paused' : 'running'); } catch (_) {}
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
    document.querySelectorAll('.reveal').forEach((element, index) => {
      element.style.setProperty('--reveal-delay', `${index % 3 * 65}ms`);
      observer.observe(element);
    });
  }

  // These decorations never intercept navigation, game controls or copying.
  const surfaces = '.destination-card, .project-card, .game-portal, .guide-card, .game-card';
  function clearSurface(node) {
    if (!node) return;
    node.classList.remove('pointer-lit');
    node.style.removeProperty('--tilt-x'); node.style.removeProperty('--tilt-y');
  }
  function clearScene(node) {
    if (!node) return;
    node.style.removeProperty('--scene-x'); node.style.removeProperty('--scene-y');
  }
  function resetPointer() {
    cancelAnimationFrame(pointerFrame); pointerFrame = 0; lastPointer = null;
    clearSurface(activeSurface); clearScene(activeScene); activeSurface = activeScene = null;
    cursor.x = cursor.y = 0;
  }
  function paintPointer() {
    pointerFrame = 0;
    if (!lastPointer || paused || light || document.hidden || !finePointer.matches) { resetPointer(); return; }
    const { x, y, surface, scene } = lastPointer;
    if (activeSurface !== surface) clearSurface(activeSurface);
    if (activeScene !== scene) clearScene(activeScene);
    activeSurface = surface; activeScene = scene;
    if (surface) {
      const rect = surface.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (x - rect.left) / Math.max(1, rect.width)));
      const py = Math.max(0, Math.min(1, (y - rect.top) / Math.max(1, rect.height)));
      surface.classList.add('pointer-lit');
      surface.style.setProperty('--shine-x', `${px * 100}%`); surface.style.setProperty('--shine-y', `${py * 100}%`);
      surface.style.setProperty('--tilt-x', `${(py - .5) * -4}deg`); surface.style.setProperty('--tilt-y', `${(px - .5) * 4}deg`);
    }
    if (scene) {
      const rect = scene.getBoundingClientRect();
      scene.style.setProperty('--scene-x', `${Math.max(-8, Math.min(8, (x - rect.left - rect.width / 2) * .025))}px`);
      scene.style.setProperty('--scene-y', `${Math.max(-6, Math.min(6, (y - rect.top - rect.height / 2) * .018))}px`);
    }
  }
  document.addEventListener('pointermove', event => {
    if (paused || light || document.hidden || !finePointer.matches || event.pointerType === 'touch') return;
    const surface = event.target.closest?.(surfaces) || null;
    const hero = event.target.closest?.('.hero-home, .page-hero-grid');
    const scene = hero?.querySelector('.space-scene, .mini-scene') || null;
    cursor.x = width ? event.clientX / width - .5 : 0; cursor.y = height ? event.clientY / height - .5 : 0;
    lastPointer = { x: event.clientX, y: event.clientY, surface, scene };
    if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);
  }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) resetPointer(); }, { passive: true });
  document.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') resetPointer(); }, { passive: true });
  document.addEventListener('keydown', event => { if (event.key === 'Tab') resetPointer(); });
  window.addEventListener('blur', resetPointer);
  finePointer.addEventListener('change', resetPointer);
  window.addEventListener('scroll', resetPointer, { passive: true });

  // Catalog batches keep their original rendering and filtering logic.
  function decorateBatch(nodes) {
    if (paused || document.hidden) return;
    nodes.filter(node => node.nodeType === 1 && node.matches('.game-card')).slice(0, 12).forEach((node, index) => {
      node.style.setProperty('--enter-delay', `${index % 4 * 45}ms`);
      node.classList.add('motion-enter');
    });
  }
  if ('MutationObserver' in window) {
    document.querySelectorAll('#gamesGrid, [data-featured-grid]').forEach(grid => {
      decorateBatch([...grid.children]);
      const observer = new MutationObserver(records => {
        if (activeSurface && !activeSurface.isConnected) resetPointer();
        decorateBatch(records.flatMap(record => [...record.addedNodes]));
      });
      observer.observe(grid, { childList: true });
    });
  }
  document.addEventListener('animationend', event => {
    if (event.animationName === 'surface-in') event.target.classList.remove('motion-enter');
  });

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
