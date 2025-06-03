const CrewSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  nconst: String,
  primaryName: String,
  birthYear: String,
  deathYear: String,
  primaryProfession: String,
  knownForTitles: {type:
		String,
		ref: "Titoli2",
	},
});

const Crew = mongoose.model('Crew', CrewSchema);