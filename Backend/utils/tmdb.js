const axios = require('axios');

const tmdb = axios.create({
  baseURL: process.env.BASEURL,
  params: {
    api_key: process.env.TMDB_API_KEY,
  },
});

module.exports = tmdb;