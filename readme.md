# 🚀 Seja Bem-vindo ao Projeto E-spike!

Este guia irá orientá-lo na configuração e execução do projeto **E-spike**. Siga os passos abaixo para preparar o ambiente, iniciar os serviços e explorar todas as funcionalidades.

---

## 🗃️ Passo 1: Configurando o Banco de Dados

A aplicação utiliza **MongoDB**, simplificando os processos de configuração. Siga os passos abaixo:

1. **Instalar o MongoDB Compass**

- Baixe o MongoDB Compass no site oficial:
  ```
  https://www.mongodb.com/try/download/compass
  ```
- Siga as instruções de instalação do seu sistema operacional.

2. **Configurar a Conexão**

- Após a instalação, inicie o MongoDB Compass.
- Crie uma nova conexão com o endereço padrão:
  ```
  mongodb://localhost:27017
  ```
- Deixe essa conexão ativa para uso no projeto.

---

## 📦 Passo 2: Configurando Dependências

Para preparar o ambiente de desenvolvimento, siga estas etapas:

1. **Acessar o Diretório do Projeto**

- Para acessar o projeto, use o comando abaixo.
  ```bash
  cd caminho_da_sua_máquina/E-spikeFunctional
  ```

2. **Instalar Dependências**
   Instale as dependências necessárias para o projeto:
   ```bash
   npm install
   ```

Caso encontre problemas durante a instalação, utilize a opção de força:
```bash npm install --force ```

---

## 🖥️ Passo 3: Inicializando o Backend

Para rodar o backend da aplicação:

1. **Acessar o Diretório do Backend**

   ```bash
   cd BackendJ
   ```
2. **Iniciar o Backend**

   ```bash
   node --watch app.js
   ```
3. **Verificação**
   Se o console mostrar que o servidor está rodando na porta 5174, a configuração foi realizada com sucesso.
4. **Solução de Problemas**
   Abra o MongoDB Compass e confirme se a database "MeuBanco" foi criada.
   Caso contrário, crie a database manualmente e reinicie o backend.

---

## 🌐 Passo 4: Inicializando o Frontend

Para rodar o frontend da aplicação:

1. **Acessar o Diretório do Frontend**

   ```bash
   cd Frontend
   ```
2. **Iniciar o Frontend**

   ```bash
   npx expo start
   ```
3. **Configuração e Visualização**
   Após executar o comando, o Expo irá exibir um QR Code no terminal.

- Para rodar no **navegador**, pressione `w`.
- Para rodar no **dispositivo físico**, escaneie o QR Code com o app **Expo Go**.
- Para rodar em um **emulador Android**, pressione `a`.

---

## ✅ Finalização

Após seguir os passos acima, o projeto estará configurado e rodando. Você pode explorar todas as funcionalidades do E-spike diretamente pelo navegador.

Se precisar de ajuda ou encontrar problemas, fique à vontade para entrar em contato ou abrir uma Issue no repositório.

Obrigado por ler tudo até o final!

---

## 🏗️ Arquitetura — C4 Model

Os diagramas abaixo descrevem a arquitetura do E-spike seguindo o modelo C4, do nível mais abstrato ao mais detalhado.

---

### Nível 1 — System Context

> Mostra o E-spike como sistema central e quem interage com ele.

<svg width="100%" viewBox="0 0 680 520" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </marker>
  </defs>
  <rect x="20" y="20" width="640" height="480" rx="16" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="6 4"></rect>
  <text font-size="12" x="48" y="44" fill="#aaa">System context</text>
  <!-- Cidadão -->
  <rect x="40" y="160" width="130" height="72" rx="8" fill="#F1EFE8" stroke="#5F5E5A" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="105" y="189" text-anchor="middle" dominant-baseline="central" fill="#2C2C2A">Cidadão</text>
  <text font-size="12" x="105" y="209" text-anchor="middle" dominant-baseline="central" fill="#5F5E5A">Usuário do app</text>
  <!-- Moderador -->
  <rect x="40" y="288" width="130" height="72" rx="8" fill="#F1EFE8" stroke="#5F5E5A" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="105" y="317" text-anchor="middle" dominant-baseline="central" fill="#2C2C2A">Moderador</text>
  <text font-size="12" x="105" y="337" text-anchor="middle" dominant-baseline="central" fill="#5F5E5A">Gerencia ocorrências</text>
  <!-- E-Spike -->
  <rect x="250" y="200" width="180" height="100" rx="12" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="340" y="237" text-anchor="middle" dominant-baseline="central" fill="#0C447C">E-Spike</text>
  <text font-size="12" x="340" y="257" text-anchor="middle" dominant-baseline="central" fill="#185FA5">Plataforma de segurança</text>
  <text font-size="12" x="340" y="272" text-anchor="middle" dominant-baseline="central" fill="#185FA5">urbana colaborativa</text>
  <!-- MongoDB -->
  <rect x="510" y="160" width="130" height="72" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="575" y="189" text-anchor="middle" dominant-baseline="central" fill="#085041">MongoDB Atlas</text>
  <text font-size="12" x="575" y="209" text-anchor="middle" dominant-baseline="central" fill="#0F6E56">Banco de dados</text>
  <!-- OpenRouter -->
  <rect x="510" y="288" width="130" height="72" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="575" y="317" text-anchor="middle" dominant-baseline="central" fill="#085041">OpenRouter AI</text>
  <text font-size="12" x="575" y="337" text-anchor="middle" dominant-baseline="central" fill="#0F6E56">Chatbot de segurança</text>
  <!-- OpenStreetMap -->
  <rect x="250" y="60" width="180" height="72" rx="8" fill="#FAECE7" stroke="#993C1D" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="340" y="89" text-anchor="middle" dominant-baseline="central" fill="#712B13">OpenStreetMap</text>
  <text font-size="12" x="340" y="109" text-anchor="middle" dominant-baseline="central" fill="#993C1D">Tiles e geocodificação</text>
  <!-- Arrows -->
  <line x1="170" y1="196" x2="248" y2="240" stroke="#888" stroke-width="1" marker-end="url(#arrow1)"></line>
  <line x1="170" y1="324" x2="248" y2="280" stroke="#888" stroke-width="1" marker-end="url(#arrow1)"></line>
  <line x1="430" y1="250" x2="508" y2="210" stroke="#888" stroke-width="1" marker-end="url(#arrow1)"></line>
  <line x1="430" y1="270" x2="508" y2="320" stroke="#888" stroke-width="1" marker-end="url(#arrow1)"></line>
  <line x1="340" y1="200" x2="340" y2="134" stroke="#888" stroke-width="1" marker-end="url(#arrow1)"></line>
  <text font-size="11" x="208" y="215" text-anchor="middle" fill="#aaa">usa</text>
  <text font-size="11" x="208" y="308" text-anchor="middle" fill="#aaa">usa</text>
  <text font-size="11" x="472" y="226" text-anchor="middle" fill="#aaa">lê/grava</text>
  <text font-size="11" x="472" y="304" text-anchor="middle" fill="#aaa">chama API</text>
  <text font-size="11" x="358" y="186" text-anchor="middle" fill="#aaa">consome</text>
  <!-- Legend -->
  <rect x="24" y="450" width="10" height="10" rx="2" fill="#185FA5"></rect>
  <text font-size="11" x="40" y="459" fill="#666">Sistema E-Spike</text>
  <rect x="130" y="450" width="10" height="10" rx="2" fill="#5F5E5A"></rect>
  <text font-size="11" x="146" y="459" fill="#666">Pessoas / atores</text>
  <rect x="250" y="450" width="10" height="10" rx="2" fill="#0F6E56"></rect>
  <text font-size="11" x="266" y="459" fill="#666">Sistemas externos</text>
  <rect x="390" y="450" width="10" height="10" rx="2" fill="#993C1D"></rect>
  <text font-size="11" x="406" y="459" fill="#666">Serviços de mapa</text>
</svg>

---

### Nível 2 — Container

> Detalha os grandes blocos tecnológicos que compõem o E-spike.

<svg width="100%" viewBox="0 0 680 580" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </marker>
  </defs>
  <rect x="20" y="20" width="640" height="540" rx="16" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="6 4"></rect>
  <text font-size="12" x="48" y="44" fill="#aaa">E-Spike — container diagram</text>
  <!-- Usuário -->
  <rect x="30" y="240" width="110" height="56" rx="8" fill="#F1EFE8" stroke="#5F5E5A" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="85" y="263" text-anchor="middle" dominant-baseline="central" fill="#2C2C2A">Cidadão /</text>
  <text font-size="14" font-weight="500" x="85" y="281" text-anchor="middle" dominant-baseline="central" fill="#2C2C2A">Moderador</text>
  <!-- App Mobile -->
  <rect x="175" y="60" width="150" height="72" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="250" y="87" text-anchor="middle" dominant-baseline="central" fill="#3C3489">App Mobile</text>
  <text font-size="12" x="250" y="107" text-anchor="middle" dominant-baseline="central" fill="#534AB7">React Native / Expo</text>
  <!-- App Web -->
  <rect x="175" y="190" width="150" height="72" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="250" y="214" text-anchor="middle" dominant-baseline="central" fill="#3C3489">App Web</text>
  <text font-size="12" x="250" y="232" text-anchor="middle" dominant-baseline="central" fill="#534AB7">React Native Web +</text>
  <text font-size="12" x="250" y="248" text-anchor="middle" dominant-baseline="central" fill="#534AB7">React Leaflet</text>
  <!-- Backend API -->
  <rect x="390" y="125" width="150" height="72" rx="8" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="465" y="152" text-anchor="middle" dominant-baseline="central" fill="#0C447C">Backend API</text>
  <text font-size="12" x="465" y="172" text-anchor="middle" dominant-baseline="central" fill="#185FA5">Node.js / Express</text>
  <!-- MongoDB -->
  <rect x="390" y="280" width="150" height="72" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="465" y="307" text-anchor="middle" dominant-baseline="central" fill="#085041">Banco de dados</text>
  <text font-size="12" x="465" y="327" text-anchor="middle" dominant-baseline="central" fill="#0F6E56">MongoDB via Mongoose</text>
  <!-- Asset local -->
  <rect x="175" y="340" width="150" height="72" rx="8" fill="#FAECE7" stroke="#993C1D" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="250" y="364" text-anchor="middle" dominant-baseline="central" fill="#712B13">Asset local</text>
  <text font-size="12" x="250" y="382" text-anchor="middle" dominant-baseline="central" fill="#993C1D">areas_count.json +</text>
  <text font-size="12" x="250" y="398" text-anchor="middle" dominant-baseline="central" fill="#993C1D">AsyncStorage cache</text>
  <!-- OpenRouter -->
  <rect x="390" y="430" width="150" height="72" rx="8" fill="#FAEEDA" stroke="#BA7517" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="465" y="457" text-anchor="middle" dominant-baseline="central" fill="#633806">OpenRouter AI</text>
  <text font-size="12" x="465" y="477" text-anchor="middle" dominant-baseline="central" fill="#BA7517">Llama 3 — chatbot</text>
  <!-- Arrows -->
  <line x1="140" y1="262" x2="173" y2="100" stroke="#888" stroke-width="1" marker-end="url(#arrow2)"></line>
  <line x1="140" y1="270" x2="173" y2="226" stroke="#888" stroke-width="1" marker-end="url(#arrow2)"></line>
  <line x1="325" y1="100" x2="388" y2="155" stroke="#888" stroke-width="1" marker-end="url(#arrow2)"></line>
  <line x1="325" y1="220" x2="388" y2="170" stroke="#888" stroke-width="1" marker-end="url(#arrow2)"></line>
  <line x1="465" y1="197" x2="465" y2="278" stroke="#888" stroke-width="1" marker-end="url(#arrow2)"></line>
  <line x1="325" y1="376" x2="388" y2="316" stroke="#888" stroke-width="1" marker-end="url(#arrow2)"></line>
  <line x1="325" y1="220" x2="388" y2="455" stroke="#888" stroke-width="1" marker-end="url(#arrow2)"></line>
  <text font-size="11" x="156" y="165" text-anchor="middle" fill="#aaa">usa</text>
  <text font-size="11" x="156" y="252" text-anchor="middle" fill="#aaa">usa</text>
  <text font-size="11" x="362" y="128" text-anchor="middle" fill="#aaa">REST</text>
  <text font-size="11" x="362" y="198" text-anchor="middle" fill="#aaa">REST</text>
  <text font-size="11" x="480" y="243" text-anchor="middle" fill="#aaa">lê/grava</text>
  <text font-size="11" x="358" y="344" text-anchor="middle" fill="#aaa">cache local</text>
  <text font-size="11" x="370" y="393" text-anchor="middle" fill="#aaa">chama</text>
  <!-- Legend -->
  <rect x="24" y="546" width="10" height="10" rx="2" fill="#534AB7"></rect>
  <text font-size="11" x="40" y="555" fill="#666">Frontends</text>
  <rect x="110" y="546" width="10" height="10" rx="2" fill="#185FA5"></rect>
  <text font-size="11" x="126" y="555" fill="#666">Backend</text>
  <rect x="190" y="546" width="10" height="10" rx="2" fill="#0F6E56"></rect>
  <text font-size="11" x="206" y="555" fill="#666">Dados</text>
  <rect x="258" y="546" width="10" height="10" rx="2" fill="#993C1D"></rect>
  <text font-size="11" x="274" y="555" fill="#666">Dados locais</text>
  <rect x="368" y="546" width="10" height="10" rx="2" fill="#BA7517"></rect>
  <text font-size="11" x="384" y="555" fill="#666">Serviço externo</text>
</svg>

---

### Nível 3 — Component

> Abre o interior do Backend API, mostrando controllers, services e repositórios.

<svg width="100%" viewBox="0 0 680 620" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </marker>
  </defs>
  <rect x="20" y="20" width="640" height="580" rx="16" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="6 4"></rect>
  <text font-size="12" x="48" y="44" fill="#aaa">Backend API — component diagram</text>
  <!-- Controllers label -->
  <text font-size="12" x="340" y="68" text-anchor="middle" fill="#666">Controllers</text>
  <!-- AuthController -->
  <rect x="36" y="76" width="114" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="93" y="99" text-anchor="middle" dominant-baseline="central" fill="#0C447C">AuthController</text>
  <text font-size="12" x="93" y="117" text-anchor="middle" dominant-baseline="central" fill="#185FA5">Login / JWT</text>
  <!-- UserController -->
  <rect x="164" y="76" width="114" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="221" y="99" text-anchor="middle" dominant-baseline="central" fill="#0C447C">UserController</text>
  <text font-size="12" x="221" y="117" text-anchor="middle" dominant-baseline="central" fill="#185FA5">CRUD usuários</text>
  <!-- OcurrenceController -->
  <rect x="292" y="76" width="114" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="349" y="99" text-anchor="middle" dominant-baseline="central" fill="#0C447C">OcurrenceCtrl</text>
  <text font-size="12" x="349" y="117" text-anchor="middle" dominant-baseline="central" fill="#185FA5">CRUD ocorrências</text>
  <!-- AlertController -->
  <rect x="420" y="76" width="114" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="477" y="99" text-anchor="middle" dominant-baseline="central" fill="#0C447C">AlertController</text>
  <text font-size="12" x="477" y="117" text-anchor="middle" dominant-baseline="central" fill="#185FA5">Alertas por raio</text>
  <!-- AreaController -->
  <rect x="548" y="76" width="106" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="601" y="99" text-anchor="middle" dominant-baseline="central" fill="#0C447C">AreaController</text>
  <text font-size="12" x="601" y="117" text-anchor="middle" dominant-baseline="central" fill="#185FA5">Zonas + ratings</text>
  <!-- Middleware -->
  <rect x="150" y="152" width="380" height="28" rx="4" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="4 3"></rect>
  <text font-size="12" x="340" y="170" text-anchor="middle" fill="#888">authenticate middleware (JWT)</text>
  <!-- Services label -->
  <text font-size="12" x="340" y="210" text-anchor="middle" fill="#666">Services</text>
  <!-- UserService -->
  <rect x="36" y="218" width="114" height="56" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="93" y="241" text-anchor="middle" dominant-baseline="central" fill="#3C3489">UserService</text>
  <text font-size="12" x="93" y="259" text-anchor="middle" dominant-baseline="central" fill="#534AB7">Lógica de usuários</text>
  <!-- OcurrenceService -->
  <rect x="164" y="218" width="114" height="56" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="221" y="241" text-anchor="middle" dominant-baseline="central" fill="#3C3489">OcurrenceService</text>
  <text font-size="12" x="221" y="259" text-anchor="middle" dominant-baseline="central" fill="#534AB7">Lógica ocorrências</text>
  <!-- AlertService -->
  <rect x="292" y="218" width="114" height="56" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="349" y="241" text-anchor="middle" dominant-baseline="central" fill="#3C3489">AlertService</text>
  <text font-size="12" x="349" y="259" text-anchor="middle" dominant-baseline="central" fill="#534AB7">Lógica de alertas</text>
  <!-- AreaService -->
  <rect x="420" y="218" width="114" height="56" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="477" y="241" text-anchor="middle" dominant-baseline="central" fill="#3C3489">AreaService</text>
  <text font-size="12" x="477" y="259" text-anchor="middle" dominant-baseline="central" fill="#534AB7">Zonas + médias</text>
  <!-- MarkerService -->
  <rect x="548" y="218" width="106" height="56" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="601" y="241" text-anchor="middle" dominant-baseline="central" fill="#3C3489">MarkerService</text>
  <text font-size="12" x="601" y="259" text-anchor="middle" dominant-baseline="central" fill="#534AB7">Marcadores mapa</text>
  <!-- Repositories label -->
  <text font-size="12" x="340" y="316" text-anchor="middle" fill="#666">Repositories / Models (Mongoose)</text>
  <!-- UserRepository -->
  <rect x="36" y="324" width="114" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="93" y="347" text-anchor="middle" dominant-baseline="central" fill="#085041">UserRepository</text>
  <text font-size="12" x="93" y="365" text-anchor="middle" dominant-baseline="central" fill="#0F6E56">Model User</text>
  <!-- OcurrenceRepo -->
  <rect x="164" y="324" width="114" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="221" y="347" text-anchor="middle" dominant-baseline="central" fill="#085041">OcurrenceRepo</text>
  <text font-size="12" x="221" y="365" text-anchor="middle" dominant-baseline="central" fill="#0F6E56">Model Ocurrence</text>
  <!-- AlertRepository -->
  <rect x="292" y="324" width="114" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="349" y="347" text-anchor="middle" dominant-baseline="central" fill="#085041">AlertRepository</text>
  <text font-size="12" x="349" y="365" text-anchor="middle" dominant-baseline="central" fill="#0F6E56">Model Alert</text>
  <!-- Area / AreaRating -->
  <rect x="420" y="324" width="114" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="477" y="347" text-anchor="middle" dominant-baseline="central" fill="#085041">Area / AreaRating</text>
  <text font-size="12" x="477" y="365" text-anchor="middle" dominant-baseline="central" fill="#0F6E56">Models + ratings</text>
  <!-- MarkerRepo -->
  <rect x="548" y="324" width="106" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="601" y="347" text-anchor="middle" dominant-baseline="central" fill="#085041">MarkerRepo</text>
  <text font-size="12" x="601" y="365" text-anchor="middle" dominant-baseline="central" fill="#0F6E56">Model Marker</text>
  <!-- MongoDB -->
  <rect x="230" y="440" width="220" height="56" rx="8" fill="#F1EFE8" stroke="#5F5E5A" stroke-width="0.5"></rect>
  <text font-size="14" font-weight="500" x="340" y="463" text-anchor="middle" dominant-baseline="central" fill="#2C2C2A">MongoDB Atlas</text>
  <text font-size="12" x="340" y="481" text-anchor="middle" dominant-baseline="central" fill="#5F5E5A">Collections persistentes</text>
  <!-- Controllers to Services -->
  <line x1="93" y1="132" x2="93" y2="216" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="221" y1="132" x2="221" y2="216" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="349" y1="132" x2="349" y2="216" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="477" y1="132" x2="477" y2="216" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="601" y1="132" x2="601" y2="216" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <!-- Services to Repos -->
  <line x1="93" y1="274" x2="93" y2="322" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="221" y1="274" x2="221" y2="322" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="349" y1="274" x2="349" y2="322" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="477" y1="274" x2="477" y2="322" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="601" y1="274" x2="601" y2="322" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <!-- Repos to MongoDB -->
  <line x1="150" y1="380" x2="290" y2="440" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="278" y1="380" x2="320" y2="438" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="349" y1="380" x2="349" y2="438" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="477" y1="380" x2="390" y2="438" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <line x1="550" y1="380" x2="412" y2="440" stroke="#888" stroke-width="1" marker-end="url(#arrow3)"></line>
  <!-- Legend -->
  <rect x="24" y="560" width="10" height="10" rx="2" fill="#185FA5"></rect>
  <text font-size="11" x="40" y="569" fill="#666">Controllers</text>
  <rect x="120" y="560" width="10" height="10" rx="2" fill="#534AB7"></rect>
  <text font-size="11" x="136" y="569" fill="#666">Services</text>
  <rect x="200" y="560" width="10" height="10" rx="2" fill="#0F6E56"></rect>
  <text font-size="11" x="216" y="569" fill="#666">Repositories / Models</text>
  <rect x="380" y="560" width="10" height="10" rx="2" fill="#5F5E5A"></rect>
  <text font-size="11" x="396" y="569" fill="#666">Banco de dados</text>
</svg>

---

### Nível 4 — Code (Domain Models)

> Mostra as entidades do domínio, seus campos e relações.
