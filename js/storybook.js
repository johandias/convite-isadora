/**
 * O LIVRO DA PRINCESINHA ISADORA - controlador 3D interativo.
 * Mobile-first, scroll-driven, reversivel e com preload/decode progressivo.
 */

(function () {
  'use strict';

  const CHAPTERS_DATA = [
    { title: 'Capa Oficial Encantada', subtitle: 'O Livro da Princesinha Isadora' },
    { title: 'Folha de Rosto Real', subtitle: 'Uma hist\u00f3ria escrita com amor' },
    { title: 'Era uma vez...', subtitle: 'O Bosque Encantado' },
    { title: 'Chegou Isadora Louise', subtitle: 'O Maior Amor do Mundo' },
    { title: 'Tudo Ganhou Novas Cores', subtitle: 'A Magia dos Primeiros Dias' },
    { title: 'Um Mundo para Descobrir', subtitle: 'Curiosidade e Alegria' },
    { title: 'Cercada de Amor', subtitle: 'O Carinho da Fam\u00edlia' },
    { title: 'Ela Foi Crescendo...', subtitle: 'Jeitinho Doce e Encantador' },
    { title: 'A Princesa da Floresta', subtitle: 'Amiga de Todos os Bichinhos' },
    { title: 'E ent\u00e3o... 1 Aninho!', subtitle: 'Um Ano Cheio de Luz' },
    { title: 'Convite Especial', subtitle: 'O Pr\u00f3ximo Cap\u00edtulo com Voc\u00ea' },
    { title: 'Fim...', subtitle: 'Esta hist\u00f3ria est\u00e1 apenas come\u00e7ando' }
  ];

  const BOOK_IMAGE_SIZES = '(max-width: 480px) 92vw, (max-width: 768px) 85vw, 700px';
  const BOOK_PAGES = [
    '00_capa_livro_isadora',
    '01_folha_rosto_isadora',
    '02_era_uma_vez_no_bosque',
    '03_entao_chegou_isadora',
    '04_tudo_ganhou_novas_cores',
    '05_um_mundo_para_descobrir',
    '06_princesinha_cercada_de_amor',
    '07_ela_foi_crescendo',
    '08_a_floresta_descobriu_sua_princesa',
    '09_e_entao_1_aninho',
    '10_convite_magico_com_botoes',
    '11_fim_magico_isadora'
  ].map((name) => ({
    name,
    fallback: `assets/isadora/book/${name}.png`,
    srcset: [
      `assets/isadora/book/${name}-480.avif 480w`,
      `assets/isadora/book/${name}-768.avif 768w`,
      `assets/isadora/book/${name}.avif ${name === '00_capa_livro_isadora' || name === '11_fim_magico_isadora' ? 1024 : 1086}w`
    ].join(', ')
  }));

  class InteractiveStorybook {
    constructor() {
      this.section = document.getElementById('secao-livro');
      if (!this.section) return;

      this.assembly = document.getElementById('bookAssembly');
      this.sheets = Array.from(document.querySelectorAll('.book-sheet:not(.sheet-base)'));
      this.dots = Array.from(document.querySelectorAll('.book-step-dot'));
      this.titleEl = document.getElementById('bookChapterTitle');
      this.badgeEl = document.getElementById('bookChapterBadge');
      this.stackLeft = document.getElementById('bookStackLeft');
      this.stackRight = document.getElementById('bookStackRight');
      this.prevBtn = document.getElementById('bookNavPrev');
      this.nextBtn = document.getElementById('bookNavNext');
      this.introCurtain = document.getElementById('bookIntroCurtain');

      this.totalSheets = this.sheets.length;
      this.totalChapters = CHAPTERS_DATA.length;
      this.currentChapterIndex = 0;
      this.targetProgress = 0;
      this.currentProgress = 0;
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.sectionTop = 0;
      this.totalScrollable = 1;
      this.rafId = null;
      this.preloadStarted = false;
      this.preloadPromises = new Map();
      this.readyPages = new Set();

      this.audioCtx = null;
      this.lastCrossedPage = -1;
      this.lastSoundState = null;
      this.lastRenderProgress = 0;

      this.init();
    }

    init() {
      this.refreshMetrics();
      this.bindEvents();
      this.setupDirectDrag();
      this.update(true);
      this.preloadWindow(0, 4, true);
      this.observePreloadStart();
    }

    initAudio() {
      if (this.audioCtx) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      } catch (e) {
        // Audio pode estar bloqueado/desabilitado pelo navegador.
      }
    }

    playPageTurnSound(direction = 1) {
      if (!this.audioCtx) return;
      try {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const now = this.audioCtx.currentTime;
        const duration = 0.22;
        const sampleRate = this.audioCtx.sampleRate;
        const bufferSize = Math.floor(sampleRate * duration);
        const buffer = this.audioCtx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);

        // Síntese de ruído rosa suave simulando o atrito real entre folhas de papel
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          const pink = (b0 + b1 + b2 + white * 0.5362) * 0.18;
          const t = i / bufferSize;
          const envelope = Math.sin(t * Math.PI) * Math.exp(-t * 1.5);
          data[i] = pink * envelope;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Filtro passa-faixa com varredura aerodinâmica (o sopro característico da folha se movendo)
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        const startFreq = direction >= 0 ? 1450 : 1250;
        const endFreq = direction >= 0 ? 520 : 620;
        filter.frequency.setValueAtTime(startFreq, now);
        filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.85);
        filter.Q.setValueAtTime(1.8, now);

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        noise.start(now);

        // Fase 2: Amortecimento sutil ao pousar no bloco de páginas (low-frequency cushion thud)
        const osc = this.audioCtx.createOscillator();
        const oscGain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now + duration * 0.65);
        osc.frequency.exponentialRampToValueAtTime(55, now + duration);
        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.setValueAtTime(0.035, now + duration * 0.65);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.06);

        osc.connect(oscGain);
        oscGain.connect(this.audioCtx.destination);
        osc.start(now + duration * 0.65);
        osc.stop(now + duration + 0.07);
      } catch (e) {}
    }

    bindEvents() {
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

      window.addEventListener('resize', () => {
        this.refreshMetrics();
        this.handleScroll();
      }, { passive: true });

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.initAudio();
          this.goToChapter(this.currentChapterIndex - 1);
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.initAudio();
          this.goToChapter(this.currentChapterIndex + 1);
        });
      }

      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          this.initAudio();
          this.goToChapter(index);
        });
      });

      if (this.introCurtain) {
        this.introCurtain.addEventListener('click', () => {
          this.initAudio();
          this.goToChapter(0);
        });
      }

      window.addEventListener('keydown', (e) => {
        const scrollY = window.scrollY;
        const inBook = scrollY >= this.sectionTop - window.innerHeight &&
          scrollY <= this.sectionTop + this.section.offsetHeight;

        if (!inBook) return;

        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          this.goToChapter(this.currentChapterIndex + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          this.goToChapter(this.currentChapterIndex - 1);
        }
      });

      document.addEventListener('pointerdown', () => this.initAudio(), { once: true });
    }

    setupDirectDrag() {
      if (!this.assembly) return;

      let isPointerDown = false;
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let startTime = 0;
      let startProgress = 0;
      let lastX = 0;
      let velocityX = 0;
      let lastMoveTime = 0;

      const onPointerDown = (e) => {
        // Não interceptar cliques em botões de ação ou links interativos
        if (e.target.closest('a, button, input, .book-action-btn, .book-nav-arrow')) {
          return;
        }

        this.initAudio();
        isPointerDown = true;
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        lastX = e.clientX;
        startTime = performance.now();
        lastMoveTime = startTime;
        velocityX = 0;
        startProgress = this.currentProgress;
      };

      const onPointerMove = (e) => {
        if (!isPointerDown) return;

        const currentX = e.clientX;
        const currentY = e.clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const now = performance.now();

        const dt = now - lastMoveTime;
        if (dt > 0) {
          velocityX = (currentX - lastX) / dt;
          lastX = currentX;
          lastMoveTime = now;
        }

        if (!isDragging) {
          if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
            isDragging = true;
            this.assembly.classList.add('is-dragging');
            if (e.cancelable) e.preventDefault();
          } else if (Math.abs(deltaY) > 10) {
            isPointerDown = false;
            return;
          }
        }

        if (isDragging) {
          if (e.cancelable) e.preventDefault();
          const bookWidth = Math.max(280, this.assembly.offsetWidth);
          // Arrasto para a esquerda avança a página; arrasto para a direita retrocede
          const pageTurnDelta = (-deltaX / (bookWidth * 0.75)) * (1 / this.totalSheets);
          this.targetProgress = Math.max(0, Math.min(1, startProgress + pageTurnDelta));
          this.preloadAroundProgress(this.targetProgress);
          this.startUpdateLoop();
        }
      };

      const onPointerUp = (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;

        const elapsed = performance.now() - startTime;
        const currentX = e.clientX;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        if (isDragging) {
          isDragging = false;
          this.assembly.classList.remove('is-dragging');

          const currentStep = this.targetProgress * this.totalSheets;
          let targetStep = Math.round(currentStep);

          if (Math.abs(velocityX) > 0.45 && elapsed < 350) {
            targetStep = velocityX < 0 ? Math.ceil(currentStep) : Math.floor(currentStep);
          }

          const targetChapter = Math.max(0, Math.min(this.totalChapters - 1, targetStep));
          this.goToChapter(targetChapter);
        } else if (elapsed < 300 && Math.hypot(deltaX, deltaY) < 12) {
          // Toque suave nas laterais do livro para folhear rapidamente
          const rect = this.assembly.getBoundingClientRect();
          const tapRelativeX = (currentX - rect.left) / rect.width;

          if (tapRelativeX > 0.65) {
            this.goToChapter(this.currentChapterIndex + 1);
          } else if (tapRelativeX < 0.35) {
            this.goToChapter(this.currentChapterIndex - 1);
          }
        }
      };

      this.assembly.addEventListener('pointerdown', onPointerDown, { passive: false });
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true });
    }

    handleScroll() {
      const currentScroll = window.scrollY - this.sectionTop;
      const rawProgress = currentScroll / this.totalScrollable;
      this.targetProgress = Math.max(0, Math.min(1, rawProgress));
      this.preloadAroundProgress(this.targetProgress);
      this.startUpdateLoop();
    }

    startUpdateLoop() {
      if (this.rafId) return;
      this.rafId = window.requestAnimationFrame(() => this.updateLoop());
    }

    updateLoop() {
      this.rafId = null;
      const smoothing = this.isReducedMotion ? 0.35 : 0.16;
      const diff = this.targetProgress - this.currentProgress;

      if (Math.abs(diff) > 0.0003) {
        this.currentProgress += diff * smoothing;
        this.render();
        this.startUpdateLoop();
      } else {
        this.currentProgress = this.targetProgress;
        this.render();
      }
    }

    goToChapter(index) {
      const clampedIndex = Math.max(0, Math.min(this.totalChapters - 1, index));
      const targetP = clampedIndex / (this.totalChapters - 1);
      const targetScrollY = this.sectionTop + (targetP * this.totalScrollable);

      this.preloadWindow(Math.max(0, clampedIndex - 1), clampedIndex + 3, true);
      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });
    }

    update(immediate = false) {
      this.handleScroll();
      if (immediate) {
        this.currentProgress = this.targetProgress;
        this.render();
      }
    }

    render() {
      const p = this.getGuardedProgress(this.currentProgress);
      const totalSheets = this.sheets.length;
      const stepSize = 1 / totalSheets;
      let turnedCount = 0;
      const isForward = p >= this.lastRenderProgress;

      this.sheets.forEach((sheet, i) => {
        const stepStart = i * stepSize;
        const stepEnd = (i + 1) * stepSize;
        const readingThreshold = stepStart + (stepSize * 0.10);
        const flipOverlay = sheet.querySelector('.sheet-flip-overlay');
        const actionOverlay = sheet.querySelector('.sheet-action-overlay');

        if (this.isReducedMotion) {
          this.renderReducedMotionSheet(sheet, flipOverlay, actionOverlay, p, stepEnd, totalSheets, i);
          if (p >= stepEnd) turnedCount++;
          return;
        }

        if (p <= readingThreshold) {
          sheet.style.transform = 'rotateY(0deg) translateZ(0)';
          sheet.style.zIndex = (totalSheets - i) + 1;
          this.applySheetFX(sheet, flipOverlay, 0, 0);
          if (actionOverlay) {
            actionOverlay.style.opacity = '1';
            actionOverlay.style.pointerEvents = 'auto';
          }
          sheet.classList.remove('turned');
        } else if (p >= stepEnd) {
          sheet.style.transform = 'rotateY(-180deg) translateZ(0)';
          sheet.style.zIndex = i + 1;
          this.applySheetFX(sheet, flipOverlay, 1, 0);
          if (actionOverlay) {
            actionOverlay.style.opacity = '0';
            actionOverlay.style.pointerEvents = 'none';
          }
          sheet.classList.add('turned');
          turnedCount++;
        } else {
          const localProgress = (p - readingThreshold) / (stepEnd - readingThreshold);
          const clamped = Math.max(0, Math.min(1, localProgress));
          const eased = this.paperEase(clamped);
          const lift = Math.sin(eased * Math.PI);
          const rise = Math.sin(clamped * Math.PI);
          const earlyCurl = Math.sin(Math.min(1, clamped * 1.25) * Math.PI);
          const angle = -180 * eased;
          const curlZ = 4 + (lift * 68);
          const curlScale = 1 - (lift * 0.082);
          const skewY = (earlyCurl * 1.8) * (eased < 0.5 ? 1 : -0.75);
          const rotateX = rise * (eased < 0.5 ? 3.2 : -1.8);
          const rotateZ = (rise * 1.1) * (eased < 0.5 ? -1 : 0.8);
          const translateX = Math.sin(eased * Math.PI) * -10;
          const translateY = rise * -6;

          sheet.style.transform = `translateX(${translateX.toFixed(2)}px) translateY(${translateY.toFixed(2)}px) translateZ(${curlZ.toFixed(1)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${angle.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) skewY(${skewY.toFixed(2)}deg) scaleX(${curlScale.toFixed(3)})`;
          sheet.style.zIndex = totalSheets + 10;
          this.applySheetFX(sheet, flipOverlay, eased, lift);

          if (actionOverlay) {
            actionOverlay.style.opacity = clamped > 0.05 ? '0' : '1';
            actionOverlay.style.pointerEvents = clamped > 0.05 ? 'none' : 'auto';
          }

          if (clamped >= 0.5) {
            sheet.classList.add('turned');
            turnedCount += clamped;
          } else {
            sheet.classList.remove('turned');
          }

          if (Math.abs(clamped - 0.5) < 0.15) {
            const pageState = isForward ? `fwd_${i}` : `bwd_${i}`;
            if (this.lastSoundState !== pageState) {
              this.playPageTurnSound(isForward ? 1 : -1);
              this.lastSoundState = pageState;
            }
          }
        }
      });

      if (this.stackLeft) {
        const leftRatio = Math.min(1, Math.max(0, turnedCount / (totalSheets - 1)));
        this.stackLeft.style.transform = `scaleX(${(leftRatio * 0.95).toFixed(3)})`;
      }
      if (this.stackRight) {
        const rightRatio = Math.min(1, Math.max(0, (totalSheets - 1 - turnedCount) / (totalSheets - 1)));
        this.stackRight.style.transform = `scaleX(${(0.12 + rightRatio * 0.88).toFixed(3)})`;
      }

      const activeChapter = Math.min(
        this.totalChapters - 1,
        Math.round(p * (this.totalChapters - 1))
      );

      if (activeChapter !== this.currentChapterIndex) {
        this.currentChapterIndex = activeChapter;
        this.updateHUD(activeChapter);
      }

      if (p > 0.94) {
        const exitProgress = (p - 0.94) / 0.06;
        const scale = 1 - (exitProgress * 0.06);
        const yOffset = exitProgress * 15;
        this.assembly.style.transform = `scale(${scale.toFixed(3)}) translateY(${yOffset.toFixed(1)}px)`;
      } else {
        this.assembly.style.transform = 'scale(1) translateY(0)';
      }

      if (this.prevBtn) {
        this.prevBtn.disabled = this.currentChapterIndex === 0;
        this.prevBtn.classList.toggle('disabled', this.currentChapterIndex === 0);
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = this.currentChapterIndex === this.totalChapters - 1;
        this.nextBtn.classList.toggle('disabled', this.currentChapterIndex === this.totalChapters - 1);
      }

      this.lastRenderProgress = p;
    }

    renderReducedMotionSheet(sheet, flipOverlay, actionOverlay, p, stepEnd, totalSheets, index) {
      const turned = p >= stepEnd;
      sheet.style.transform = 'none';
      sheet.style.opacity = turned ? '0' : '1';
      sheet.style.zIndex = turned ? index + 1 : (totalSheets - index) + 1;
      sheet.classList.toggle('turned', turned);
      this.applySheetFX(sheet, flipOverlay, turned ? 1 : 0, 0);
      if (actionOverlay) {
        actionOverlay.style.opacity = turned ? '0' : '1';
        actionOverlay.style.pointerEvents = turned ? 'none' : 'auto';
      }
    }

    applySheetFX(sheet, flipOverlay, progress, lift) {
      if (flipOverlay) {
        flipOverlay.style.opacity = (lift * 0.75).toFixed(3);
        flipOverlay.style.setProperty('--flip-progress', progress.toFixed(3));
        flipOverlay.style.setProperty('--flip-shadow', (lift * 0.38).toFixed(3));
        flipOverlay.style.setProperty('--flip-shadow-soft', (lift * 0.24).toFixed(3));
        flipOverlay.style.setProperty('--flip-highlight', (lift * 0.35).toFixed(3));
      }
      sheet.style.setProperty('--paper-curl', lift.toFixed(3));
      sheet.style.setProperty('--paper-fold', `${(progress * 100).toFixed(1)}%`);
      sheet.style.setProperty('--paper-edge-opacity', (0.15 + (lift * 0.4)).toFixed(3));
      sheet.style.setProperty('--paper-shadow-opacity', (lift * 0.58).toFixed(3));
      sheet.style.setProperty('--paper-shadow-blur', `${(6 + lift * 22).toFixed(1)}px`);
      sheet.style.setProperty('--paper-shadow-x', `${(-18 + (progress * 36)).toFixed(1)}px`);
      sheet.style.setProperty('--paper-shadow-scale', (0.75 + lift * 0.25).toFixed(3));
    }

    getGuardedProgress(progress) {
      if (this.readyPages.size >= BOOK_PAGES.length) return progress;

      const stepSize = 1 / this.totalSheets;
      for (let i = 0; i < this.totalSheets; i++) {
        const stepStart = i * stepSize;
        const stepEnd = (i + 1) * stepSize;
        const readingThreshold = stepStart + (stepSize * 0.10);
        const nextPageIndex = Math.min(BOOK_PAGES.length - 1, i + 1);

        if (progress > readingThreshold && progress < stepEnd && !this.readyPages.has(nextPageIndex)) {
          this.preloadWindow(Math.max(0, i - 1), i + 4, true);
          return readingThreshold - 0.0001;
        }
      }

      return progress;
    }

    updateHUD(index) {
      const data = CHAPTERS_DATA[index] || CHAPTERS_DATA[0];

      if (this.badgeEl) {
        if (index === 0) {
          this.badgeEl.textContent = 'Capa';
        } else if (index === 1) {
          this.badgeEl.textContent = 'Abertura';
        } else if (index === this.totalChapters - 1) {
          this.badgeEl.textContent = 'Ep\u00edlogo';
        } else {
          this.badgeEl.textContent = `P\u00e1gina ${index - 1} de 10`;
        }
      }

      if (this.titleEl) {
        this.titleEl.textContent = data.title;
      }

      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    paperEase(x) {
      return x < 0.5
        ? 4 * x * x * x
        : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    refreshMetrics() {
      this.sectionTop = this.section.offsetTop;
      this.totalScrollable = Math.max(1, this.section.offsetHeight - window.innerHeight);
    }

    observePreloadStart() {
      if (!('IntersectionObserver' in window)) {
        this.preloadAllPages();
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.preloadAllPages();
          observer.disconnect();
        }
      }, { rootMargin: '1200px 0px' });

      observer.observe(this.section);
    }

    preloadAroundProgress(progress) {
      const pageIndex = Math.min(BOOK_PAGES.length - 1, Math.floor(progress * (BOOK_PAGES.length - 1)));
      this.preloadWindow(Math.max(0, pageIndex - 1), pageIndex + 4, false);
    }

    preloadWindow(start, end, eager) {
      const last = Math.min(BOOK_PAGES.length - 1, end);
      for (let i = start; i <= last; i++) {
        this.preloadPage(i, eager);
      }
    }

    preloadAllPages() {
      if (this.preloadStarted) return;
      this.preloadStarted = true;
      this.preloadWindow(0, BOOK_PAGES.length - 1, false);
    }

    preloadPage(index, eager) {
      if (this.readyPages.has(index)) return Promise.resolve();
      if (this.preloadPromises.has(index)) return this.preloadPromises.get(index);

      const page = BOOK_PAGES[index];
      const img = new Image();
      img.decoding = 'async';
      img.sizes = BOOK_IMAGE_SIZES;
      if ('fetchPriority' in img) {
        img.fetchPriority = eager ? 'high' : 'low';
      }

      const promise = new Promise((resolve) => {
        img.onload = () => {
          const decoded = img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
          decoded.then(() => {
            this.readyPages.add(index);
            this.startUpdateLoop();
            resolve();
          });
        };
        img.onerror = () => resolve();
      });

      img.srcset = page.srcset;
      img.src = page.fallback;
      this.preloadPromises.set(index, promise);
      return promise;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new InteractiveStorybook());
  } else {
    new InteractiveStorybook();
  }
})();
