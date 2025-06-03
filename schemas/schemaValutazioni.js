const ValutazioniSchema = mongoose.Schema({  
	tconst: String, 
	averageRating: Number, 
	numVotes: Number
	
}); 
const Valutazioni = mongoose.model("Valutazioni", ValutazioniSchema);