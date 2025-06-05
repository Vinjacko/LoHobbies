const Episodi = require('../schemas/schemaEpisodi');
const Titoli2 = require('../schemas/schemaTitoli2');

exports.findEpisodeByTitle = async (req, res) => {
    try {

        // 1. Trova la serie in base al nome
        const serie = await Titoli2.findMovieByTitle(req.query);

        if (!serie) {
            return res.status(404).json({ errore: 'Membro del cast non trovato' });
        }

        // 2. Trova i film che includono knownForTitles nell'array `tconst`
        const episodi = await Episodi.find({ tconst: serie.tconst });

        res.status(200).json(episodi);
    } catch (err) {
        res.status(500).json({ errore: err.message });
    }
};