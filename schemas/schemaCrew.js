const CrewSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  nconst: String,
  primaryName: String,
  birthYear: String,
  deathYear: String,
  primaryProfession: String,
  knownForTitles: String
});

const Crew = mongoose.model('Crew', CrewSchema);