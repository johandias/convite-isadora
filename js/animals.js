/**
 * ============================================================================
 * INTERAÇÕES COM OS ANIMAIS & PERSONAGENS ENCANTADOS
 * Torna os animais, a Branca de Neve e os Anões do convite totalmente interativos
 * ============================================================================
 */

class FairytaleCharacters {
  constructor() {
    this.container = null;
    this.dialogueQueue = null;
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.setupHotspots();
    });
  }

  setupHotspots() {
    const cardEl = document.querySelector(".invitation-card-wrapper");
    if (!cardEl) return;

    // Definição das áreas interativas sobre o convite original
    const characterData = [
      // 1. Passarinhos do topo
      {
        id: "bird-left",
        title: "Passarinho Azul",
        top: "4%", left: "28%", width: "16%", height: "12%",
        speech: "Piu piu! Que dia feliz! 🎶",
        sound: "bird",
        emojis: ["🎵", "🎶", "✨", "💙"]
      },
      {
        id: "bird-right",
        title: "Passarinho Cantor",
        top: "4%", left: "58%", width: "16%", height: "12%",
        speech: "Vamos cantar parabéns para a Isa! 🎂",
        sound: "bird",
        emojis: ["🎵", "🎶", "✨", "💙"]
      },
      // 2. Brasão Real da Isadora
      {
        id: "crest-badge",
        title: "Brasão Real",
        top: "7%", left: "34%", width: "32%", height: "16%",
        speech: "Princesa Isadora Louise • 1 Aninho Real! 👑",
        sound: "fanfare",
        emojis: ["👑", "✨", "🍎", "⭐"]
      },
      // 3. Cervo da esquerda & Esquilo
      {
        id: "deer-left",
        title: "Cervinho & Esquilo",
        top: "66%", left: "14%", width: "26%", height: "18%",
        speech: "O bosque está em festa com você! 🦌❤️",
        sound: "heart",
        emojis: ["💖", "🦌", "🐿️", "🌿"]
      },
      // 4. Cervo da direita
      {
        id: "deer-right",
        title: "Cervo Encantado",
        top: "64%", left: "62%", width: "24%", height: "20%",
        speech: "Venha comemorar com a gente! 🌸",
        sound: "heart",
        emojis: ["💖", "🦌", "✨", "🌺"]
      },
      // 5. Branca de Neve
      {
        id: "snow-white",
        title: "Branca de Neve",
        top: "76%", left: "48%", width: "16%", height: "18%",
        speech: "Bem-vindos ao meu conto de fadas! Vai ser lindo! ✨🍎",
        sound: "sparkle",
        emojis: ["🍎", "👑", "✨", "❤️"]
      },
      // 6. Coelhinho
      {
        id: "bunny",
        title: "Coelhinho Real",
        top: "88%", left: "48%", width: "8%", height: "10%",
        speech: "Pula, pula! 1 aninho da Isadora! 🐰",
        sound: "pop",
        emojis: ["🐰", "🥕", "✨"]
      },
      // 7. Sete Anões (esquerda)
      {
        id: "dwarfs-left",
        title: "Dunga, Mestre e Zangado",
        top: "82%", left: "8%", width: "38%", height: "16%",
        speech: "Heigh-Ho! Hora de comemorar! 🎉",
        sound: "fanfare",
        emojis: ["💎", "⛏️", "🎉", "⭐"]
      },
      // 8. Sete Anões (direita)
      {
        id: "dwarfs-right",
        title: "Atchim, Feliz, Dengoso e Soneca",
        top: "82%", left: "62%", width: "34%", height: "16%",
        speech: "Atchim! 🤧 Viva a nossa princesinha! 🎊",
        sound: "sparkle",
        emojis: ["🎊", "😄", "🎈", "❤️"]
      },
      // 9. Macieiras laterais
      {
        id: "apple-tree-left",
        title: "Macieira Encantada",
        top: "60%", left: "0%", width: "14%", height: "28%",
        speech: "Colha uma maçã mágica! 🍎✨",
        sound: "pop",
        emojis: ["🍎", "🍏", "🍃", "✨"]
      },
      {
        id: "apple-tree-right",
        title: "Macieira Encantada",
        top: "60%", left: "86%", width: "14%", height: "28%",
        speech: "Doces maçãs para o aniversário! 🍎🍏",
        sound: "pop",
        emojis: ["🍎", "🍏", "🍃", "✨"]
      }
    ];

    const overlay = document.createElement("div");
    overlay.className = "character-hotspots-layer";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "12";

    characterData.forEach((char) => {
      const spot = document.createElement("div");
      spot.className = "character-hotspot";
      spot.setAttribute("data-character", char.id);
      spot.setAttribute("title", `Toque em ${char.title}!`);
      spot.style.position = "absolute";
      spot.style.top = char.top;
      spot.style.left = char.left;
      spot.style.width = char.width;
      spot.style.height = char.height;
      spot.style.pointerEvents = "auto";
      spot.style.cursor = "pointer";
      spot.style.borderRadius = "20px";

      // Efeito de toque / clique
      const trigger = (e) => {
        e.stopPropagation();
        this.interact(char, spot, e);
      };

      spot.addEventListener("click", trigger);
      spot.addEventListener("touchstart", (e) => {
        e.preventDefault();
        trigger(e);
      }, { passive: false });

      overlay.appendChild(spot);
    });

    cardEl.appendChild(overlay);
  }

  interact(char, element, event) {
    // 1. Toca som correspondente
    if (window.fairytaleAudio) {
      if (char.sound === "bird") window.fairytaleAudio.playBirdChirp();
      else if (char.sound === "heart") window.fairytaleAudio.playHeartChime();
      else if (char.sound === "fanfare") window.fairytaleAudio.playRoyalFanfare();
      else if (char.sound === "pop") window.fairytaleAudio.playPop();
      else window.fairytaleAudio.playSparkle();
    }

    // 2. Balão de fala flutuante
    this.showSpeechBubble(char.speech, element);

    // 3. Emojis flutuantes
    this.spawnFloatingEmojis(char.emojis, element);

    // 4. Confetes ou estrelas douradas
    if (window.fairytaleConfetti && (char.id === "crest-badge" || char.id.includes("dwarfs"))) {
      const rect = element.getBoundingClientRect();
      window.fairytaleConfetti.burst({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        count: 25,
        power: 0.7
      });
    }

    // Efeito de leve pulso no elemento
    element.classList.add("hotspot-pulse");
    setTimeout(() => element.classList.remove("hotspot-pulse"), 600);
  }

  showSpeechBubble(text, targetEl) {
    // Remove balão anterior se houver
    const oldBubble = document.querySelector(".character-speech-bubble");
    if (oldBubble) oldBubble.remove();

    const rect = targetEl.getBoundingClientRect();
    const bubble = document.createElement("div");
    bubble.className = "character-speech-bubble";
    bubble.textContent = text;
    bubble.style.position = "fixed";
    bubble.style.left = `${rect.left + rect.width / 2}px`;
    bubble.style.top = `${Math.max(20, rect.top - 50)}px`;
    bubble.style.transform = "translateX(-50%) scale(0.7)";
    bubble.style.opacity = "0";
    bubble.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    bubble.style.zIndex = "9999";

    document.body.appendChild(bubble);

    requestAnimationFrame(() => {
      bubble.style.transform = "translateX(-50%) scale(1)";
      bubble.style.opacity = "1";
    });

    setTimeout(() => {
      bubble.style.transform = "translateX(-50%) scale(0.8)";
      bubble.style.opacity = "0";
      setTimeout(() => bubble.remove(), 300);
    }, 2400);
  }

  spawnFloatingEmojis(emojis, targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const count = Math.min(4, emojis.length + 1);

    for (let i = 0; i < count; i++) {
      const emoji = emojis[i % emojis.length];
      const el = document.createElement("div");
      el.className = "floating-animal-emoji";
      el.textContent = emoji;
      el.style.position = "fixed";
      el.style.left = `${rect.left + Math.random() * rect.width}px`;
      el.style.top = `${rect.top + rect.height * 0.5}px`;
      el.style.fontSize = `${Math.random() * 12 + 20}px`;
      el.style.zIndex = "999";
      el.style.pointerEvents = "none";
      el.style.animation = `floatUpAndFade ${Math.random() * 0.6 + 1.2}s ease-out forwards`;

      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1800);
    }
  }
}

window.fairytaleCharacters = new FairytaleCharacters();
