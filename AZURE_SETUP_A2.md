# Configuração de Infraestrutura e Nuvem - Projeto E-Spike (Atividade A2)

Este documento descreve a arquitetura em nuvem do projeto **E-Spike** e serve como guia passo a passo para configurar os recursos no Microsoft Azure e em outras plataformas, atendendo aos requisitos da disciplina de Computação em Nuvem II.

---

## 1. Infraestrutura do Projeto e Recursos Utilizados

O projeto adota uma abordagem *cloud-first*, dividindo responsabilidades entre diferentes plataformas como serviço (PaaS) e infraestrutura como serviço (IaaS) para obter alta disponibilidade e reduzir a carga de gerenciamento de servidores.

### Onde está hospedado:
- **Frontend (Web/Mobile App):** Hospedado no **Render.com** (Static Site). Permite deploy contínuo integrado ao GitHub.
- **Backend (API REST Node.js):** Hospedado no **Render.com** (Web Service). Gerencia as regras de negócio, autenticação e comunicação com os serviços externos.
- **Banco de Dados:** **MongoDB Atlas** (Cloud Database). Armazena os dados de usuários, alertas, zonas de risco e metadados.
- **Armazenamento de Arquivos:** **Microsoft Azure Blob Storage**. Utilizado para salvar as imagens dos "Foto-Reportes" enviados pela comunidade.
- **Monitoramento e Observabilidade:** **Azure Application Insights** + **Azure Monitor**. Monitoramento ativo da API Node.js.

---

## 2. Implementando Storage Account - Blob Storage

Para o recurso de "Foto-Reportes", as imagens enviadas pelos usuários não são salvas no banco de dados, mas sim no Azure Blob Storage, garantindo escalabilidade. O backend já está programado para utilizar o SDK `@azure/storage-blob`.

### Como Configurar no Portal do Azure:
1. Acesse o [Portal do Azure](https://portal.azure.com/).
2. Vá em **Storage accounts** (Contas de Armazenamento) e clique em **Create**.
3. Escolha seu *Resource Group* (ex: `espike-rg`) e dê um nome único (ex: `espikestorage`).
4. Em *Redundancy*, escolha **Geo-redundant storage (GRS)** para garantir alta disponibilidade. Prossiga e crie o recurso.
5. Após criado, entre na Storage Account, vá na aba **Containers** e crie um novo chamado `teste` (com nível de acesso *Private* - o código gera SAS URLs temporárias por segurança).
6. Vá na aba **Access keys** (Chaves de acesso), clique em *Show* na **Connection string** da `key1` e copie o valor.

### Configuração no Backend:
No painel do Render.com (ou no arquivo `.env` local do backend), adicione as seguintes variáveis:
```env
PHOTO_REPORT_AZURE_ENABLED=true
AZURE_STORAGE_CONNECTION_STRING=Sua_Connection_String_Aqui
```
*O backend vai gerar automaticamente links (SAS URLs) com validade de 24 horas para visualização segura das fotos no frontend.*

---

## 3. Monitoramento do Ambiente e Dashboards

A observabilidade da API foi implementada usando o **Azure Application Insights**. O backend Node.js utiliza o pacote oficial `@azure/monitor-opentelemetry` para coletar métricas automáticas.

### Como Configurar no Portal do Azure:
1. No Portal do Azure, pesquise por **Application Insights** e crie um novo recurso (vinculado ao seu *Resource Group*).
2. Na página inicial do Application Insights recém-criado, copie a **Connection String** exibida no canto superior direito.

### Configuração no Backend:
No painel do Render.com (ou no `.env` local), adicione:
```env
AZURE_APPINSIGHTS_CONNECTION_STRING=Sua_Connection_String_Do_App_Insights
```

### Criando Dashboards de Monitoramento:
1. No Portal do Azure, procure por **Dashboards** e crie um **Novo Dashboard**.
2. Adicione os seguintes *Tiles* (Painéis) puxando dados do seu recurso Application Insights:
   - **Tempo de Resposta do Servidor:** Para ver se a API está lenta.
   - **Solicitações de Servidor (Server Requests):** Para ver o tráfego da API (quantidade de requisições /api/photo-reports, /api/alerts, etc).
   - **Exceções / Falhas:** Gráfico listando os erros HTTP (400, 500) retornados pelo Node.js.
   - **Métricas do Storage Account:** Adicione um gráfico das métricas da sua *Storage Account* mostrando a quantidade de chamadas "PutBlob" (uploads) e "GetBlob" (downloads).

---

## 4. Política de Backup do Ambiente

As políticas de backup combinam recursos nativos do Azure e do MongoDB Atlas. 

### Azure Blob Storage (Arquivos de Imagem)
Não é necessário rodar scripts manuais se configurarmos as proteções nativas no Portal do Azure:
1. Na sua Storage Account, vá até o menu lateral **Data protection** (Proteção de dados).
2. Marque a opção **Enable soft delete for blobs** e configure para reter arquivos por **30 dias**. Se uma imagem for deletada acidentalmente, ela poderá ser restaurada pelo portal em até 1 mês.
3. Marque a opção **Enable versioning for blobs** (Opcional, caso fotos de mesmo nome sejam sobrescritas, preserva o histórico).

### MongoDB Atlas (Dados em Texto)
- **Automático:** Caso utilize um tier pago (M10+), o Atlas faz *Cloud Backups* automáticos (Snapshots).
- **Manual (Plano Gratuito M0):** Para o plano gratuito, deve-se gerar um dump (`mongodump`) manual e armazenar o arquivo `.gz` resultante em um novo container na Azure (ex: container `db-backups`).

---

## 5. Boas Práticas de Alta Disponibilidade (HA)

O projeto cumpre com as diretrizes de alta disponibilidade por meio da descentralização de serviços e do aproveitamento da resiliência da nuvem:

1. **Hospedagem em PaaS (Render):** O Render.com gerencia o balanceamento de carga e garante que o contêiner do Node.js reinicie automaticamente em caso de falha de software (Crash).
2. **Redundância Geográfica do Storage (GRS):** A Storage Account foi configurada com GRS (Geo-Redundant Storage). Isso significa que as imagens do E-Spike são replicadas sincronamente três vezes na região principal e enviadas de forma assíncrona para uma região secundária da Microsoft. Se o datacenter primário falhar, os dados não são perdidos.
3. **Graceful Degradation (Fallback):** O código do backend foi desenvolvido para não interromper totalmente as operações caso a Azure falhe. Se o `AZURE_STORAGE_CONNECTION_STRING` for inválido ou a conexão com a nuvem cair, o sistema possui lógica de *fallback* e passa a salvar as imagens temporariamente no disco local (`uploads/photo-reports/`), mantendo o fluxo de usuários ativo.
4. **Banco de Dados em Cluster:** O MongoDB Atlas opera por padrão em um Replica Set de 3 nós. Se o nó primário cair, um nó secundário assume como primário imediatamente sem que o backend perceba indisponibilidade.
