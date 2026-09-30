/**
 * O LIVRO DA PRINCESINHA ISADORA • CONTROLADOR 3D INTERATIVO
 * Mobile-First • Scroll-Driven • Reversível • Áudio Sutil de Folheamento
 */

(function () {
  'use strict';

  // Configuração dos Capítulos do Livro
  const CHAPTERS_DATA = [
    { title: "Capa Oficial Encantada", subtitle: "O Livro da Princesinha Isadora" },
    { title: "Folha de Rosto Real", subtitle: "Uma história escrita com amor" },
    { title: "Era uma vez...", subtitle: "O Bosque Encantado" },
    { title: "Chegou Isadora Louise", subtitle: "O Maior Amor do Mundo" },
    { title: "Tudo Ganhou Novas Cores", subtitle: "A Magia dos Primeiros Dias" },
    { title: "Um Mundo para Descobrir", subtitle: "Curiosidade e Alegria" },
    { title: "Cercada de Amor", subtitle: "O Carinho da Família" },
    { title: "Ela Foi Crescendo...", subtitle: "Jeitinho Doce e Encantador" },
    { title: "A Princesa da Floresta", subtitle: "Amiga de Todos os Bichinhos" },
    { title: "E então... 1 Aninho!", subtitle: "Um Ano Cheio de Luz" },
    { title: "Convite Especial", subtitle: "O Próximo Capítulo com Você" },
    { title: "Fim...", subtitle: "Esta história está apenas começando" }
  ];

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

      this.totalSheets = this.sheets.length; // 11 sheets que viram
      this.totalChapters = CHAPTERS_DATA.length; // 12 estados
      this.currentChapterIndex = 0;
      this.targetProgress = 0;
      this.currentProgress = 0;
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.audioCtx = null;
      this.lastCrossedPage = -1;

      this.init();
    }

    init() {
      this.bindEvents();
      this.update(true);
      this.preloadImages();
    }

    // Inicialização do Web Audio para som de virar folha
    initAudio() {
      if (this.audioCtx) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      } catch (e) {
        // Áudio desabilitado silenciosamente se não suportado
      }
    }

    playPageTurnSound() {
      if (!this.audioCtx) return;
      try {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const now = this.audioCtx.currentTime;
        const bufferSize = this.audioCtx.sampleRate * 0.12; // 120ms som suave de papel
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
      // Otimização de Scroll via requestAnimationFrame
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Cliques nos botões de assistência de navegação
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

      // Cliques nas bolinhas/marcadores
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          this.initAudio();
          this.goToChapter(index);
        });
      });

      // Clique no indicador de rolagem da introdução
      if (this.introCurtain) {
        this.introCurtain.addEventListener('click', () => {
          this.initAudio();
          this.goToChapter(0);
        });
      }

      // Teclas de seta
      window.addEventListener('keydown', (e) => {
        const rect = this.section.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            this.goToChapter(this.currentChapterIndex + 1);
          } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            this.goToChapter(this.currentChapterIndex - 1);
          }
        }
      });

      // Primeiro clique ativa o motor de áudio
      document.addEventListener('pointerdown', () => this.initAudio(), { once: true });
    }

    handleScroll() {
      const rect = this.section.getBoundingClientRect();
      const totalScrollable = this.section.offsetHeight - window.innerHeight;

      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = currentScroll / totalScrollable;
      this.targetProgress = Math.max(0, Math.min(1, rawProgress));

      this.updateLoop();
    }

    updateLoop() {
      // Interpolação suave para rolagem macia
      const diff = this.targetProgress - this.currentProgress;
      if (Math.abs(diff) > 0.0005) {
        this.currentProgress += diff * 0.22;
        this.render();
        window.requestAnimationFrame(() => this.updateLoop());
      } else {
        this.currentProgress = this.targetProgress;
        this.render();
      }
    }

    goToChapter(index) {
      const clampedIndex = Math.max(0, Math.min(this.totalChapters - 1, index));
      const totalScrollable = this.section.offsetHeight - window.innerHeight;
      const targetP = clampedIndex / (this.totalChapters - 1);
      const targetScrollY = this.section.offsetTop + (targetP * totalScrollable);

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
      const p = this.currentProgress;
      const totalSheets = this.sheets.length; // 11

      // Cada folha tem seu intervalo de virada
      const stepSize = 1 / totalSheets;

      let turnedCount = 0;

      this.sheets.forEach((sheet, i) => {
        const stepStart = i * stepSize;
        const stepEnd = (i + 1) * stepSize;

        // Janela de descanso de 30% do passo para leitura confortável
        const readingThreshold = stepStart + (stepSize * 0.28);
        const flipOverlay = sheet.querySelector('.sheet-flip-overlay');
        const actionOverlay = sheet.querySelector('.sheet-action-overlay');

        if (p <= readingThreshold) {
          // Folha ainda fechada / em leitura
          sheet.style.transform = 'rotateY(0deg)';
          sheet.style.zIndex = (totalSheets - i) + 1;
          if (flipOverlay) flipOverlay.style.opacity = '0';
          if (actionOverlay) {
            actionOverlay.style.opacity = '1';
            actionOverlay.style.pointerEvents = 'auto';
          }
          sheet.classList.remove('turned');
        } else if (p >= stepEnd) {
          // Folha totalmente virada
          sheet.style.transform = 'rotateY(-180deg)';
          sheet.style.zIndex = i + 1;
          if (flipOverlay) flipOverlay.style.opacity = '0';
          if (actionOverlay) {
            actionOverlay.style.opacity = '0';
            actionOverlay.style.pointerEvents = 'none';
          }
          sheet.classList.add('turned');
          turnedCount++;
        } else {
          // Folha em pleno movimento 3D de virada
          const localProgress = (p - readingThreshold) / (stepEnd - readingThreshold);
          const clamped = Math.max(0, Math.min(1, localProgress));

          // Easing suave na virada
          const easeProgress = this.easeInOutCubic(clamped);
          const angle = -180 * easeProgress;

          // Curvatura de papel sutil usando translateZ e rotação Y
          const rad = easeProgress * Math.PI;
          const curlZ = Math.sin(rad) * 22; // Elevação 3D suave da página no ar

          sheet.style.transform = `rotateY(${angle.toFixed(2)}deg) translateZ(${curlZ.toFixed(1)}px)`;
          sheet.style.zIndex = totalSheets + 5; // Fica no topo durante a virada

          // Efeito de iluminação e sombra dinâmica
          if (flipOverlay) {
            const shadowIntensity = Math.sin(rad) * 0.65;
            flipOverlay.style.opacity = shadowIntensity.toFixed(2);
          }

          if (actionOverlay) {
            if (clamped > 0.05) {
              actionOverlay.style.opacity = '0';
              actionOverlay.style.pointerEvents = 'none';
            } else {
              actionOverlay.style.opacity = '1';
              actionOverlay.style.pointerEvents = 'auto';
            }
          }

          if (clamped >= 0.5) {
            sheet.classList.add('turned');
            turnedCount += clamped;
          } else {
            sheet.classList.remove('turned');
          }

          // Disparo de som de virar página ao cruzar o meio
          if (this.lastCrossedPage !== i && clamped > 0.4 && clamped < 0.6) {
            this.playPageTurnSound();
            this.lastCrossedPage = i;
          }
        }
      });

      // Atualiza espessura física da pilha esquerda
      if (this.stackLeft) {
        this.stackLeft.style.width = Math.min(12, turnedCount * 1.05) + 'px';
      }

      // Calcula capítulo ativo atual
      const activeChapter = Math.min(
        this.totalChapters - 1,
        Math.floor(p * (this.totalChapters - 0.2))
      );

      if (activeChapter !== this.currentChapterIndex) {
        this.currentChapterIndex = activeChapter;
        this.updateHUD(activeChapter);
      }

      // Efeito de fechamento suave ao final do livro
      if (p > 0.94) {
        const exitProgress = (p - 0.94) / 0.06;
        const scale = 1 - (exitProgress * 0.06);
        const yOffset = exitProgress * 15;
        this.assembly.style.transform = `scale(${scale.toFixed(3)}) translateY(${yOffset.toFixed(1)}px)`;
      } else {
        this.assembly.style.transform = 'scale(1) translateY(0px)';
      }

      // Atualiza estado dos botões laterais
      if (this.prevBtn) {
        this.prevBtn.disabled = this.currentChapterIndex === 0;
        this.prevBtn.classList.toggle('disabled', this.currentChapterIndex === 0);
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = this.currentChapterIndex === this.totalChapters - 1;
        this.nextBtn.classList.toggle('disabled', this.currentChapterIndex === this.totalChapters - 1);
      }
    }

    updateHUD(index) {
      const data = CHAPTERS_DATA[index] || CHAPTERS_DATA[0];

      if (this.badgeEl) {
        if (index === 0) {
          this.badgeEl.textContent = 'Capa';
        } else if (index === 1) {
          this.badgeEl.textContent = 'Abertura';
        } else if (index === this.totalChapters - 1) {
          this.badgeEl.textContent = 'Epílogo';
        } else {
          this.badgeEl.textContent = `Página ${index - 1} de 10`;
        }
      }

      if (this.titleEl) {
        this.titleEl.textContent = data.title;
      }

      // Marcadores dourados
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    preloadImages() {
      // Pré-carrega as imagens WebP de todas as páginas em background
      const sources = [
        'assets/isadora/book/00_capa_livro_isadora.webp',
        'assets/isadora/book/01_folha_rosto_isadora.webp',
        'assets/isadora/book/02_era_uma_vez_no_bosque.webp',
        'assets/isadora/book/03_entao_chegou_isadora.webp',
        'assets/isadora/book/04_tudo_ganhou_novas_cores.webp',
        'assets/isadora/book/05_um_mundo_para_descobrir.webp',
        'assets/isadora/book/06_princesinha_cercada_de_amor.webp',
        'assets/isadora/book/07_ela_foi_crescendo.webp',
        'assets/isadora/book/08_a_floresta_descobriu_sua_princesa.webp',
        'assets/isadora/book/09_e_entao_1_aninho.webp',
        'assets/isadora/book/10_convite_magico_com_botoes.webp',
        'assets/isadora/book/11_fim_magico_isadora.webp'
      ];

      sources.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new InteractiveStorybook());
  } else {
    new InteractiveStorybook();
  }

})();
