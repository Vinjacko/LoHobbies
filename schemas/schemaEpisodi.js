const EpisodiSchema = mongoose.Schema({  
	_id: Schema.Types.ObjectId,
	tconst: String, 
	parentTconst: String, 
	seasonNumber: String,
	episodeNumber: String 
}); 
const Episodi = mongoose.model("Episodi", EpisodiSchema);