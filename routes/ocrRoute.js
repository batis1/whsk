const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { createWorker } = Tesseract;
function verifyLanguageFile() {
    const langPath = path.join(process.cwd(), 'chi_sim.traineddata');
    if (!fs.existsSync(langPath)) {
      throw new Error('Chinese language file not found. Please ensure chi_sim.traineddata is in the root directory.');
    }
  }
// Helper function to filter only Chinese characters
function filterChineseCharacters(text) {
  // This regex matches Chinese characters (including traditional)
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2b820-\u2ceaf\uf900-\ufaff\u2f800-\u2fa1f]/g;
  
  // Find all Chinese characters in the text
  const matches = text.match(chineseRegex);
  
  // Return the Chinese characters joined together, or empty string
  return matches ? matches.join('') : '';
}

// Helper function to process image with Tesseract
async function processImage(imagePath) {
  let worker = null;
  try {
    process.stdout.write('Starting OCR process...\n');
    
    // Create worker with logger
    worker = await createWorker({
      logger: m => process.stdout.write(JSON.stringify(m) + '\n')
    });
    
    process.stdout.write('Loading language...\n');
    await worker.loadLanguage('chi_sim');
    
    process.stdout.write('Initializing...\n');
    await worker.initialize('chi_sim');
    
    process.stdout.write('Setting parameters...\n');
    await worker.setParameters({
      tessedit_char_whitelist: '\u4e00-\u9fff',
      preserve_interword_spaces: '0',
      tessedit_pageseg_mode: '3'
    });

    process.stdout.write('Recognizing text...\n');
    const result = await worker.recognize(imagePath);
    
    process.stdout.write('Processing results...\n');
    const chineseOnly = filterChineseCharacters(result.data.text);
    
    process.stdout.write('Cleaning up...\n');
    await worker.terminate();
    
    return chineseOnly;
  } catch (error) {
    process.stdout.write('Error occurred during OCR process:\n');
    process.stdout.write(error.toString() + '\n');
    
    if (worker) {
      try {
        await worker.terminate();
      } catch (terminateError) {
        process.stdout.write('Error terminating worker: ' + terminateError.toString() + '\n');
      }
    }
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
  }
});

// Add file size and type restrictions
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Reduce to 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Route for webcam capture
router.post("/capture", async (req, res) => {
  let imagePath = null;
  try {
    verifyLanguageFile();  // Add this line
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { img } = req.body;
    if (!img) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const base64Data = img.replace(/^data:image\/(jpeg|png|jpg);base64,/, "");
    imagePath = path.join(os.tmpdir(), `capture-${Date.now()}.jpg`);
    
    fs.writeFileSync(imagePath, base64Data, 'base64');
    
    const text = await processImage(imagePath);
    
    if (!text) {
      return res.status(400).json({ error: 'No Chinese characters detected' });
    }
    
    res.json({ text });
  } catch (error) {
    console.error('Capture error:', error);
    res.status(500).json({ 
      error: 'Failed to process image',
      details: error.message 
    });
  } finally {
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (e) {
        console.error('Failed to delete temporary file:', e);
      }
    }
  }
});

// Route for file upload
router.post("/upload", upload.single('file'), async (req, res) => {
  try {
    process.stdout.write('Starting file upload processing...\n');
    verifyLanguageFile();
    
    if (!req.file) {
      process.stdout.write('No file uploaded\n');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    process.stdout.write('Processing image...\n');
    const text = await processImage(req.file.path);
    
    if (!text) {
      process.stdout.write('No Chinese characters detected\n');
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No Chinese characters detected' });
    }
    
    process.stdout.write('Converting image to base64...\n');
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    process.stdout.write('Cleaning up temporary file...\n');
    fs.unlinkSync(req.file.path);
    
    process.stdout.write('Sending response...\n');
    res.json({ 
      text,
      image: base64Image
    });
  } catch (error) {
    process.stdout.write('Upload error: ' + error.toString() + '\n');
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        process.stdout.write('Failed to delete temporary file: ' + e.toString() + '\n');
      }
    }
    res.status(500).json({ 
      error: 'Failed to process image',
      details: error.message 
    });
  }
});

module.exports = router;
