const Crew = require('../schemas/schemaCrew');

exports.findCrewByName = async (req, res) => {
    try {
        const nomeCercato = req.query.primaryName;

        if (!nomeCercato) {
            return res.status(400).json({ errore: 'Nessun elemento trovato!' });
        }

        // Ricerca case-insensitive e parziale
        const crew = await Crew.find({
            primaryName: { $regex: nomeCercato, $options: 'i' }
        });

        res.status(200).json(crew);
    } catch (err) {
        res.status(500).json({ errore: err.message });
    }
};
