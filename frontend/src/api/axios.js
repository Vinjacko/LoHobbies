import axios from 'axios';

// creazione di un'istanza di axios per facilitarne l'utilizzo
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

export default instance;