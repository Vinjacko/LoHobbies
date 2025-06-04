const Titoli2 = require('../schemas/schemaTitoli2');
const Crew = require('../schemas/schemaCrew');

exports.findMovieByTitle = async (req, res) => {
    try {

        if (!req.query.primaryTitle) {
            const titoloCercato = req.query.originalTitle;
            var f = 0;
        } else {
            const titoloCercato = req.query.primaryTitle;
            var f = 1;
        }

        if (!titoloCercato) {
            return res.status(400).json({ errore: 'Nessun elemento trovato!' });
        }

        // Ricerca case-insensitive e parziale

        if (f === 0) {
            const titoli2 = await Titoli2.find({
                primaryTitle: { $regex: titoloCercato, $options: 'i' }
            });
        } else {
            const titoli2 = await Titoli2.find({
                primaryTitle: { $regex: titoloCercato, $options: 'i' }
            });
        }


        res.status(200).json(titoli2);
    } catch (err) {
        res.status(500).json({ errore: err.message });
    }
};

exports.findMovieByCrew = async (req, res) => {
    try {
        const nameCrew = req.query.primaryName;

        if (!nameCrew) {
            return res.status(400).json({ errore: 'Nessun elemento trovato' });
        }

        // 1. Trova il componente del cast in base al nome
        const crew = await Crew.findCrewByName(nameCrew);

        if (!crew) {
            return res.status(404).json({ errore: 'Membro del cast non trovato' });
        }

        // 2. Trova i film che includono knownForTitles nell'array `tconst`
        const codici = crew.knownForTitles.split(",");
        codici.forEach(element => {
            const titoli2 = Titoli2.find({ tconst: element });
            res.status(200).json(titoli2);
        });


    } catch (err) {
        res.status(500).json({ errore: err.message });
    }
};