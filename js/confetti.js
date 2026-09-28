/**
 * ============================================================================
 * SISTEMA DE CONFETES & BRILHOS FESTIVOS (Zero dependências externas)
 * ============================================================================
 */

class FairytaleConfetti {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "confettiCanvas";
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "99999";
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  // Explosão festiva principal de aniversário
  burst(options = {}) {
    const count = options.count || 90;
    const originX = options.x !== undefined ? options.x : window.innerWidth / 2;
    const originY = options.y !== undefined ? options.y : window.innerHeight * 0.45;
    
    // Paleta encantada: Vermelho Maçã, Dourado Real, Azul Céu, Rosa Suave, Verde Floresta
    const colors = [
      "#e63946", "#ffd700", "#ffb703", "#48cae4", "#ff758f", 
      "#52b788", "#ffffff", "#d90429", "#f72585"
    ];

    const shapes = options.shapes || ["rect", "circle", "star", "heart"];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = (Math.random() * 8 + 4) * (options.power || 1);
      
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed * (Math.random() * 0.8 + 0.6),
        vy: Math.sin(angle) * speed - Math.random() * 4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        gravity: 0.18,
        friction: 0.98,
        opacity: 1,
        fadeSpeed: Math.random() * 0.012 + 0.008,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  // Efeito especial: Chuva contínua de confetes
  shower(durationMs = 3500) {
    const end = Date.now() + durationMs;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      this.burst({
        count: 20,
        x: Math.random() * window.innerWidth,
        y: -10,
        power: 0.8
      });
    }, 200);
  }

  // Efeito especial: Estrelas douradas
  goldStars(x, y) {
    this.burst({
      count: 35,
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
      shapes: ["star"],
      power: 0.9
    });
  }

  // Loop de animação
  animate() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.fadeSpeed;

      if (p.opacity <= 0 || p.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === "star") {
        this.drawStar(0, 0, 5, p.size, p.size / 2);
      } else if (p.shape === "heart") {
        this.drawHeart(0, 0, p.size);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawHeart(cx, cy, size) {
    const s = size * 0.7;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy + s / 4);
    this.ctx.quadraticCurveTo(cx, cy, cx - s / 2, cy);
    this.ctx.quadraticCurveTo(cx - s, cy, cx - s, cy + s / 3);
    this.ctx.quadraticCurveTo(cx - s, cy + s * 0.7, cx, cy + s);
    this.ctx.quadraticCurveTo(cx + s, cy + s * 0.7, cx + s, cy + s / 3);
    this.ctx.quadraticCurveTo(cx + s, cy, cx + s / 2, cy);
    this.ctx.quadraticCurveTo(cx, cy, cx, cy + s / 4);
    this.ctx.fill();
  }
}

// Inicialização segura após o carregamento da página
window.addEventListener("DOMContentLoaded", () => {
  window.fairytaleConfetti = new FairytaleConfetti();
});
