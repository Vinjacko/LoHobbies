const ValutazioniSchema = mongoose.Schema({  
	_id: Schema.Types.ObjectId,
	tconst: {type:
		String,
		ref: "Titoli2"
	}, 
	averageRating: Number, 
	numVotes: Number
	
}); 
const Valutazioni = mongoose.model("Valutazioni", ValutazioniSchema);