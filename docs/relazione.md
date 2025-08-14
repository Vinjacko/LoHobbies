# Relazione del Progetto: LoHobbies

## 1. Scenario Applicativo e Visione del Progetto

### 1.1 Introduzione
LoHobbies è una piattaforma web moderna e interattiva, concepita come un hub centrale per gli amanti del cinema e delle serie televisive. L'obiettivo è superare la semplice catalogazione di contenuti, offrendo un'esperienza utente ricca e personalizzata. L'applicazione permette di scoprire nuovi titoli in linea con i propri gusti, comporre un diario dettagliato delle proprie visioni e condividere le proprie passioni con una community.

### 1.2 Funzionalità Chiave
-   **Scoperta Intelligente**: Oltre a mostrare i titoli di tendenza, LoHobbies fornisce una sezione "Esplora" con filtri avanzati (per genere, anno di uscita, popolarità, valutazione) per aiutare gli utenti a trovare esattamente ciò che cercano.
-   **Gestione delle Liste Personali**:
    -   **Watchlist**: Funge da promemoria per i contenuti che l'utente vuole vedere.
    -   **Diario**: Permette di costruire uno storico delle proprie visioni. Ogni voce può essere arricchita con una valutazione (da 1 a 5 stelle), un commento personale e la data di visione, trasformando il diario in un vero e proprio archivio personale.
    -   **Preferiti**: Una schermata che contiene tutti i nostri titoli preferiti aggiunti cliccando sul bottone a forma di cuore.
-   **Autenticazione Sicura e Profilo Utente**: Il sistema di autenticazione è basato su token (JWT), con meccanismi di refresh automatico per garantire una sessione fluida e sicura. Gli utenti possono personalizzare il proprio profilo con un nome e una foto profilo, nel caso in cui non è presente una foto profilo caricata dall'utente ci sarà un placeholder con la prima lettera maiuscola del nome utente.
-   **Pagine di Dettaglio Complete**: Ogni media (film o serie TV) e persona (attore, regista) ha una pagina dedicata che aggrega tutte le informazioni rilevanti: trama, cast, produzioni correlate, trailer ufficiali (tramite modale) e raccomandazioni basate su algoritmi.
- **Menù impostazioni**: composto da diverse voci che ci permettono di cambiare la lingua dell'applicazione (italiano e inglese), il tema dell'applicazione (white-mode e dark-mode), la possibilità di cambiare password e di aggiornare la foto profilo.

## 2. Architettura dell'Applicazione

L'architettura è basata sul modello a tre livelli (Three-Tier Architecture), che separa la presentazione, la logica applicativa e la gestione dei dati.

-   **Frontend (Livello di Presentazione)**:
    -   **Framework**: React (v19)
    -   **Routing**: `react-router-dom` per la navigazione client-side in una Single Page Application (SPA).
    -   **State Management**: React Context API (`AuthContext`, `FilterContext`, `ThemeContext`) per la gestione dello stato globale (autenticazione, filtri, tema).
    -   **Chiamate API**: `axios` per le comunicazioni HTTP con il backend, con un'istanza pre-configurata e interceptor per la gestione automatica del refresh dei token.
    -   **Styling**: CSS puro con un approccio modulare per componente.

-   **Backend (Livello Logico)**:
    -   **Framework**: Node.js con Express.js per la creazione di un'API RESTful robusta.
    -   **Gestione Asincrona**: Utilizzo di `async/await` per operazioni non bloccanti, specialmente nelle interazioni con il database e le API esterne.
    -   **Sicurezza**: Middleware `authMiddleware` per proteggere gli endpoint che richiedono autenticazione tramite la verifica di JSON Web Tokens (JWT).
    -   **Integrazione Esterna**: Un modulo dedicato (`tmdb.js`) gestisce tutte le chiamate verso l'API di The Movie Database (TMDB) per l'arricchimento dei dati.

-   **Database (Livello Dati)**:
    -   **Sistema**: MongoDB, un database NoSQL a documenti che offre flessibilità per la gestione dei dati degli utenti.
    -   **ODM**: Mongoose per la modellazione degli oggetti di business (schema `User`) e la gestione delle interazioni con il database.

---

## 3. Diagrammi UML

### 3.1 Diagramma dei Casi d'Uso Esteso

```mermaid
graph TD
    subgraph "Utente Guest"
        Guest[Guest] --> Registrazione;
        Guest --> Login;
    end

    subgraph "Utente Registrato"
        Utente[Utente] --> GestisciProfilo[Gestisci Profilo];
        Utente --> CercaContenuti[Cerca Contenuti];
        CercaContenuti --> FiltraRisultati[Filtra Risultati];
        Utente --> VisualizzaDettagli[Visualizza Dettagli Media];
        Utente --> GestisciWatchlist[Gestisci Watchlist];
        Utente --> GestisciDiario[Gestisci Diario];
        Utente --> GestisciPreferiti[Gestisci Preferiti];
    end
```

### 3.2 Diagramma di Sequenza (Login Utente)

```mermaid
sequenceDiagram
    participant U as Utente
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Inserisce email e password e clicca Login
    F->>B: POST /api/v1/auth/login (con credenziali)
    B->>DB: findOne({ email: email })
    DB-->>B: Restituisce dati utente (incluso hash password)
    B->>B: Confronta hash password fornita con quella salvata
    alt Credenziali Corrette
        B->>B: Genera Access Token (JWT) e Refresh Token
        B->>DB: Salva Refresh Token per l'utente
        DB-->>B: Conferma salvataggio
        B-->>F: 200 OK con dati utente e Access Token
        F->>F: Salva stato utente nel Context
        F-->>U: Reindirizza alla Homepage e mostra profilo
    else Credenziali Errate
        B-->>F: 401 Unauthorized
        F-->>U: Mostra messaggio di errore
    end
```

---

## 4. Modello dei Dati Dettagliato

Il database MongoDB utilizza una singola collection `users` per memorizzare tutte le informazioni.

### Schema `User` (`LoHobbies/backend/models/User.js`)

-   `name`: (String, Required) - Nome visualizzato dell'utente.
-   `email`: (String, Required, Unique) - Identificativo univoco per l'autenticazione.
-   `password`: (String, Required, Select: false) - Hash della password (non restituito di default nelle query).
-   `refreshToken`: (String) - Token utilizzato per rinnovare la sessione senza richiedere un nuovo login.
-   `profilePicture`: (String) - Path dell'immagine del profilo caricata sul server.
-   `watchlist`, `diary`, `favourites`: (Array di Sub-documenti) - Ognuno di questi array contiene oggetti con una struttura definita, che include non solo l'ID del media ma anche metadati come `title` e `posterPath` per ridurre la necessità di chiamate API aggiuntive quando si visualizzano le liste.
    -   **Sottodocumento `diary`**: Include campi aggiuntivi come `rating` (Number), `comment` (String) e `watchedDate` (Date) per una registrazione dettagliata.
-   `timestamps`: (Boolean: true) - Aggiunge automaticamente i campi `createdAt` e `updatedAt` a ogni documento.

---

## 5. Documentazione delle API (Backend)

Descrizione dettagliata degli endpoint principali.

### 5.1 Autenticazione (`/auth`)
-   `POST /register`: Body: `{ name, email, password }`. Crea un nuovo utente.
-   `POST /login`: Body: `{ email, password }`. Autentica l'utente e restituisce `accessToken` e dati utente. Imposta un `httpOnly` cookie con il `refreshToken`.
-   `GET /`: (Protetta) Endpoint usato per verificare la validità del token e caricare i dati dell'utente all'avvio dell'app.
-   `POST /profile-picture`: (Protetta) Accetta `multipart/form-data` per il caricamento di un'immagine.

### 5.2 Media (`/media`)
-   `GET /discover`: Query params: `?genre=28&sort_by=popularity.desc`. Permette una ricerca filtrata.
-   `GET /search`: Query params: `?query=matrix`. Restituisce una lista di film, serie TV e persone.
-   `POST /watchlist`: (Protetta) Body: `{ mediaId, mediaType, title, ... }`. Aggiunge un elemento alla watchlist.
-   `DELETE /watchlist/:mediaId`: (Protetta) Rimuove un elemento specifico dalla watchlist. Logica simile per `diary` e `favourites`.

---

## 6. Componenti React (Frontend)

Analisi della struttura dei componenti e del flusso di dati.

### 6.1 Flusso dei Dati e Gestione dello Stato
L'applicazione fa un uso estensivo della React Context API per evitare il "prop drilling".
-   **`AuthContext`**: Fornisce a tutti i componenti figli l'oggetto `user`, lo stato `loading` e le funzioni `login`/`logout`. All'avvio, tenta di caricare i dati dell'utente (`loadUser`) per mantenere la sessione.
-   **`FilterContext`**: Mantiene lo stato dei filtri selezionati nel `FilterModal` e li rende disponibili alle pagine `Explore` e `SearchPage` per costruire le query API corrette.
-   **`ThemeContext`**: Permette di cambiare il tema (es. da chiaro a scuro) e applica le classi CSS corrispondenti al `div` principale dell'app.

### 6.2 Descrizione dei Componenti Chiave
-   **`Header.js`**: Componente complesso che include la barra di ricerca con autocompletamento, i link di navigazione e un menu a tendina per l'utente loggato (con link a Profilo, Diary, Watchlist, Favourites e Logout).
-   **`MediaCarousel.js`**: Componente riutilizzabile (basato sulla libreria Swiper) per visualizzare caroselli orizzontali di media, utilizzato in `Trending`,e nelle raccomandazioni. (DA CAMBIARE)
-   **`AuthModal.js`**: Contiene sia il form di Login che quello di Registrazione, con logica per passare da uno all'altro. Include la validazione dei campi e la gestione della visualizzazione della password.
-   **`MediaPage.js`**: Una delle pagine più complesse. Al mount, esegue chiamate API multiple per ottenere i dettagli del media, il cast, i video (trailer) e le raccomandazioni. Renderizza queste informazioni usando altri componenti riutilizzabili come `CastCarousel` e `RecommendationsGrid`.


---

## 7. Sicurezza e Gestione degli Errori

### 7.1 Misure di Sicurezza
La sicurezza è un aspetto fondamentale dell'applicazione, implementata sia a livello di backend che di frontend.
-   **Autenticazione basata su Token (JWT)**: L'accesso alle risorse protette è controllato tramite JSON Web Tokens. L'Access Token ha una breve durata per minimizzare i rischi in caso di compromissione, mentre il Refresh Token, memorizzato in un cookie `httpOnly` per prevenire attacchi XSS, permette di rinnovare la sessione in modo sicuro.
-   **Hashing delle Password**: Le password degli utenti non vengono mai memorizzate in chiaro. Viene utilizzato l'algoritmo `bcrypt` per creare un hash sicuro della password prima di salvarla nel database.
-   **Protezione degli Endpoint**: Il backend utilizza un middleware (`authMiddleware.js`) che viene applicato a tutte le rotte che richiedono l'autenticazione. Questo middleware verifica la validità del JWT presente nell'header della richiesta.
-   **CORS (Cross-Origin Resource Sharing)**: La configurazione CORS sul backend è restrittiva e permette richieste solo da origini fidate (l'URL del frontend),

 impedendo richieste non autorizzate da altri domini.
-   **Validazione dell'Input**: Viene eseguita una validazione di base sull'input dell'utente per prevenire attacchi comuni.

### 7.2 Gestione degli Errori
-   **Backend**: Il server Express è configurato con un gestore di errori globale (`unhandledRejection`) che cattura qualsiasi errore asincrono non gestito, logga il messaggio e chiude il server in modo controllato per prevenire stati inconsistenti. Le risposte API utilizzano codici di stato HTTP standard (es. 400, 401, 404, 500) per comunicare la natura dell'errore al client.
-   **Frontend**: Il client utilizza gli `interceptor` di Axios per gestire centralmente gli errori delle API. In particolare, l'interceptor di risposta gestisce automaticamente gli errori `401 Unauthorized` tentando di rinnovare il token. Per l'utente finale, gli errori vengono mostrati attraverso notifiche o messaggi contestuali per non interrompere l'esperienza di navigazione.

---

## 8. Diagramma di Architettura Visuale

Questo diagramma illustra il flusso di comunicazione tra i vari componenti del sistema.

```mermaid
graph TD
    User([Utente Browser]) --> Frontend{"Frontend (React SPA)"};
    Frontend -->|Chiamate API| Backend{"Backend (Node.js/Express)"};
    Backend -->|Query| Database[(MongoDB)];
    Backend -->|Chiamata API Esterna| ExternalAPI[TMDB API];

    style User fill:#,stroke:#333,stroke-width:2px;
    style Frontend fill:#,stroke:#333,stroke-width:2px;
    style Backend fill:#,stroke:#333,stroke-width:2px;
    style Database fill:#,stroke:#333,stroke-width:2px;
    style ExternalAPI fill:#,stroke:#333,stroke-width:2px;
```

---

## 9. Flusso di Dati Dettagliato nel Frontend

Il flusso di dati nel frontend è progettato per essere unidirezionale e prevedibile, seguendo i principi di React.

1.  **Inizializzazione dell'App**:
    -   Al caricamento, `App.js` renderizza i `Provider` dei contesti (`AuthProvider`, `FilterProvider`, `ThemeProvider`).
    -   `AuthProvider` esegue un `useEffect` che chiama la funzione `loadUser`.
    -   `loadUser` effettua una chiamata `GET /api/v1/auth` per recuperare i dati dell'utente se esiste una sessione valida (tramite il refresh token cookie). Il risultato popola lo stato `user` nel contesto.

2.  **Interazione dell'Utente (Esempio: Aggiunta al Diario)**:
    -   L'utente si trova sulla `MediaPage` e clicca sul pulsante per aggiungere un film al diario.
    -   Viene aperta una modale (`DiaryModal`) che permette di inserire valutazione e commento.
    -   Al salvataggio, il componente chiama una funzione (es. `handleAddToDiary`).
    -   Questa funzione invia una richiesta `POST /api/v1/media/diary` al backend tramite Axios, includendo l'ID del media, la valutazione e il commento. Il token di autenticazione viene automaticamente allegato all'header dall'interceptor di Axios.
    -   Il backend processa la richiesta, aggiorna il documento dell'utente nel database e restituisce una risposta di successo.
    -   Il frontend riceve la risposta. A questo punto, può invalidare i dati esistenti per forzare un ri-fetch del diario (`loadUser()` o una funzione specifica) oppure aggiornare lo stato locale per riflettere immediatamente la modifica senza una nuova chiamata API.
    -   Viene mostrata una notifica di successo (`SuccessModal`) all'utente.

Questo approccio garantisce che lo stato dell'interfaccia utente sia sempre sincronizzato con lo stato del backend, fornendo un'esperienza fluida e reattiva.

## 10. Deployment