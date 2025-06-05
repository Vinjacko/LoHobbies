const TitoliCrewSchema = mongoose.Schema({
	_id: Schema.Types.ObjectId,
	tconst: {
		type:
			String,
		ref: "Titoli2"
	},
	directors: {
		type:
			String,
		ref: "Crew"
	},
	writers: {
		type:
			String,
		ref: "Crew"
	}

});
const TitoliCrew = mongoose.model("TitoliCrew", TitoliCrewSchema);