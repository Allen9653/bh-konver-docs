const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { validateAuthToken } = require("./middleware/auth");

const router = express.Router();

// File size limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm'
];

// 📂 Konfiguracija za snimanje fajla
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename - remove any path components
    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = Date.now() + "-" + sanitizedName;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Nepodržani tip fajla.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// 📥 Ruta za upload (PROTECTED)
router.post("/", validateAuthToken, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Fajl nije poslan." });

  // Return only the filename, not full path (security)
  res.json({ 
    message: "Fajl uspješno snimljen.", 
    filename: req.file.filename 
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fajl je prevelik. Maksimalna veličina je 50MB.' });
    }
  }
  if (err.message === 'Nepodržani tip fajla.') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
