const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { createCanvas } = require("canvas");

let tesseractInitialized = false;

// Generate a synthetic image
function generateSyntheticImage() {
  const width = 500; // Image width
  const height = 200; // Image height
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  // Fill the background with white
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, width, height);

  // Add some text to the image
  context.fillStyle = "#000000";
  context.font = "30px Arial";
  context.fillText("你好世界", 50, 100); // Add Chinese text for testing

  // Convert the canvas to a buffer
  const buffer = canvas.toBuffer("image/jpeg");
  return buffer;
}

// Force Tesseract Initialization
async function preloadTesseract() {
  try {
    console.log("Preloading Tesseract...");

    // Generate the synthetic image
    const syntheticImageBuffer = generateSyntheticImage();

    // Save the synthetic image to a temporary file
    const tempImagePath = path.join(os.tmpdir(), "synthetic-init.jpg");
    fs.writeFileSync(tempImagePath, syntheticImageBuffer);

    // Use the synthetic image to preload Tesseract
    await Tesseract.recognize(tempImagePath, "chi_sim", {
      logger: (info) => console.log(info),
    });

    tesseractInitialized = true;
    console.log("Tesseract initialized successfully.");

    // Cleanup the temporary file
    fs.unlinkSync(tempImagePath);
  } catch (error) {
    console.error("Error initializing Tesseract:", error);
    throw error;
  }
}

// Preload Tesseract on server startup
preloadTesseract();

// Helper function to filter only Chinese characters
function filterChineseCharacters(text) {
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2b820-\u2ceaf\uf900-\ufaff\u2f800-\u2fa1f]/g;
  const matches = text.match(chineseRegex);
  return matches ? matches.join("") : "";
}

// Process image with Tesseract.js
async function processImage(imagePath) {
  if (!tesseractInitialized) {
    throw new Error("Tesseract is not initialized yet. Please wait.");
  }

  try {
    const { data } = await Tesseract.recognize(imagePath, "chi_sim", {
      logger: (info) => console.log(info),
    });
    const chineseOnly = filterChineseCharacters(data.text);
    return chineseOnly;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
}

// Use system temp directory for better cross-platform compatibility
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = os.tmpdir();
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, `ocr-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Route for file upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Uploaded file path:", req.file.path);

    const text = await processImage(req.file.path);
    console.log("OCR result:", text);

    if (!text) {
      console.error("No Chinese characters detected");
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "No Chinese characters detected" });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
    fs.unlinkSync(req.file.path);

    res.json({ text, image: base64Image });
  } catch (error) {
    console.error("Backend error during upload:", error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to process image" });
  }
});

// Route for testing synthetic image
router.get("/test-synthetic", async (req, res) => {
  try {
    const syntheticImageBuffer = generateSyntheticImage();

    // Save the synthetic image to a temporary file
    const tempImagePath = path.join(os.tmpdir(), "synthetic-test.jpg");
    fs.writeFileSync(tempImagePath, syntheticImageBuffer);

    // Process the synthetic image
    const text = await processImage(tempImagePath);
    console.log("OCR result from synthetic image:", text);

    // Cleanup the temporary file
    fs.unlinkSync(tempImagePath);

    res.json({ text, image: `data:image/jpeg;base64,${syntheticImageBuffer.toString("base64")}` });
  } catch (error) {
    console.error("Error processing synthetic image:", error);
    res.status(500).json({ error: "Failed to process synthetic image" });
  }
});

module.exports = router;
