// convert.js – API rute za konverziju fajlova

const express = require("express");
const router = express.Router();
const path = require("path");

// Uvoz konverter funkcija
const convertPDF = require("../backend/convert/pdf");
const convertAudio = require("../backend/convert/audio");
const convertImage = require("../backend/convert/image");
const convertGIF = require("../backend/convert/gif");

// 📄 PDF konverzija
router.post("/pdf", (req, res) => {
  const { inputPath, outputFormat } = req.body;
  const outputDir = path.resolve("converted");

  convertPDF(inputPath, outputFormat, outputDir, (err, outputFile) => {
    if (err) return res.status(500).json({ error: "PDF konverzija nije uspjela." });
    res.json({ message: "Uspješno konvertovano", file: outputFile });
  });
});

// 🎧 Audio konverzija
router.post("/audio", (req, res) => {
  const { inputPath, outputFormat } = req.body;
  const outputDir = path.resolve("converted");

  convertAudio(inputPath, outputFormat, outputDir, (err, outputFile) => {
    if (err) return res.status(500).json({ error: "Audio konverzija nije uspjela." });
    res.json({ message: "Uspješno konvertovano", file: outputFile });
  });
});

// 🖼️ Image konverzija
router.post("/image", (req, res) => {
  const { inputPath, outputFormat } = req.body;
  const outputDir = path.resolve("converted");

  convertImage(inputPath, outputFormat, outputDir, (err, outputFile) => {
    if (err) return res.status(500).json({ error: "Image konverzija nije uspjela." });
    res.json({ message: "Uspješno konvertovano", file: outputFile });
  });
});

// 🎞️ GIF/Video konverzija
router.post("/gif", (req, res) => {
  const { inputPath, outputFormat } = req.body;
  const outputDir = path.resolve("converted");

  convertGIF(inputPath, outputFormat, outputDir, (err, outputFile) => {
    if (err) return res.status(500).json({ error: "GIF/Video konverzija nije uspjela." });
    res.json({ message: "Uspješno konvertovano", file: outputFile });
  });
});

module.exports = router;
