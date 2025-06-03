const ValutazioniSchema = mongoose.Schema({  
	_id: Schema.Types.ObjectId,
	tconst: String, 
	averageRating: Number, 
	numVotes: Number
	
}); 
const Valutazioni = mongoose.model("Valutazioni", ValutazioniSchema);