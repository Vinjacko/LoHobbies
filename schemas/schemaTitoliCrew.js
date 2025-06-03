const TitoliCrewSchema = mongoose.Schema({  
	_id: Schema.Types.ObjectId,
	tconst: String, 
	directors: String, 
	writers: String
	
}); 
const TitoliCrew = mongoose.model("TitoliCrew", TitoliCrewSchema);