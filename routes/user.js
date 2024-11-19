require('dotenv').config();  // Add this at the very top
const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/User");
const { response } = require("express");
const { Score } = require("../models/Score");
const router = express.Router();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const multerFilter = (req, file, cb) => {
  console.log("Processing file:", file.mimetype);
  
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    console.log("Invalid file type:", file.mimetype);
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};
// console.log('Cloudinary Config:', {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      return file.mimetype.startsWith('audio') ? 'audio' : 'profile';
    },
    resource_type: (req, file) => {
      if (file.mimetype.startsWith('audio')) return 'raw';
      if (file.mimetype.startsWith('video')) return 'video';
      return 'auto';
    },
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp3', 'wav', 'mpeg'],
    public_id: (req, file) => {
      const fileName = file.originalname.split('.')[0];
      const fileExt = file.originalname.split('.').pop();
      return `${fileName}_${Date.now()}.${fileExt}`;
    },
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: multerFilter
});

const uploadUser = upload.single("file");

// Wrap the upload middleware in error handling
const handleUpload = (req, res, next) => {
  uploadUser(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(500).json({
        message: "Error uploading file",
        error: err.message
      });
    }
    next();
  });
};

const handleUploadUserPhoto = (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const filePath = req.file.path;

    res.send({
      message: "File uploaded successfully",
      fileName: req.file.originalname,
      filePath: filePath,
      format: req.file.format,
      resourceType: req.file.resource_type
    });
  } catch (error) {
    console.error("Handler Error:", error);
    res.status(500).json({
      message: "Error processing upload",
      error: error.message
    });
  }
};

// Update the route to use the error handling middleware
router.post("/uploadProfileImage", handleUpload, handleUploadUserPhoto);

router.get("/", async (req, res) => {
  const { withScores } = req.query;

  const docs = await User.find();

  if (withScores) {
    for (let index = 0; index < docs.length; index++) {
      const lesson = docs[index];

      const wordDocs = await Score.find({ userID: lesson._id });

      docs[index] = { ...lesson._doc, scores: wordDocs };
    }
  }

  res.send({ status: "success", docs });
});

router.post("/signup", (req, res) => {
  const newUser = req.body;

  bcrypt.hash(req.body.password, 4, (err, hash) => {
    if (!err) {
      // console.log("creating");
      User.create({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        hskLevel: req.body.hskLevel,
        role: req.body.role,
      })
        .then((userRecord) => {
          res.status(200).send({
            message: "Account Created",
            success: true,
            user: createClientUser(userRecord),
          });
        })
        .catch((err) => {
          // console.log("Error", err);
          res
            .status(500)
            .send({ message: "Account Error", success: false, err });
        });
    } else {
      // console.log("Error", err);
      res.status(500).send({ message: "Unable to hash", success: false, err });
    }
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log({ username, password });
  User.findOne({ username }, (err, userRecord) => {
    // console.log(userRecord);
    if (!userRecord) {
      res.status(200).send({ message: "User does not exist", auth: false });
    } else {
      bcrypt.compare(password, userRecord.password, (err, result) => {
        // console.log(result);
        res.status(200).send({
          auth: result,
          user: createClientUser(userRecord),
        });
      });
    }
  });
});
router.put("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  // console.log({ user });

  const updateOptions = ["username"];

  for (let index = 0; index < updateOptions.length; index++) {
    const element = updateOptions[index];
    user[element] = req.body[element] ? req.body[element] : user[element];
  }

  await user.save();
  res.send({ message: "user update successfully" });
});

router.get("/:id", async (req, res) => {
  try {
    const docs = await User.findOne({ _id: req.params.id });
    // console.log(docs);
    
    const { username, _id, email, hskLevel } = docs;

    res.send({
      username,
      _id,
      email,
      hskLevel,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      status: "fail",
      message: "something went wrong to get the user",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await User.deleteOne({ _id: id });

  res.send({ status: "deleted successfully" });
});

const createClientUser = ({ password, _id, username, ...rest }) => ({
  timeStamp: Date.now(),
  id: _id,
  username,
  ...rest,
});

module.exports = router;
