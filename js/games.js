// AWNGKUU Arcade Lounge - Multi-Game Arcade Engine
// Built using HTML5 Canvas & Web Audio API (No dependencies)

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Custom Cursor Disabled - Default cursor active

  // 2. Custom Magnetic vectors
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

  // 3. Custom 3D Card Tilts (only for other elements with data-tilt="true")
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest("[data-tilt='true']");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tilt = 10;
    const rotateY = (x - centerX) / (rect.width / 2) * tilt;
    const rotateX = -(y - centerY) / (rect.height / 2) * tilt;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    const glowColor = card.getAttribute("glow-color") || "rgba(255, 255, 255, 0.05)";
    card.style.backgroundImage = `radial-gradient(350px circle at ${x}px ${y}px, ${glowColor}, transparent 80%)`;
  });

  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest("[data-tilt='true']");
    if (!card) return;

    const related = e.relatedTarget;
    if (related && card.contains(related)) return;

    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    card.style.backgroundImage = "none";
  });


  // 4. Game Engine State & Setup
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  let currentGame = "snake"; // "snake", "breakout", "shooter"
  let isPlaying = false;
  let isPaused = false;
  let isGameOver = false;
  let soundEnabled = true;
  let gameInterval = null;
  let score = 0;
  let highScore = 0;

  // Track keyboard holding state for fluid movement
  const keysState = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  // Spark Particles
  let particles = [];

  // DOM Selectors
  const scoreLabel = document.getElementById("game-score");
  const highScoreLabel = document.getElementById("game-highscore");
  const btnSound = document.getElementById("btn-sound");
  const btnPause = document.getElementById("btn-pause");
  
  // Overlays
  const overlayStart = document.getElementById("overlay-start");
  const overlayPause = document.getElementById("overlay-pause");
  const overlayGameOver = document.getElementById("overlay-gameover");
  const gameoverSummary = document.getElementById("gameover-summary");
  
  // Text Elements to update dynamically
  const gameTitle = document.getElementById("game-title");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayDesc = document.getElementById("overlay-desc");
  const footerControls = document.getElementById("footer-controls");

  // Load highscore
  function loadHighScore() {
    highScore = parseInt(localStorage.getItem(`${currentGame}_high_score`) || "0", 10);
    highScoreLabel.textContent = highScore;
  }

  // Audio Context Setup
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function synthSound(freq, type, duration, volume) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Sound synth failed:", e);
    }
  }

  // Audio cues
  function playMoveSound() { synthSound(150, "sine", 0.08, 0.05); }
  function playEatSound() {
    synthSound(523.25, "triangle", 0.15, 0.15); // C5
    setTimeout(() => { synthSound(659.25, "triangle", 0.2, 0.15); }, 80); // E5
  }
  function playHitSound() { synthSound(330, "triangle", 0.1, 0.2); }
  function playLaserSound() { synthSound(880, "sawtooth", 0.12, 0.08); }
  function playExplosionSound() {
    synthSound(100, "sawtooth", 0.35, 0.25);
  }

  // Spark Particle system
  class SparkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 6;
      this.vy = (Math.random() - 0.5) * 6;
      this.radius = Math.random() * 3 + 1;
      this.alpha = 1.0;
      this.color = color;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.94;
      this.vy *= 0.94;
      this.alpha -= 0.04;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnExplosion(pixelX, pixelY, color) {
    for (let i = 0; i < 15; i++) {
      particles.push(new SparkParticle(pixelX, pixelY, color));
    }
  }


  // ==========================================
  // GAME 1: NEON GRID SNAKE
  // ==========================================
  const SNAKE_GRID_SIZE = 20;
  const SNAKE_TILE_COUNT = canvas.width / SNAKE_GRID_SIZE;
  let snake = [];
  let snakeFood = { x: 10, y: 10 };
  let snakeDirection = { x: 1, y: 0 };
  let snakeDirBuffer = { x: 1, y: 0 };

  function initSnake() {
    snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ];
    snakeDirection = { x: 1, y: 0 };
    snakeDirBuffer = { x: 1, y: 0 };
    snakeFood = randomSnakeFoodPos();
  }

  function randomSnakeFoodPos() {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * SNAKE_GRID_SIZE),
        y: Math.floor(Math.random() * SNAKE_GRID_SIZE)
      };
      const onSnake = snake.some(s => s.x === newFood.x && s.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }

  function gameTickSnake() {
    snakeDirection = snakeDirBuffer;
    const head = {
      x: snake[0].x + snakeDirection.x,
      y: snake[0].y + snakeDirection.y
    };

    // Boundary check
    if (head.x < 0 || head.x >= SNAKE_GRID_SIZE || head.y < 0 || head.y >= SNAKE_GRID_SIZE) {
      triggerGameOver();
      return;
    }

    // Eat self check
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      triggerGameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === snakeFood.x && head.y === snakeFood.y) {
      score += 15;
      scoreLabel.textContent = score;
      playEatSound();
      spawnExplosion(snakeFood.x * SNAKE_TILE_COUNT + SNAKE_TILE_COUNT/2, snakeFood.y * SNAKE_TILE_COUNT + SNAKE_TILE_COUNT/2, "#f59e0b");
      snakeFood = randomSnakeFoodPos();
    } else {
      snake.pop();
      playMoveSound();
    }
  }

  function drawBoardSnake() {
    // Background Grid
    ctx.fillStyle = "#020204";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.015)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= SNAKE_GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * SNAKE_TILE_COUNT, 0);
      ctx.lineTo(i * SNAKE_TILE_COUNT, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * SNAKE_TILE_COUNT);
      ctx.lineTo(canvas.width, i * SNAKE_TILE_COUNT);
      ctx.stroke();
    }

    // Draw Food
    const foodX = snakeFood.x * SNAKE_TILE_COUNT + SNAKE_TILE_COUNT / 2;
    const foodY = snakeFood.y * SNAKE_TILE_COUNT + SNAKE_TILE_COUNT / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(foodX, foodY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#f59e0b";
    ctx.fill();
    ctx.restore();

    // Draw Snake
    snake.forEach((segment, idx) => {
      const isHead = idx === 0;
      const x = segment.x * SNAKE_TILE_COUNT;
      const y = segment.y * SNAKE_TILE_COUNT;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 1.5, y + 1.5, SNAKE_TILE_COUNT - 3, SNAKE_TILE_COUNT - 3, 5);
      if (isHead) {
        ctx.fillStyle = "#22c55e";
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#22c55e";
      } else {
        const ratio = 1 - (idx / snake.length) * 0.6;
        ctx.fillStyle = `rgba(16, 185, 129, ${ratio})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(16, 185, 129, 0.4)";
      }
      ctx.fill();
      ctx.restore();
    });
  }


  // ==========================================
  // GAME 2: NEON BRICK BREAKER (BREAKOUT)
  // ==========================================
  let breakoutPaddle = { x: 160, y: 375, width: 80, height: 10, speed: 7 };
  let breakoutBall = { x: 200, y: 300, vx: 3, vy: -3, radius: 6 };
  let breakoutBricks = [];
  let breakoutMoveDirection = 0; // -1: Left, 1: Right, 0: Static

  const BRICK_ROWS = 4;
  const BRICK_COLS = 6;
  const BRICK_WIDTH = 58;
  const BRICK_HEIGHT = 16;
  const BRICK_GAP = 7;
  const BRICK_OFFSET_TOP = 40;
  const BRICK_OFFSET_LEFT = 11;

  function initBreakout() {
    breakoutPaddle.x = canvas.width / 2 - breakoutPaddle.width / 2;
    breakoutBall.x = canvas.width / 2;
    breakoutBall.y = 280;
    breakoutBall.vx = (Math.random() > 0.5 ? 3 : -3);
    breakoutBall.vy = -3;
    breakoutMoveDirection = 0;

    // Create bricks
    breakoutBricks = [];
    const colors = ["#22c55e", "#10b981", "#06b6d4", "#a855f7"];
    for (let r = 0; r < BRICK_ROWS; r++) {
      breakoutBricks[r] = [];
      for (let c = 0; c < BRICK_COLS; c++) {
        breakoutBricks[r][c] = {
          x: c * (BRICK_WIDTH + BRICK_GAP) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_GAP) + BRICK_OFFSET_TOP,
          color: colors[r % colors.length],
          active: true
        };
      }
    }
  }

  function gameTickBreakout() {
    // Resolve paddle keys state
    if (keysState.left) {
      breakoutMoveDirection = -1;
    } else if (keysState.right) {
      breakoutMoveDirection = 1;
    } else {
      breakoutMoveDirection = 0;
    }

    // Move paddle
    breakoutPaddle.x += breakoutMoveDirection * breakoutPaddle.speed;
    if (breakoutPaddle.x < 0) breakoutPaddle.x = 0;
    if (breakoutPaddle.x + breakoutPaddle.width > canvas.width) {
      breakoutPaddle.x = canvas.width - breakoutPaddle.width;
    }

    // Move ball
    breakoutBall.x += breakoutBall.vx;
    breakoutBall.y += breakoutBall.vy;

    // Wall bounce left/right
    if (breakoutBall.x - breakoutBall.radius < 0 || breakoutBall.x + breakoutBall.radius > canvas.width) {
      breakoutBall.vx = -breakoutBall.vx;
      playMoveSound();
    }

    // Top bounce
    if (breakoutBall.y - breakoutBall.radius < 0) {
      breakoutBall.vy = -breakoutBall.vy;
      playMoveSound();
    }

    // Bottom check (Game Over)
    if (breakoutBall.y + breakoutBall.radius > canvas.height) {
      triggerGameOver();
      return;
    }

    // Paddle collision
    if (
      breakoutBall.y + breakoutBall.radius >= breakoutPaddle.y &&
      breakoutBall.y - breakoutBall.radius <= breakoutPaddle.y + breakoutPaddle.height &&
      breakoutBall.x >= breakoutPaddle.x &&
      breakoutBall.x <= breakoutPaddle.x + breakoutPaddle.width
    ) {
      // Direct ball back up
      breakoutBall.vy = -Math.abs(breakoutBall.vy);
      // Change bounce angle depending on hit spot
      const hitSpot = (breakoutBall.x - (breakoutPaddle.x + breakoutPaddle.width / 2)) / (breakoutPaddle.width / 2);
      breakoutBall.vx = hitSpot * 5;
      playHitSound();
      spawnExplosion(breakoutBall.x, breakoutPaddle.y, "#22c55e");
    }

    // Brick collision
    let allBricksCleared = true;
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const brick = breakoutBricks[r][c];
        if (brick.active) {
          allBricksCleared = false;
          if (
            breakoutBall.x + breakoutBall.radius >= brick.x &&
            breakoutBall.x - breakoutBall.radius <= brick.x + BRICK_WIDTH &&
            breakoutBall.y + breakoutBall.radius >= brick.y &&
            breakoutBall.y - breakoutBall.radius <= brick.y + BRICK_HEIGHT
          ) {
            brick.active = false;
            breakoutBall.vy = -breakoutBall.vy;
            score += 20;
            scoreLabel.textContent = score;
            playEatSound();
            spawnExplosion(brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT / 2, brick.color);
            break; // Exit loop for this frame's hit
          }
        }
      }
    }

    // Level progression
    if (allBricksCleared) {
      playEatSound();
      initBreakout(); // Respawn bricks
    }
  }

  function drawBoardBreakout() {
    ctx.fillStyle = "#020204";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw paddle
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(breakoutPaddle.x, breakoutPaddle.y, breakoutPaddle.width, breakoutPaddle.height, 4);
    ctx.fillStyle = "#22c55e";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#22c55e";
    ctx.fill();
    ctx.restore();

    // Draw ball
    ctx.save();
    ctx.beginPath();
    ctx.arc(breakoutBall.x, breakoutBall.y, breakoutBall.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffffff";
    ctx.fill();
    ctx.restore();

    // Draw bricks
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const brick = breakoutBricks[r][c];
        if (brick.active) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, 3);
          ctx.fillStyle = brick.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = brick.color;
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }


  // ==========================================
  // GAME 3: CYBER SHOOTER
  // ==========================================
  let shooterShip = { x: 180, y: 360, width: 40, height: 16, speed: 6 };
  let shooterBullets = [];
  let shooterInvaders = [];
  let shooterMoveDirection = 0; // -1: Left, 1: Right, 0: Static
  let shooterInvaderDirection = 1; // 1: Right, -1: Left
  let shooterInvaderSpeed = 1.0;
  let shooterShootCooldown = 0;

  function initShooter() {
    shooterShip.x = canvas.width / 2 - shooterShip.width / 2;
    shooterBullets = [];
    shooterInvaders = [];
    shooterMoveDirection = 0;
    shooterInvaderDirection = 1;
    shooterInvaderSpeed = 1.0;
    shooterShootCooldown = 0;

    // Spawn Invaders Grid
    const rows = 3;
    const cols = 6;
    const invWidth = 32;
    const invHeight = 16;
    const invGap = 15;
    const offsetLeft = 50;
    const offsetTop = 40;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        shooterInvaders.push({
          x: c * (invWidth + invGap) + offsetLeft,
          y: r * (invHeight + invGap) + offsetTop,
          width: invWidth,
          height: invHeight,
          color: r === 0 ? "#ef4444" : r === 1 ? "#a855f7" : "#06b6d4",
          active: true
        });
      }
    }
  }

  function gameTickShooter() {
    if (isGameOver) return;

    // Resolve ship keys state
    if (keysState.left) {
      shooterMoveDirection = -1;
    } else if (keysState.right) {
      shooterMoveDirection = 1;
    } else {
      shooterMoveDirection = 0;
    }

    // Ship movement
    shooterShip.x += shooterMoveDirection * shooterShip.speed;
    if (shooterShip.x < 0) shooterShip.x = 0;
    if (shooterShip.x + shooterShip.width > canvas.width) {
      shooterShip.x = canvas.width - shooterShip.width;
    }

    // Cooldown tick
    if (shooterShootCooldown > 0) shooterShootCooldown--;

    // Move bullets
    for (let i = shooterBullets.length - 1; i >= 0; i--) {
      const b = shooterBullets[i];
      b.y -= 7;
      if (b.y < 0) {
        shooterBullets.splice(i, 1);
      }
    }

    // Move invaders horizontally
    let hitEdge = false;
    shooterInvaders.forEach(inv => {
      if (!inv.active) return;
      inv.x += shooterInvaderDirection * shooterInvaderSpeed;
      // Only trigger hitEdge if they are moving towards that edge
      if (inv.x < 10 && shooterInvaderDirection === -1) {
        hitEdge = true;
      }
      if (inv.x + inv.width > canvas.width - 10 && shooterInvaderDirection === 1) {
        hitEdge = true;
      }
    });

    // If edge hit, descend and swap direction
    if (hitEdge) {
      shooterInvaderDirection = -shooterInvaderDirection;
      for (let i = 0; i < shooterInvaders.length; i++) {
        const inv = shooterInvaders[i];
        if (!inv.active) continue;
        inv.y += 15;
        // Check gameover height
        if (inv.y + inv.height >= shooterShip.y) {
          triggerGameOver();
          return; // Exit tick immediately
        }
      }
    }

    // Bullet-Invader collision
    for (let bIdx = shooterBullets.length - 1; bIdx >= 0; bIdx--) {
      const bullet = shooterBullets[bIdx];
      for (let iIdx = 0; iIdx < shooterInvaders.length; iIdx++) {
        const inv = shooterInvaders[iIdx];
        if (inv.active && 
            bullet.x >= inv.x && bullet.x <= inv.x + inv.width &&
            bullet.y >= inv.y && bullet.y <= inv.y + inv.height) {
          
          inv.active = false;
          shooterBullets.splice(bIdx, 1);
          score += 25;
          scoreLabel.textContent = score;
          playHitSound();
          spawnExplosion(inv.x + inv.width/2, inv.y + inv.height/2, inv.color);
          break; // break to check next bullet
        }
      }
    }

    // Check level clear
    if (shooterInvaders.every(inv => !inv.active)) {
      playEatSound();
      shooterInvaderSpeed += 0.4;
      initShooter(); // Next wave!
    }
  }

  function drawBoardShooter() {
    ctx.fillStyle = "#020204";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Ship
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(shooterShip.x, shooterShip.y, shooterShip.width, shooterShip.height, 4);
    ctx.fillStyle = "#06b6d4";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#06b6d4";
    ctx.fill();
    ctx.restore();

    // Draw Bullets
    shooterBullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = "#f59e0b";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#f59e0b";
      ctx.fillRect(b.x - 1.5, b.y, 3, 10);
      ctx.restore();
    });

    // Draw Invaders
    shooterInvaders.forEach(inv => {
      if (!inv.active) return;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(inv.x, inv.y, inv.width, inv.height, 3);
      ctx.fillStyle = inv.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = inv.color;
      ctx.fill();
      ctx.restore();
    });
  }

  function shooterShoot() {
    if (shooterShootCooldown > 0) return;
    shooterBullets.push({
      x: shooterShip.x + shooterShip.width / 2,
      y: shooterShip.y
    });
    shooterShootCooldown = 15; // cooldown frames
    playLaserSound();
  }


  // ==========================================
  // SHARED ENGINE LOOPS & CONTROL BINDINGS
  // ==========================================
  function gameTick() {
    if (currentGame === "snake") {
      gameTickSnake();
    } else if (currentGame === "breakout") {
      gameTickBreakout();
    } else if (currentGame === "shooter") {
      gameTickShooter();
    }
    drawBoard();
  }

  function drawBoard() {
    if (currentGame === "snake") {
      drawBoardSnake();
    } else if (currentGame === "breakout") {
      drawBoardBreakout();
    } else if (currentGame === "shooter") {
      drawBoardShooter();
    }

    // Cleanly draw and filter dead explosion sparks backwards
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function startGame() {
    initAudio();
    score = 0;
    particles = [];
    isGameOver = false;
    isPaused = false;
    isPlaying = true;

    scoreLabel.textContent = score;
    btnPause.classList.remove("hidden");
    overlayStart.classList.add("hidden");
    overlayGameOver.classList.add("hidden");
    overlayPause.classList.add("hidden");

    if (currentGame === "snake") {
      initSnake();
    } else if (currentGame === "breakout") {
      initBreakout();
    } else if (currentGame === "shooter") {
      initShooter();
    }

    if (gameInterval) clearInterval(gameInterval);
    const speed = currentGame === "snake" ? 95 : 1000 / 60; // 60fps for Breakout/Shooter
    gameInterval = setInterval(gameTick, speed);

    drawBoard();
  }

  function togglePause() {
    if (!isPlaying || isGameOver) return;
    
    if (isPaused) {
      isPaused = false;
      overlayPause.classList.add("hidden");
      const speed = currentGame === "snake" ? 95 : 1000 / 60;
      gameInterval = setInterval(gameTick, speed);
      btnPause.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i>`;
      lucide.createIcons();
    } else {
      isPaused = true;
      clearInterval(gameInterval);
      overlayPause.classList.remove("hidden");
      btnPause.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;
      lucide.createIcons();
    }
  }

  function triggerGameOver() {
    clearInterval(gameInterval);
    isPlaying = false;
    isGameOver = true;
    btnPause.classList.add("hidden");

    playExplosionSound();

    if (currentGame === "snake" && snake.length > 0) {
      spawnExplosion(snake[0].x * SNAKE_TILE_COUNT + SNAKE_TILE_COUNT/2, snake[0].y * SNAKE_TILE_COUNT + SNAKE_TILE_COUNT/2, "#ef4444");
    } else if (currentGame === "breakout") {
      spawnExplosion(breakoutBall.x, breakoutBall.y, "#ef4444");
    } else if (currentGame === "shooter") {
      spawnExplosion(shooterShip.x + shooterShip.width/2, shooterShip.y + shooterShip.height/2, "#ef4444");
    }
    
    // Screen shake
    const cabinet = document.querySelector(".glass");
    gsap.fromTo(cabinet,
      { x: -8 },
      { x: 0, duration: 0.05, repeat: 5, yoyo: true, ease: "none" }
    );

    // Save HighScore
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(`${currentGame}_high_score`, highScore.toString());
      highScoreLabel.textContent = highScore;
    }

    gameoverSummary.textContent = `FINAL SCORE: ${score}`;
    overlayGameOver.classList.remove("hidden");
  }

  // Keyboard router
  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key)) {
      e.preventDefault();
    }

    // Set keysState for fluid movements
    if (key === "a" || e.key === "ArrowLeft") keysState.left = true;
    if (key === "d" || e.key === "ArrowRight") keysState.right = true;
    if (key === "w" || e.key === "ArrowUp") keysState.up = true;
    if (key === "s" || e.key === "ArrowDown") keysState.down = true;

    if (!isPlaying || isPaused || isGameOver) return;

    if (currentGame === "snake") {
      if ((key === "w" || e.key === "ArrowUp") && snakeDirection.y !== 1) {
        snakeDirBuffer = { x: 0, y: -1 };
      } else if ((key === "s" || e.key === "ArrowDown") && snakeDirection.y !== -1) {
        snakeDirBuffer = { x: 0, y: 1 };
      } else if ((key === "a" || e.key === "ArrowLeft") && snakeDirection.x !== 1) {
        snakeDirBuffer = { x: -1, y: 0 };
      } else if ((key === "d" || e.key === "ArrowRight") && snakeDirection.x !== -1) {
        snakeDirBuffer = { x: 1, y: 0 };
      }
    } else if (currentGame === "shooter") {
      if (e.key === " ") {
        shooterShoot();
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();

    // Release keysState
    if (key === "a" || e.key === "ArrowLeft") keysState.left = false;
    if (key === "d" || e.key === "ArrowRight") keysState.right = false;
    if (key === "w" || e.key === "ArrowUp") keysState.up = false;
    if (key === "s" || e.key === "ArrowDown") keysState.down = false;
  });

  // Game Selector tabs switching logic
  function switchGame(target) {
    if (gameInterval) clearInterval(gameInterval);
    currentGame = target;
    isPlaying = false;
    isPaused = false;
    isGameOver = false;

    // Reset UI states
    score = 0;
    scoreLabel.textContent = "0";
    loadHighScore();
    
    btnPause.classList.add("hidden");
    overlayGameOver.classList.add("hidden");
    overlayPause.classList.add("hidden");
    overlayStart.classList.remove("hidden");

    // Clear tabs classes
    document.querySelectorAll("[id^='tab-']").forEach(btn => {
      btn.className = "flex-1 py-2 text-center rounded-lg font-code text-[11px] font-bold text-zinc-500 hover:text-white transition-all duration-300";
    });

    // Update active tab, titles, desc, controls footer
    const activeBtn = document.getElementById(`tab-${target}`);
    activeBtn.className = "flex-1 py-2 text-center rounded-lg font-code text-[11px] font-bold bg-amber-500 text-black shadow-lg";

    if (target === "snake") {
      gameTitle.textContent = "NEON GRID SNAKE";
      overlayTitle.textContent = "ARE YOU READY?";
      overlayDesc.textContent = "Use WASD or Arrow Keys to pilot the system. Eat yellow nodes to expand the trail matrix.";
      footerControls.textContent = "KEYBOARD: [W,A,S,D] OR [ARROWS]";
    } else if (target === "breakout") {
      gameTitle.textContent = "NEON BRICK BREAKER";
      overlayTitle.textContent = "INITIALIZE CORE?";
      overlayDesc.textContent = "Use A/D or Arrow Keys to move the paddle. Bounce the ball to shatter the grid.";
      footerControls.textContent = "KEYBOARD: [A,D] OR [ARROWS]";
    } else if (target === "shooter") {
      gameTitle.textContent = "CYBER GRID SHOOTER";
      overlayTitle.textContent = "CYBER THREAT DETECTED";
      overlayDesc.textContent = "Use A/D or Arrow Keys to steer. Press Spacebar to shoot lasers and destroy invader grid nodes.";
      footerControls.textContent = "KEYBOARD: [A,D]/[ARROWS] + [SPACEBAR]";
    }

    // Initialize values for chosen game to support pre-render without crashes
    if (currentGame === "snake") initSnake();
    if (currentGame === "breakout") initBreakout();
    if (currentGame === "shooter") initShooter();

    updateMobileControlsVisibility();
    drawBoard();
  }

  // Initial states setup on script load
  initSnake();
  initBreakout();
  initShooter();
  loadHighScore();

  // Tabs bindings
  document.getElementById("tab-snake").addEventListener("click", (e) => { e.target.blur(); switchGame("snake"); });
  document.getElementById("tab-breakout").addEventListener("click", (e) => { e.target.blur(); switchGame("breakout"); });
  document.getElementById("tab-shooter").addEventListener("click", (e) => { e.target.blur(); switchGame("shooter"); });

  // Main buttons bindings
  document.getElementById("btn-start").addEventListener("click", (e) => { e.target.blur(); startGame(); });
  document.getElementById("btn-resume").addEventListener("click", (e) => { e.target.blur(); togglePause(); });
  document.getElementById("btn-restart").addEventListener("click", (e) => { e.target.blur(); startGame(); });
  btnPause.addEventListener("click", (e) => { e.target.blur(); togglePause(); });

  // Sound toggle button click
  btnSound.addEventListener("click", (e) => {
    e.target.blur();
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      btnSound.innerHTML = `<i data-lucide="volume-2" class="w-4 h-4"></i>`;
      initAudio();
    } else {
      btnSound.innerHTML = `<i data-lucide="volume-x" class="w-4 h-4"></i>`;
    }
    lucide.createIcons();
  });

  // 11. Mobile Touch Controls Router & Handlers
  function updateMobileControlsVisibility() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
    const mobileControls = document.getElementById("mobile-controls");
    const dpad = document.getElementById("control-dpad");
    const actionPad = document.getElementById("control-action");
    const fireBtn = document.getElementById("ctrl-action-fire");

    if (!isTouch) {
      mobileControls.classList.add("hidden");
      return;
    }

    mobileControls.classList.remove("hidden");

    if (currentGame === "snake") {
      dpad.classList.remove("hidden");
      actionPad.classList.add("hidden");
    } else if (currentGame === "breakout") {
      dpad.classList.add("hidden");
      actionPad.classList.remove("hidden");
      fireBtn.classList.add("hidden"); // Breakout has no fire button
    } else if (currentGame === "shooter") {
      dpad.classList.add("hidden");
      actionPad.classList.remove("hidden");
      fireBtn.classList.remove("hidden"); // Shooter has fire button
    }
  }

  // Touch control button bindings
  // D-Pad Directional Controls (Snake)
  document.getElementById("ctrl-up").addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (snakeDirection.y !== 1) snakeDirBuffer = { x: 0, y: -1 };
  });
  document.getElementById("ctrl-down").addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (snakeDirection.y !== -1) snakeDirBuffer = { x: 0, y: 1 };
  });
  document.getElementById("ctrl-left").addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (snakeDirection.x !== 1) snakeDirBuffer = { x: -1, y: 0 };
  });
  document.getElementById("ctrl-right").addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (snakeDirection.x !== -1) snakeDirBuffer = { x: 1, y: 0 };
  });

  // Mouse fallback click controls (for testing desktop responsive viewport)
  document.getElementById("ctrl-up").addEventListener("click", () => {
    if (snakeDirection.y !== 1) snakeDirBuffer = { x: 0, y: -1 };
  });
  document.getElementById("ctrl-down").addEventListener("click", () => {
    if (snakeDirection.y !== -1) snakeDirBuffer = { x: 0, y: 1 };
  });
  document.getElementById("ctrl-left").addEventListener("click", () => {
    if (snakeDirection.x !== 1) snakeDirBuffer = { x: -1, y: 0 };
  });
  document.getElementById("ctrl-right").addEventListener("click", () => {
    if (snakeDirection.x !== -1) snakeDirBuffer = { x: 1, y: 0 };
  });

  // Action Pad (Left/Right & Fire) - Touch & Mouse bindings
  const btnLeft = document.getElementById("ctrl-action-left");
  const btnRight = document.getElementById("ctrl-action-right");
  const btnFire = document.getElementById("ctrl-action-fire");

  btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); keysState.left = true; });
  btnLeft.addEventListener("touchend", (e) => { e.preventDefault(); keysState.left = false; });
  btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); keysState.right = true; });
  btnRight.addEventListener("touchend", (e) => { e.preventDefault(); keysState.right = false; });
  btnFire.addEventListener("touchstart", (e) => { e.preventDefault(); if (isPlaying && !isPaused && !isGameOver) shooterShoot(); });

  btnLeft.addEventListener("mousedown", () => { keysState.left = true; });
  btnLeft.addEventListener("mouseup", () => { keysState.left = false; });
  btnLeft.addEventListener("mouseleave", () => { keysState.left = false; });
  btnRight.addEventListener("mousedown", () => { keysState.right = true; });
  btnRight.addEventListener("mouseup", () => { keysState.right = false; });
  btnRight.addEventListener("mouseleave", () => { keysState.right = false; });
  btnFire.addEventListener("mousedown", () => { if (isPlaying && !isPaused && !isGameOver) shooterShoot(); });

  // Initial mobile controls setup check
  updateMobileControlsVisibility();
  window.addEventListener("resize", updateMobileControlsVisibility);

  // Pre-load render
  drawBoard();
});
