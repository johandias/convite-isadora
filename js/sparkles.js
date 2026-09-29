/**
 * ============================================================================
 * SISTEMA DE BRILHOS & PÓ DE FADA SUTIL (Canvas 2D)
 * Brilhos delicados, discretos e elegantes - sem poluição visual
 * ============================================================================
 */

class DisneySparkles {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.maxParticles = 14; // Poucos brilhos para não sobrecarregar
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
    this.canvas.style.zIndex = "8";
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Cria apenas poucos brilhos sutis no ambiente
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }

    // Rastro muito sutil e espaçado ao toque/movimento
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
    const isSpecialStar = Math.random() > 0.7;
    return {
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : window.innerHeight + 10,
      size: isSpecialStar ? Math.random() * 2.5 + 1.5 : Math.random() * 2 + 1,
      speedY: Math.random() * 0.35 + 0.15,
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.5 + 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.03 + 0.015,
      color: Math.random() > 0.4 ? "#ffd160" : "#ffffff", // Dourado suave e branco
      isStar: isSpecialStar,
      isTrail: false
    };
  }

  onPointerMove(x, y) {
    const now = performance.now();
    // Apenas gera um brilho suave a cada 220ms para não poluir
    if (now - this.lastSparkleTime > 220) {
      this.lastSparkleTime = now;
      if (this.particles.length < 20) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          size: Math.random() * 2 + 1.2,
          speedY: (Math.random() - 0.6) * 0.8,
          speedX: (Math.random() - 0.5) * 0.8,
          opacity: 0.7,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          twinkleOffset: 0,
          twinkleSpeed: 0.05,
          color: Math.random() > 0.5 ? "#ffd160" : "#ffffff",
          isStar: true,
          isTrail: true
        });
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Renderiza apenas brilhos discretos
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y -= p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      p.twinkleOffset += p.twinkleSpeed;

      const alpha = p.isTrail 
        ? p.opacity 
        : (Math.sin(p.twinkleOffset) * 0.3 + 0.5) * p.opacity;

      if (p.isTrail) {
        p.opacity -= 0.025;
        p.size *= 0.97;
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
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = "#ffd160";

      if (p.isStar) {
        const r = p.size;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(-r * 1.8, 0);
        this.ctx.lineTo(r * 1.8, 0);
        this.ctx.moveTo(0, -r * 1.8);
        this.ctx.lineTo(0, r * 1.8);
        this.ctx.stroke();
      } else {
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
