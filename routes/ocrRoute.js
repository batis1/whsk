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
    console.log('Starting OCR process...');
    // Create worker with explicit paths
    worker = await Tesseract.createWorker({
        langPath: process.cwd(),
        workerPath: require.resolve('tesseract.js/dist/worker.min.js'),
        logger: null,  // Disable logging
        errorHandler: null  // Disable error handler
      });
    console.log('Loading language...');
    // Load language with explicit path
    await worker.loadLanguage('chi_sim', {
        langPath: process.cwd(),
        dataPath: path.join(process.cwd(), 'chi_sim.traineddata')
      });
    
    console.log('Initializing...');
    await worker.initialize('chi_sim');
    
    console.log('Setting parameters...');
    await worker.setParameters({
    tessedit_char_whitelist: '\u4e00-\u9fff',
    preserve_interword_spaces: '0',
    tessedit_pageseg_mode: '3'
    });
    console.log('Recognizing text...');
    const result = await worker.recognize(imagePath);
    
    console.log('Processing results...');
    const chineseOnly = filterChineseCharacters(result.data.text);
    console.log('Cleaning up...');
    if (worker) {
      await worker.terminate();
    }
    // Terminate worker
    if (worker) {
      await worker.terminate();
    }
    
    return chineseOnly;
  } catch (error) {
    // Make sure to terminate worker even if there's an error
    if (worker) {
      try {
        await worker.terminate();
      } catch (terminateError) {
        console.error('Error terminating worker:', terminateError);
      }
    }
    console.error('Tesseract error:', error);
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
    verifyLanguageFile();
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process image and get Chinese text only
    const text = await processImage(req.file.path);
    
    if (!text) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No Chinese characters detected' });
    }
    
    // Read the file and convert to base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    // Clean up temporary file
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      text,
      image: base64Image
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed to delete temporary file:', e);
      }
    }
    res.status(500).json({ 
      error: 'Failed to process image',
      details: error.message 
    });
  }
});

module.exports = router;
