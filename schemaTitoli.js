const titoliSchema = new mongoose.Schema({
  titleId: String,
  ordering: Number,
  title: String,
  region: String,
  language: String,
  types: String,
  attributes: String,
  isOriginalTitle: Boolean
});

const titoli = mongoose.model('Titoli', titoliSchema);