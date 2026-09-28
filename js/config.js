/**
 * ============================================================================
 * CONVITE DE ANIVERSÁRIO - ISADORA (1 ANINHO)
 * Arquivo de Configuração Centralizada
 * ============================================================================
 * Altere as informações abaixo para personalizar todos os dados do convite,
 * confirmação no WhatsApp, endereço da festa e chave Pix!
 */

const CONVITE_CONFIG = {
  // Informações da Aniversariante
  aniversariante: {
    nome: "Isadora",
    nomeCompleto: "Isadora Louise",
    idade: "1 ano",
    subtitulo: "1º aninho em um conto de fadas",
    tema: "Branca de Neve e os Sete Anões"
  },

  // Data e Horário
  evento: {
    data: "05/01",
    diaDaSemana: "domingo",
    horario: "19:00",
    ano: 2027, // Ano do evento para a contagem regressiva
    // Data completa para contagem regressiva ISO (ano, mês 0-indexado, dia, hora, minuto)
    dataAlvo: new Date(2027, 0, 5, 19, 0, 0),
    dataTextoCompleto: "Domingo, 05 de Janeiro de 2027 às 19:00h"
  },

  // Local da Festa
  local: {
    nome: "Espaço Real Encantado Buffet Infantil",
    endereco: "Av. das Flores Mágicas, 777",
    bairro: "Jardim dos Contos",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    referencia: "Próximo à Praça Principal - Fácil estacionamento no local",
    // Link direto do Google Maps para abrir no app/navegador
    googleMapsUrl: "https://maps.google.com/?q=Av.+Paulista,+1000+-+Bela+Vista,+São+Paulo+-+SP",
    // Link do Waze
    wazeUrl: "https://waze.com/ul?q=Av.+Paulista,+1000+-+Bela+Vista,+São+Paulo+-+SP",
    // Link do Uber (abre app do Uber com destino pré-preenchido)
    uberUrl: "https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=Av.+Paulista,+1000+-+São+Paulo",
    // Iframe embed para exibição na página de localização
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1066941873133!2d-46.65390548447595!3d-23.564611184681283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1680000000000!5m2!1spt-BR!2sbr"
  },

  // WhatsApp para Confirmação de Presença (RSVP)
  // IMPORTANTE: Insira o número com DDD sem traços, pontos ou parênteses. Ex: "5511999999999"
  rsvp: {
    whatsapp: "5511999999999", // << Altere para o seu número do WhatsApp aqui
    dataLimite: "28/12",
    mensagemPadrao: "Olá! Gostaria de confirmar presença no aniversário de 1 aninho da Isadora!"
  },

  // Sugestões de Presentes
  presentes: {
    tamanhos: {
      roupa: "1 ano (12 a 18 meses)",
      calcado: "Nº 19 ou 20",
      fralda: "Tamanho G (Pampers ou Huggies)"
    },
    pix: {
      chave: "isadora.1ano@exemplo.com", // << Altere para a sua chave Pix aqui
      tipoChave: "E-mail",
      titular: "Isadora Louise / Mamãe & Papai",
      banco: "Banco Digital / Poupança Real"
    },
    categorias: [
      {
        titulo: "👗 Roupinhas Encantadas",
        descricao: "Tamanho 1 ano (12 a 18 meses) - Vestidinhos, conjuntos leves e confortáveis, macaquinhos e pijaminhas fresquinhos."
      },
      {
        titulo: "👟 Sapatinhos Reais",
        descricao: "Tamanho Nº 19 e 20 - Sandalinhas macias, tênis de velcro fáceis de calçar e sapatilhas confortáveis."
      },
      {
        titulo: "🧸 Brinquedos Educativos",
        descricao: "Para fase de 1 aninho: blocos de encaixar, livrinhos interativos de banho/som, xilofone ou chocalhos musicais, brinquedos sensoriais."
      },
      {
        titulo: "🍼 Fraldinhas & Cuidados",
        descricao: "Fraldas descartáveis tamanho G, toalhinhas umedecidas suaves e produtinhos cheirosos para bebê."
      }
    ]
  },

  // Vídeo de Abertura
  video: {
    arquivo: "convite-video.mp4",
    poster: "assets/video-poster.jpg",
    titulo: "O Convite Real da Princesa Isadora",
    duracaoSegundos: 8
  },

  // Trilha Sonora
  audio: {
    trilhaAmbiente: "assets/ambient-fairytale.mp3",
    autoPlayAposIntro: true
  }
};

// Exporta globalmente para uso em todos os scripts
window.CONVITE_CONFIG = CONVITE_CONFIG;
