/**
 * ============================================================================
 * MAGIC SCROLL — Sistema de Rolagem Mágica da Princesinha Isadora
 * Experiência Disney: parallax, partículas, typewriter, Isadora se movendo
 * ============================================================================
 */

(function () {
  "use strict";

  /* =========================================================================
   * 0. UTILITÁRIOS
   * ========================================================================= */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function rnd(min, max) { return Math.random() * (max - min) + min; }
  function rint(min, max) { return Math.floor(rnd(min, max + 1)); }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  /* =========================================================================
   * 1. MAGICAL PARTICLES — Brilhinhos que surgem ao rolar
   * ========================================================================= */
  const PARTICLE_POOL = [];
  const PARTICLE_COUNT = 60;
  const particleContainer = document.createElement("div");
  particleContainer.id = "magic-particle-container";
  particleContainer.style.cssText = [
    "position:fixed",
    "top:0","left:0","width:100%","height:100%",
    "pointer-events:none",
    "z-index:9999",
    "overflow:hidden"
  ].join(";");
  document.body.appendChild(particleContainer);

  const PARTICLE_EMOJIS = ["✨","⭐","🌟","💫","🍎","🌸","💖","🌺","🦋","👑","🔮","💎","🌙","☀️","❄️","🌈"];

  function createParticle() {
    const el = document.createElement("span");
    el.className = "magic-particle";
    el.style.cssText = [
      "position:absolute",
      "font-size:14px",
      "pointer-events:none",
      "user-select:none",
      "will-change:transform,opacity",
      "transform:translateZ(0)"
    ].join(";");
    particleContainer.appendChild(el);
    return el;
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    PARTICLE_POOL.push({ el: createParticle(), active: false });
  }

  function launchParticle(x, y, emoji) {
    const p = PARTICLE_POOL.find(p => !p.active);
    if (!p) return;
    p.active = true;
    const el = p.el;
    el.textContent = emoji || PARTICLE_EMOJIS[rint(0, PARTICLE_EMOJIS.length - 1)];

    const startX = x + rnd(-40, 40);
    const startY = y + rnd(-20, 20);
    const vx = rnd(-60, 60);
    const vy = rnd(-80, -200);
    const spin = rnd(-360, 360);
    const scale0 = rnd(0.5, 1.4);
    const duration = rnd(900, 1800);

    let startTime = null;
    el.style.left = startX + "px";
    el.style.top = startY + "px";
    el.style.opacity = "1";
    el.style.transform = `scale(${scale0}) rotate(0deg)`;

    function frame(ts) {
      if (!startTime) startTime = ts;
      const t = (ts - startTime) / duration;
      if (t >= 1) {
        el.style.opacity = "0";
        p.active = false;
        return;
      }
      const ease = 1 - Math.pow(t, 3);
      el.style.left = (startX + vx * t) + "px";
      el.style.top = (startY + vy * t * ease) + "px";
      el.style.opacity = String(1 - t * t);
      el.style.transform = `scale(${scale0 * (1 - t * 0.3)}) rotate(${spin * t}deg)`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Burst de partículas numa posição */
  function burstParticles(x, y, count, emojis) {
    const list = emojis || PARTICLE_EMOJIS;
    for (let i = 0; i < (count || 8); i++) {
      setTimeout(() => {
        launchParticle(x + rnd(-30, 30), y + rnd(-30, 30), list[rint(0, list.length - 1)]);
      }, i * 60);
    }
  }

  /* Partículas automáticas ao rolar */
  let scrollParticleThrottle = 0;
  window.addEventListener("scroll", () => {
    const now = Date.now();
    if (now - scrollParticleThrottle < 120) return;
    scrollParticleThrottle = now;
    const x = rnd(window.innerWidth * 0.05, window.innerWidth * 0.95);
    const y = rnd(window.innerHeight * 0.1, window.innerHeight * 0.9);
    launchParticle(x, y);
  }, { passive: true });

  /* =========================================================================
   * 2. ISADORA FLOATING COMPANION — Isadora se move de lado a lado
   * ========================================================================= */
  const companion = document.createElement("div");
  companion.id = "isadora-companion";
  companion.style.cssText = [
    "position:fixed",
    "bottom:10px",
    "right:-100px",            /* começa fora da tela */
    "width:90px",
    "height:auto",
    "pointer-events:none",
    "z-index:8888",
    "transition:right 0.8s cubic-bezier(0.34,1.56,0.64,1)",
    "filter:drop-shadow(0 6px 18px rgba(229,36,59,0.35))",
    "will-change:transform"
  ].join(";");

  const companionImg = document.createElement("img");
  companionImg.src = "assets/isadora/princesinha_a_acenar_com_coroa_floral.webp";
  companionImg.onerror = () => { companionImg.src = "assets/isadora/princesinha_a_acenar_com_coroa_floral.png"; };
  companionImg.alt = "Princesinha Isadora";
  companionImg.style.cssText = "width:90px;height:auto;display:block;";
  companion.appendChild(companionImg);

  /* Balão de fala flutuante */
  const companionBubble = document.createElement("div");
  companionBubble.id = "companion-bubble";
  companionBubble.style.cssText = [
    "position:absolute",
    "bottom:92px",
    "right:10px",
    "background:#ffffff",
    "border:2.5px solid #ffbe1a",
    "border-radius:16px 16px 4px 16px",
    "padding:7px 11px",
    "font-size:11px",
    "font-family:'Poppins',sans-serif",
    "font-weight:700",
    "color:#d91626",
    "white-space:nowrap",
    "box-shadow:0 4px 14px rgba(0,0,0,0.14)",
    "opacity:0",
    "transform:translateY(8px) scale(0.8)",
    "transition:opacity 0.4s ease,transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
    "pointer-events:none",
    "max-width:160px",
    "white-space:normal",
    "text-align:center",
    "line-height:1.3"
  ].join(";");
  companion.appendChild(companionBubble);
  document.body.appendChild(companion);

  const COMPANION_MESSAGES = [
    "✨ Role mais para baixo!",
    "🍎 Vem ver a festa!",
    "👑 Olha aqui!",
    "💖 Que saudade de você!",
    "🌸 Quase chegando...",
    "🎈 Clica em mim!",
    "🎉 Vai ser incrível!",
    "🦋 Venha brincar comigo!",
    "⭐ Surpresa te espera!",
    "🎂 1 aninho chegando!",
  ];

  let companionVisible = false;
  let companionFlipped = false;
  let companionBubbleTimer = null;
  let lastCompanionSide = "right";

  function showCompanionBubble(msg) {
    clearTimeout(companionBubbleTimer);
    companionBubble.textContent = msg || COMPANION_MESSAGES[rint(0, COMPANION_MESSAGES.length - 1)];
    companionBubble.style.opacity = "1";
    companionBubble.style.transform = "translateY(0) scale(1)";
    companionBubbleTimer = setTimeout(() => {
      companionBubble.style.opacity = "0";
      companionBubble.style.transform = "translateY(8px) scale(0.8)";
    }, 3200);
  }

  companion.addEventListener("click", () => {
    burstParticles(
      parseFloat(companion.style.right || 12) < 200 ? window.innerWidth - 60 : 60,
      window.innerHeight - 80, 10
    );
    showCompanionBubble(COMPANION_MESSAGES[rint(0, COMPANION_MESSAGES.length - 1)]);
  });

  let lastScrollY = 0;
  let companionMoveThrottle = 0;
  let companionSide = "right"; /* "right" ou "left" */
  let isadoraPoses = [
    "assets/isadora/princesinha_a_acenar_com_coroa_floral.webp",
    "assets/isadora/menina_com_vestido_floral_a_acenar.webp",
    "assets/isadora/retrato_de_bebe_com_vestido_floral.webp",
    "assets/isadora/menina_em_vestido_floral_de_princesa.webp"
  ];
  let poseIdx = 0;

  function switchCompanionSide(side) {
    if (side === companionSide) return;
    companionSide = side;

    /* Muda pose da Isadora */
    poseIdx = (poseIdx + 1) % isadoraPoses.length;
    companionImg.style.opacity = "0";
    setTimeout(() => {
      companionImg.src = isadoraPoses[poseIdx];
      companionImg.style.opacity = "1";
    }, 250);

    if (side === "left") {
      companion.style.right = "auto";
      companion.style.left = "-100px";
      companion.style.transform = "scaleX(-1)"; /* espelha para olhar para dentro */
      /* Move para dentro */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          companion.style.left = "12px";
          companionImg.style.transition = "opacity 0.25s ease";
        });
      });
    } else {
      companion.style.left = "auto";
      companion.style.right = "-100px";
      companion.style.transform = "scaleX(1)";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          companion.style.right = "12px";
          companionImg.style.transition = "opacity 0.25s ease";
        });
      });
    }
  }

  function updateCompanionOnScroll() {
    const now = Date.now();
    if (now - companionMoveThrottle < 400) return;
    companionMoveThrottle = now;

    const scrollY = window.scrollY;
    const scrollDelta = scrollY - lastScrollY;
    lastScrollY = scrollY;
    const scrollPercent = scrollY / (document.documentElement.scrollHeight - window.innerHeight);

    /* Alterna de lado conforme progresso de scroll */
    const targetSide = scrollPercent < 0.35 ? "right"
      : scrollPercent < 0.65 ? "left"
      : scrollPercent < 0.85 ? "right"
      : "left";

    if (!companionVisible) {
      /* Aparece após 80px de scroll */
      if (scrollY > 80) {
        companionVisible = true;
        switchCompanionSide(targetSide);
        setTimeout(() => showCompanionBubble("🍎 Role para mais magia!"), 600);
      }
    } else {
      switchCompanionSide(targetSide);
      /* Mensagem ocasional ao mudar de lado */
      if (Math.random() < 0.18) {
        showCompanionBubble();
      }
    }

    /* Burst de partículas ao mudar direção brusca */
    if (Math.abs(scrollDelta) > 60) {
      const cx = companionSide === "right" ? window.innerWidth - 60 : 60;
      burstParticles(cx, window.innerHeight - 80, 5, ["✨","💫","⭐","🌸"]);
    }
  }

  window.addEventListener("scroll", updateCompanionOnScroll, { passive: true });

  /* Pequeno balanço contínuo */
  let bounceTick = 0;
  function companionBounce() {
    bounceTick++;
    const wobble = Math.sin(bounceTick * 0.06) * 5;
    const scale = 1 + Math.sin(bounceTick * 0.09) * 0.04;
    companionImg.style.transform = `translateY(${wobble}px) scale(${scale})`;
    requestAnimationFrame(companionBounce);
  }
  requestAnimationFrame(companionBounce);

  /* =========================================================================
   * 3. SCROLL REVEAL APRIMORADO — com atraso em cascata e partículas
   * ========================================================================= */
  const revealElements = qsa(".scroll-reveal");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting) {
        /* Atraso escalonado para elementos filhos */
        const delay = parseFloat(el.dataset.revealDelay || "0");
        setTimeout(() => {
          el.classList.add("revealed");
          /* Partículas ao revelar */
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 3;
          const emojis = el.classList.contains("story-character-box")
            ? ["💖","✨","⭐","🍎","👑"]
            : ["✨","💫","🌟","⭐"];
          burstParticles(cx, cy, 6, emojis);
        }, delay);
      } else {
        const rect = el.getBoundingClientRect();
        /* Só recolhe se saiu completamente da tela */
        if (rect.top > window.innerHeight + 50 || rect.bottom < -50) {
          el.classList.remove("revealed");
        }
      }
    });
  }, { rootMargin: "0px 0px -60px 0px", threshold: 0.08 });

  revealElements.forEach((el, i) => {
    /* Adiciona atraso escalonado automaticamente */
    if (!el.dataset.revealDelay) {
      /* Calcula posição dentro do container pai */
      const siblings = qsa(".scroll-reveal", el.parentElement);
      const idx = siblings.indexOf(el);
      el.dataset.revealDelay = String(idx * 140);
    }
    revealObserver.observe(el);
  });

  /* =========================================================================
   * 4. MAGIC TYPEWRITER — Mensagens que surgem letra a letra
   * ========================================================================= */
  function typewrite(el, speed) {
    const full = el.dataset.typeText || el.textContent;
    el.dataset.typeText = full;
    el.textContent = "";
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += full[i++];
      if (i >= full.length) clearInterval(interval);
    }, speed || 35);
  }

  const typeElements = qsa("[data-typewrite]");
  const typeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.typed) {
        entry.target.dataset.typed = "1";
        const delay = parseFloat(entry.target.dataset.typeDelay || "300");
        setTimeout(() => typewrite(entry.target, parseFloat(entry.target.dataset.typeSpeed || "35")), delay);
      }
    });
  }, { threshold: 0.5 });

  typeElements.forEach(el => typeObserver.observe(el));

  /* =========================================================================
   * 5. PARALLAX — elementos flutuam em velocidades diferentes ao rolar
   * ========================================================================= */
  const parallaxElements = qsa("[data-parallax]");

  function applyParallax() {
    const scrollY = window.scrollY;
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax || "0.2");
      const offset = scrollY * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }

  if (parallaxElements.length) {
    window.addEventListener("scroll", applyParallax, { passive: true });
    applyParallax();
  }

  /* =========================================================================
   * 6. MAGIC TRAIL — rastro de brilhinhos seguindo o cursor / toque
   * ========================================================================= */
  let trailThrottle = 0;

  function onPointerMove(e) {
    const now = Date.now();
    if (now - trailThrottle < 80) return;
    trailThrottle = now;
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    if (!x || !y) return;
    launchParticle(x, y, PARTICLE_EMOJIS[rint(0, PARTICLE_EMOJIS.length - 1)]);
  }

  document.addEventListener("mousemove", onPointerMove, { passive: true });
  document.addEventListener("touchmove", onPointerMove, { passive: true });

  /* =========================================================================
   * 7. SCROLL PROGRESS BAR — barra mágica de progresso no topo
   * ========================================================================= */
  const progressBar = document.createElement("div");
  progressBar.id = "scroll-progress-bar";
  progressBar.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    "height:3px",
    "width:0%",
    "background:linear-gradient(90deg,#e5243b 0%,#ffbe1a 40%,#1e4299 70%,#e5243b 100%)",
    "background-size:200% 100%",
    "animation:progressShimmer 2s linear infinite",
    "z-index:99999",
    "transition:width 0.15s ease",
    "border-radius:0 2px 2px 0"
  ].join(";");

  const progressStyle = document.createElement("style");
  progressStyle.textContent = `
    @keyframes progressShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(progressStyle);
  document.body.appendChild(progressBar);

  function updateProgressBar() {
    const scrollTop = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (scrollTop / totalHeight) * 100 : 0;
    progressBar.style.width = progress + "%";
  }
  window.addEventListener("scroll", updateProgressBar, { passive: true });

  /* =========================================================================
   * 8. SECTION ENTRANCE FLASH — lampejo de brilho ao entrar em cada seção
   * ========================================================================= */
  const sceneSections = qsa(".story-scene-section");
  const flashEl = document.createElement("div");
  flashEl.id = "section-flash";
  flashEl.style.cssText = [
    "position:fixed",
    "top:0","left:0","width:100%","height:100%",
    "pointer-events:none",
    "z-index:9990",
    "opacity:0",
    "background:radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, transparent 70%)",
    "transition:opacity 0.2s ease"
  ].join(";");
  document.body.appendChild(flashEl);

  let lastScene = -1;

  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const scene = parseInt(entry.target.dataset.scene || "0");
      if (scene === lastScene) return;
      lastScene = scene;

      /* Flash */
      flashEl.style.opacity = "1";
      setTimeout(() => { flashEl.style.opacity = "0"; }, 250);

      /* Burst de partículas no centro */
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const sceneEmojis = [
        ["✨","👑","💖","🍎"],
        ["🌸","🐦","🌺","🦋"],
        ["🎉","🎈","⭐","🌟"]
      ];
      burstParticles(cx, cy, 12, sceneEmojis[(scene - 1) % sceneEmojis.length]);

      /* Mensagem na Isadora-companion */
      const companionMsgs = [
        "👑 Era uma vez...",
        "🌸 O Bosque Encantado!",
        "🎉 A grande Celebração!",
      ];
      showCompanionBubble(companionMsgs[(scene - 1) % companionMsgs.length]);
    });
  }, { rootMargin: "-30% 0px -30% 0px", threshold: 0 });

  sceneSections.forEach(sec => sceneObserver.observe(sec));

  /* =========================================================================
   * 9. FLOATING SPARKLES — estrelinhas flutuantes contínuas na página
   * ========================================================================= */
  const sparkleLayer = document.createElement("div");
  sparkleLayer.id = "floating-sparkles-layer";
  sparkleLayer.style.cssText = [
    "position:fixed",
    "top:0","left:0","width:100%","height:100%",
    "pointer-events:none",
    "z-index:100",
    "overflow:hidden"
  ].join(";");
  document.body.appendChild(sparkleLayer);

  const SPARKLE_SYMBOLS = ["✨","⭐","💫","🌟","🍎","💖"];
  const MAX_AMBIENT = 8;

  function spawnAmbientSparkle() {
    if (sparkleLayer.children.length >= MAX_AMBIENT) return;
    const sp = document.createElement("span");
    sp.textContent = SPARKLE_SYMBOLS[rint(0, SPARKLE_SYMBOLS.length - 1)];
    const x = rnd(2, 96);
    const dur = rnd(4, 8);
    const delay = rnd(0, 3);
    const size = rnd(12, 22);
    sp.style.cssText = [
      "position:absolute",
      `left:${x}%`,
      "top:110%",
      `font-size:${size}px`,
      "opacity:0",
      `animation:ambientFloat ${dur}s ${delay}s ease-in-out forwards`
    ].join(";");
    sparkleLayer.appendChild(sp);
    setTimeout(() => sp.remove(), (dur + delay) * 1000 + 500);
  }

  const ambientStyle = document.createElement("style");
  ambientStyle.textContent = `
    @keyframes ambientFloat {
      0%   { transform:translateY(0) rotate(0deg)   scale(0.5); opacity:0; }
      15%  { opacity:0.85; }
      80%  { opacity:0.7; }
      100% { transform:translateY(-115vh) rotate(360deg) scale(1.2); opacity:0; }
    }
  `;
  document.head.appendChild(ambientStyle);

  setInterval(spawnAmbientSparkle, 650);

  /* =========================================================================
   * 10. ISADORA WAVE TEXT — palavras mágicas surgem ao rolar para seções
   * ========================================================================= */
  const waveTextEls = qsa(".magic-wave-text");

  function applyWaveEffect(el) {
    if (el.dataset.waved) return;
    el.dataset.waved = "1";
    const text = el.dataset.waveText || el.textContent;
    el.textContent = "";
    [...text].forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00a0" : char;
      span.style.cssText = [
        "display:inline-block",
        "opacity:0",
        "transform:translateY(20px) rotate(6deg) scale(0.7)",
        `animation:magicCharIn 0.5s ${i * 55}ms cubic-bezier(0.34,1.56,0.64,1) forwards`
      ].join(";");
      el.appendChild(span);
    });
  }

  const waveStyle = document.createElement("style");
  waveStyle.textContent = `
    @keyframes magicCharIn {
      0%   { opacity:0; transform:translateY(20px) rotate(6deg) scale(0.7); }
      60%  { opacity:1; transform:translateY(-4px) rotate(-1deg) scale(1.05); }
      100% { opacity:1; transform:translateY(0) rotate(0) scale(1); }
    }
  `;
  document.head.appendChild(waveStyle);

  const waveObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) applyWaveEffect(entry.target);
    });
  }, { threshold: 0.3 });

  waveTextEls.forEach(el => {
    el.dataset.waveText = el.textContent;
    waveObserver.observe(el);
  });

  /* =========================================================================
   * 11. SCROLL MAGNET — "pula" suavemente para a próxima seção com bounce
   * ========================================================================= */
  let isSnapping = false;
  let snapTimer = null;

  function getScrollSections() {
    return qsa(".story-scene-section, .countdown-section, .magic-actions-bar, .fairytale-breathing-quote");
  }

  /* EXPOSIÇÃO GLOBAL de funções auxiliares para uso externo */
  window.magicScroll = {
    burstParticles,
    launchParticle,
    showCompanionBubble,
    typewrite
  };

})();
