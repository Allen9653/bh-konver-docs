// convert.js – API rute za konverziju fajlova

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { validateAuthToken } = require("./middleware/auth");
const { validateInputPath } = require("./middleware/validatePath");

// Uvoz konverter funkcija
const convertPDF = require("../backend/convert/pdf");
const convertAudio = require("../backend/convert/audio");
const convertImage = require("../backend/convert/image");
const convertGIF = require("../backend/convert/gif");

// Allowed output formats per conversion type
const ALLOWED_FORMATS = {
  pdf: ['docx', 'txt', 'jpg', 'png'],
  audio: ['mp3', 'wav', 'ogg', 'flac'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  gif: ['mp4', 'gif', 'webm']
};

const validateOutputFormat = (type) => (req, res, next) => {
  const { outputFormat } = req.body;
  
  if (!outputFormat) {
    return res.status(400).json({ error: 'outputFormat je obavezan.' });
  }

  const allowed = ALLOWED_FORMATS[type] || [];
  if (!allowed.includes(outputFormat.toLowerCase())) {
    return res.status(400).json({ 
      error: `Nepodržani izlazni format. Dozvoljeni formati: ${allowed.join(', ')}` 
    });
  }
  
  next();
};

// 📄 PDF konverzija (PROTECTED)
router.post("/pdf", validateAuthToken, validateInputPath, validateOutputFormat('pdf'), (req, res) => {
  const { outputFormat } = req.body;
  const inputPath = req.validatedPath;
  const outputDir = path.resolve("converted");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  convertPDF(inputPath, outputFormat, outputDir, (err, outputFile) => {
    if (err) {
      console.error('[CONVERT] PDF conversion error:', err);
      return res.status(500).json({ error: "PDF konverzija nije uspjela." });
    }
    // Return only filename, not full path
    res.json({ message: "Uspješno konvertovano", filename: path.basename(outputFile) });
  });
});

// 🎧 Audio konverzija (PROTECTED)
router.post("/audio", validateAuthToken, validateInputPath, validateOutputFormat('audio'), (req, res) => {
  const { outputFormat } = req.body;
  const inputPath = req.validatedPath;
  const outputDir = path.resolve("converted");

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  convertAudio(inputPath, outputFormat, outputDir, (err, outputFile) => {
    if (err) {
      console.error('[CONVERT] Audio conversion error:', err);
      return res.status(500).json({ error: "Audio konverzija nije uspjela." });
    }
    res.json({ message: "Uspješno konvertovano", filename: path.basename(outputFile) });
  });
});

// 🖼️ Image konverzija (PROTECTED)
router.post("/image", validateAuthToken, validateInputPath, validateOutputFormat('image'), (req, res) => {
  const { outputFormat } = req.body;
  const inputPath = req.validatedPath;
  const outputDir = path.resolve("converted");

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  convertImage(inputPath, outputFormat, outputDir, (err, outputFile) => {
    if (err) {
      console.error('[CONVERT] Image conversion error:', err);
      return res.status(500).json({ error: "Image konverzija nije uspjela." });
    }
    res.json({ message: "Uspješno konvertovano", filename: path.basename(outputFile) });
  });
});

// 🎞️ GIF/Video konverzija (PROTECTED)
router.post("/gif", validateAuthToken, validateInputPath, validateOutputFormat('gif'), (req, res) => {
  const { outputFormat } = req.body;
  const inputPath = req.validatedPath;
  const outputDir = path.resolve("converted");

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  convertGIF(inputPath, outputFormat, outputDir, (err, outputFile) => {
    if (err) {
      console.error('[CONVERT] GIF/Video conversion error:', err);
      return res.status(500).json({ error: "GIF/Video konverzija nije uspjela." });
    }
    res.json({ message: "Uspješno konvertovano", filename: path.basename(outputFile) });
  });
});

module.exports = router;