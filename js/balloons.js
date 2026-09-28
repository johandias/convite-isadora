/**
 * ============================================================================
 * SISTEMA DE BALÕES MÁGICOS INTERATIVOS
 * Animação de balões flutuantes 3D com física suave e estouro ao toque
 * ============================================================================
 */

class FairytaleBalloons {
  constructor() {
    this.container = null;
    this.colors = [
      { bg: "linear-gradient(135deg, #ff4d6d, #c9184a)", shadow: "#800f2f" }, // Vermelho Maçã
      { bg: "linear-gradient(135deg, #ffd166, #e09f3e)", shadow: "#9e2a2b" }, // Dourado Real
      { bg: "linear-gradient(135deg, #48cae4, #0077b6)", shadow: "#03045e" }, // Azul Cinderela / Branca de Neve
      { bg: "linear-gradient(135deg, #fff3b0, #ddb892)", shadow: "#b08968" }, // Pérola
      { bg: "linear-gradient(135deg, #70e000, #38b000)", shadow: "#007200" }  // Verde Folha Mágica
    ];
    this.init();
  }

  init() {
    this.container = document.createElement("div");
    this.container.id = "balloonsContainer";
    this.container.style.position = "fixed";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.pointerEvents = "none";
    this.container.style.overflow = "hidden";
    this.container.style.zIndex = "15";
    document.body.appendChild(this.container);

    // Lança alguns balões no início e esporadicamente
    setTimeout(() => this.spawnBatch(3), 2000);
    setInterval(() => {
      // Cria balões apenas se a aba estiver visível e menos de 8 na tela
      if (!document.hidden && this.container.children.length < 7) {
        this.createBalloon();
      }
    }, 4500);
  }

  spawnBatch(count = 5) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.createBalloon(), i * 350);
    }
  }

  createBalloon(customX) {
    if (!this.container) return;

    const balloonEl = document.createElement("div");
    balloonEl.className = "fairytale-balloon";

    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const size = Math.random() * 22 + 45; // 45px a 67px
    const startX = customX !== undefined 
      ? customX 
      : Math.random() * (window.innerWidth - 80) + 40;
    const duration = Math.random() * 6 + 10; // 10s a 16s
    const wobbleDuration = Math.random() * 2 + 2.5;

    balloonEl.style.width = `${size}px`;
    balloonEl.style.height = `${size * 1.22}px`;
    balloonEl.style.left = `${startX}px`;
    balloonEl.style.bottom = `-${size * 1.5}px`;
    balloonEl.style.background = color.bg;
    balloonEl.style.boxShadow = `inset -4px -4px 10px rgba(0,0,0,0.25), 0 8px 15px rgba(0,0,0,0.15)`;
    balloonEl.style.animation = `balloonFloat ${duration}s linear forwards, balloonSway ${wobbleDuration}s ease-in-out infinite alternate`;
    balloonEl.style.pointerEvents = "auto";
    balloonEl.style.cursor = "pointer";

    // Brilho especular no balão
    const shine = document.createElement("div");
    shine.className = "balloon-shine";
    balloonEl.appendChild(shine);

    // Nó e cordão do balão
    const knot = document.createElement("div");
    knot.className = "balloon-knot";
    balloonEl.appendChild(knot);

    const string = document.createElement("div");
    string.className = "balloon-string";
    string.style.height = `${size * 1.4}px`;
    balloonEl.appendChild(string);

    // Evento de clique para estourar o balão!
    const popAction = (e) => {
      e.stopPropagation();
      this.popBalloon(balloonEl);
    };
    balloonEl.addEventListener("click", popAction);
    balloonEl.addEventListener("touchstart", popAction, { passive: false });

    this.container.appendChild(balloonEl);

    // Remove do DOM após sair da tela
    setTimeout(() => {
      if (balloonEl && balloonEl.parentNode) {
        balloonEl.remove();
      }
    }, duration * 1000 + 500);
  }

  popBalloon(balloonEl) {
    if (!balloonEl || balloonEl.classList.contains("popping")) return;
    balloonEl.classList.add("popping");

    const rect = balloonEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Toca som de pop
    if (window.fairytaleAudio) {
      window.fairytaleAudio.playPop();
    }

    // Solta confetes no ponto do estouro
    if (window.fairytaleConfetti) {
      window.fairytaleConfetti.burst({
        x: cx,
        y: cy,
        count: 22,
        power: 0.7
      });
    }

    // Animação CSS de estouro
    balloonEl.style.transform = "scale(1.4)";
    balloonEl.style.opacity = "0";
    balloonEl.style.transition = "all 0.15s ease-out";

    setTimeout(() => {
      if (balloonEl.parentNode) {
        balloonEl.remove();
      }
    }, 180);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.fairytaleBalloons = new FairytaleBalloons();
});
