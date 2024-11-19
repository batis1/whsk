const mongoose = require("mongoose");
const express = require("express");
const { Word } = require("../models/WordModel");
const { User } = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  const { lessonId, userId, query } = req.query;
  const objectQuery = {};

  if (userId) {
    const user = await User.findById(userId);
    console.log({ user });
    const words = [];

    if (user?.savedWords)
      for (let index = 0; index < user.savedWords.length; index++) {
        const wordId = user.savedWords[index];
        console.log({ wordId });
        const word = await Word.findById(wordId);

        words.push(word);
      }
    res.send({ docs: words });

    return;
  }

  if (lessonId) {
    objectQuery.lessonId = lessonId;
  }

  if (query) {
    objectQuery.character = query;
  }

  const docs = await Word.find(objectQuery);

  res.send({ resultLength: docs.length, message: "working", docs });
});

router.post("/", async (req, res) => {
  const newWord = new Word(req.body);

  const doc = await newWord.save();

  res.send({ message: "working", doc });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const updatedParams = [
    "character",
    "pinyin",
    "englishTranslation",
    "sentence",
  ];

  const word = await Word.findById(id);

  for (let index = 0; index < updatedParams.length; index++) {
    const param = updatedParams[index];

    word[param] = req.body[param] ? req.body[param] : word[param];
  }

  const doc = await word.save();

  res.send({ message: "working", doc });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const word = await Word.findById(id);

  const doc = await word.save();

  res.send({ message: "working", doc });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await Word.deleteOne({ _id: id });

  res.send({ message: "delete successfully" });
});

module.exports = router;
