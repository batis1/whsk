const mongoose = require("mongoose");
const express = require("express");
const { request } = require("express");
const { Score } = require("../models/Score");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const scores = await Score.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          username: 1,
          score: 1,
          date: 1,
          userID: 1,
          level: "$user.hskLevel"
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.send(scores.map((score, index) => ({
      ...score,
      index: index + 1
    })));
  } catch (err) {
    console.log("There was an error", err);
    res.status(500).send(err);
  }
});

router.get("/:userID", (req, res) => {
  if (req.query.isAdmin) {
    Score.find({ userID: req.params.userID }, (err, docs) => {
      res.send({ docs });
    })
      .sort({ score: -1 })
      .catch((err) => {
        console.log("There was an error", err);
        res.status(500).send(err);
      });
    return;
  }

  Score.find({ userID: req.params.userID }, (err, docs) => {
    res.send(docs);
  })
    .sort({ score: -1 })
    .limit(10)
    .catch((err) => {
      console.log("There was an error", err);
      res.status(500).send(err);
    });
});

router.post("/", (req, res) => {
  const newScore = req.body;
  console.log(newScore);
  Score.create(newScore)
    .then((obj) => {
      console.log("New score is created", obj);
      res.status(200).send({ message: "You're score is saved" });
    })
    .catch((err) => {
      console.log("There was an error", err);
      res.status(500).send(err);
    });
});

module.exports = router;
