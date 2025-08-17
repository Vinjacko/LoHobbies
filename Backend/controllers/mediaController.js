const tmdb = require('../utils/tmdb');
const User = require('../models/User');
const Comment = require('../models/Comment');

/*Lo scopo è risolvere un problema comune nei sistemi di valutazione: 
  come confrontare un film con un punteggio di 9/10 basato su 1.000 voti con un film che ha un punteggio di 10/10 ma solo 5 voti? 
  Un semplice punteggio medio favorirebbe il secondo film, ma intuitivamente sappiamo che il primo risultato è più affidabile. 
  Il Wilson Score affronta questo problema calcolando un limite inferiore "pessimistico" del punteggio che un elemento probabilmente otterrebbe se tutti avessero votato. 
  In questo modo, penalizza gli elementi con un numero inferiore di voti, fornendo un ordinamento più equo e affidabile.
*/
const wilsonScore = (p, n) => {
  const z = 1.96;   // 95% di confidenza
  if (n === 0) return 0;
  const p_hat = p;
  const score =
    (p_hat + (z * z) / (2 * n) - z * Math.sqrt((p_hat * (1 - p_hat) + (z * z) / (4 * n)) / n)) /
    (1 + (z * z) / n);
  return score;
};

// calcola un punteggio di tendenza
const getTrending = async (req, res, next) => {
  const { language = 'it-IT' } = req.query;   // permette di ottenere i risultati di TMDB basati sul mercato italiano
  try {
    // recupera un insieme più ampio di contenuti popolari da TMDB
    const movieResponse = await tmdb.get('/discover/movie', {
      params: {
        sort_by: 'popularity.desc',
        'vote_count.gte': 150, // filtro per rilevanza (almeno 150 voti)
        page: 1,
        'primary_release_date.lte': new Date().toISOString().split('T')[0],   // filtro sulla data, converte la data in formato ISO e prende solo la parte che corrisponde a gg/mm/aaaa
        language,
      },
    });

    const tvResponse = await tmdb.get('/discover/tv', {
      params: {
        sort_by: 'popularity.desc',
        'vote_count.gte': 150,
        page: 1,
        'first_air_date.lte': new Date().toISOString().split('T')[0],
        language,
      },
    });

    // aggiunge l'attributo media_type a film e serie-TV
    const candidates = [
      ...movieResponse.data.results.map((m) => ({ ...m, media_type: 'movie' })),
      ...tvResponse.data.results.map((t) => ({ ...t, media_type: 'tv' })),
    ];

    // calcola il punteggio di tendenza per ogni candidato
    const WEIGHTS = { freshness: 0.15, popularity: 0.45, quality: 0.35, completion: 0.05 }; //completion è la percentuale di contenuto guardato
    const MAX_POPULARITY = Math.max(...candidates.map(c => c.popularity), 10000);

    const scoredCandidates = candidates.map((c) => {
      // freschezza: misura quanto è recente il film (nel nostro caso 5 giorni)
      const releaseDate = new Date(c.release_date || c.first_air_date);
      const hoursSinceRelease = (new Date() - releaseDate) / (1000 * 60 * 60);
      const score_freshness = hoursSinceRelease <= 120 ? 1.0 : Math.exp(-0.00577 * (hoursSinceRelease - 120));

      // popolarità di TMDB: questo valore viene normalizzato con una funzione logaritmica per evitare che titoli estremamente virali dominino la classifica.
      const score_popularity = Math.log(1 + c.popularity) / Math.log(1 + MAX_POPULARITY);

      // qualità percepita da TMDB: calcola un punteggio di qualità statisticamente robusto usando la media voti (vote_average) e il numero di voti (vote_count) di TMDB.
      // Utilizza la formula dell'intervallo di confidenza di Wilson per dare più peso ai titoli con un numero significativo di recensioni
      const p_hat = c.vote_average / 10.0;
      const score_quality = wilsonScore(p_hat, c.vote_count);
      
      // tasso di completamento visione: metrica interna che misura la percentuale media di un film che gli utenti guardano. 
      // Premia i titoli che mantengono gli spettatori incollati allo schermo fino alla fine
      const score_completion = 0.75; // Placeholder value

      // punteggio di tendenza finale
      const trendingScore =
        WEIGHTS.freshness * score_freshness +
        WEIGHTS.popularity * score_popularity +
        WEIGHTS.quality * score_quality +
        WEIGHTS.completion * score_completion;

      return { ...c, trendingScore };
    });

    // ordina con il nuovo punteggio di tendenza
    const sortedCandidates = scoredCandidates.sort((a, b) => b.trendingScore - a.trendingScore);

    // diversifica i risultati
    const finalTrendingList = [];
    const genreCounts = {};
    const MAX_GENRE = 3;

    sortedCandidates.forEach((candidate) => {

});
    let stop = false;

    sortedCandidates.forEach((candidate) => {
      if (stop) return;

      if (finalTrendingList.length >= 20) {
        stop = true;
      return;
      }

      const mainGenreId = candidate.genre_ids[0];
      const genreCount = genreCounts[mainGenreId] || 0;

      if (genreCount < MAX_GENRE) {
        finalTrendingList.push(candidate);
        genreCounts[mainGenreId] = genreCount + 1;
      }
    });

    res.status(200).json({ success: true, data: finalTrendingList });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Errore del server' });
  }
};

// metodo per ottenere il contenuto della sezione esplora
const getExplore = async (req, res, next) => {
  try {
    const { page = 1, language = 'it-IT' } = req.query;

    const movieResponse = await tmdb.get('/discover/movie', {
      params: {
        sort_by: 
        'vote_average.desc',
        'vote_count.gte': 150,
        page,
        language,
      },
    });

    const tvResponse = await tmdb.get('/discover/tv', {
        params: {
          sort_by: 
          'vote_average.desc',
          'vote_count.gte': 150,
          page,
          language,
        },
      });

    const results = [
        ...movieResponse.data.results.map((m) => ({ ...m, media_type: 'movie' })),
        ...tvResponse.data.results.map((t) => ({ ...t, media_type: 'tv' }))
    ].sort((a, b) => b.vote_average - a.vote_average);

    const total_pages = Math.max(movieResponse.data.total_pages, tvResponse.data.total_pages);
    const total_results = movieResponse.data.total_results + tvResponse.data.total_results;

    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page, 10),   // pagina corrente convertita da stringa a numero intero
        total_pages,
        total_results,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo per ottenere i dettagli di film e serie-TV
const getMovieDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'it-IT' } = req.query;
    const response = await tmdb.get(`/movie/${id}`, {
      params: {
        // permette di richiedere tutte le informazioni sul contenuto
        append_to_response: 'credits,videos,images',    
        language
      }
    });
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Errore del server!' });
  }
};

const getTvShowDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'it-IT' } = req.query;
    const response = await tmdb.get(`/tv/${id}`, {
      params: {
        append_to_response: 'credits,videos,images',
        language
      }
    });
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo per ottenere i contenuti consigliati nella sezione 'potrebbero piacerti anche'
const getRecommendations = async (req, res, next) => {
  try {
    const { media_type, id } = req.params;
    const { language = 'it-IT' } = req.query;
    const response = await tmdb.get(`/${media_type}/${id}/recommendations`, {
      params: { language }
    });
    const results = response.data.results.map((m) => ({ ...m, media_type }));
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // se il contenuto non esiste viene ugualmente riscontrato un esito positivo ma restituito un array vuoto
      return res.status(200).json({ success: true, data: [] });   
    }
    console.error(error);
    res.status(400).json({ success: false, error: 'Server Error' });
  }
};

// metodo per ottenere le informazioni sul cast
const getPersonDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'it-IT' } = req.query;
    const response = await tmdb.get(`/person/${id}`, {
      params: {
        append_to_response: 'movie_credits,tv_credits',
        language
      }
    });
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo per gestire la barra di ricerca
const searchAll = async (req, res, next) => {
  try {
    const { query, mediaType, sortBy = 'popularity.desc', genres, yearFrom, yearTo, language = 'it-IT' } = req.query;
    let results = [];
    const searchPromises = [];
    // se viene fornito un mediaType specifico lo usa altrimenti cerca entrambi
    const typesToSearch = mediaType ? [mediaType] : ['movie', 'tv'];

    if (typesToSearch.includes('movie')) {
        searchPromises.push(
            tmdb.get('/search/movie', { params: { query, primary_release_year: yearFrom, language } })
                .then(res => res.data.results.map(item => ({ ...item, media_type: 'movie' })))
        );
    }
    if (typesToSearch.includes('tv')) {
        searchPromises.push(
            tmdb.get('/search/tv', { params: { query, first_air_date_year: yearFrom, language } })
                .then(res => res.data.results.map(item => ({ ...item, media_type: 'tv' })))
        );
    }

    const responses = await Promise.all(searchPromises);
    responses.forEach(responseArray => {
        results.push(...responseArray);
    });

    // filtra il genere se fornito
    if (genres) {
      const genreArray = genres.split(',');
      results = results.filter(item =>
        item.genre_ids && item.genre_ids.some(genreId => genreArray.includes(genreId.toString()))
      );
    }

    // ordina i risultati
    const [sortKey, sortOrder] = sortBy.split('.');
    results.sort((a, b) => {
      let valA, valB;

      if (sortKey === 'release_date') {
        valA = new Date(a.release_date || a.first_air_date);
        valB = new Date(b.release_date || b.first_air_date);
      } else {
        valA = a[sortKey] || 0;
        valB = b[sortKey] || 0;
      }

      if (valA < valB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo per gestire i filtri di ricerca
const discoverMedia = async (req, res, next) => {
  try {
    const {
      mediaType = 'movie',
      page = 1,
      sortBy = 'popularity.desc',
      genres,
      yearFrom,
      yearTo,
      language = 'it-IT',
    } = req.query;

    const params = {
      page,
      sort_by: sortBy,
      'vote_count.gte': 100, // filtra gli oggetti con almeno 100 voti
      language,
    };

    if (genres) 
      params.with_genres = genres;
    if (mediaType === 'movie') {
      if (yearFrom) 
        params['primary_release_date.gte'] = `${yearFrom}-01-01`;
      if (yearTo) 
        params['primary_release_date.lte'] = `${yearTo}-12-31`;
    } else if (mediaType === 'tv') {
      if (yearFrom) 
        params['first_air_date.gte'] = `${yearFrom}-01-01`;
      if (yearTo) 
        params['first_air_date.lte'] = `${yearTo}-12-31`;
    }

    const response = await tmdb.get(`/discover/${mediaType}`, { params });

    const results = response.data.results.map((item) => ({ ...item, media_type: mediaType }));

    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        page: response.data.page,
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo per ottenere i generi nei filtri
const getGenres = async (req, res, next) => {
  try {
    const { language = 'it-IT' } = req.query;
    const movieGenresPromise = tmdb.get('/genre/movie/list', { params: { language } });
    const tvGenresPromise = tmdb.get('/genre/tv/list', { params: { language } });

    const [movieGenres, tvGenres] = await Promise.all([movieGenresPromise, tvGenresPromise]);

    const genres = {
      movie: movieGenres.data.genres.filter(genre => genre.name !== 'TV Movie'),  // TV Movie è un genere ambiguo per questo è meglio filtrarlo
      tv: tvGenres.data.genres.filter(genre => genre.name !== 'TV Movie'),
    };

    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo legato all'autocompletamento della barra di ricerca
const autocompleteSearch = async (req, res, next) => {
  try {
    const { query, language = 'it-IT' } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const response = await tmdb.get('/search/multi', {
      params: {
        query,
        language,
        include_adult: true,
      },
    });

    const scoredResults = response.data.results.map(item => {
      const title = item.title || item.name || '';
      const lowerTitle = title.toLowerCase();
      const lowerQuery = query.toLowerCase();
      let score = 0;

      if (lowerTitle === lowerQuery) {
        score = 3; // corrispondenza esatta
      } else if (lowerTitle.startsWith(lowerQuery)) {
        score = 2; // inizia con ciò che si è scritto
      } else if (lowerTitle.includes(lowerQuery)) {
        score = 1; // contiene ciò che si è scritto
      }

      return { ...item, relevanceScore: score };
    });

    const sortedResults = scoredResults.sort((a, b) => {
        if (a.relevanceScore !== b.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;   // ordina i risultati in base al relevanceScore dal più alto al più basso
        }
        return b.popularity - a.popularity;
    });

    // filtraggio e limitazione dei risultati
    const finalResults = sortedResults
      .filter(item =>
        item.relevanceScore > 0 &&
        ((item.media_type === 'movie' && item.poster_path) ||
         (item.media_type === 'tv' && item.poster_path) ||
         (item.media_type === 'person' && item.profile_path))
      )
      .slice(0, 7); // Limit to 7 results

    res.status(200).json({ success: true, data: finalResults });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Server Error' });
  }
};

// metodo per aggiungere i titoli alla watchlist
const addToWatchlist = async (req, res, next) => {
  try {
    const { mediaId, mediaType, posterPath, title, releaseDate } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non trovato!' });
    }

    const isAlreadyInWatchlist = user.watchlist.some(item => item.mediaId === mediaId && item.mediaType === mediaType);

    if (isAlreadyInWatchlist) {
      return res.status(400).json({ success: false, error: 'Contenuto già presente nella watchlist!' });
    }

    user.watchlist.push({ mediaId, mediaType, posterPath, title, releaseDate });
    await user.save();

    res.status(200).json({ success: true, data: user.watchlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo per ottenere il contenuto della watchlist
const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non trovato' });
    }
    res.status(200).json({ success: true, data: user.watchlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo per rimuovere il contenuto dalla watchlist
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non troavato' });
    }

    user.watchlist = user.watchlist.filter(item => item.mediaId !== mediaId);
    await user.save();

    res.status(200).json({ success: true, data: user.watchlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo per aggiungere un contenuto al diario
const addToDiary = async (req, res, next) => {
    try {
        const { mediaId, mediaType, posterPath, title, releaseDate, rating, comment, watchedDate } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Utente non trovato!' });
        }

        const diaryEntry = {
            mediaId,
            mediaType,
            posterPath,
            title,
            releaseDate,
            rating,
            comment,
            watchedDate: watchedDate,
        };

        user.diary.push(diaryEntry);
        await user.save();

        if (comment && comment.trim() !== '') {
            const newComment = new Comment({
                user: userId,
                mediaId,
                mediaType,
                content: comment,
            });
            await newComment.save();
            const populatedComment = await Comment.findById(newComment._id).populate('user', 'name username profilePicture');
            req.io.emit('new_comment', populatedComment);
        }

        res.status(200).json({ success: true, data: user.diary });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Errore del server!' });
    }
};

// metodo per ottenere il contenuto del diario
const getDiary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non trovato!' });
    }
    res.status(200).json({ success: true, data: user.diary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Errore del server' });
  }
};

// metodo per rimuovere un contenuto dal diario
const removeFromDiary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non trovato' });
    }

    const diaryEntry = user.diary.find(item => item._id.toString() === id);

    if (diaryEntry && diaryEntry.comment) {
      await Comment.findOneAndDelete({
        user: userId,
        mediaId: diaryEntry.mediaId,
        mediaType: diaryEntry.mediaType,
        content: diaryEntry.comment,
      });
    }

    user.diary = user.diary.filter(item => item._id.toString() !== id);
    await user.save();

    res.status(200).json({ success: true, data: user.diary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Errore del server!' });
  }
};

// metodo per aggiungere un contenuto ai preferiti
const addToFavourites = async (req, res, next) => {
  try {
    const { mediaId, mediaType, posterPath, title, releaseDate } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non trovato!' });
    }

    const isAlreadyInFavourites = user.favourites.some(item => item.mediaId === mediaId && item.mediaType === mediaType);

    if (isAlreadyInFavourites) {
      return res.status(400).json({ success: false, error: 'Contenuto già presente nei preferiti!' });
    }

    user.favourites.push({ mediaId, mediaType, posterPath, title, releaseDate });
    await user.save();

    res.status(200).json({ success: true, data: user.favourites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Errore del server' });
  }
};

// metodo per ottenere il contenuto dei preferiti
const getFavourites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non trovato!' });
    }
    res.status(200).json({ success: true, data: user.favourites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Errore del server' });
  }
};

// metodo per rimuovere un contenuto dai preferiti
const removeFromFavourites = async (req, res, next) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utente non trovato!' });
    }

    user.favourites = user.favourites.filter(item => item.mediaId !== mediaId);
    await user.save();

    res.status(200).json({ success: true, data: user.favourites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Errore del server' });
  }
};

const getComments = async (req, res, next) => {
  try {
    const { mediaType, mediaId } = req.params;
    const comments = await Comment.find({ mediaType, mediaId }).sort({ createdAt: -1 }).populate('user', 'name username profilePicture');
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Errore del server' });
  }
};

module.exports = {
  getTrending,
  getExplore,
  getMovieDetails,
  getTvShowDetails,
  getRecommendations,
  getPersonDetails,
  searchAll,
  discoverMedia,
  getGenres,
  autocompleteSearch,
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  addToDiary,
  getDiary,
  removeFromDiary,
  addToFavourites,
  getFavourites,
  removeFromFavourites,
  getComments,
};