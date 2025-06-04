const Titoli = require('../schemas/schemaTitoli');

exports.findMovieByTitle = async (req, res) => {
    try {
        const titoloCercato = req.query.title;

        if (!titoloCercato) {
            return res.status(400).json({ errore: 'Nessun elemento trovato!' });
        }

        // Ricerca case-insensitive e parziale
        const titoli = await Titoli.find({
            title: { $regex: titoloCercato, $options: 'i' }
        });

        res.status(200).json(titoli);
    } catch (err) {
        res.status(500).json({ errore: err.message });
    }
};


