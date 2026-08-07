// AWNGKUU Love Core Lounge - Interactivity Engine
// Built using HTML5 Canvas / Audio API & GSAP (No external UI dependencies)

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // 1. Custom Cursor setup (keeps behavior matched to homepage)
  const cursorDot = document.getElementById("custom-cursor-dot");
  const cursorRing = document.getElementById("custom-cursor-ring");

  gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });
  gsap.set(cursorRing, { xPercent: -50, yPercent: -50 });

  window.addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    gsap.to(cursorDot, { x: clientX, y: clientY, duration: 0 });
    gsap.to(cursorRing, { x: clientX, y: clientY, duration: 0.4, ease: "power3.out" });
  });

  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("a, button, [data-hover='true']");
    if (target) {
      gsap.to(cursorRing, {
        scale: 2.0,
        backgroundColor: "rgba(244, 63, 94, 0.15)",
        borderColor: "rgba(244, 63, 94, 0.8)",
        borderWidth: "1.5px",
        duration: 0.3
      });
      gsap.to(cursorDot, {
        scale: 0.4,
        backgroundColor: "#f43f5e",
        duration: 0.3
      });
    } else {
      gsap.to(cursorRing, {
        scale: 1,
        backgroundColor: "transparent",
        borderColor: "rgba(255, 255, 255, 0.4)",
        borderWidth: "1px",
        duration: 0.3
      });
      gsap.to(cursorDot, {
        scale: 1,
        backgroundColor: "#ffffff",
        duration: 0.3
      });
    }
  });

  // 2. Custom Magnetic vectors for return button or tilt cards
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

    gsap.to(child, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)"
    });
  });

  // 3. Custom 3D Card Tilts
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest("[data-tilt='true']");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tilt = 6;
    const rotateY = (x - centerX) / (rect.width / 2) * tilt;
    const rotateX = -(y - centerY) / (rect.height / 2) * tilt;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.005, 1.005, 1.005)`;
    const glowColor = card.getAttribute("glow-color") || "rgba(255, 255, 255, 0.05)";
    card.style.backgroundImage = `radial-gradient(300px circle at ${x}px ${y}px, ${glowColor}, transparent 80%)`;
  });

  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest("[data-tilt='true']");
    if (!card) return;

    const related = e.relatedTarget;
    if (related && card.contains(related)) return;

    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    card.style.backgroundImage = "none";
  });


  // 4. Together Chronometer Counter
  const loveStartDate = new Date("2024-10-24T00:00:00");
  
  function updateLoveCounter() {
    const daysEl = document.getElementById("love-days");
    const hoursEl = document.getElementById("love-hours");
    const minutesEl = document.getElementById("love-minutes");
    const secondsEl = document.getElementById("love-seconds");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const now = new Date();
    const diff = now - loveStartDate;

    if (diff < 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateLoveCounter();
  setInterval(updateLoveCounter, 1000);


  // 5. Love Decryptor Messages & Audio Synth / Heart Particle Burst
  const loveMessages = [
    "ACCESS_GRANTED: Awek saya paling comel dalam dunia. ❤️",
    "DECRYPTED: System heartbeat matches her rhythm perfectly. [Ping: 1ms]",
    "LOG: Database status: 100% full of thoughts about her.",
    "ALERT: Threat level: Critical - She stole my heart! 🔒",
    "INFO: Cache cleared. Only memories of us remain.",
    "STATUS: System overload due to extreme cuteness.",
    "PORT_OPEN: Direct websocket tunnel to her happiness successfully established.",
    "LOG_LEVEL_INFO: Terlampau rindu. compile error: love overload.",
    "WARNING: Continuous looking into her eyes might cause permanent smiling.",
    "DEBUG: Memory heap: 99.9% occupied by her smile."
  ];

  const btnDecryptLove = document.getElementById("btn-decrypt-love");
  const decryptedMsgEl = document.getElementById("decrypted-message");
  let isDecrypting = false;

  if (btnDecryptLove && decryptedMsgEl) {
    btnDecryptLove.addEventListener("click", (e) => {
      if (isDecrypting) return;
      isDecrypting = true;

      // Play cute high beep synth
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } catch (err) {
        console.warn("Love audio synthesize blocked:", err);
      }

      // Generate heart particles
      spawnHeartExplosion();

      // Decrypt garbled text effect
      const finalMsg = loveMessages[Math.floor(Math.random() * loveMessages.length)];
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$&*1234567890{}[]<>";
      let tick = 0;
      const totalTicks = 12;

      const decryptInterval = setInterval(() => {
        let tempText = "";
        for (let i = 0; i < finalMsg.length; i++) {
          if (finalMsg[i] === " " || i < (tick / totalTicks) * finalMsg.length) {
            tempText += finalMsg[i];
          } else {
            tempText += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        decryptedMsgEl.textContent = tempText;
        tick++;

        if (tick > totalTicks) {
          clearInterval(decryptInterval);
          decryptedMsgEl.textContent = finalMsg;
          isDecrypting = false;
        }
      }, 50);
    });
  }

  function spawnHeartExplosion() {
    const container = document.getElementById("love");
    const btn = document.getElementById("btn-decrypt-love");
    if (!container || !btn) return;

    const rect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const spawnX = btnRect.left - rect.left + btnRect.width / 2;
    const spawnY = btnRect.top - rect.top;

    for (let i = 0; i < 20; i++) {
      const heart = document.createElement("span");
      heart.innerHTML = "❤️";
      heart.className = "absolute pointer-events-none text-rose-500 text-sm md:text-base select-none z-30";
      heart.style.left = `${spawnX}px`;
      heart.style.top = `${spawnY}px`;
      container.appendChild(heart);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 100 + 50;

      gsap.fromTo(heart, 
        { scale: 0, opacity: 1, x: 0, y: 0, rotation: 0 },
        {
          x: Math.cos(angle) * velocity,
          y: -(Math.random() * 150 + 100),
          scale: Math.random() * 1.5 + 0.8,
          rotation: Math.random() * 360 - 180,
          opacity: 0,
          duration: Math.random() * 1.2 + 0.8,
          ease: "power2.out",
          onComplete: () => heart.remove()
        }
      );
    }
  }

});
