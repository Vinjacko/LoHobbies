const Titoli2Schema = mongoose.Schema({  
	tconst: String, 
	titleType: String, 
	primaryTitle: String,
	originalTitle: String,
	isAdult: String,
	startYear: String,
	endYear: String,
	runtimeMinutes: String,
	genres: String
}); 
const Titoli2 = mongoose.model("Titoli2", Titoli2Schema);