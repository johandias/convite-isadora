# 🍎 Convite de Aniversário Real - 1º Aninho da Isadora

> 🌐 **Acesse o Convite Online**: [https://johandias.github.io/convite-isadora/](https://johandias.github.io/convite-isadora/)

Site interativo de convite de aniversário de 1 aninho da **Isadora**, com o tema **Branca de Neve e os Sete Anões**, composto fielmente conforme o modelo visual, com experiência de vídeo integrada, animações ricas, confetes, balões 3D, animais interativos e páginas dedicadas para cada botão.

---

## ✨ Funcionalidades Principais

1. **🎬 Vídeo de Abertura ("Antes do Convite")**:
   - Tela de recepção encantada com selo real dourado.
   - Reprodução integrada do vídeo em alta qualidade em moldura de cinema de conto de fadas.
   - Transição suave com chuva de confetes festivos para revelar o convite.
   - Botão **"🎬 Rever Vídeo"** disponível no cabeçalho a qualquer momento.

2. **👑 Convite Fiel ao Print com Hotspots Interativos**:
   - Layout e composição idênticos ao modelo: brasão real com pássaros e maçã, tipografia encantada, data e horário estilizados e a cena mágica da floresta com a Branca de Neve, os 7 anões, cervos, passarinhos e macieiras.
   - Anéis dourados pulsantes sobre os 3 botões redondos para indicar interação ao toque/clique.
   - **Cards de Acesso Rápido** abaixo do convite para facilitar o toque em qualquer celular ou tela.

3. **📄 Páginas Dedicadas para Cada Botão**:
   - **💬 [Confirmar Presença (`confirmar-presenca.html`)](confirmar-presenca.html)**:
     - Formulário completo: Nome, Telefone, Presença (Sim/Não), Quantidade de Adultos e Crianças com contadores interativos (+/-), Acompanhantes e Recadinho carinhoso.
     - **Botão "Confirmar pelo WhatsApp"**: Gera mensagem pronta, formatada com emojis e detalhes, abrindo o WhatsApp diretamente no número dos pais.
     - **Botão "Salvar no Site"**: Registra no navegador e exibe o ticket real de confirmação com chuva de confetes.
   - **📍 [Localização da Festa (`localizacao.html`)](localizacao.html)**:
     - Endereço completo formatado, referências e dicas de estacionamento.
     - Mapa interativo integrado do Google Maps.
     - Botões de 1 clique: **Abrir no Google Maps**, **Abrir no Waze**, **Chamar Uber** e **Copiar Endereço**.
     - Opção de **Adicionar à Google Agenda** ou **Baixar Lembrete (.ics)** para iPhone/Outlook.
   - **🎁 [Sugestão de Presentes (`sugestao-presentes.html`)](sugestao-presentes.html)**:
     - Tamanhos em destaque: Roupinhas (1 ano / 12-18m), Sapatinhos (Nº 19/20) e Fraldinhas (G).
     - Categorias detalhadas de brinquedos educativos, cuidados e roupas.
     - **Pix Mágico / Cofrinho da Isadora**: Card especial com chave Pix e botão **"Copiar Chave Pix"** com feedback instantâneo e confetes.
     - Opção para os convidados marcarem o que pretendem levar.

4. **✨ Animações e Interatividades Especiais**:
   - **🦌 Animais e Personagens Interativos**: Toque nos passarinhos, nos cervos, na Branca de Neve, nos anões ou no coelho para ver balões de fala flutuantes, efeitos sonoros fofos (cantos de pássaro, harpa mágica, fanfarras) e emojis de coração e maçãs.
   - **🎈 Balões 3D Flutuantes**: Balões que sobem suavemente com física realista. Toque em qualquer balão para estourá-lo com som de "pop" e confetes!
   - **🎊 Canhão de Confetes**: Chuva de confetes comemorativos com estrelas douradas e corações.
   - **✨ Pó de Fada (Canvas)**: Partículas douradas cintilantes que acompanham o movimento do dedo ou do mouse.
   - **🎵 Trilha Sonora de Conto de Fadas**: Melodia suave de caixinha de música com botão de controle (ligar/desligar).
   - **⏳ Contagem Regressiva em Tempo Real**: Dias, Horas, Minutos e Segundos até a grande festa.

---

## 🛠️ Como Personalizar os Dados (Fácil e Rápido)

Basta abrir o arquivo **[`js/config.js`](js/config.js)** e editar os campos desejados:
- **WhatsApp dos Pais**: campo `rsvp.whatsapp` (coloque seu DDD e número).
- **Endereço da Festa**: campo `local.nome`, `local.endereco`, links do Maps e Waze.
- **Chave Pix**: campo `presentes.pix.chave` e nome do titular.
- **Data e Horário**: campo `evento.dataAlvo` para a contagem regressiva.

---

## 🚀 Como Testar no Computador

Você pode abrir o arquivo `index.html` diretamente no seu navegador de preferência (Google Chrome, Microsoft Edge, Safari, Firefox) ou rodar um servidor local:

### Com Python (já instalado):
```powershell
python -m http.server 8000
```
Depois acesse `http://localhost:8000` no seu navegador.

### Com Node.js:
```powershell
npx serve
```

---

## 🌐 Como Publicar na Internet (Para Enviar no WhatsApp)

Para que todos os seus convidados consigam abrir o convite pelo celular via link:
1. **Opção 1 (GitHub Pages - Grátis)**: Suba os arquivos para um repositório no GitHub e ative o GitHub Pages nas configurações.
2. **Opção 2 (Vercel ou Netlify - Grátis)**: Arraste a pasta `ISADORA` diretamente no site do [Netlify Drop](https://app.netlify.com/drop) ou conecte via Vercel. O link fica pronto em 30 segundos!
