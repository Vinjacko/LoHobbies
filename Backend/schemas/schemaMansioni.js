const MansioniSchema = mongoose.Schema({
  _id: Schema.Types.ObjectId,
  tconst: {
    type:
      String,
    ref: "Titoli2"
  },
  ordering: Number,
  nconst: {
    type:
      String,
    ref: "Crew"
  },
  category: String,
  job: String,
  characters: String,
})

const Mansioni = mongoose.model("Mansioni", MansioniSchema)