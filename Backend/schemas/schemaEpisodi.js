const EpisodiSchema = mongoose.Schema({
	_id: Schema.Types.ObjectId,
	tconst: {
		type:
			String,
		ref: "Titoli2"
	},
	parentTconst: String,
	seasonNumber: String,
	episodeNumber: String
});
const Episodi = mongoose.model("Episodi", EpisodiSchema);