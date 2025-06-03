const TitoliCrewSchema = mongoose.Schema({  
	tconst: String, 
	directors: String, 
	writers: String
	
}); 
const TitoliCrew = mongoose.model("TitoliCrew", TitoliCrewSchema);