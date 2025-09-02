// year
document.getElementById('y').textContent = new Date().getFullYear();

// scroll reveal
const revealables = [...document.querySelectorAll('.reveal')];
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealables.forEach(el => io.observe(el));

// theme toggle (persist)
const root = document.documentElement;
const key = 'accu2-theme';
const saved = localStorage.getItem(key);
if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

document.getElementById('themeToggle').addEventListener('click', () => {
  const cur = root.getAttribute('data-theme') || 'dark';
  const next = (cur === 'dark') ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem(key, next);
});

// tiny mouse parallax on blobs
const blobs = document.querySelectorAll('.blob');
window.addEventListener('pointermove', (e) => {
  const { innerWidth:w, innerHeight:h } = window;
  const x = (e.clientX / w - .5) * 10; // -5..5
  const y = (e.clientY / h - .5) * 10;
  blobs.forEach((b, i) => {
    const k = (i+1) * 0.4;
    b.style.transform = `translate3d(${x*k}px, ${y*k}px, 0)`;
  });
}, { passive:true });
