# C4 Model — E-Spike

Documentação arquitetural do projeto E-Spike nos quatro níveis do C4 Model.

---

## Nível 1 — System Context

Visão geral do sistema e seus atores externos.

```mermaid
graph TD
    cidadao["Cidadao - Usuario do app"]
    moderador["Moderador - Gerencia ocorrencias"]
    espike["E-Spike - Plataforma de seguranca urbana"]
    osm["OpenStreetMap - Tiles e geocodificacao"]
    mongo["MongoDB Atlas - Banco de dados"]
    openrouter["OpenRouter AI - Chatbot Llama 3"]

    cidadao -->|usa| espike
    moderador -->|usa| espike
    espike -->|consome tiles| osm
    espike -->|le e grava| mongo
    espike -->|chama API| openrouter
```

---

## Nível 2 — Container

Blocos tecnológicos que compõem o E-Spike.

```mermaid
graph TD
    usuario["Cidadao / Moderador"]

    subgraph frontend["Frontends"]
        mobile["App Mobile - React Native + Expo"]
        web["App Web - React Native Web + React Leaflet"]
    end

    subgraph backend["Backend"]
        api["Backend API - Node.js / Express"]
    end

    subgraph dados["Dados"]
        mongo["MongoDB via Mongoose"]
        local["Asset Local - areas_count.json + AsyncStorage"]
    end

    openrouter["OpenRouter AI - Llama 3"]

    usuario -->|usa| mobile
    usuario -->|usa| web
    mobile -->|REST HTTP| api
    web -->|REST HTTP| api
    api -->|le e grava| mongo
    mobile -->|cache local| local
    web -->|cache local| local
    mobile -->|chama API| openrouter
    web -->|chama API| openrouter
```

---

## Nível 3 — Component (Backend API)

Componentes internos do Backend Node.js / Express.

```mermaid
graph TD
    client["Cliente - Mobile ou Web"]

    subgraph middleware["Middleware"]
        auth["authenticate - Verifica JWT"]
    end

    subgraph controllers["Controllers"]
        authCtrl["AuthController - Login e JWT"]
        userCtrl["UserController - CRUD usuarios"]
        occCtrl["OcurrenceController - CRUD ocorrencias"]
        alertCtrl["AlertController - Alertas por raio"]
        areaCtrl["AreaController - Zonas e ratings"]
        markerCtrl["MarkerController - Marcadores"]
    end

    subgraph services["Services"]
        userSvc["UserService"]
        occSvc["OcurrenceService"]
        alertSvc["AlertService"]
        areaSvc["AreaService"]
        markerSvc["MarkerService"]
    end

    subgraph repositories["Repositories e Models"]
        userRepo["UserRepository"]
        occRepo["OcurrenceRepository"]
        alertRepo["AlertRepository"]
        areaRepo["Area e AreaRating"]
        markerRepo["MarkerRepository"]
    end

    mongo[("MongoDB Atlas")]

    client --> auth
    auth --> authCtrl
    auth --> userCtrl
    auth --> occCtrl
    auth --> alertCtrl
    auth --> areaCtrl
    auth --> markerCtrl

    authCtrl --> userSvc
    userCtrl --> userSvc
    occCtrl --> occSvc
    occCtrl --> markerSvc
    alertCtrl --> alertSvc
    areaCtrl --> areaSvc
    markerCtrl --> markerSvc

    userSvc --> userRepo
    occSvc --> occRepo
    alertSvc --> alertRepo
    areaSvc --> areaRepo
    markerSvc --> markerRepo

    userRepo --> mongo
    occRepo --> mongo
    alertRepo --> mongo
    areaRepo --> mongo
    markerRepo --> mongo
```

---

## Nível 4 — Code (Domain Models)

Entidades do domínio, seus campos e relações.

```mermaid
erDiagram
    USER {
        string _id PK
        string name
        string email
        string cpf
        string phone
        string password
        string user_type
        date createdAt
    }

    ALERT {
        string _id PK
        string alert_message
        string severity_level
        number alert_radius
        number latitude
        number longitude
        date alert_time
        string user_id FK
        int active
    }

    OCURRENCE {
        string _id PK
        string description
        string occurrence_type
        number latitude
        number longitude
        date date_time
        string status
    }

    MARKER {
        string _id PK
        string ocurrenceId FK
        number latitude
        number longitude
        string description
    }

    AREA {
        string _id PK
        string name
        string coordinates
        number ratingCount
        number ratings_overall
        number ratings_risk
        number ratings_lighting
        number ratings_infrastructure
        number ratings_policing
    }

    AREA_RATING {
        string _id PK
        string areaId FK
        string userId FK
        number overall
        number risk
        number lighting
        number infrastructure
        number policing
        string comments
    }

    HEXAGON {
        number id PK
        string severity
        string color
        number fill_opacity
        string coordinates
        string centroid
    }

    USER ||--o{ ALERT : cria
    USER ||--o{ AREA_RATING : avalia
    OCURRENCE ||--|| MARKER : gera
    AREA ||--o{ AREA_RATING : recebe
    AREA_RATING }o--|| AREA : agrega
```

> **Nota:** `HEXAGON` é uma entidade **local** — carregada do arquivo `assets/areas_count.json` e cacheada via `AsyncStorage`. Não possui relação com o MongoDB nem com as demais entidades.

---

## Resumo das Relações


| Relação               | Tipo    | Descrição                                                   |
| ----------------------- | ------- | ------------------------------------------------------------- |
| `User` → `Alert`       | 1:N     | Usuário cria vários alertas                                 |
| `User` → `AreaRating`  | 1:N     | Usuário avalia várias áreas (upsert por área)             |
| `Ocurrence` → `Marker` | 1:1     | Criados atomicamente; Marker é revertido se Ocurrence falhar |
| `AreaRating` → `Area`  | N:1     | Cada avaliação recalcula as médias em`Area.ratings`        |
| `Hexagon`               | isolado | Dado estático local, sem FK com MongoDB                      |
