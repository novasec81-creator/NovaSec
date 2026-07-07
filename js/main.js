// Cookie banner
if (!localStorage.getItem('cookies')) {
  setTimeout(() => document.getElementById('cookieBanner')?.classList.add('show'), 500);
}

// Navbar toggle
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle?.addEventListener('click', () => links?.classList.toggle('active'));
toggle?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); links?.classList.toggle('active'); } });
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => links?.classList.remove('active')));

// Navbar background opacity on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 64
    ? 'rgba(10, 14, 23, 0.95)'
    : 'rgba(10, 14, 23, 0.8)';
});

// Counter animation (disabled — stats now static)

// Contact form
const form = document.getElementById('contactForm');
form?.addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = 'Envoi...';
  btn.disabled = true;
  const f = new FormData(this);
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_key: 'a439b93f-8002-4e89-a3f8-3fffe0cb3c79',
      subject: 'NovaSec - Demande de ' + (f.get('service') || 'devis'),
      from_name: f.get('nom'),
      email: f.get('email'),
      message: f.get('message'),
      service: f.get('service')
    })
  }).then(r => r.json()).then(d => {
    if (d.success) { window.location.href = 'merci.html'; }
    else throw new Error(d.message);
  }).catch(() => {
    window.location.href = 'mailto:NovaSec81@gmail.com?' + new URLSearchParams({
      subject: 'NovaSec - Demande de ' + (f.get('service') || 'devis'),
      body: 'Nom: ' + f.get('nom') + '\nEmail: ' + f.get('email') + '\nService: ' + f.get('service') + '\n\n' + f.get('message')
    });
  })  .finally(() => { btn.textContent = orig; btn.disabled = false; });
});

// Service card buttons → scroll to Contact + auto-select
document.querySelectorAll('.btn-card').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const service = this.dataset.service;
    sessionStorage.setItem('novaService', service);
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    const sel = document.querySelector('#contactForm select[name="service"]');
    if (sel) sel.value = service;
  });
});
// On load, restore auto-selected service
const saved = sessionStorage.getItem('novaService');
if (saved) {
  const sel = document.querySelector('#contactForm select[name="service"]');
  if (sel) sel.value = saved;
  sessionStorage.removeItem('novaService');
}

// Smooth reveal on scroll
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .formation-card, .pack-card, .maintenance-card, .portfolio-card').forEach((el, i) => {
  el.classList.add('card-enter');
  el.style.transitionDelay = (i % 6) * 80 + 'ms';
  revealObs.observe(el);
});
