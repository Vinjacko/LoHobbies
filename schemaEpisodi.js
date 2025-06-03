const EpisodiSchema = mongoose.Schema({  
	tconst: String, 
	parentTconst: String, 
	seasonNumber: String,
	episodeNumber: String 
}); 
const Episodi = mongoose.model("Episodi", EpisodiSchema);