const search = require('../tmdbAPI/search');

const getPopularFilms = async (req, res, next) => {
    try {
        const popularFilms = await search();

        res.status(200).json(popularFilms);

    } catch (error) {
        next(error);
    }
};

module.exports = { getPopularFilms };