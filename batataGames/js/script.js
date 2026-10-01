const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const cursorGlow = document.getElementById('cursorGlow');

menuBtn?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks?.classList.remove('open'));
});

document.querySelectorAll('.accordion').forEach(card => {
  const trigger = card.querySelector('.accordion-trigger');
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    card.classList.toggle('active');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
window.observer = observer;

function bindTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateY = (x - midX) / 22;
      const rotateX = (midY - y) / 22;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

bindTiltCards();
window.bindTiltCards = bindTiltCards;

window.addEventListener('mousemove', (e) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

const canvas = document.getElementById('stars');
const ctx = canvas?.getContext('2d');
let particles = [];
const maxDistance = 120;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createParticles();
}
window.addEventListener('resize', resizeCanvas);

function createParticles() {
  if (!canvas) return;
  const count = Math.max(52, Math.floor(window.innerWidth / 24));
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.36,
      vy: (Math.random() - 0.5) * 0.36,
      r: Math.random() * 1.8 + 0.6,
    });
  }
}

function drawParticles() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(196, 150, 255, 0.88)';
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.10 * (1 - dist / maxDistance)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
}

resizeCanvas();
drawParticles();
