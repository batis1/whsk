const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  character: String,
  pinyin: String,
  englishTranslation: String,
  sentence: String,
  lessonId: { type: mongoose.Types.ObjectId, ref: "Lesson", required: true },
});

const Word = mongoose.model("Word", wordSchema);

module.exports = { Word };
