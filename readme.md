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
    cd <caminho_da_sua_máquina>/E-spikeFunctional
    ```

2. **Instalar Dependências**
  Instale as dependências necessárias para o projeto:
    ```bash
    npm install
    ```
  Caso encontre problemas durante a instalação, utilize a opção de força:
    ```bash
    npm install --force
    ```

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
    npm run dev
    ```

3. **Configuração e Visualização**
  O frontend será executado na porta `localhost:5173`.
  Para uma experiência ideal, ajuste a janela do navegador para o formato Mobile (vertical).

---

## ✅ Finalização

Após seguir os passos acima, o projeto estará configurado e rodando. Você pode explorar todas as funcionalidades do E-spike diretamente pelo navegador.

Se precisar de ajuda ou encontrar problemas, fique à vontade para entrar em contato ou abrir uma Issue no repositório.

Obrigado por ler tudo até o final! 
