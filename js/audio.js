/**
 * ============================================================================
 * GERENCIADOR DE ÁUDIO E EFEITOS SONOROS MÁGICOS
 * Suporte a trilha sonora ambiente e síntese Web Audio API nativa
 * ============================================================================
 */

class FairytaleAudio {
  constructor() {
    this.audioContext = null;
    this.bgMusic = null;
    this.isPlaying = false;
    this.isMuted = localStorage.getItem("isadora_audio_muted") === "true";
    this.volume = 0.4;
    this.initAudioElement();
  }

  // Inicializa o elemento de áudio de fundo
  initAudioElement() {
    this.bgMusic = new Audio();
    this.bgMusic.src = (window.CONVITE_CONFIG && window.CONVITE_CONFIG.audio) 
      ? window.CONVITE_CONFIG.audio.trilhaAmbiente 
      : "assets/o-conto-de-isadora-louise.mp3";
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.isMuted ? 0 : this.volume;
  }

  // Obtém ou inicializa o contexto Web Audio API com permissão do usuário
  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  // Alterna música de fundo (tocar / pausar)
  toggleMusic() {
    if (this.isPlaying) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
    return this.isPlaying;
  }

  playMusic() {
    if (!this.bgMusic) return;
    this.getAudioContext();
    this.bgMusic.volume = this.isMuted ? 0 : this.volume;
    const playPromise = this.bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.updateUiState(true);
        })
        .catch((err) => {
          console.log("Autoplay bloqueado pelo navegador, aguardando clique:", err);
          this.isPlaying = false;
          this.updateUiState(false);
        });
    }
  }

  pauseMusic() {
    if (!this.bgMusic) return;
    this.bgMusic.pause();
    this.isPlaying = false;
    this.updateUiState(false);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("isadora_audio_muted", this.isMuted);
    if (this.bgMusic) {
      this.bgMusic.volume = this.isMuted ? 0 : this.volume;
    }
    this.updateUiState(this.isPlaying && !this.isMuted);
    return this.isMuted;
  }

  updateUiState(active) {
    const isCurrentlyPlaying = this.isPlaying && !this.isMuted;
    
    // Atualiza todos os botões de áudio da interface
    document.querySelectorAll(".music-toggle-btn, #musicToggleBtn, #musicToggleBtnSection").forEach(btn => {
      const icon = btn.querySelector(".music-icon");
      const textSpan = btn.querySelector("span:not(.music-icon)");
      
      if (!isCurrentlyPlaying) {
        btn.classList.remove("playing");
        btn.setAttribute("title", "Tocar: O Conto de Isadora Louise 🎵");
        if (icon) icon.textContent = "🎵";
        if (btn.id === "musicToggleBtnSection" && textSpan) {
          textSpan.textContent = "Tocar Trilha Sonora Real";
        }
      } else {
        btn.classList.add("playing");
        btn.setAttribute("title", "Pausar música 🎵");
        if (icon) icon.textContent = "⏸️";
        if (btn.id === "musicToggleBtnSection" && textSpan) {
          textSpan.textContent = "Pausar Trilha Sonora";
        }
      }
    });
  }

  /* =========================================================================
   * SÍNTESE DE EFEITOS SONOROS MÁGICOS (Web Audio API)
   * ========================================================================= */

  // Efeito 1: Chuva de Pó de Fada / Brilho Mágico (Harp Shimmer)
  playSparkle() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Escala pentatônica mágica (C6, D6, E6, G6, A6, C7)
    const notes = [1046.5, 1174.6, 1318.5, 1567.9, 1760.0, 2093.0];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.45);
    });
  }

  // Efeito 2: Pipoco de Balão / Pop Alegre
  playPop() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Efeito 3: Canto dos Passarinhos Azuis
  playBirdChirp() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chirps = [
      { t: 0.0, f1: 2200, f2: 3200 },
      { t: 0.12, f1: 2500, f2: 3600 },
      { t: 0.28, f1: 2400, f2: 3400 }
    ];

    chirps.forEach(c => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(c.f1, now + c.t);
      osc.frequency.linearRampToValueAtTime(c.f2, now + c.t + 0.06);
      osc.frequency.linearRampToValueAtTime(c.f1 * 0.9, now + c.t + 0.09);

      gain.gain.setValueAtTime(0, now + c.t);
      gain.gain.linearRampToValueAtTime(0.15, now + c.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + c.t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + c.t);
      osc.stop(now + c.t + 0.1);
    });
  }

  // Efeito 4: Coração / Carinho dos Cervos
  playHeartChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [659.25, 880.00, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.55);
    });
  }

  // Efeito 5: Fanfarra Real Festiva (ao confirmar presença / abrir convite)
  playRoyalFanfare() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C5, E5, G5, C6 (triunfal)
    const fanfareNotes = [
      { t: 0.0, f: 523.25, d: 0.15 },
      { t: 0.16, f: 659.25, d: 0.15 },
      { t: 0.32, f: 783.99, d: 0.18 },
      { t: 0.52, f: 1046.50, d: 0.6 }
    ];

    fanfareNotes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.2, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.005, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.05);
    });
  }
}

// Instância global
window.fairytaleAudio = new FairytaleAudio();
