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
    ],
    // Catálogo de Presentes (Rachar Cotas ou Escolher/Reservar Pessoalmente)
    itens: [
      // Presentes Coletivos / Rachar Valor (Cotas / Vaquinha)
      {
        id: "gift-carrinho-01",
        titulo: "Carrinho de Passeio Real Travel System",
        descricao: "Carrinho moderno, leve e seguro para os passeios no parque e viagens da princesinha.",
        categoria: "Passeio",
        tipo: "rachar",
        imagem: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500&auto=format&fit=crop&q=80",
        linkLoja: "https://www.amazon.com.br/s?k=carrinho+bebe+travel+system",
        valorTotal: 800,
        valorCota: 50,
        arrecadado: 250,
        contribuicoes: [
          { nome: "Padrinho Lucas", valor: 150, data: "27/09/2026", mensagem: "Para passear muito com a dinda e o dindo!" },
          { nome: "Tia Cláudia", valor: 100, data: "28/09/2026", mensagem: "Um beijo enorme na princesa!" }
        ]
      },
      {
        id: "gift-piscina-02",
        titulo: "Piscina de Bolinhas Mágica & Cantinho de Brincar",
        descricao: "Espaço lúdico de estimulação sensorial com bolinhas coloridas para o quartinho.",
        categoria: "Brinquedos",
        tipo: "rachar",
        imagem: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=80",
        linkLoja: "https://www.amazon.com.br/s?k=piscina+de+bolinhas+espuma+bebe",
        valorTotal: 300,
        valorCota: 30,
        arrecadado: 90,
        contribuicoes: [
          { nome: "Tio Renato", valor: 90, data: "28/09/2026", mensagem: "Muitas brincadeiras divertidas pra você!" }
        ]
      },
      {
        id: "gift-cadeirinha-03",
        titulo: "Cadeirinha de Automóvel Super Conforto",
        descricao: "Cadeirinha de segurança para o carro acompanhar o crescimento dos próximos anos.",
        categoria: "Passeio",
        tipo: "rachar",
        imagem: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=80",
        linkLoja: "https://www.amazon.com.br/s?k=cadeira+auto+bebe+isofix",
        valorTotal: 650,
        valorCota: 50,
        arrecadado: 100,
        contribuicoes: [
          { nome: "Vovó Helena", valor: 100, data: "28/09/2026", mensagem: "Segurança e amor sempre com a vovó!" }
        ]
      },

      // Presentes Pessoais (Escolher, Comprar e Levar Presencialmente)
      {
        id: "gift-vestido-04",
        titulo: "Vestidinho Temático Branca de Neve (1 ano)",
        descricao: "Vestidinho de festa com corpete azul real e saia amarela, bem levinho para comemorar.",
        categoria: "Roupinhas",
        tipo: "pessoal",
        imagem: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop&q=80",
        linkLoja: "https://www.amazon.com.br/s?k=vestido+infantil+branca+de+neve+1+ano",
        status: "disponivel",
        reservadoPor: null
      },
      {
        id: "gift-sapatinho-05",
        titulo: "Sapatilha de Verniz Vermelha Real (Nº 19 ou 20)",
        descricao: "Sapatilha macia com fecho fácil, perfeita para combinar com o vestido de princesa.",
        categoria: "Sapatinhos",
        tipo: "pessoal",
        imagem: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=500&auto=format&fit=crop&q=80",
        linkLoja: "https://www.amazon.com.br/s?k=sapatilha+infantil+vermelha+bebe",
        status: "disponivel",
        reservadoPor: null
      },
      {
        id: "gift-brinquedo-06",
        titulo: "Xilofone & Kit Musical Sensorial de Madeira",
        descricao: "Instrumentos musicais coloridos educativos para despertar a alegria e ritmo da Isa.",
        categoria: "Brinquedos",
        tipo: "pessoal",
        imagem: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80",
        linkLoja: "https://www.amazon.com.br/s?k=xilofone+infantil+madeira+bebe",
        status: "disponivel",
        reservadoPor: null
      },
      {
        id: "gift-torre-07",
        titulo: "Torre de Encaixe & Cubos Didáticos Montessori",
        descricao: "Brinquedo de coordenação motora com formas geométricas e cores vivas.",
        categoria: "Brinquedos",
        tipo: "pessoal",
        imagem: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop&q=80",
        linkLoja: "https://www.amazon.com.br/s?k=brinquedo+encaixe+madeira+1+ano",
        status: "disponivel",
        reservadoPor: null
      },
      {
        id: "gift-livro-08",
        titulo: "Livrinhos Interativos de Toque e Sons Disney",
        descricao: "Coleção de livrinhos cartonados e laváveis com texturas dos bichinhos da floresta.",
        categoria: "Brinquedos",
        tipo: "pessoal",
        imagem: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
        linkLoja: "https://www.amazon.com.br/s?k=livro+interativo+bebe+toque+som",
        status: "disponivel",
        reservadoPor: null
      },
      {
        id: "gift-fraldas-09",
        titulo: "Kit Fraldas Pampers Premium Care G + Toalhinhas",
        descricao: "Pacotão de fraldas tamanho G e lencinhos hipoalergênicos para o dia a dia.",
        categoria: "Cuidados",
        tipo: "pessoal",
        imagem: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&auto=format&fit=crop&q=80",
        linkLoja: "https://www.amazon.com.br/s?k=fralda+pampers+premium+care+g",
        status: "disponivel",
        reservadoPor: null
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
