const TitoliSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  titleId: String,
  ordering: Number,
  title: String,
  region: String,
  language: String,
  types: String,
  attributes: String,
  isOriginalTitle: Boolean
});

const Titoli = mongoose.model('Titoli', TitoliSchema);