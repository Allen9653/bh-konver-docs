const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// 📂 Konfiguracija za snimanje fajla
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 📥 Ruta za upload
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Fajl nije poslan." });

  const inputPath = path.join(__dirname, "../uploads", req.file.filename);
  res.json({ message: "Fajl uspješno snimljen.", path: inputPath });
});

module.exports = router;
