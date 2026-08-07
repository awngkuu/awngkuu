// AWNGKUU Static digital hub main logic script
// Integrates GSAP, ScrollTrigger, Lenis, and Lucide in Vanilla JS

document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Initialize Lucide Icons
  lucide.createIcons();

  // Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1.05,
  });

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Disable scrolling during preloader
  lenis.stop();

  // 1. Cinematic Preloader
  const preloaderWords = [
    "INITIALIZING SYSTEMS",
    "LOADING INTERFACE",
    "CONNECTING TO PORTAL",
    "AWANG KU MUHAMMAD WAFIQ AIMAN",
    "WELCOME TO MY WORLD"
  ];
  
  const counterVal = { val: 0 };
  const preloaderText = document.getElementById("preloader-text");
  const preloaderCounter = document.getElementById("preloader-counter");
  const preloaderBar = document.getElementById("preloader-bar");
  const preloaderContainer = document.getElementById("preloader");

  const preloaderTl = gsap.timeline({
    onComplete: () => {
      // Exit animations
      const exitTl = gsap.timeline({
        onComplete: () => {
          preloaderContainer.style.display = "none";
          lenis.start(); // Unlock scrolling
          ScrollTrigger.refresh(); // Recalculate heights for ScrollTrigger
        }
      });

      exitTl.to([preloaderText, preloaderCounter, preloaderBar.parentElement], {
        opacity: 0,
        y: -40,
        duration: 0.5,
        ease: "power3.in"
      });

      exitTl.to(preloaderContainer, {
        yPercent: -100,
        duration: 1.0,
        ease: "power4.inOut"
      }, "-=0.15");
      
      // Trigger Hero elements entrance animations
      animateHeroReveal();
    }
  });

  preloaderTl.to(counterVal, {
    val: 100,
    duration: 2.8,
    ease: "power2.out",
    onUpdate: () => {
      const current = Math.floor(counterVal.val);
      preloaderCounter.textContent = `${current}%`;
      
      // Update text index based on progress
      const wordIdx = Math.min(
        Math.floor((current / 100) * preloaderWords.length),
        preloaderWords.length - 1
      );
      preloaderText.textContent = preloaderWords[wordIdx];
    }
  });

  gsap.fromTo([preloaderText, preloaderCounter], 
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15 }
  );

  gsap.fromTo(preloaderBar,
    { scaleX: 0 },
    { scaleX: 1, duration: 2.8, ease: "power2.out" }
  );

  // Custom Cursor Disabled - Default cursor active

  // 3. Background Constellation Canvas
  const bgCanvas = document.getElementById("bg-particle-canvas");
  const ctx = bgCanvas.getContext("2d");
  
  let w = (bgCanvas.width = window.innerWidth);
  let h = (bgCanvas.height = window.innerHeight);

  const particles = [];
  const maxParticles = 65;
  const colors = ["#10b981", "#22c55e", "#059669", "#84cc16", "#ffffff"];
  const mouseCoords = { x: 0, y: 0, active: false };

  window.addEventListener("resize", () => {
    w = bgCanvas.width = window.innerWidth;
    h = bgCanvas.height = window.innerHeight;
  });

  window.addEventListener("mousemove", (e) => {
    mouseCoords.x = e.clientX;
    mouseCoords.y = e.clientY;
    mouseCoords.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouseCoords.active = false;
  });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (mouseCoords.active) {
        const dx = mouseCoords.x - this.x;
        const dy = mouseCoords.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180) {
          const force = (180 - dist) / 180;
          this.vx += (dx / dist) * force * 0.015;
          this.vy += (dy / dist) * force * 0.015;
          
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (speed > 1.2) {
            this.vx = (this.vx / speed) * 1.2;
            this.vy = (this.vy / speed) * 1.2;
          }
        }
      }

      this.vx *= 0.98;
      this.vy *= 0.98;

      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  function renderConstellation(timestamp) {
    ctx.clearRect(0, 0, w, h);

    // Dynamic radial gradient spotlight
    const grad = ctx.createRadialGradient(
      mouseCoords.active ? mouseCoords.x : w / 2,
      mouseCoords.active ? mouseCoords.y : h / 2,
      10,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.8
    );
    grad.addColorStop(0, "rgba(10, 25, 15, 0.45)");
    grad.addColorStop(0.5, "rgba(3, 8, 5, 0.95)");
    grad.addColorStop(1, "rgba(2, 2, 3, 1)");
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw lines
    ctx.lineWidth = 0.5;
    for (let i = 0; i < maxParticles; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < maxParticles; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 90) {
          const alpha = (90 - dist) / 90 * 0.05;
          ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1.0;
    requestAnimationFrame(renderConstellation);
  }
  requestAnimationFrame(renderConstellation);

  // 4. Hero Section Animations
  const heroRoles = [
    "Maritime Informatics Student 🚢",
    "Web Developer @ Liash Trading 💻",
    "Future Full-Stack Developer 🚀",
    "Creative Web Designer 🎨",
    "Ex-Football Dreamer ⚽",
    "Guitar Jammer 🎸",
    "180cm / 85kg 🤫"
  ];
  let currentRoleIdx = 0;
  const heroRoleEl = document.getElementById("hero-role");

  setInterval(() => {
    currentRoleIdx = (currentRoleIdx + 1) % heroRoles.length;
    gsap.to(heroRoleEl, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      onComplete: () => {
        heroRoleEl.textContent = heroRoles[currentRoleIdx];
        gsap.fromTo(heroRoleEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
      }
    });
  }, 3000);

  function animateHeroReveal() {
    // Populate letters stagger in firstname & lastname
    const firstNameContainer = document.getElementById("hero-firstname");
    const lastNameContainer = document.getElementById("hero-lastname");

    firstNameContainer.innerHTML = "AWANG KU".split(" ").map(word => 
      `<span class="inline-block mr-4">${word.split("").map(c => `<span class="hero-char inline-block opacity-0">${c}</span>`).join("")}</span>`
    ).join("");

    lastNameContainer.innerHTML = "WAFIQ AIMAN".split(" ").map(word => 
      `<span class="inline-block mr-4">${word.split("").map(c => `<span class="hero-char inline-block opacity-0">${c}</span>`).join("")}</span>`
    ).join("");

    // Set initial transform state using GSAP to avoid Tailwind variable conflicts
    gsap.set(".hero-char", { opacity: 0, y: 35 });

    const tl = gsap.timeline();
    tl.to(".hero-char", {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.05,
      ease: "power4.out"
    });

    tl.fromTo("#hero-role", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    );

    tl.fromTo("#hero button",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
      "-=0.4"
    );

    // Parallax scroll effects
    gsap.to(".hero-parallax", {
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      },
      y: (i, target) => {
        const speed = target.dataset.speed || 0.3;
        return window.innerHeight * speed;
      },
      opacity: 0
    });
  }

  // 5. Word Reveal animation in About section
  const aboutTextEl = document.getElementById("about-reveal-text");
  const rawText = aboutTextEl.textContent.trim().replace(/\s+/g, " ");
  aboutTextEl.innerHTML = rawText.split(" ").map(word => 
    `<span class="reveal-word inline-block mr-2 opacity-20 transition-all">${word}</span>`
  ).join(" ");

  gsap.to(".reveal-word", {
    scrollTrigger: {
      trigger: aboutTextEl,
      start: "top 80%",
      end: "bottom 55%",
      scrub: 0.5
    },
    opacity: 1,
    color: "#ffffff",
    stagger: 0.04
  });

  // Stagger about-cards slide-in
  gsap.fromTo(".about-card",
    { opacity: 0, y: 40 },
    {
      scrollTrigger: {
        trigger: ".about-card-container",
        start: "top 85%"
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out"
    }
  );

  // 6. Journey Timeline Builder & Animation
  const timelineData = [
    { id: "birth", emoji: "👶", title: "Born in Johor Bahru", period: "2004", subtitle: "The Legend Begins", description: "Born in Johor Bahru in 2004. Raised in Tebrau before moving to Ulu Tiram, Johor. The youngest child (anak ke-2 dari 2 adik beradik), naturally pampered but destined for greatness." },
    { id: "primary", emoji: "🪖", title: "The Soldier Dream", period: "Primary School", subtitle: "Defending the Nation", description: "Had a burning ambition to become an army soldier. Used to run around with toy guns, way before realizing that compiler bugs are the real enemies to fight." },
    { id: "football", emoji: "⚽", title: "The Football Dream", period: "High School", subtitle: "Dreaming of the Pitch", description: "Switched targets to the football field. Tall at 180cm, I aimed to play professional football—until my stamina decided to take an early retirement." },
    { id: "school", emoji: "🎸", title: "Guitars & Gaming", period: "Teenage Era", subtitle: "Rockstar Wannabe", description: "Discovered the guitar and spent hours learning chords. Simultaneously became a professional couch potato playing Mobile Legends, eFootball, and eventually Valorant." },
    { id: "umt", emoji: "🚢", title: "UMT (Maritime Informatics)", period: "Present Focus", subtitle: "Surviving Computer Science", description: "Joined Universiti Malaysia Terengganu under Computer Science (Maritime Informatics). Balancing complex theories, algorithms, and interface design to build a solid foundation." },
    { id: "internship", emoji: "💼", title: "Intern @ Liash Trading", period: "Internship Era", subtitle: "Web Developer", description: "Currently working as an intern web developer at Liash Trading. Designing real-world web applications, polishing front-end layouts, and getting hands-on experience in modern web systems." },
    { id: "future", emoji: "🚀", title: "The Real Goal", period: "Beyond", subtitle: "Full-Stack Developer & Designer", description: "Graduating from UMT to become a high-caliber Full-Stack Developer and Web Designer. Building premium responsive web systems and retiring rich to buy more guitars." }
  ];

  const timelineContainer = document.getElementById("timeline-container");
  
  timelineContainer.innerHTML = timelineData.map((item, idx) => {
    const isEven = idx % 2 === 0;
    return `
      <div class="relative flex flex-col md:flex-row items-center w-full ${isEven ? "md:flex-row-reverse" : ""}">
        <!-- Node point -->
        <div id="journey-node-${item.id}" class="absolute left-4 md:left-1/2 top-6 md:top-1/2 w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-700 -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"></div>
        
        <!-- Card side -->
        <div class="w-full md:w-1/2 pl-10 pr-4 md:px-12 text-left">
          <div id="journey-card-${item.id}" class="opacity-0 translate-y-8 transition-all duration-700">
            <div class="glass relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ease-out" data-tilt="true" glow-color="${isEven ? "rgba(16, 185, 129, 0.15)" : "rgba(34, 197, 94, 0.15)"}">
              <div class="flex justify-between items-center mb-3">
                <span class="font-code text-xs text-neon-cyan tracking-wider">${item.period}</span>
                <span class="text-xl">${item.emoji}</span>
              </div>
              <h3 class="font-display font-bold text-white text-lg md:text-xl mb-1">${item.title}</h3>
              <h4 class="font-sans text-xs text-zinc-400 font-medium tracking-wide mb-3">${item.subtitle}</h4>
              <p class="font-sans text-sm text-zinc-500 leading-relaxed">${item.description}</p>
            </div>
          </div>
        </div>

        <!-- Empty spacer on desktop -->
        <div class="hidden md:block w-1/2"></div>
      </div>
    `;
  }).join("");

  // Timeline glow line update
  gsap.fromTo("#timeline-glow", 
    { scaleY: 0 },
    {
      scrollTrigger: {
        trigger: "#journey",
        start: "top 65%",
        end: "bottom 70%",
        scrub: true
      },
      scaleY: 1,
      ease: "none"
    }
  );

  // Timeline nodes lighting and cards slide in
  timelineData.forEach(item => {
    const nodeId = `#journey-node-${item.id}`;
    const cardId = `#journey-card-${item.id}`;

    gsap.to(nodeId, {
      scrollTrigger: {
        trigger: nodeId,
        start: "top 75%",
        end: "top 40%",
        toggleActions: "play reverse play reverse"
      },
      backgroundColor: "#22c55e",
      borderColor: "#10b981",
      boxShadow: "0 0 20px rgba(34, 197, 94, 0.8)",
      scale: 1.35,
      duration: 0.35
    });

    gsap.to(cardId, {
      scrollTrigger: {
        trigger: cardId,
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  // 7. Bento Grid Explorer Cards population
  const bentoData = [
    { id: "portfolio", title: "Portfolio", subtitle: "My professional showcase & projects", icon: "briefcase", gridClass: "md:col-span-2 md:row-span-1", route: "#", glow: "rgba(16, 185, 129, 0.2)", iconColor: "text-neon-violet" },
    { id: "projects", title: "Projects", subtitle: "Open source & personal repositories", icon: "folder-git-2", gridClass: "md:col-span-1 md:row-span-1", route: "#", glow: "rgba(34, 197, 94, 0.2)", iconColor: "text-neon-cyan" },
    { id: "blog", title: "Blog", subtitle: "Writings on tech & lessons learned", icon: "book-open", gridClass: "md:col-span-1 md:row-span-1", route: "#", glow: "rgba(132, 204, 22, 0.2)", iconColor: "text-neon-pink" },
    { id: "games", title: "Games Hub", subtitle: "Take a break, play classic arcade challenges", icon: "gamepad-2", gridClass: "md:col-span-2 md:row-span-1", route: "games.html", glow: "rgba(245, 158, 11, 0.25)", iconColor: "text-amber-500" },
    { id: "movies", title: "Movies", subtitle: "Cinematic favorites & rating logs", icon: "film", gridClass: "md:col-span-1 md:row-span-1", route: "#", glow: "rgba(239, 68, 68, 0.2)", iconColor: "text-red-500" },
    { id: "love-core", title: "Love Core", subtitle: "Heartbeat timer & decryptor vault", icon: "heart", gridClass: "md:col-span-1 md:row-span-1", route: "love.html", glow: "rgba(244, 63, 94, 0.25)", iconColor: "text-neon-rose" },
    { id: "private", title: "Private Portal", subtitle: "Secure developer dashboard & vault", icon: "lock", gridClass: "md:col-span-4 md:row-span-1", route: "#", glow: "rgba(99, 102, 241, 0.2)", iconColor: "text-indigo-500" }
  ];

  const bentoContainer = document.getElementById("bento-container");
  
  bentoContainer.innerHTML = bentoData.map(item => `
    <a href="${item.route}" class="bento-card group flex min-h-[160px] md:h-full ${item.gridClass}" data-hover="true">
      <div class="glass relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ease-out flex flex-col justify-between w-full h-full select-none cursor-pointer" data-tilt="true" glow-color="${item.glow}">
        <div class="flex justify-between items-start w-full relative z-10">
          <div class="p-2.5 bg-white/5 rounded-xl ${item.iconColor} group-hover:scale-110 transition-transform duration-300">
            <i data-lucide="${item.icon}" class="w-8 h-8"></i>
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
            <i data-lucide="arrow-up-right" class="w-5 h-5 text-white/50 group-hover:text-white"></i>
          </div>
        </div>
        
        <div class="relative z-10">
          <h3 class="font-display font-bold text-white text-lg md:text-xl flex items-center gap-2 mb-1">${item.title}</h3>
          <p class="font-sans text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">${item.subtitle}</p>
        </div>
      </div>
    </a>
  `).join("");

  // Staggered reveal for bento cards
  gsap.fromTo(".bento-card",
    { opacity: 0, scale: 0.9, y: 30 },
    {
      scrollTrigger: {
        trigger: "#bento-container",
        start: "top 80%"
      },
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "power2.out"
    }
  );



  // 9. Tech Stack marquee rows injection
  const techRow1 = [
    { name: "HTML", cat: "frontend" },
    { name: "CSS", cat: "frontend" },
    { name: "JavaScript", cat: "frontend" },
    { name: "TypeScript", cat: "frontend" },
    { name: "React", cat: "frontend" },
    { name: "Next.js", cat: "frontend" },
    { name: "Tailwind CSS", cat: "frontend" }
  ];

  const techRow2 = [
    { name: "Node.js", cat: "backend" },
    { name: "Java", cat: "backend" },
    { name: "Python", cat: "backend" },
    { name: "MySQL", cat: "backend" },
    { name: "Git", cat: "tool" },
    { name: "GitHub", cat: "tool" },
    { name: "Docker", cat: "tool" }
  ];

  const track1 = document.getElementById("marquee-track-1");
  const track2 = document.getElementById("marquee-track-2");

  // Triple entries for smooth seamless loop
  const buildBadgesHtml = (arr) => [...arr, ...arr, ...arr].map(t => `
    <div class="tech-badge ${t.cat} mx-3" data-hover="true">
      <span class="mr-2 opacity-50">//</span> ${t.name}
    </div>
  `).join("");

  track1.innerHTML = buildBadgesHtml(techRow1);
  track2.innerHTML = buildBadgesHtml(techRow2);

  // 10. Social Circles
  const socials = [
    { 
      name: "GitHub", 
      url: "https://github.com/awngkuu", 
      svg: `<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>`, 
      cls: "hover:text-white hover:border-white/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
    },
    { 
      name: "LinkedIn", 
      url: "https://www.linkedin.com/in/awngkuu", 
      svg: `<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764c.966 0 1.75.79 1.75 1.764s-.784 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`, 
      cls: "hover:text-[#0077b5] hover:border-[#0077b5]/50 hover:shadow-[0_0_30px_rgba(0,119,181,0.25)]" 
    },
    { 
      name: "Email", 
      url: "mailto:wafiqaiman7@gmail.com", 
      svg: `<svg class="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`, 
      cls: "hover:text-neon-cyan hover:border-neon-cyan/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.25)]" 
    },
    { 
      name: "Instagram", 
      url: "https://instagram.com/awngkuu", 
      svg: `<svg class="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`, 
      cls: "hover:text-neon-pink hover:border-neon-pink/50 hover:shadow-[0_0_30px_rgba(132,204,22,0.25)]" 
    }
  ];

  const socialsContainer = document.getElementById("socials-container");
  socialsContainer.innerHTML = socials.map(s => `
    <div data-magnetic="0.4">
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-circle group flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-zinc-900 bg-zinc-950/40 text-zinc-500 transition-all duration-300 ${s.cls}" data-hover="true">
        ${s.svg}
      </a>
    </div>
  `).join("");

  gsap.fromTo(".social-circle",
    { opacity: 0, scale: 0.7, y: 30 },
    {
      scrollTrigger: {
        trigger: "#socials-container",
        start: "top 85%"
      },
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.7,
      ease: "back.out(1.5)",
      stagger: 0.1
    }
  );

  // Refresh Lucide to apply newly injected icons
  lucide.createIcons();

  // 11. Custom 3D Card Tilts
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest("[data-tilt='true']");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tilt = 12; // tilt angle strength
    const rotateY = (x - centerX) / (rect.width / 2) * tilt;
    const rotateX = -(y - centerY) / (rect.height / 2) * tilt;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Gradient Glow follow mouse spotlight
    const glowColor = card.getAttribute("glow-color") || "rgba(255, 255, 255, 0.05)";
    card.style.backgroundImage = `radial-gradient(350px circle at ${x}px ${y}px, ${glowColor}, transparent 80%)`;
  });

  // Reset tilts on mouseleave
  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest("[data-tilt='true']");
    if (!card) return;
    
    // Check if the cursor really left the card boundary
    const related = e.relatedTarget;
    if (related && card.contains(related)) return;

    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    card.style.backgroundImage = "none";
  });

  // 12. Custom Magnetic Attraction Pull
  document.addEventListener("mousemove", (e) => {
    const container = e.target.closest("[data-magnetic]");
    if (!container) return;

    const child = container.firstElementChild;
    if (!child) return;

    const range = 50;
    const strength = parseFloat(container.getAttribute("data-magnetic")) || 0.3;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < range) {
      gsap.to(child, {
        x: distanceX * strength,
        y: distanceY * strength,
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(child, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    }
  });

  document.addEventListener("mouseout", (e) => {
    const container = e.target.closest("[data-magnetic]");
    if (!container) return;

    const child = container.firstElementChild;
    if (!child) return;

    const related = e.relatedTarget;
    if (related && container.contains(related)) return;

    gsap.to(child, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)"
    });
  });

  // 13. Background Ambient Audio Controller
  const bgAudio = document.getElementById("bg-audio");
  const musicToggle = document.getElementById("nav-music-toggle");
  const eqBars = document.querySelectorAll(".eq-bar");

  // Set default starting volume to a comfortable 15% (non-blasting)
  if (bgAudio) {
    bgAudio.volume = 0.15;
  }

  if (musicToggle && bgAudio) {
    musicToggle.addEventListener("click", () => {
      if (bgAudio.paused) {
        bgAudio.play()
          .then(() => {
            eqBars.forEach(bar => bar.classList.add("playing"));
            gsap.to(musicToggle, {
              borderColor: "rgba(34, 197, 94, 0.4)",
              boxShadow: "0 0 15px rgba(34, 197, 94, 0.2)",
              duration: 0.3
            });
          })
          .catch(err => {
            console.warn("Audio playback blocked by user gestures:", err);
          });
      } else {
        bgAudio.pause();
        eqBars.forEach(bar => bar.classList.remove("playing"));
        gsap.to(musicToggle, {
          borderColor: "rgba(255, 255, 255, 0.06)",
          boxShadow: "none",
          duration: 0.3
        });
      }
    });

    // Mute/pause audio if tab loses focus to remain resource friendly
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (!bgAudio.paused) {
          bgAudio.pause();
          eqBars.forEach(bar => bar.classList.remove("playing"));
          gsap.to(musicToggle, {
            borderColor: "rgba(255, 255, 255, 0.06)",
            boxShadow: "none",
            duration: 0.3
          });
        }
      }
    });
  }

  // 14. Rocket Launch scroll logic
  const heroRocket = document.getElementById("hero-rocket");
  if (heroRocket) {
    let isLaunching = false;
    heroRocket.addEventListener("click", () => {
      if (isLaunching) return;
      isLaunching = true;

      // Play launch synth sound
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.8);

        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.85);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.85);
      } catch (e) {
        console.warn("Launch audio synthesis blocked/failed:", e);
      }

      // GSAP rocket flight animation
      const rocketIcon = heroRocket.querySelector("i");
      gsap.timeline({
        onComplete: () => {
          // Scroll to about section
          scrollToSection("about");
          
          // Reset rocket position after a small delay
          gsap.delayedCall(1.2, () => {
            gsap.set(rocketIcon, { y: 0, scale: 1, opacity: 1 });
            isLaunching = false;
          });
        }
      })
      .to(rocketIcon, {
        y: 15,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      })
      .to(rocketIcon, {
        y: -700,
        scale: 0.6,
        opacity: 0,
        duration: 0.7,
        ease: "power3.in"
      });
    });
  // 14. Mobile Navigation Menu handlers
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  const mobileMenuClose = document.getElementById("mobile-menu-close");

  if (mobileMenuToggle && mobileMenuOverlay && mobileMenuClose) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenuOverlay.classList.remove("translate-x-full");
    });
    mobileMenuClose.addEventListener("click", () => {
      mobileMenuOverlay.classList.add("translate-x-full");
    });
  }

  window.closeMobileMenu = function() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add("translate-x-full");
    }
  };

});

// Global Smooth Scroll Nav click handler
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
