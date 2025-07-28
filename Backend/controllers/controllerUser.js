const User = require('../models/user.model');
const Media = require('../models/media.model');

// 'findOrCreateMedia' è una funzione helper (che abbiamo definito prima) che:
    // Cerca nella tua collezione 'Media' un documento con quel tmdbId.
    // Se lo trova, lo restituisce.
    // Se NON lo trova, ne crea uno nuovo nel tuo database e poi lo restituisce.
    // Questo passaggio è cruciale per non avere duplicati di film nel tuo DB.

async function findOrCreateMedia(mediaData) {                               
    let media = await Media.findOne({ tmdbId: mediaData.tmdbId });
    if (!media) {
        media = await Media.create(mediaData);
    }
    return media;
}

// WATCHLIST
exports.addToWatchlist = async (req, res) => {
    try {
        const media = await findOrCreateMedia(req.body.mediaData); // mediaData arriva dal frontend {tmdbId, title, etc.}
        const user = await User.findByIdAndUpdate(      // findByIdAndUpdate trova l'utente, aggiunge l'ID del film alla sua watchlist e restituisce il documento utente aggiornato.
            req.user.id,                                // ID utente ottenuto da un middleware di autenticazione
            { $addToSet: { watchlist: media._id } },    // $addToSet evita duplicati
            { new: true }                               // '{ new: true }' dice a Mongoose di restituire il documento UTENTE AGGIORNATO
        ).populate('watchlist');                        
        //  '.populate('watchlist')' dice a Mongoose: "Prendi tutti gli ID in quell'array e sostituiscili con i documenti completi dalla collezione 'Media' a cui si riferiscono".
        res.status(200).json({ message: "Contenuto aggiunto correttamente" });
    } catch (error) {
        res.status(500).json({ message: "Errore del server durante il caricamento del contenuto" });
    }
};

exports.removeFromWatchlist = async (req, res) => {
    try {
        const { mediaId } = req.params;     // L'ID del media nel nostro DB
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { watchlist: mediaId } },
            { new: true }
        ).populate('watchlist');
        
        res.status(200).json({ message: "Contenuto eliminato correttamente" });
    } catch (error) {
        res.status(500).json({ message: "Errore del server durante la rimozione del contenuto" });
    }
};

// PREFERITI (la logica è identica alla watchlist)
exports.addToFavorites = async (req, res) => {
    try {
        const media = await findOrCreateMedia(req.body.mediaData);
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { favorites: media._id } },
            { new: true }
        ).populate('favorites');

        res.status(200).json({ message: "Contenuto aggiunto correttamente" });
    } catch (error) {
        res.status(500).json({ message: "Errore del server durante il caricamento del contenuto" });
    }
};

exports.removeFromFavorites = async (req, res) => {
    try {
        const { mediaId } = req.params;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { favorites: mediaId } },
            { new: true }
        ).populate('favorites');
        
        res.status(200).json({ message: "Contenuto eliminato correttamente" });
    } catch (error) {
        res.status(500).json({ message: "Errore del server durante la rimozione del contenuto" });
    }
};

// CRONOLOGIA RICERCHE
exports.addSearchTerm = async (req, res) => {
    try {
        const { searchTerm } = req.body;
        // Aggiunge il termine in cima alla lista e limita la cronologia a 20 termini
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $push: { searchHistory: { $each: [searchTerm], $position: 0, $slice: 20 } } },
            { new: true }
        );
        res.status(200).json({ message: "Contenuto trovato correttamente" });
    } catch (error) {
        res.status(500).json({ message: "Errore del server, contenuto non disponibile" });
    }
};