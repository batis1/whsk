const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  category: String,
  type: String,
  difficulty: String,
  question: String,
  correct_answer: String,
  incorrect_answers: Array,
  audioUrl: String,
  level: String,
  hskLevel: String,
  audioDescription: String,
  popupDescription: { pinyin: String, translation: String },
});

const Question = mongoose.model("Questions", questionSchema);

module.exports = { Question };
