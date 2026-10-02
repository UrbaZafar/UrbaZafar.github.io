const canvas = document.getElementById('globe');
const ctx = canvas.getContext('2d');

const SIZE = 600;
const dpr = window.devicePixelRatio || 1;
canvas.width = SIZE * dpr;
canvas.height = SIZE * dpr;
canvas.style.width = SIZE + 'px';
ctx.scale(dpr, dpr);
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

const W = SIZE, H = SIZE;
const cx = W / 2, cy = H / 2, R = 195;

const skills = [
  { label: 'Python', image: 'logos/python.png' },
  { label: 'R', image: 'logos/r.png' },
  { label: 'SQL', image: 'logos/sql.png' },
  { label: 'Linux', image: 'logos/linux.png' },
  { label: 'Git', image: 'logos/git.png' },
  { label: 'PyTorch', image: 'logos/pytorch.png' },
  { label: 'GNNs', image: 'logos/graph_network.png' },
  { label: 'Explainable AI', image: 'logos/AI.png' },
  { label: 'RNA-seq', image: 'logos/Rna.png' },
  { label: 'circRNA', image: 'logos/circRNA.png' },
  { label: 'EpiGenomics', image: 'logos/epigenomics.png' },
  { label: 'Network Analysis', image: 'logos/Network_Analysis.png' },
  { label: 'Cytoscape', image: 'logos/Cytoscape.png' },
  { label: 'Pathway Analysis', image: 'logos/Pathway_Analysis.png' },
  { label: 'Protein-3D', image: 'logos/3d_protein.png' },
  { label: 'Spatial-Analysis', image: 'logos/Spatial_Analysis.png' },
  { label: 'Neurodegeneration', image: 'logos/Neurodegen.png' },
];

skills.forEach(s => {
  const img = new Image();
  img.src = s.image;
  img.onload = () => { s.img = img; };
  img.onerror = () => console.warn('Globe icon failed to load:', s.image);
});

const stars = Array.from({ length: 70 }, () => ({
  x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.1 + 0.3, phase: Math.random() * Math.PI * 2
}));

function drawStars(t) {
  stars.forEach(s => {
    const tw = 0.2 + 0.5 * Math.abs(Math.sin(t * 0.0012 + s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${tw})`;
    ctx.fill();
  });
}

let rotX = 0.3, rotY = 0;
let dragging = false, lastX = 0, lastY = 0;
let velX = 0, velY = 0.008;

function drawGlobe() {
  const emLine = 'rgba(6, 95, 70, 0.5)';
  ctx.lineWidth = 0.6;

  for (let i = 1; i <= 7; i++) {
    const lat = (i / 8) * Math.PI;
    const r2 = R * Math.sin(lat);
    const yOff = -R * Math.cos(lat);
    ctx.beginPath();
    ctx.ellipse(cx, cy + yOff, r2, r2 * 0.18, 0, 0, Math.PI * 2);
    ctx.strokeStyle = emLine;
    ctx.stroke();
  }

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + rotY;
    ctx.beginPath();
    ctx.strokeStyle = emLine;
    for (let j = 0; j <= 60; j++) {
      const lat = (j / 60) * Math.PI;
      const x = cx + R * Math.sin(lat) * Math.cos(angle);
      const y = cy - R * Math.cos(lat);
      j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 8; i++) {
    const a1 = (i / 8) * Math.PI * 2 + rotY;
    const a2 = ((i + 3) / 8) * Math.PI * 2 + rotY;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
    for (let j = 0; j <= 40; j++) {
      const t = j / 40;
      const lat = t * Math.PI;
      const ang = a1 + (a2 - a1) * t;
      const x = cx + R * Math.sin(lat) * Math.cos(ang);
      const y = cy - R * Math.cos(lat);
      j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function getPoints() {
  return skills.map((s, i) => {
    const phi = Math.acos(-1 + (2 * i) / skills.length);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    return { ...s, phi, theta };
  });
}

function drawSkills(t) {
  const pts = getPoints();
  const projected = pts.map(pt => {
    const x0 = R * Math.sin(pt.phi) * Math.cos(pt.theta);
    const y0 = R * Math.cos(pt.phi);
    const z0 = R * Math.sin(pt.phi) * Math.sin(pt.theta);
    const p = rotate3D(x0, y0, z0, rotX, rotY);
    const depthFactor = (p.z + R) / (2 * R);
    return { ...pt, sx: cx + p.x, sy: cy - p.y, depthFactor, z: p.z };
  });

  projected.sort((a, b) => a.z - b.z);

  projected.forEach((p, idx) => {
    const pulse = 1 + 0.06 * Math.sin(t * 0.0015 + idx);
    const alpha = (0.25 + 0.75 * p.depthFactor) * pulse;
    const size = (28 + 26 * p.depthFactor) * pulse;

    ctx.save();
    ctx.globalAlpha = Math.min(alpha, 1);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = 16 * p.depthFactor;

    if (p.img) {
      const ratio = p.img.naturalWidth / p.img.naturalHeight;
      const w = ratio >= 1 ? size : size * ratio;
      const h = ratio >= 1 ? size / ratio : size;
      ctx.drawImage(p.img, p.sx - w / 2, p.sy - h / 2, w, h);
    } else {
      ctx.fillStyle = '#0c1712';
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = Math.min(alpha * 0.9, 1);
    ctx.fillStyle = '#e0f5ea';
    ctx.font = `${Math.round(9 + 4 * p.depthFactor)}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(p.label, p.sx, p.sy + size / 2 + 4);

    ctx.restore();
  });
}

function animate(t) {
  ctx.clearRect(0, 0, W, H);
  drawStars(t || 0);
  drawGlobe();
  drawSkills(t || 0);
  if (!dragging) {
    rotY += velY;
    rotX += velX;
    velX *= 0.97;
    velY *= 0.97;
  }
  requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = 'grabbing'; });
window.addEventListener('mouseup', () => { dragging = false; canvas.style.cursor = 'grab'; });
window.addEventListener('mousemove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  rotY += dx * 0.012; rotX += dy * 0.01;
  velY = dx * 0.008; velX = dy * 0.01;
  lastX = e.clientX; lastY = e.clientY;
});
canvas.addEventListener('touchstart', e => { dragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; });
canvas.addEventListener('touchend', () => { dragging = false; });
canvas.addEventListener('touchmove', e => {
  if (!dragging) return;
  const dx = e.touches[0].clientX - lastX, dy = e.touches[0].clientY - lastY;
  rotY += dx * 0.012; rotX += dy * 0.01;
  velY = dx * 0.008; velX = dy * 0.01;
  lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
});

animate();

function rotate3D(x, y, z, rx, ry) {
  let y1 = y * Math.cos(rx) - z * Math.sin(rx);
  let z1 = y * Math.sin(rx) + z * Math.cos(rx);
  let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
  let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
  return { x: x2, y: y1, z: z2 };
}

const revealEls = document.querySelectorAll('#focus, #projects, #research, #about, #contact, .focus-card, .tl-item');
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

const sideDots = document.querySelectorAll('.side-dot');
const navLinks = document.querySelectorAll('.nav-inner a');
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    sideDots.forEach(dot => dot.classList.toggle('active', dot.dataset.section === id));
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

sections.forEach(sec => sectionObserver.observe(sec));

const projTrack = document.getElementById('projectsTrack');
const projPrev = document.getElementById('projPrev');
const projNext = document.getElementById('projNext');

if (projTrack && projPrev && projNext) {
  let animating = false;

  const cardStep = () => {
    const card = projTrack.querySelector('.project-card');
    const gap = parseFloat(getComputedStyle(projTrack).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };
  const maxScroll = () => projTrack.scrollWidth - projTrack.clientWidth;

  const updateArrows = () => {
    projPrev.disabled = projTrack.scrollLeft <= 4;
    projNext.disabled = projTrack.scrollLeft >= maxScroll() - 4;
  };

  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const glideTo = target => {
    if (animating) return;
    const start = projTrack.scrollLeft;
    const dist = target - start;
    if (Math.abs(dist) < 1) return;

    animating = true;
    projTrack.classList.add('is-animating');
    const duration = 650;
    const t0 = performance.now();

    const frame = now => {
      const p = Math.min((now - t0) / duration, 1);
      projTrack.scrollLeft = start + dist * easeInOut(p);
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        projTrack.classList.remove('is-animating');
        animating = false;
        updateArrows();
      }
    };
    requestAnimationFrame(frame);
  };

  const go = dir => {
    const step = cardStep();
    const index = Math.round(projTrack.scrollLeft / step) + dir;
    glideTo(Math.max(0, Math.min(index * step, maxScroll())));
  };

  projPrev.addEventListener('click', () => go(-1));
  projNext.addEventListener('click', () => go(1));
  projTrack.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
}

document.querySelectorAll('.project-diagram img').forEach(img => {
  const frame = img.parentElement;
  const markEmpty = () => frame.classList.add('is-empty');
  const markLoaded = () => frame.classList.add('has-img');
  img.addEventListener('error', markEmpty);
  img.addEventListener('load', markLoaded);
  if (img.complete) { img.naturalWidth === 0 ? markEmpty() : markLoaded(); }
});

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

if (lightbox) {
  const closeLightbox = () => { lightbox.hidden = true; document.body.style.overflow = ''; };

  document.querySelectorAll('.project-diagram').forEach(frame => {
    frame.addEventListener('click', () => {
      if (!frame.classList.contains('has-img')) return;
      const img = frame.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });

  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });
}

function sendMail() {
  let parms = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
  };

  emailjs.send("service_uzkim1z", "template_z3bc5xp", parms)
    .then(() => {
      alert("Email sent.");
    })
    .catch((err) => {
      alert("Something went wrong. Please try again.");
      console.error("EmailJS error:", err);
    });
}