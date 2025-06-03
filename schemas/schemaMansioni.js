const MansioniSchema = mongoose.Schema({
    _id: Schema.Types.ObjectId,
    tconst: String,
    ordering: Number,
    nconst: String,
    category: String,
    job: String,
    characters: String,
})

const Mansioni = mongoose.model("Mansioni", MansioniSchema)