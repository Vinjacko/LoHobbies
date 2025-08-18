# LoHobbies

LoHobbies è un'applicazione web completa per la gestione e la scoperta di contenuti cinematografici e televisivi. L'applicazione permette agli utenti di cercare, esplorare e interagire con informazioni dettagliate su film e serie TV, sfruttando le API di The Movie Database (TMDB).

## Funzionalità Principali

### Autenticazione e Gestione Utenti
- **Registrazione e Accesso**: Sistema completo di autenticazione con registrazione, login e logout
- **Gestione del Profilo**: Possibilità di caricare e modificare l'immagine del profilo
- **Persistenza della Sessione**: Supporto per il "Ricordami" durante il login con token di refresh
- **Sicurezza**: Protezione delle password con bcrypt e autenticazione basata su token JWT

### Esplorazione dei Contenuti
- **Contenuti in Tendenza**: Sezione dedicata ai contenuti più popolari con algoritmo di ranking personalizzato che considera fattori come freschezza, popolarità, qualità percepita e tasso di completamento
- **Esplora**: Catalogo completo di film e serie TV ordinati per valutazione, con paginazione
- **Ricerca Avanzata**: Barra di ricerca con autocompletamento e filtri per genere, anno di uscita e ordinamento (per popolarità, anno di rilascio o valutazione)
- **Dettagli dei Contenuti**: Pagine dedicate per film e serie TV con informazioni dettagliate, cast completo, trailer e immagini

### Interazione con i Contenuti
- **Watchlist**: Possibilità di aggiungere contenuti a una lista dei desideri personalizzata con salvataggio delle informazioni essenziali
- **Preferiti**: Sistema di preferiti per salvare i contenuti preferiti con persistenza nel database utente
- **Diario Personale**: Funzionalità per registrare i contenuti visti con valutazioni a stelle, commenti e data di visione
- **Commenti**: Sistema di commenti in tempo reale sui contenuti con notifica istantanea agli utenti connessi

### Funzionalità Social e di Condivisione
- **Valutazioni**: Sistema di valutazione a stelle per i contenuti con salvataggio nel diario personale
- **Commenti in Tempo Reale**: Chat in tempo reale per i commenti sui contenuti con aggiornamento istantaneo
- **Contenuti Consigliati**: Sezione con raccomandazioni personalizzate basate sui contenuti visualizzati, ottenute direttamente dalle API di TMDB
- **Contenuti per Genere**: Visualizzazione di contenuti simili per genere principale del contenuto visualizzato

### Esperienza Utente
- **Interfaccia Responsiva**: Design adattivo per dispositivi mobili e desktop con componenti ottimizzati per diverse dimensioni dello schermo
- **Supporto Multilingua**: Interfaccia disponibile in italiano e inglese con rilevamento automatico della lingua del browser
- **Temi Personalizzabili**: Supporto per temi chiari e scuri con persistenza della preferenza dell'utente
- **Navigazione Intuitiva**: Interfaccia utente pulita e facile da usare con menu di navigazione e breadcrumb

### Tecnologie Utilizzate
- **Frontend**: React con React Router per la navigazione, i18next per l'internazionalizzazione, Swiper per caroselli interattivi
- **Backend**: Node.js con Express per le API RESTful, MongoDB con Mongoose per il database documentale
- **Autenticazione**: JWT (JSON Web Tokens) con token di accesso a breve scadenza e token di refresh per sessioni prolungate
- **API Esterne**: Integrazione completa con le API di The Movie Database (TMDB) per ottenere informazioni dettagliate su film, serie TV e persone
- **Real-time**: Socket.IO per le funzionalità di commenti in tempo reale
- **Gestione File**: Multer per il caricamento sicuro delle immagini profilo degli utenti

## Struttura dell'Applicazione
L'applicazione è suddivisa in due parti principali:
1. **Frontend**: Interfaccia utente React con componenti modulari organizzati per funzionalità
2. **Backend**: API RESTful con Express per la gestione dei dati utente, autenticazione e integrazione con TMDB

## Funzionalità di Personalizzazione
- **Temi**: Supporto per temi chiari e scuri con cambio immediato e persistenza della preferenza
- **Lingue**: Supporto multilingua (italiano e inglese) con rilevamento automatico e selezione manuale
- **Filtri Avanzati**: Opzioni di filtraggio per genere, anno di rilascio/uscita e ordinamento per popolarità, data o valutazione

## Sicurezza
- **Protezione delle Password**: Hashing con bcrypt per salvare le password in modo sicuro nel database
- **Autenticazione JWT**: Token di accesso con scadenza breve (15 minuti) e token di refresh per sessioni prolungate (7 giorni)