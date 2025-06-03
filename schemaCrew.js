const crewSchema = new mongoose.Schema({
  nconst: String,
  primaryName: String,
  birthYear: String,
  deathYear: String,
  primaryProfession: String,
  knownForTitles: String
});

const crew = mongoose.model('Crew', crewSchema);