const Diary = require('../models/diary.model');
const Media = require('../models/media.model');
const User = require('../models/user.model');


async function findOrCreateMedia(mediaData) {
    let media = await Media.findOne({ tmdbId: mediaData.tmdbId });
    if (!media) {
        media = await Media.create(mediaData);
    }
    return media;
}

// Crea o aggiorna una voce del diario
exports.logOrUpdateEntry = async (req, res) => {
    try {
        const { mediaData, rating, reviewText, watchedDate } = req.body;
        const user = req.user.id;

        const media = await findOrCreateMedia(mediaData);
        
        const entry = await Diary.findOneAndUpdate(
            { user: user, media: media._id },       // Criterio di ricerca
            { rating, reviewText, watchedDate },    // Dati da aggiornare o creare
            { new: true, upsert: true, runValidators: true }    // Opzioni: ritorna il doc nuovo, crealo se non esiste, esegui validatori per rispettare i vincoli sul voto
        ).populate('media');

        //rimuovi il film dalla watchlist se era presente
        await User.findByIdAndUpdate(user, { $pull: { watchlist: media._id } });

        res.status(201).json({ message: "Diario aggiornato correttamente."});
    } catch (error) {
        res.status(500).json({ message: "Errore nel server, diario non aggiornato."});
    }
};

// Ottiene tutte le voci del diario di un utente
exports.getUserDiary = async (req, res) => {
    try {
        const entries = await Diary.find({ user: req.user.id })
            .populate('media')              // Sostituisce l'ID del media con l'oggetto media completo
            .sort({ watchedDate: -1 });     // Ordina per data di visione più recente

        res.status(200).json({ message: "Diario mostrato correttamente."});
    } catch (error) {
        res.status(500).json({ message: "Errore del server, impossibile visualizzare il diario."});
    }
};

// Rimuove una voce del diario
exports.deleteEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const entry = await Diary.findOneAndDelete({ _id: entryId, user: req.user.id });

        if (!entry) {
            return res.status(404).json({message: "Errore: voce del diario non trovata."});
        }

        res.status(204).json({ message: "La rimozione è stata eseguita correttamente" });
    } catch (error) {
        res.status(500).json({ message: "Errore del server, impossibile rimuovere la voce del diario." });
    }
};
