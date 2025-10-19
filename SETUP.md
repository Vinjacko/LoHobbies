# Configurazione Ambiente di Sviluppo

## File di Ambiente

### `.env` (Produzione)
Usato per il deployment su Render:
```env
REACT_APP_API_URL=https://lohobbies.onrender.com
```

### `.env.local` (Sviluppo Locale)
Usato per lo sviluppo locale (NON committare su Git):
```env
REACT_APP_API_URL=http://localhost:3000
```

## Avvio Applicazione

### Backend
```bash
cd backend
node server.js
```
Il backend parte sulla porta 3000.

### Frontend
```bash
cd frontend
npm start
```
Il frontend parte sulla porta 3001 (o altra porta disponibile).

## Note Importanti
- Il file `.env.local` ha priorità su `.env` in sviluppo
- NON rimuovere le virgolette dai valori in .env
- NON committare `.env.local` su Git
