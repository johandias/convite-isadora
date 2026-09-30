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

      this.init();
    }

    init() {
      this.refreshMetrics();
      this.bindEvents();
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

    playPageTurnSound() {
      if (!this.audioCtx) return;
      try {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const now = this.audioCtx.currentTime;
        const bufferSize = this.audioCtx.sampleRate * 0.12;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900, now);
        filter.Q.setValueAtTime(1.5, now);

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        noise.start(now);
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
      const smoothing = this.isReducedMotion ? 0.35 : 0.14;
      const diff = this.targetProgress - this.currentProgress;

      if (Math.abs(diff) > 0.0005) {
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

      this.sheets.forEach((sheet, i) => {
        const stepStart = i * stepSize;
        const stepEnd = (i + 1) * stepSize;
        const readingThreshold = stepStart + (stepSize * 0.42);
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
          const earlyCurl = Math.sin(Math.min(1, clamped * 1.35) * Math.PI);
          const angle = -180 * eased;
          const curlZ = 7 + (lift * 54);
          const curlScale = 1 - (lift * 0.065);
          const skewY = (earlyCurl * 1.55) * (eased < 0.5 ? 1 : -1);
          const rotateX = rise * (eased < 0.5 ? 2.6 : -1.4);
          const rotateZ = (rise * 0.82) * (eased < 0.5 ? -1 : 1);
          const translateX = Math.sin(eased * Math.PI) * -8;
          const translateY = rise * -7;

          sheet.style.transform = `translateX(${translateX.toFixed(2)}px) translateY(${translateY.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) rotateY(${angle.toFixed(2)}deg) scaleX(${curlScale.toFixed(3)}) skewY(${skewY.toFixed(2)}deg) translateZ(${curlZ.toFixed(1)}px)`;
          sheet.style.zIndex = totalSheets + 5;
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

          if (this.lastCrossedPage !== i && clamped > 0.4 && clamped < 0.6) {
            this.playPageTurnSound();
            this.lastCrossedPage = i;
          }
        }
      });

      if (this.stackLeft) {
        this.stackLeft.style.transform = `scaleX(${Math.min(1, turnedCount / 11).toFixed(3)})`;
      }

      const activeChapter = Math.min(
        this.totalChapters - 1,
        Math.floor(p * (this.totalChapters - 0.2))
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
        flipOverlay.style.opacity = (lift * 0.68).toFixed(3);
        flipOverlay.style.setProperty('--flip-progress', progress.toFixed(3));
        flipOverlay.style.setProperty('--flip-shadow', (lift * 0.34).toFixed(3));
        flipOverlay.style.setProperty('--flip-shadow-soft', (lift * 0.22).toFixed(3));
        flipOverlay.style.setProperty('--flip-highlight', (lift * 0.28).toFixed(3));
      }
      sheet.style.setProperty('--paper-curl', lift.toFixed(3));
      sheet.style.setProperty('--paper-fold', `${(progress * 100).toFixed(1)}%`);
      sheet.style.setProperty('--paper-edge-opacity', (0.18 + (lift * 0.32)).toFixed(3));
      sheet.style.setProperty('--paper-shadow-opacity', (lift * 0.5).toFixed(3));
      sheet.style.setProperty('--paper-shadow-x', `${(-12 + (progress * 28)).toFixed(1)}px`);
    }

    getGuardedProgress(progress) {
      if (this.readyPages.size >= BOOK_PAGES.length) return progress;

      const stepSize = 1 / this.totalSheets;
      for (let i = 0; i < this.totalSheets; i++) {
        const stepStart = i * stepSize;
        const stepEnd = (i + 1) * stepSize;
        const readingThreshold = stepStart + (stepSize * 0.42);
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
