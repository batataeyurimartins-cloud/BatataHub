
const stars = document.getElementById('stars');
if (stars) {
  const ctx = stars.getContext('2d');
  let width = 0;
  let height = 0;
  let points = [];

  function resize(){
    width = stars.width = window.innerWidth;
    height = stars.height = window.innerHeight;
    points = Array.from({ length: Math.max(70, Math.floor(width / 20)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.9 + 0.4,
      s: Math.random() * 0.28 + 0.05,
      a: Math.random() * 0.6 + 0.25
    }));
  }

  function draw(){
    ctx.clearRect(0,0,width,height);
    for(const p of points){
      p.y += p.s;
      if (p.y > height + 4) {
        p.y = -8;
        p.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  addEventListener('resize', resize);
}

const glow = document.getElementById('cursorGlow');
if (glow) {
  addEventListener('pointermove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

window.observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => window.observer.observe(el));

window.bindTiltCards = function bindTiltCards() {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    if (card.dataset.tiltBound === '1') return;
    card.dataset.tiltBound = '1';

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 8;
      const rotateX = (0.5 - py) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
};
window.bindTiltCards();

window.showToast = function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
};
