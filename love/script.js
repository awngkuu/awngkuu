/**
 * Cinematic Digital Love Experience - JavaScript Engine
 * Custom 3D Foliage Physics, 3-Layer Bokeh Parallax, Cursor Repulsion,
 * Touch Sparkle Trails, Gesture Music Controllers, Interactive Wax Seals,
 * and 3D Perspective Card Tilts.
 */

// --- CONFIGURATION ---
const ANNIVERSARY_DATE = "2024-05-02T00:00:00";
const USERNAME_VALID = "yuunijamil";
const PASSWORD_VALID = "020524";

// --- STATE & INTERACTION ---
let currentPhase = 'intro';
const cursor = { x: -1000, y: -1000, active: false };
let trailParticles = [];
let explosionParticles = [];
let waxSealCracked = false;

// Track mouse and touch movements globally
window.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  cursor.active = true;

  // Update background glow coordinates dynamically
  const xPercent = (e.clientX / window.innerWidth) * 100;
  const yPercent = (e.clientY / window.innerHeight) * 100;
  document.body.style.setProperty('--mouse-x', `${xPercent}%`);
  document.body.style.setProperty('--mouse-y', `${yPercent}%`);

  // Spawn touch trail particles
  if (currentPhase !== 'transitioning' && Math.random() < 0.4) {
    spawnTrailParticle(e.clientX, e.clientY);
  }
});

window.addEventListener('mouseleave', () => {
  cursor.active = false;
});

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    cursor.x = e.touches[0].clientX;
    cursor.y = e.touches[0].clientY;
    cursor.active = true;

    const xPercent = (e.touches[0].clientX / window.innerWidth) * 100;
    const yPercent = (e.touches[0].clientY / window.innerHeight) * 100;
    document.body.style.setProperty('--mouse-x', `${xPercent}%`);
    document.body.style.setProperty('--mouse-y', `${yPercent}%`);

    if (currentPhase !== 'transitioning' && Math.random() < 0.4) {
      spawnTrailParticle(e.touches[0].clientX, e.touches[0].clientY);
    }
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  cursor.active = false;
});


// --- ADVANCED CANVAS FOLIAGE & SPARKLE ENGINE ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let maxParticles = 80;
let time = 0;
let transitionSpeedMultiplier = 1.0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  maxParticles = window.innerWidth < 768 ? 35 : 80;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class FlowerParticle {
  constructor(isExplosion = false, originX = 0, originY = 0) {
    this.isExplosion = isExplosion;
    this.reset(originX, originY);
  }

  reset(originX, originY) {
    this.depth = Math.random();

    if (this.depth < 0.25) {
      // distant background layer
      this.size = Math.random() * 5 + 4;
      this.vy = Math.random() * 0.5 + 0.3;
      this.blur = 1.5;
      this.alpha = Math.random() * 0.25 + 0.2;
      this.layerZ = 0.5;
    } else if (this.depth >= 0.85) {
      // near foreground layer
      this.size = Math.random() * 12 + 18;
      this.vy = Math.random() * 2.2 + 1.8;
      this.blur = 5.0;
      this.alpha = Math.random() * 0.4 + 0.35;
      this.layerZ = 1.8;
    } else {
      // sharp focused midground
      this.size = Math.random() * 8 + 8;
      this.vy = Math.random() * 1.3 + 0.7;
      this.blur = 0;
      this.alpha = Math.random() * 0.35 + 0.65;
      this.layerZ = 1.0;
    }

    this.type = Math.floor(Math.random() * 5);
    this.rx = Math.random() * Math.PI * 2;
    this.ry = Math.random() * Math.PI * 2;
    this.rz = Math.random() * Math.PI * 2;

    this.vrx = (Math.random() - 0.5) * 0.05;
    this.vry = (Math.random() - 0.5) * 0.05;
    this.vrz = (Math.random() - 0.5) * 0.03;

    if (this.isExplosion) {
      this.x = originX;
      this.y = originY;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1.0;
      this.decay = Math.random() * 0.02 + 0.012;
      this.blur = 0;
      this.type = Math.random() > 0.4 ? 4 : 0;
      this.layerZ = 1.2;
    } else {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height - 20;
      this.vx = (Math.random() - 0.5) * 1.0;
    }

    this.wobbleSpeed = Math.random() * 0.015 + 0.005;
    this.wobblePhase = Math.random() * Math.PI * 2;
  }

  update() {
    time += 0.00015;

    if (this.isExplosion) {
      this.x += this.vx * transitionSpeedMultiplier;
      this.y += this.vy * transitionSpeedMultiplier;
      this.vy += 0.06;
      this.alpha -= this.decay;

      this.rx += this.vrx * 2;
      this.ry += this.vry * 2;
      this.rz += this.vrz * 2;

      if (this.alpha <= 0) return false;
    } else {
      const windWave = Math.sin(time + this.y * 0.004) * 0.35 + 0.25;

      this.y += this.vy * this.layerZ * transitionSpeedMultiplier;
      this.x += (this.vx + windWave) * this.layerZ * transitionSpeedMultiplier;

      this.rx += this.vrx * transitionSpeedMultiplier;
      this.ry += this.vry * transitionSpeedMultiplier;
      this.rz += this.vrz * transitionSpeedMultiplier;

      if (cursor.active && this.depth >= 0.25) {
        const dx = this.x - cursor.x;
        const dy = this.y - cursor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = window.innerWidth < 768 ? 80 : 130;

        if (dist < radius) {
          const force = (radius - dist) / radius * 2.5;
          const ux = dx / (dist || 1);
          const uy = dy / (dist || 1);

          this.vx += ux * force;
          this.vy += uy * force;
        }
      }

      this.vx = Math.max(-5, Math.min(5, this.vx));
      this.vy = Math.max(0.6, Math.min(3.5, this.vy));

      if (this.y > canvas.height + 30 || this.x < -30 || this.x > canvas.width + 30) {
        this.reset();
      }
    }
    return true;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);

    ctx.rotate(this.rz);
    ctx.scale(Math.cos(this.ry), Math.cos(this.rx));

    if (this.blur > 0) {
      ctx.filter = `blur(${this.blur}px)`;
    } else {
      ctx.filter = 'none';
    }

    switch (this.type) {
      case 0:
        const roseGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, this.size);
        roseGrad.addColorStop(0, '#ff4d6d');
        roseGrad.addColorStop(0.8, '#c9184a');
        roseGrad.addColorStop(1, '#800f2f');
        ctx.fillStyle = roseGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 1:
        ctx.fillStyle = '#ffccd5';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5;
          const px = Math.cos(angle) * (this.size / 2);
          const py = Math.sin(angle) * (this.size / 2);
          ctx.ellipse(px, py, this.size / 2.5, this.size / 3.8, angle, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.fillStyle = '#ff758f';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 6, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 2:
        ctx.fillStyle = 'rgba(255, 245, 247, 0.75)';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 1.1, this.size / 2.3, 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 3:
        const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        glowGrad.addColorStop(0, 'rgba(255, 244, 214, 0.95)');
        glowGrad.addColorStop(0.5, 'rgba(255, 200, 100, 0.45)');
        glowGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 4:
        ctx.fillStyle = 'rgba(255, 77, 109, 0.85)';
        ctx.beginPath();
        const s = this.size * 0.9;
        ctx.moveTo(0, -s / 4);
        ctx.bezierCurveTo(0, -s / 2, -s / 2, -s / 2, -s / 2, -s / 4);
        ctx.bezierCurveTo(-s / 2, s / 4, 0, s / 2, 0, s * 0.75);
        ctx.bezierCurveTo(0, s / 2, s / 2, s / 4, s / 2, -s / 4);
        ctx.bezierCurveTo(s / 2, -s / 2, 0, -s / 2, 0, -s / 4);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }
}

// Sparkle/Heart cursor trail particle definition
class TrailParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 6 + 4;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = -Math.random() * 1.5 - 0.5; // floats up
    this.alpha = 1.0;
    this.decay = Math.random() * 0.03 + 0.02;
    this.isHeart = Math.random() > 0.6;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    return this.alpha > 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.filter = 'none';

    if (this.isHeart) {
      ctx.fillStyle = 'rgba(255, 107, 139, 0.8)';
      ctx.beginPath();
      const s = this.size;
      ctx.moveTo(0, -s / 4);
      ctx.bezierCurveTo(0, -s / 2, -s / 2, -s / 2, -s / 2, -s / 4);
      ctx.bezierCurveTo(-s / 2, s / 4, 0, s / 2, 0, s * 0.75);
      ctx.bezierCurveTo(0, s / 2, s / 2, s / 4, s / 2, -s / 4);
      ctx.bezierCurveTo(s / 2, -s / 2, 0, -s / 2, 0, -s / 4);
      ctx.closePath();
      ctx.fill();
    } else {
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      grad.addColorStop(0, 'rgba(255, 235, 160, 0.9)');
      grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function spawnTrailParticle(x, y) {
  trailParticles.push(new TrailParticle(x, y));
}

// Populate background particle list
for (let i = 0; i < maxParticles; i++) {
  particles.push(new FlowerParticle(false));
}

// Loop update & draw
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background foliage
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  // Draw mouse trail particles
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const active = trailParticles[i].update();
    if (active) {
      trailParticles[i].draw();
    } else {
      trailParticles.splice(i, 1);
    }
  }

  // Draw portal click explosions
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const active = explosionParticles[i].update();
    if (active) {
      explosionParticles[i].draw();
    } else {
      explosionParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(render);
}
render();

// Heart blast emitter
function spawnExplosion(x, y, multiplier = 1.0) {
  const count = window.innerWidth < 768 ? 45 : 110;
  for (let i = 0; i < count; i++) {
    const particle = new FlowerParticle(true, x, y);
    particle.vx *= multiplier;
    particle.vy *= multiplier;
    explosionParticles.push(particle);
  }
}


// --- INTERACTIVE MUSIC CONTROLLERS ---
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
let musicPlaying = false;

function playMusic() {
  if (bgMusic && !musicPlaying) {
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicToggle.classList.remove('paused');
    }).catch(err => {
      console.log("Audio playback blocked by browser gesture policies:", err);
    });
  }
}

function toggleMusic(event) {
  if (event) event.stopPropagation();
  if (!bgMusic) return;

  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
    musicToggle.classList.add('paused');
  } else {
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicToggle.classList.remove('paused');
    });
  }
}


// --- INTRO PHASE TIMERS ---
document.addEventListener('DOMContentLoaded', () => {
  // Check if session exists
  if (localStorage.getItem('love_session') === 'true') {
    currentPhase = 'home';
    
    const introScreen = document.getElementById('intro-screen');
    if (introScreen) introScreen.classList.add('hidden');
    
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.classList.add('hidden');
    
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.classList.add('visible');
    
    playMusic();
    
    // Play music on first user interaction if browser blocked autoplay on load
    const startMusicOnInteraction = () => {
      playMusic();
      window.removeEventListener('click', startMusicOnInteraction);
      window.removeEventListener('touchstart', startMusicOnInteraction);
    };
    window.addEventListener('click', startMusicOnInteraction);
    window.addEventListener('touchstart', startMusicOnInteraction);

    setInterval(updateAnniversaryCounter, 1000);
    updateAnniversaryCounter();
    initQuiz();
    initScrollReveals();
    initCardTilts();
    initFlowerRain();
    showFlowerFab();
    loadSavedMood();
    return;
  }

  const title = document.getElementById('intro-title');
  const subtitle = document.getElementById('intro-subtitle');

  // Gradual fading titles with letter-spacing class triggers
  setTimeout(() => {
    if (currentPhase !== 'intro') return;
    title.classList.add('loaded');
    title.style.opacity = '1';
  }, 1200);

  setTimeout(() => {
    if (currentPhase !== 'intro') return;
    subtitle.style.opacity = '1';
  }, 2500);

  // Handle click outside heart on intro screen
  document.getElementById('intro-screen').addEventListener('click', () => {
    if (currentPhase !== 'intro') return;
    if (subtitle.dataset.originalText) return;

    subtitle.dataset.originalText = subtitle.innerText;
    subtitle.innerText = "Tekan love tu la Sayang ❤️";
    subtitle.style.color = "#ff4d6d";
    subtitle.classList.add('shake');

    setTimeout(() => {
      subtitle.innerText = subtitle.dataset.originalText;
      subtitle.style.color = "";
      subtitle.classList.remove('shake');
      delete subtitle.dataset.originalText;
    }, 2500);
  });

  // Initialize 3D card tilt behaviors
  initCardTilts();
  initFlowerRain();
  loadSavedMood();
});


// --- PHASE TRANSITION: EXPANDING PORTAL ---
function triggerPortalTransition(event) {
  if (event) event.stopPropagation();
  if (currentPhase !== 'intro') return;
  currentPhase = 'transitioning';

  // Try starting music loop upon this user gesture!
  playMusic();

  const heartContainer = document.getElementById('intro-heart');
  const title = document.getElementById('intro-title');
  const subtitle = document.getElementById('intro-subtitle');

  title.style.opacity = '0';
  subtitle.style.opacity = '0';

  document.querySelectorAll('.heart-pulse-ring').forEach(ring => {
    ring.style.display = 'none';
  });

  heartContainer.classList.add('expanded');

  transitionSpeedMultiplier = 3.5;
  spawnExplosion(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2, 1.5);

  setTimeout(() => {
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');

    let slowInterval = setInterval(() => {
      if (transitionSpeedMultiplier > 1.0) {
        transitionSpeedMultiplier -= 0.15;
      } else {
        transitionSpeedMultiplier = 1.0;
        clearInterval(slowInterval);
      }
    }, 100);

    currentPhase = 'login';
  }, 1500);
}


// --- LOGIN VALIDATION & SCENIC TRANSITION ---
const loginForm = document.getElementById('login-form');
const loginCard = document.querySelector('.login-card');
const loginError = document.getElementById('login-error');
const submitBtn = document.getElementById('login-submit-btn');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();

  // Allow "yuunijamil" / "sayang" / "love" as usernames, and different date representations of the anniversary
  const validUsernames = [USERNAME_VALID, "love", "sayang"];
  const validPasswords = [PASSWORD_VALID, "1234", "02052024", "20240502", "02-05-24", "02-05-2024", "02/05/24", "02/05/2024"];

  if (validUsernames.includes(username) && validPasswords.includes(password)) {
    currentPhase = 'warp';
    loginError.classList.add('hidden');

    submitBtn.disabled = true;
    submitBtn.classList.add('success-pulse');
    submitBtn.innerHTML = '<span>Welcome back, Sayang ❤️</span>';

    const btnRect = submitBtn.getBoundingClientRect();
    const ox = btnRect.left + btnRect.width / 2;
    const oy = btnRect.top + btnRect.height / 2;

    spawnExplosion(ox, oy, 1.3);
    setTimeout(() => spawnExplosion(ox, oy - 150, 1.1), 250);
    setTimeout(() => spawnExplosion(ox, oy + 150, 1.1), 450);

    document.body.classList.add('warp-zoomed');
    transitionSpeedMultiplier = 5.0;

    setTimeout(() => {
      document.body.classList.remove('warp-zoomed');
      document.getElementById('login-screen').classList.add('hidden');

      const mainContent = document.getElementById('main-content');
      mainContent.classList.add('visible');

      currentPhase = 'home';
      localStorage.setItem('love_session', 'true');

      let slowInterval = setInterval(() => {
        if (transitionSpeedMultiplier > 1.0) {
          transitionSpeedMultiplier -= 0.25;
        } else {
          transitionSpeedMultiplier = 1.0;
          clearInterval(slowInterval);
        }
      }, 80);

      setInterval(updateAnniversaryCounter, 1000);
      updateAnniversaryCounter();
      initQuiz();
      playMusic(); // Autoplay music immediately after user logs in

      initScrollReveals();
      mainContent.scrollTop = 0;
      showFlowerFab();
    }, 1800);

  } else {
    loginError.classList.remove('hidden');
    loginCard.classList.add('shake');
    setTimeout(() => {
      loginCard.classList.remove('shake');
    }, 600);
  }
});


// --- ANNIVERSARY RELATIONSHIP COUNTER ---
function updateAnniversaryCounter() {
  const start = new Date(ANNIVERSARY_DATE);
  const now = new Date();

  if (now < start) return;

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    minutes--;
    seconds += 60;
  }

  if (minutes < 0) {
    hours--;
    minutes += 60;
  }

  if (hours < 0) {
    days--;
    hours += 24;

    if (days < 0) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
  }

  document.getElementById('years').textContent = String(years).padStart(2, '0');
  document.getElementById('months').textContent = String(months).padStart(2, '0');
  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}


// --- WAX SEAL & ENVELOPE ENGINE ---
function crackWaxSeal(event) {
  event.stopPropagation();
  if (waxSealCracked) return;

  const seal = document.getElementById('wax-seal');

  // Crack/fade seal
  seal.style.opacity = '0';
  seal.style.transform = 'scale(0) rotate(20deg)';

  // Set trigger
  waxSealCracked = true;

  // Play heart burst on seal location
  const rect = seal.getBoundingClientRect();
  spawnExplosion(rect.left + 25, rect.top + 25, 0.6);

  // Automatically trigger letter pull up
  setTimeout(toggleEnvelope, 500);
}

function toggleEnvelope() {
  const envelope = document.getElementById('envelope-wrapper');

  // Shake warning if wax seal is not yet cracked
  if (!waxSealCracked) {
    const seal = document.getElementById('wax-seal');
    seal.classList.add('shake');
    setTimeout(() => seal.classList.remove('shake'), 600);
    return;
  }

  if (envelope.classList.contains('open')) {
    envelope.classList.remove('open');
  } else {
    envelope.classList.add('open');
    setTimeout(() => {
      if (envelope.classList.contains('open')) {
        document.getElementById('letter-modal').classList.add('visible');
      }
    }, 950);
  }
}

function closeLetterModal() {
  document.getElementById('letter-modal').classList.remove('visible');
  setTimeout(() => {
    document.getElementById('envelope-wrapper').classList.remove('open');
    // Restore wax seal
    const seal = document.getElementById('wax-seal');
    seal.style.opacity = '1';
    seal.style.transform = '';
    waxSealCracked = false;
  }, 400);
}


// --- 3D PERSPECTIVE TILT CONTROLS ---
function initCardTilts() {
  // Select reasons and moments cards
  const elements = document.querySelectorAll('.reason-card, .memory-moment-card');

  elements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;

      // Calculate 3D tilt coordinates
      const rotateX = -(y - yc) / 8; // vertical tilt
      const rotateY = (x - xc) / 8;  // horizontal tilt

      // Apply transforms
      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      element.style.boxShadow = `0 15px 30px rgba(255, 77, 109, 0.2)`;
    });

    element.addEventListener('mouseleave', () => {
      // Revert back on leave
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      element.style.boxShadow = '';
    });
  });
}


// --- LOGOUT ROUTINE ---
function logout() {
  currentPhase = 'login';

  document.getElementById('main-content').classList.remove('visible');
  hideFlowerFab();
  
  if (bgMusic && musicPlaying) {
    toggleMusic(); // stop music on logout
  }

  localStorage.removeItem('love_session');

  // Remove the session style block so the pages transition and hide/show correctly
  const sessionStyle = document.getElementById('session-style');
  if (sessionStyle) {
    sessionStyle.remove();
  }

  setTimeout(() => {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';

    submitBtn.disabled = false;
    submitBtn.classList.remove('success-pulse');
    submitBtn.innerHTML = '<span>Enter Our Love Stories</span><span class="heart-btn-icon text-lg">❤️</span>';

    document.getElementById('login-screen').classList.remove('hidden');
  }, 1000);
}


// --- SCROLL OBSERVER HELPER ---
function initScrollReveals() {
  const scrollElements = document.querySelectorAll('.scroll-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.12,
    root: document.getElementById('main-content')
  });

  scrollElements.forEach(el => observer.observe(el));
}

function scrollToTop() {
  const container = document.getElementById('main-content');
  if (container) {
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// --- MORE REASONS ERROR MODAL ---
function showMoreReasonsError(event) {
  if (event) event.stopPropagation();
  
  const modal = document.getElementById('error-modal');
  if (modal) modal.classList.add('visible');
  
  if (event) {
    spawnExplosion(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2, 1.2);
  }
}

function closeErrorModal() {
  const modal = document.getElementById('error-modal');
  if (modal) modal.classList.remove('visible');
}

// --- MINI QUIZ CONFIGURATION & GAME LOGIC ---
const QUIZ_QUESTIONS = [
  {
    question: "Where do we usually hang out?",
    options: {
      a: "Kksam",
      b: "Limbong",
      c: "Kuliah"
    },
    answer: "b",
    feedback: {
      correct: "Correct! Limbong is our favorite spot! 📍❤️",
      incorrect: "Wrong! Try again, Sayang. 🥺"
    }
  },
  {
    question: "Who is always sulking?",
    options: {
      a: "Me",
      b: "You"
    },
    answer: "b",
    feedback: {
      correct: "Hehe yes, you are! But it's okay, you're cute. 🥰❤️",
      incorrect: "Are you sure? Try again... 😉"
    }
  },
  {
    question: "Which two of these activities have we done together before?",
    details: [
      "i. Flying a kite",
      "ii. Going to the zoo",
      "iii. Doing artsy things",
      "iv. Watching a movie together"
    ],
    options: {
      a: "i and ii",
      b: "i and iii",
      c: "iii and iv",
      d: "ii and iv"
    },
    answer: "b",
    feedback: {
      correct: "Correct! We flew a kite and did artsy things! 🪁🎨❤️",
      incorrect: "Nope! Think about our special days together... 🤭"
    }
  },
  {
    question: "What is our favorite gesture?",
    options: {
      a: "Waving",
      b: "Mini heart",
      c: "Clapping",
      d: "Kissing"
    },
    answer: "d",
    feedback: {
      correct: "Yesss! Kissing is definitely our favorite! 💋❤️",
      incorrect: "Hmm, try again! You know this one... 😏"
    }
  },
  {
    question: "When did we get back together?",
    options: {
      a: "During semester break",
      b: "Before semester break",
      c: "After semester break"
    },
    answer: "c",
    feedback: {
      correct: "Correct! We got back together right after semester break. 🎒❤️",
      incorrect: "Wrong timing! Think back, Sayang... 😉"
    }
  },
  {
    question: "Where did we go on our first date?",
    options: {
      a: "Bookstore",
      b: "Park",
      c: "Museum"
    },
    answer: "a",
    feedback: {
      correct: "Correct! Our very first date was at the bookstore. 📚❤️",
      incorrect: "Nope, that wasn't our first stop! 🤭"
    }
  },
  {
    question: "What are the compulsory things we must do when visiting the mall?",
    details: [
      "i. Watch movies",
      "ii. Go to karaoke",
      "iii. Find a place to eat first",
      "iv. Go to the photo booth"
    ],
    options: {
      a: "i and ii",
      b: "i and iii",
      c: "ii and iv",
      d: "iii and iv"
    },
    answer: "d",
    feedback: {
      correct: "Spot on! We always find a place to eat first and get to the photo booth! 🍔📸❤️",
      incorrect: "Wrong choices! You know we love food and photos... 😜"
    }
  },
  {
    question: "Which of these is correct?",
    options: {
      a: "We always go on dates by motorcycle",
      b: "We never match our clothes on dates",
      c: "She always loves to pinch and bite me"
    },
    answer: "c",
    feedback: {
      correct: "Ouch! But true... you love to pinch and bite me! 🤏😬❤️",
      incorrect: "Wrong choice! Guess again, my bitey partner... 😜"
    }
  },
  {
    question: "How did we first get in touch?",
    options: {
      a: "Through Instagram",
      b: "Through our friends",
      c: "From our matriculation days"
    },
    answer: "a",
    feedback: {
      correct: "Correct! Instagram was where it all began! 📱❤️",
      incorrect: "Nope, not that way! Try again... 🤭"
    }
  },
  {
    question: "Is Awang more handsome than the K-pop idols that Ayuni likes?",
    options: {
      a: "True",
      b: "False"
    },
    answer: "a",
    feedback: {
      correct: "Correct! Awang wins by a landslide! 👑🕺❤️",
      incorrect: "Wrong answer! Clearly, the answer is True! 😜"
    }
  }
];

let currentQuestionIndex = 0;
let quizScore = 0;
let answered = false;

function initQuiz() {
  currentQuestionIndex = 0;
  quizScore = 0;
  answered = false;
  showQuestion();
}

function showQuestion() {
  answered = false;
  const quizBody = document.getElementById('quiz-body');
  const progressText = document.getElementById('quiz-progress-text');
  const scoreText = document.getElementById('quiz-score-text');
  const quizActions = document.getElementById('quiz-actions');
  
  if (!quizBody) return;
  
  progressText.textContent = `Question ${currentQuestionIndex + 1} of ${QUIZ_QUESTIONS.length}`;
  scoreText.textContent = `Score: ${quizScore}`;
  quizActions.innerHTML = '';
  
  const q = QUIZ_QUESTIONS[currentQuestionIndex];
  
  let detailsHtml = '';
  if (q.details) {
    detailsHtml = `<div class="text-left text-pink-200/80 text-sm space-y-1 mb-4 max-w-sm mx-auto bg-black/20 p-3.5 rounded-xl border border-white/5 font-sans">
      ${q.details.map(d => `<div>${d}</div>`).join('')}
    </div>`;
  }
  
  let optionsHtml = '';
  Object.entries(q.options).forEach(([key, val]) => {
    optionsHtml += `
      <button onclick="selectOption('${key}')" id="opt-${key}" 
              class="w-full text-left px-5 py-3.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold hover:bg-white/10 hover:border-pink-500/30 transition duration-300 flex justify-between items-center quiz-option-btn font-sans">
        <span>${key.toUpperCase()}. ${val}</span>
        <span class="status-icon text-base"></span>
      </button>
    `;
  });
  
  quizBody.innerHTML = `
    <h3 class="text-xl md:text-2xl font-serif font-bold text-pink-100 mb-4">${q.question}</h3>
    ${detailsHtml}
    <div class="space-y-3.5 max-w-md mx-auto mt-2 w-full">
      ${optionsHtml}
    </div>
    <div id="quiz-feedback" class="mt-5 text-sm font-semibold min-h-[20px] transition-all"></div>
  `;
}

function selectOption(key) {
  if (answered) return;
  answered = true;
  
  const q = QUIZ_QUESTIONS[currentQuestionIndex];
  const selectedBtn = document.getElementById(`opt-${key}`);
  const feedbackEl = document.getElementById('quiz-feedback');
  const allButtons = document.querySelectorAll('.quiz-option-btn');
  
  allButtons.forEach(btn => btn.style.pointerEvents = 'none');
  
  if (key === q.answer) {
    quizScore++;
    document.getElementById('quiz-score-text').textContent = `Score: ${quizScore}`;
    selectedBtn.classList.add('bg-green-950/40', 'border-green-500', 'text-green-200');
    selectedBtn.querySelector('.status-icon').textContent = '✅';
    feedbackEl.textContent = q.feedback.correct;
    feedbackEl.className = "mt-5 text-sm font-semibold text-green-300 animate-pulse";
    
    const rect = selectedBtn.getBoundingClientRect();
    spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 1.0);
  } else {
    selectedBtn.classList.add('bg-red-950/40', 'border-red-500', 'text-red-200');
    selectedBtn.querySelector('.status-icon').textContent = '❌';
    
    const correctBtn = document.getElementById(`opt-${q.answer}`);
    if (correctBtn) {
      correctBtn.classList.add('bg-green-950/20', 'border-green-500/60', 'text-green-300');
      correctBtn.querySelector('.status-icon').textContent = '✓';
    }
    
    feedbackEl.textContent = q.feedback.incorrect;
    feedbackEl.className = "mt-5 text-sm font-semibold text-red-300";
    
    const card = document.getElementById('quiz-card');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 600);
  }
  
  const quizActions = document.getElementById('quiz-actions');
  const isLast = currentQuestionIndex === QUIZ_QUESTIONS.length - 1;
  quizActions.innerHTML = `
    <button onclick="nextQuestion()" class="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition duration-300 flex items-center gap-1.5 shadow-[0_4px_15px_rgba(255,77,109,0.3)]">
      <span>${isLast ? 'See Results' : 'Next'}</span>
      <span>${isLast ? '🎉' : '→'}</span>
    </button>
  `;
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < QUIZ_QUESTIONS.length) {
    showQuestion();
  } else {
    showQuizResults();
  }
}

function showQuizResults() {
  const quizBody = document.getElementById('quiz-body');
  const progressText = document.getElementById('quiz-progress-text');
  const quizActions = document.getElementById('quiz-actions');
  
  progressText.textContent = "Quiz Completed";
  quizActions.innerHTML = '';
  
  let percentage = (quizScore / QUIZ_QUESTIONS.length) * 100;
  let resultMsg = "";
  let emoji = "";
  
  if (percentage === 100) {
    resultMsg = "Perfect score! You know everything about us! You are amazing, Sayang! ❤️";
    emoji = "👑💖";
  } else if (percentage >= 75) {
    resultMsg = "So close! You know us very well! Love you! 💕";
    emoji = "🌸🥰";
  } else {
    resultMsg = "It's okay! We still have a lifetime to build more memories together. Love you! 🥰";
    emoji = "🧸❤️";
  }
  
  quizBody.innerHTML = `
    <div class="text-6xl mb-4">${emoji}</div>
    <h3 class="text-2xl font-serif font-bold text-pink-100 mb-2">Quiz Finished!</h3>
    <div class="text-4xl font-extrabold text-rose-400 mb-4">${quizScore} / ${QUIZ_QUESTIONS.length}</div>
    <p class="text-pink-200/90 text-base max-w-sm mx-auto leading-relaxed mb-6">${resultMsg}</p>
    <button onclick="initQuiz()" class="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-pink-200 rounded-full text-sm font-semibold transition duration-300 max-w-xs mx-auto">
      Play Again 🔄
    </button>
  `;
}

// --- RESPONSIVE MEMORIES SLIDER SCROLLING ---
function scrollMemories(direction) {
  const track = document.getElementById('memories-track');
  if (track) {
    const cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth : 280;
    const gap = 24; // gap-6 is 1.5rem = 24px
    const scrollAmount = (cardWidth + gap) * 2;
    if (direction === 'left') {
      track.scrollLeft -= scrollAmount;
    } else {
      track.scrollLeft += scrollAmount;
    }
  }
}

// --- MOBILE OVERLAY NAVIGATION MENU ---
function toggleMobileMenu() {
  const overlay = document.getElementById('mobile-menu-overlay');
  if (overlay) {
    overlay.classList.toggle('visible');
  }
}

// ==========================================================================
// PIXEL ART BLOOMING FLOWER ENGINE
// ==========================================================================

// Color Palette Maps
const PALETTES = {
  rose: {
    '.': '#1a1a1a', // outline
    'r': '#e63946', // bright red
    'd': '#9b2226', // dark red
    'm': '#ae2012', // medium red
    'p': '#ff8fa3', // pink highlight
    'g': '#2b9348', // stem green
    'l': '#55a630', // light green leaf
    ' ': 'transparent'
  },
  daisy: {
    '.': '#1a1a1a', // outline
    'o': '#f77f00', // orange petal
    'y': '#fcbf49', // yellow petal
    'w': '#ffffff', // white highlight
    'p': '#d90429', // pink center
    'c': '#ffb703', // center highlight
    'g': '#2b9348',
    ' ': 'transparent'
  },
  tulip: {
    '.': '#1a1a1a', // outline
    'm': '#d90429', // dark tulip red
    'p': '#ff4d6d', // hot pink
    's': '#ff8fa3', // soft pink
    'l': '#ffccd5', // light pink
    'g': '#2b9348', // stem green
    ' ': 'transparent'
  },
  sunflower: {
    '.': '#1a1a1a', // outline
    'y': '#ffca3a', // bright yellow
    'o': '#ff924c', // dark yellow/orange
    'b': '#582f0e', // brown center
    'd': '#3c1b00', // dark brown
    'g': '#2b9348', // stem green
    ' ': 'transparent'
  }
};

// 18x18 Pixel Art Flower Sprites
const SPRITE_ROSE = [
  "      ......      ",
  "    ..pppppp..    ",
  "   .ppmmmmmmpp.   ",
  "  .ppmmrrddrrmp.  ",
  " .pmrrddddddrrrm. ",
  " .mrrddrrrrrrrdm. ",
  ".mrrrdrrpppprrdrm.",
  ".mrrrdmpppppprdrm.",
  ".mrrrdmpppppprdrm.",
  ".mrrrrddppdrrrdrm.",
  " .mrrrrrdddrrrrm. ",
  "  .mmrrrrrrrrrm.  ",
  "   ..mmrrrrrm..   ",
  "     ........     ",
  "        ..        ",
  "      ..gg..      ",
  "     .lgggg.      ",
  "      ..gg..      "
];

const SPRITE_DAISY = [
  "      ......      ",
  "    ..yyyyyy..    ",
  "   .yyoowoowwyy.  ",
  "  .yoowwccwwooy.  ",
  " .yowwccccccwwoy. ",
  " .yowccppppccwoy. ",
  ".yowcpppppppcwoy.",
  ".yowcpppppppcwoy.",
  ".yoocppppppcoooy.",
  " .yooccppccccooy. ",
  " .yoowccccccwoy.  ",
  "  .yyoowwwwooy.   ",
  "   ..yyyyyy..     ",
  "     ......       ",
  "       ..         ",
  "     ..gg..       ",
  "      .gggg.      ",
  "       ..gg.      "
];

const SPRITE_TULIP = [
  "      ......      ",
  "    ..ssssss..    ",
  "   .ssllllllss.   ",
  "  .sllpppppplls.  ",
  " .slppppppppppls. ",
  " .lppppmmmmppppl. ",
  ".lpppmmmmmmmmpppl.",
  ".lppmmmmmmmmmmppl.",
  ".lppmmmmmmmmmmppl.",
  ".lppmmmmmmmmmmppl.",
  " .lppppmmmmppppl. ",
  "  .llppppppppll.  ",
  "   ..llllllll..   ",
  "     ........     ",
  "        ..        ",
  "      ..gg..      ",
  "      .gggg.      ",
  "      ..gg..      "
];

const SPRITE_SUNFLOWER = [
  "      ......      ",
  "    ..yyyyyy..    ",
  "   .yyoowoowwyy.  ",
  "  .yoowwddwwooy.  ",
  " .yowwddddddwwoy. ",
  " .yowddbbbbddwoy. ",
  ".yowdbbbbbbbdwoy.",
  ".yowdbbbbbbbdwoy.",
  ".yoodbbbbbbdoooy.",
  " .yoodddddddooy. ",
  " .yoowddddwoy.  ",
  "  .yyoowwwwooy.   ",
  "   ..yyyyyy..     ",
  "     ......       ",
  "       ..         ",
  "     ..gg..       ",
  "      .gggg.      ",
  "       ..gg.      "
];

// Global state for Flower Rain overlay
let flowerRainActive = false;
let flowerCanvas = null;
let flowerCtx = null;
let flowerList = [];
let totalFlowersSent = 0;
let flowerRainAnimationId = null;
let lastAutoSpawnTime = 0;

// English words of endearment to float up when clicked
const FLOWER_MESSAGES = [
  "For My Grumpy Love! ❤️",
  "So cute! 🥰",
  "Awang Loves Ayuni! 🤍",
  "Muahh! 💋",
  "Miss you so much! 🥺",
  "Flowers for you 🌹",
  "Luv u, my love! ✨",
  "You are mine! 👑",
  "Love you forever 💐",
  "Don't be grumpy 😊",
  "You are perfect 🧸",
  "My grumpy baby 🌸"
];

class PixelBloomingFlower {
  constructor(x, y, isClicked = false, spriteType = null) {
    this.x = x;
    this.y = y;
    this.isClicked = isClicked;
    this.scale = 0;
    this.bloomProgress = 0;
    
    // Staggered flower types
    const types = ['rose', 'daisy', 'tulip', 'sunflower'];
    this.type = spriteType || types[Math.floor(Math.random() * types.length)];
    
    const spriteMaps = {
      rose: SPRITE_ROSE,
      daisy: SPRITE_DAISY,
      tulip: SPRITE_TULIP,
      sunflower: SPRITE_SUNFLOWER
    };
    this.sprite = spriteMaps[this.type];
    this.palette = PALETTES[this.type];
    
    // Choose size based on viewport
    const baseMin = window.innerWidth < 768 ? 26 : 42;
    const baseMax = window.innerWidth < 768 ? 38 : 62;
    this.size = Math.random() * (baseMax - baseMin) + baseMin;
    
    // How fast it blooms
    this.growSpeed = Math.random() * 0.02 + 0.012;
    
    // Physics
    this.vy = isClicked ? (Math.random() * 1.6 + 1.0) : (Math.random() * 2.0 + 1.4);
    this.vx = (Math.random() - 0.5) * 1.0;
    this.wobbleSpeed = Math.random() * 0.03 + 0.015;
    this.wobblePhase = Math.random() * Math.PI * 2;
    
    this.rotation = (Math.random() - 0.5) * 0.3; // small initial tilt
    this.vRotation = (Math.random() - 0.5) * 0.008;
    
    this.alpha = 1.0;
    this.state = 'falling'; // 'falling', 'landing', 'fading'
    this.sparkles = [];
  }
  
  update(width, height) {
    // 1. Grow/bloom
    if (this.bloomProgress < 1) {
      this.bloomProgress += this.growSpeed;
      if (this.bloomProgress > 1) this.bloomProgress = 1;
    }
    this.scale = this.bloomProgress;
    
    // 2. Spawn and update sparkles
    if (Math.random() < 0.15 && this.bloomProgress < 0.95) {
      this.sparkles.push({
        x: (Math.random() - 0.5) * (this.size * 0.5),
        y: (Math.random() - 0.5) * (this.size * 0.5),
        alpha: 1.0,
        decay: Math.random() * 0.035 + 0.018,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.4 ? '#ffccd5' : '#fcbf49'
      });
    }
    
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      this.sparkles[i].alpha -= this.sparkles[i].decay;
      if (this.sparkles[i].alpha <= 0) {
        this.sparkles.splice(i, 1);
      }
    }
    
    // 3. Falling and landing logic
    if (this.state === 'falling') {
      this.y += this.vy;
      this.x += this.vx + Math.sin(this.wobblePhase) * 0.25;
      this.wobblePhase += this.wobbleSpeed;
      this.rotation += this.vRotation;
      
      // Stop falling and settle on the floor (leave margin for pile)
      if (this.y >= height - 35) {
        this.y = height - 35;
        this.state = 'landing';
        this.vy = 0;
        this.vx = 0;
        this.vRotation = 0;
        setTimeout(() => {
          this.state = 'fading';
        }, Math.random() * 2500 + 2000); // stay on bottom for 2-4.5s
      }
    } else if (this.state === 'fading') {
      this.alpha -= 0.015; // fade out smoothly
      if (this.alpha <= 0) {
        return false;
      }
    }
    
    return true;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    // Draw sparkles first (behind or around)
    this.sparkles.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha * this.alpha;
      ctx.beginPath();
      ctx.arc(this.x + s.x, this.y + s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.globalAlpha = this.alpha;
    
    const currentSize = this.size * this.scale;
    const gridW = this.sprite[0].length;
    const gridH = this.sprite.length;
    const pixelSize = currentSize / Math.max(gridW, gridH);
    
    // Offset to draw around the center
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    const offsetX = - (gridW * pixelSize) / 2;
    const offsetY = - (gridH * pixelSize) / 2;
    
    // Render pixel grid sharp
    ctx.imageSmoothingEnabled = false;
    
    for (let r = 0; r < gridH; r++) {
      for (let c = 0; c < gridW; c++) {
        const char = this.sprite[r][c];
        if (char !== ' ') {
          ctx.fillStyle = this.palette[char];
          ctx.fillRect(
            Math.floor(offsetX + c * pixelSize), 
            Math.floor(offsetY + r * pixelSize), 
            Math.ceil(pixelSize), 
            Math.ceil(pixelSize)
          );
        }
      }
    }
    
    ctx.restore();
  }
}

// Initialise FAB button behaviors and state
function initFlowerRain() {
  flowerCanvas = document.getElementById('flower-rain-canvas');
  if (flowerCanvas) {
    flowerCtx = flowerCanvas.getContext('2d');
  }
  
  // Set up resize handler
  window.addEventListener('resize', () => {
    if (flowerCanvas && flowerRainActive) {
      flowerCanvas.width = window.innerWidth;
      flowerCanvas.height = window.innerHeight;
    }
  });
  
  // Retrieve counter from storage
  totalFlowersSent = parseInt(localStorage.getItem('total_flowers_sent') || '0');
  const counterVal = document.getElementById('flower-counter-val');
  if (counterVal) {
    counterVal.textContent = totalFlowersSent.toLocaleString();
  }
  
  // Add screen click/tap interaction to spawn flowers and float text
  if (flowerCanvas) {
    const triggerSpawn = (e) => {
      if (!flowerRainActive) return;
      
      const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
      
      if (clientX !== undefined && clientY !== undefined) {
        // Spawn 3 flowers per click
        for (let i = 0; i < 3; i++) {
          const spreadX = (Math.random() - 0.5) * 40;
          const spreadY = (Math.random() - 0.5) * 40;
          spawnFlower(clientX + spreadX, clientY + spreadY, true);
        }
        
        // Spawn one beautiful text bubble
        spawnFloatingText(clientX, clientY);
      }
    };
    
    flowerCanvas.addEventListener('mousedown', triggerSpawn);
    flowerCanvas.addEventListener('touchstart', triggerSpawn, { passive: true });
  }
  
  // Handle explicit click and touchstart on FAB with stopPropagation and preventDefault
  const fab = document.getElementById('flower-fab');
  if (fab) {
    const handleFabTrigger = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openFlowerRain();
    };
    fab.addEventListener('click', handleFabTrigger);
    fab.addEventListener('touchstart', handleFabTrigger, { passive: false });
  }

  // Handle explicit click and touchstart on Close Button with stopPropagation and preventDefault
  const closeBtn = document.querySelector('.flower-close-btn');
  if (closeBtn) {
    const handleCloseTrigger = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeFlowerRain();
    };
    closeBtn.addEventListener('click', handleCloseTrigger);
    closeBtn.addEventListener('touchstart', handleCloseTrigger, { passive: false });
  }
}

// Show/Hide Floating Action Button
function showFlowerFab() {
  const fab = document.getElementById('flower-fab');
  if (fab && localStorage.getItem('love_session') === 'true') {
    fab.classList.remove('hidden');
  }
}

// Hide Floating Action Button
function hideFlowerFab() {
  const fab = document.getElementById('flower-fab');
  if (fab) {
    fab.classList.add('hidden');
  }
}

// Open Overlay and start rain loop
function openFlowerRain() {
  const overlay = document.getElementById('flower-rain-overlay');
  if (!overlay || !flowerCanvas) return;
  
  flowerRainActive = true;
  hideFlowerFab();
  
  // Prevent main content from scrolling
  const mainContent = document.getElementById('main-content');
  if (mainContent) mainContent.style.overflow = 'hidden';
  
  // Set canvas size
  flowerCanvas.width = window.innerWidth;
  flowerCanvas.height = window.innerHeight;
  
  // Reset lists
  flowerList = [];
  
  // Show overlay
  overlay.classList.add('visible');
  
  // Start engine loop
  lastAutoSpawnTime = performance.now();
  if (flowerRainAnimationId) {
    cancelAnimationFrame(flowerRainAnimationId);
  }
  flowerRainAnimationId = requestAnimationFrame(renderFlowerRainLoop);
  
  // Initial blast of falling flowers
  const count = window.innerWidth < 768 ? 10 : 25;
  for (let i = 0; i < count; i++) {
    const rx = Math.random() * flowerCanvas.width;
    const ry = Math.random() * -flowerCanvas.height * 0.8;
    spawnFlower(rx, ry, false);
  }
}

// Close Overlay and stop loop
function closeFlowerRain() {
  const overlay = document.getElementById('flower-rain-overlay');
  if (!overlay) return;
  
  flowerRainActive = false;
  showFlowerFab();
  
  // Restore main content scrolling
  const mainContent = document.getElementById('main-content');
  if (mainContent) mainContent.style.overflow = 'auto';
  
  overlay.classList.remove('visible');
  
  if (flowerRainAnimationId) {
    cancelAnimationFrame(flowerRainAnimationId);
    flowerRainAnimationId = null;
  }
  
  // Clear the canvas
  if (flowerCtx) {
    flowerCtx.clearRect(0, 0, flowerCanvas.width, flowerCanvas.height);
  }
}

// Spawn flower helper
function spawnFlower(x, y, isClicked = false) {
  flowerList.push(new PixelBloomingFlower(x, y, isClicked));
  
  if (isClicked) {
    totalFlowersSent++;
    localStorage.setItem('total_flowers_sent', totalFlowersSent);
    const counterVal = document.getElementById('flower-counter-val');
    if (counterVal) {
      counterVal.textContent = totalFlowersSent.toLocaleString();
    }
  }
}

// Float text popup bubbles helper
function spawnFloatingText(x, y) {
  const container = document.getElementById('flower-message-container');
  if (!container) return;
  
  const bubble = document.createElement('div');
  bubble.className = 'floating-flower-text';
  
  // Choose random sweet message
  const msg = FLOWER_MESSAGES[Math.floor(Math.random() * FLOWER_MESSAGES.length)];
  bubble.textContent = msg;
  
  // Set coordinate and spread
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  
  container.appendChild(bubble);
  
  // Automatically clean up DOM element after animation ends
  setTimeout(() => {
    bubble.remove();
  }, 2200);
}

// Animation loop
function renderFlowerRainLoop(timestamp) {
  if (!flowerRainActive || !flowerCtx || !flowerCanvas) return;
  
  // Auto spawn new falling flowers over time
  const autoSpawnInterval = window.innerWidth < 768 ? 600 : 350; // ms
  if (timestamp - lastAutoSpawnTime > autoSpawnInterval) {
    const rx = Math.random() * flowerCanvas.width;
    spawnFlower(rx, -40, false);
    lastAutoSpawnTime = timestamp;
  }
  
  // Clear canvas
  flowerCtx.clearRect(0, 0, flowerCanvas.width, flowerCanvas.height);
  
  // Update and draw all active flowers
  for (let i = flowerList.length - 1; i >= 0; i--) {
    const flower = flowerList[i];
    const isAlive = flower.update(flowerCanvas.width, flowerCanvas.height);
    if (isAlive) {
      flower.draw(flowerCtx);
    } else {
      flowerList.splice(i, 1);
    }
  }
  
  flowerRainAnimationId = requestAnimationFrame(renderFlowerRainLoop);
}

// --- MOOD TRACKER (BILIK EMOSI) CONFIGURATION & ACTIONS ---
const MOOD_RESPONSES = {
  happy: {
    text: "Seeing you happy is literally the best thing in my life. Keep smiling okay, you look super cute when you smile! 😊❤️",
    author: "I love you"
  },
  grumpy: {
    text: "Are you grumpy or mad at me? 😡 Pls don't be mad... here is a cascade of pixel flowers to cheer you up! 🌹",
    author: "I got you"
  },
  sulking: {
    text: "Are you sulking? 🥺 I'm so sorry if I did anything wrong. Sending you a big virtual hug and a special rain of pixel flowers! 💐",
    author: "I'm sorry ❤️"
  },
  tired: {
    text: "Are you tired? 😴 Go get some rest okay. I'm always here to listen to you and keep you comfy. I got your back. 😴💤",
    author: "Rest well"
  },
  missyou: {
    text: "I miss you so, so much too! Hang in there. Next time we meet, I'm gonna hug you so tight. Luv u! 🤍✨",
    author: "Miss you more"
  }
};

// Load saved mood on startup
function loadSavedMood() {
  const savedMood = localStorage.getItem('ayuni_current_mood');
  if (savedMood && MOOD_RESPONSES[savedMood]) {
    selectMood(savedMood, false);
  }
}

// Handle mood selection and trigger effects
function selectMood(moodName, triggerActions = true) {
  const responseCard = document.getElementById('mood-response-card');
  if (!responseCard || !MOOD_RESPONSES[moodName]) return;
  
  // 1. Remove active state from all buttons
  const buttons = document.querySelectorAll('.mood-btn');
  buttons.forEach(btn => btn.classList.remove('active-mood'));
  
  // 2. Add active state to selected button
  const selectedBtn = document.getElementById(`mood-${moodName}`);
  if (selectedBtn) {
    selectedBtn.classList.add('active-mood');
  }
  
  // 3. Save to localStorage
  localStorage.setItem('ayuni_current_mood', moodName);
  
  // 4. Update response text with reflow-triggered animation
  const res = MOOD_RESPONSES[moodName];
  
  responseCard.style.animation = 'none';
  responseCard.offsetHeight; // trigger reflow
  responseCard.style.animation = 'cardFadeIn 0.5s ease-out';
  
  responseCard.innerHTML = `
    <div class="mood-response-text">"${res.text}"</div>
    <div class="mood-response-author">— ${res.author}</div>
  `;
  
  // 5. Trigger special actions (only if clicked manually)
  if (!triggerActions) return;
  
  if (moodName === 'grumpy' || moodName === 'sulking') {
    // Blast small explosion at the button
    if (selectedBtn) {
      const rect = selectedBtn.getBoundingClientRect();
      spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 0.8);
    }
    
    // Auto-launch flower rain after 1.5 seconds
    setTimeout(() => {
      openFlowerRain();
      const hudTitle = document.querySelector('.flower-hud-title');
      if (hudTitle) {
        hudTitle.textContent = moodName === 'grumpy' ? "Cheering Up My Grumpy Love 😡🌹" : "Cheering Up My Sulking Love 🥺💐";
      }
    }, 1500);
    
  } else if (moodName === 'missyou') {
    // Fire multiple heart explosions across the screen
    let explosionCount = 0;
    const triggerHeartExplosions = setInterval(() => {
      const rx = Math.random() * window.innerWidth;
      const ry = Math.random() * window.innerHeight;
      spawnExplosion(rx, ry, 1.2);
      explosionCount++;
      if (explosionCount >= 5) {
        clearInterval(triggerHeartExplosions);
      }
    }, 350);
    
  } else if (moodName === 'happy') {
    // Triple spark burst
    if (selectedBtn) {
      const rect = selectedBtn.getBoundingClientRect();
      spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 1.2);
      setTimeout(() => {
        spawnExplosion(rect.left + rect.width/2 - 100, rect.top + rect.height/2 - 100, 0.9);
        spawnExplosion(rect.left + rect.width/2 + 100, rect.top + rect.height/2 - 100, 0.9);
      }, 300);
    }
  } else if (moodName === 'tired') {
    // Slow down background particle physics for 8 seconds
    transitionSpeedMultiplier = 0.35;
    setTimeout(() => {
      transitionSpeedMultiplier = 1.0;
    }, 8000);
  }
}

