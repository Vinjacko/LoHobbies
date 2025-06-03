const CrewSchema = new mongoose.Schema({
  nconst: String,
  primaryName: String,
  birthYear: String,
  deathYear: String,
  primaryProfession: String,
  knownForTitles: String
});

const Crew = mongoose.model('Crew', CrewSchema);