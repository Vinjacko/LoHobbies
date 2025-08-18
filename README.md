# LoHobbies

LoHobbies è un'applicazione web completa per la gestione e la scoperta di contenuti cinematografici e televisivi. L'applicazione permette agli utenti di cercare, esplorare e interagire con informazioni dettagliate su film e serie TV, sfruttando le API di The Movie Database (TMDB).

## Funzionalità Principali

### Autenticazione e Gestione Utenti
- **Registrazione e Accesso**: Sistema completo di autenticazione con registrazione, login e logout
- **Gestione del Profilo**: Possibilità di caricare e modificare l'immagine del profilo
- **Persistenza della Sessione**: Supporto per il "Ricordami" durante il login
- **Sicurezza**: Protezione delle password con bcrypt e token JWT per l'autenticazione

### Esplorazione dei Contenuti
- **Contenuti in Tendenza**: Sezione dedicata ai contenuti più popolari con algoritmo di ranking personalizzato
- **Esplora**: Catalogo completo di film e serie TV ordinati per valutazione
- **Ricerca Avanzata**: Barra di ricerca con autocompletamento e filtri per genere, anno di uscita e ordinamento
- **Dettagli dei Contenuti**: Pagine dedicate per film e serie TV con informazioni dettagliate, cast, trailer e immagini

### Interazione con i Contenuti
- **Watchlist**: Possibilità di aggiungere contenuti a una lista dei desideri personalizzata
- **Preferiti**: Sistema di preferiti per salvare i contenuti preferiti
- **Diario Personale**: Funzionalità per registrare i contenuti visti con valutazioni e commenti
- **Commenti**: Sistema di commenti in tempo reale sui contenuti

### Funzionalità Social e di Condivisione
- **Valutazioni**: Sistema di valutazione a stelle per i contenuti
- **Commenti in Tempo Reale**: Chat in tempo reale per i commenti sui contenuti
- **Contenuti Consigliati**: Sezione con raccomandazioni personalizzate basate sui contenuti visualizzati
- **Contenuti per Genere**: Visualizzazione di contenuti simili per genere

### Esperienza Utente
- **Interfaccia Responsive**: Design adattivo per dispositivi mobili e desktop
- **Supporto Multilingua**: Interfaccia disponibile in italiano e inglese
- **Temi Personalizzabili**: Supporto per temi chiari e scuri
- **Navigazione Intuitiva**: Interfaccia utente pulita e facile da usare

### Tecnologie Utilizzate
- **Frontend**: React, React Router, i18next per l'internazionalizzazione
- **Backend**: Node.js con Express, MongoDB per il database
- **Autenticazione**: JWT (JSON Web Tokens) con refresh token
- **API Esterne**: Integrazione con le API di The Movie Database (TMDB)
- **Real-time**: Socket.IO per le funzionalità in tempo reale
- **Gestione File**: Multer per il caricamento delle immagini profilo

## Struttura dell'Applicazione
L'applicazione è suddivisa in due parti principali:
1. **Frontend**: Interfaccia utente React con componenti modulari
2. **Backend**: API RESTful con Express per la gestione dei dati e l'autenticazione

## Funzionalità di Personalizzazione
- **Temi**: Supporto per temi chiari e scuri
- **Lingue**: Supporto multilingua (italiano e inglese)
- **Filtri Avanzati**: Opzioni di filtraggio per genere, anno e ordinamento

## Sicurezza
- **Protezione delle Password**: Hashing con bcrypt
- **Autenticazione JWT**: Token di accesso e refresh per sessioni sicure
- **Protezione CSRF**: Implementazione di misure di sicurezza per proteggere le richieste