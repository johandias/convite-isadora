/**
 * ============================================================================
 * LÓGICA PRINCIPAL - CONVITE REAL DA ISADORA
 * Controla o vídeo de introdução, contagem regressiva e interações
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initIntroExperience();
  initCountdown();
  initCalendarAction();
  initToast();
  setupButtonSounds();
});

/* =========================================================================
 * 1. EXPERIÊNCIA DE INTRODUÇÃO & VÍDEO
 * ========================================================================= */
function initIntroExperience() {
  const introGate = document.getElementById("introGate");
  const btnStartIntro = document.getElementById("btnStartIntro");
  const videoTheater = document.getElementById("videoTheater");
  const introVideo = document.getElementById("introVideo");
  const btnSkipVideo = document.getElementById("btnSkipVideo");
  const videoTimerTag = document.getElementById("videoTimerTag");
  const btnRewatch = document.getElementById("btnRewatch");

  if (!introGate) return;

  const hasSeenIntro = sessionStorage.getItem("isadora_intro_seen");
  const urlParams = new URLSearchParams(window.location.search);
  const skipViaParam = urlParams.get("convite") === "1";

  // Se já viu nesta sessão (ex: voltou de uma subpágina) ou via parâmetro ?convite=1
  if (hasSeenIntro === "true" || skipViaParam) {
    introGate.classList.add("hidden");
    introGate.style.display = "none";
  }

  // Clique em "Assistir ao Convite Real"
  if (btnStartIntro) {
    btnStartIntro.addEventListener("click", () => {
      // Dispara som de fanfarra e abre o cinema
      if (window.fairytaleAudio) {
        window.fairytaleAudio.playSparkle();
      }

      introGate.classList.add("hidden");
      setTimeout(() => {
        introGate.style.display = "none";
      }, 600);

      if (videoTheater && introVideo) {
        videoTheater.classList.add("active");
        introVideo.currentTime = 0;
        introVideo.play().catch((err) => {
          console.log("Erro ao iniciar vídeo automaticamente:", err);
        });
      }
    });
  }

  // Atualização do contador do vídeo
  if (introVideo && videoTimerTag) {
    introVideo.addEventListener("timeupdate", () => {
      const remaining = Math.max(0, Math.ceil(introVideo.duration - introVideo.currentTime));
      if (!isNaN(remaining)) {
        videoTimerTag.textContent = `Avançando em ${remaining}s...`;
      }
    });

    // Ao terminar o vídeo, fecha e vai para o convite com chuva de confetes
    introVideo.addEventListener("ended", () => {
      closeVideoAndReveal();
    });
  }

  // Botão "Pular / Ver Convite"
  if (btnSkipVideo) {
    btnSkipVideo.addEventListener("click", () => {
      closeVideoAndReveal();
    });
  }

  // Botão "Rever Vídeo de Abertura"
  if (btnRewatch) {
    btnRewatch.addEventListener("click", (e) => {
      e.preventDefault();
      if (videoTheater && introVideo) {
        videoTheater.classList.add("active");
        introVideo.currentTime = 0;
        introVideo.play();
      }
    });
  }

  function closeVideoAndReveal() {
    sessionStorage.setItem("isadora_intro_seen", "true");
    if (introVideo) introVideo.pause();
    if (videoTheater) videoTheater.classList.remove("active");

    // Efeitos comemorativos ao entrar no convite
    if (window.fairytaleConfetti) {
      window.fairytaleConfetti.burst({ count: 80 });
      setTimeout(() => window.fairytaleConfetti.shower(2500), 400);
    }
    if (window.fairytaleAudio) {
      window.fairytaleAudio.playRoyalFanfare();
      // Inicia trilha sonora suave de fundo
      if (window.CONVITE_CONFIG && window.CONVITE_CONFIG.audio.autoPlayAposIntro) {
        setTimeout(() => {
          window.fairytaleAudio.playMusic();
        }, 1200);
      }
    }
    if (window.fairytaleBalloons) {
      window.fairytaleBalloons.spawnBatch(4);
    }
  }
}

/* =========================================================================
 * 2. CONTAGEM REGRESSIVA
 * ========================================================================= */
function initCountdown() {
  const daysEl = document.getElementById("countdownDays");
  const hoursEl = document.getElementById("countdownHours");
  const minutesEl = document.getElementById("countdownMinutes");
  const secondsEl = document.getElementById("countdownSeconds");

  if (!daysEl) return;

  const targetDate = (window.CONVITE_CONFIG && window.CONVITE_CONFIG.evento)
    ? window.CONVITE_CONFIG.evento.dataAlvo
    : new Date(2027, 0, 5, 19, 0, 0);

  function update() {
    const now = new Date().getTime();
    const difference = targetDate.getTime() - now;

    if (difference <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      const title = document.querySelector(".countdown-title");
      if (title) title.innerHTML = "✨ O Grande Dia Chegou! Parabéns Isadora! 🎂";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
}

/* =========================================================================
 * 3. ADICIONAR À AGENDA (Google Agenda & iCal)
 * ========================================================================= */
function initCalendarAction() {
  const btnCalendar = document.getElementById("btnAddToCalendar");
  if (!btnCalendar) return;

  btnCalendar.addEventListener("click", () => {
    const title = encodeURIComponent("1º Aninho da Isadora - Conto de Fadas Branca de Neve");
    const details = encodeURIComponent("Venha comemorar o primeiro aninho da Isadora em um lindo conto de fadas! Venha com alegria!");
    const location = encodeURIComponent(window.CONVITE_CONFIG ? window.CONVITE_CONFIG.local.nome + ", " + window.CONVITE_CONFIG.local.endereco : "Buffet Infantil");
    
    // Data no formato YYYYMMDDTHHMMSSZ (05/01/2027 19:00h horário Brasil = 22:00h UTC)
    const dates = "20270105T220000Z/20270106T020000Z";
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;

    window.open(googleUrl, "_blank");
    showToast("Abrindo Google Agenda... 📅");
  });
}

/* =========================================================================
 * 4. FEEDBACK DE TOAST
 * ========================================================================= */
function initToast() {
  if (document.getElementById("fairyToast")) return;
  const toast = document.createElement("div");
  toast.id = "fairyToast";
  toast.className = "fairy-toast";
  document.body.appendChild(toast);
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById("fairyToast");
  if (!toast) return;

  toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
  toast.classList.add("show");

  if (window.fairytaleAudio) {
    window.fairytaleAudio.playSparkle();
  }

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}
window.showToast = showToast;

/* =========================================================================
 * 5. SONS E INTERAÇÕES NOS BOTÕES
 * ========================================================================= */
function setupButtonSounds() {
  const interactiveBtns = document.querySelectorAll("a, button, .quick-card-btn, .btn-hotspot");
  interactiveBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.fairytaleAudio) {
        window.fairytaleAudio.playSparkle();
      }
    });
  });

  // Botão de alternar música
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener("click", () => {
      if (window.fairytaleAudio) {
        window.fairytaleAudio.toggleMusic();
      }
    });
  }

  // Botão de soltar balões
  const btnBalloons = document.getElementById("btnLaunchBalloons");
  if (btnBalloons) {
    btnBalloons.addEventListener("click", () => {
      if (window.fairytaleBalloons) {
        window.fairytaleBalloons.spawnBatch(6);
      }
      showToast("Balões mágicos soltos no ar! 🎈");
    });
  }

  // Botão de soltar confetes
  const btnConfetti = document.getElementById("btnThrowConfetti");
  if (btnConfetti) {
    btnConfetti.addEventListener("click", () => {
      if (window.fairytaleConfetti) {
        window.fairytaleConfetti.burst({ count: 70 });
      }
      showToast("Chuva de confetes comemorativa! 🎊");
    });
  }
}
