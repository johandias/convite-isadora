/**
 * ============================================================================
 * SISTEMA DE PÓ DE FADA & ESTRELAS DOS DESEJOS PADRÃO DISNEY (Canvas 2D)
 * Estrelas de 4 e 8 pontas cintilantes, rastro de varinha mágica e pétalas encantadas
 * ============================================================================
 */

class DisneySparkles {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.petals = [];
    this.maxParticles = 55;
    this.maxPetals = 16;
    this.mouse = { x: -100, y: -100 };
    this.lastSparkleTime = 0;
    this.init();
  }

  init() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "sparklesCanvas";
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "10";
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Cria estrelas e pó de fada iniciais
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }

    // Cria pétalas de flores encantadas do bosque da Branca de Neve
    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }

    // Rastro da varinha mágica (toque e mouse)
    window.addEventListener("mousemove", (e) => this.onPointerMove(e.clientX, e.clientY));
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        this.onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle(randomY = false) {
    const isSpecialStar = Math.random() > 0.65;
    return {
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : window.innerHeight + 10,
      size: isSpecialStar ? Math.random() * 4.5 + 2.5 : Math.random() * 3 + 1,
      speedY: Math.random() * 0.65 + 0.25,
      speedX: (Math.random() - 0.5) * 0.45,
      opacity: Math.random() * 0.8 + 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.05 + 0.02,
      color: Math.random() > 0.25 ? "#ffd160" : "#ffffff", // Dourado Disney e Branco Puro
      isStar: isSpecialStar,
      isTrail: false
    };
  }

  createPetal(randomY = false) {
    return {
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : -20,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 0.8 + 0.4,
      speedX: Math.sin(Math.random() * Math.PI) * 0.8 + 0.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.03 + 0.015,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.5 + 0.35,
      color: Math.random() > 0.5 ? "rgba(245, 182, 161, 0.75)" : "rgba(253, 233, 196, 0.8)" // Pétala rosa e creme
    };
  }

  onPointerMove(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;

    const now = performance.now();
    if (now - this.lastSparkleTime > 40) {
      this.lastSparkleTime = now;
      for (let i = 0; i < 3; i++) {
        if (this.particles.length < 85) {
          this.particles.push({
            x: x + (Math.random() - 0.5) * 22,
            y: y + (Math.random() - 0.5) * 22,
            size: Math.random() * 4.5 + 2,
            speedY: (Math.random() - 0.7) * 1.6,
            speedX: (Math.random() - 0.5) * 1.6,
            opacity: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            twinkleOffset: 0,
            twinkleSpeed: 0.08,
            color: Math.random() > 0.4 ? "#ffd160" : "#ffffff",
            isStar: true,
            isTrail: true
          });
        }
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // 1. Renderiza Pétalas Encantadas do Bosque
    for (let i = 0; i < this.petals.length; i++) {
      const petal = this.petals[i];
      petal.y += petal.speedY;
      petal.wobble += petal.wobbleSpeed;
      petal.x += Math.sin(petal.wobble) * 0.7;
      petal.rotation += petal.rotationSpeed;

      if (petal.y > window.innerHeight + 25) {
        this.petals[i] = this.createPetal(false);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(petal.x, petal.y);
      this.ctx.rotate(petal.rotation);
      this.ctx.globalAlpha = petal.opacity;
      this.ctx.fillStyle = petal.color;

      // Desenha pétala oval elegante
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, petal.size, petal.size * 0.55, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 2. Renderiza Estrelas dos Desejos e Pó de Fada Disney
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y -= p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      p.twinkleOffset += p.twinkleSpeed;

      const alpha = p.isTrail 
        ? p.opacity 
        : (Math.sin(p.twinkleOffset) * 0.4 + 0.6) * p.opacity;

      if (p.isTrail) {
        p.opacity -= 0.024;
        p.size *= 0.96;
        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      } else {
        if (p.y < -20 || p.x < -20 || p.x > window.innerWidth + 20) {
          this.particles[i] = this.createParticle(false);
          continue;
        }
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = "#ffd160";

      if (p.isStar) {
        // Estrela Disney de 4 pontas com núcleo de luz brilhante
        const r = p.size;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        // Raio horizontal e vertical longo
        this.ctx.moveTo(-r * 2.2, 0);
        this.ctx.lineTo(r * 2.2, 0);
        this.ctx.moveTo(0, -r * 2.2);
        this.ctx.lineTo(0, r * 2.2);
        this.ctx.stroke();

        // Raios diagonais menores para criar o brilho 8-pointed star
        if (r > 3) {
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(-r * 1.1, -r * 1.1);
          this.ctx.lineTo(r * 1.1, r * 1.1);
          this.ctx.moveTo(-r * 1.1, r * 1.1);
          this.ctx.lineTo(r * 1.1, -r * 1.1);
          this.ctx.stroke();
        }
      } else {
        // Ponto de luz circular com difusão
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.fairySparkles = new DisneySparkles();
});
