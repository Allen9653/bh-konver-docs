const express = require("express");
const path = require("path");
const fs = require("fs");
const { validateAuthToken } = require("./middleware/auth");
const { validateFilename } = require("./middleware/validatePath");

const router = express.Router();

// 📤 Ruta za preuzimanje fajla (PROTECTED)
router.get("/:filename", validateAuthToken, validateFilename, (req, res) => {
  const { filename } = req.params;
  
  // Construct safe path within converted directory only
  const convertedDir = path.resolve(__dirname, "../converted");
  const filePath = path.join(convertedDir, filename);
  
  // Double-check the resolved path is within converted directory
  if (!filePath.startsWith(convertedDir)) {
    console.warn(`[SECURITY] Path escape attempt in download: ${filename}`);
    return res.status(403).json({ error: "Pristup odbijen." });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fajl nije pronađen." });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Greška pri preuzimanju:", err);
    } else {
      // Clean up file after download
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Greška pri brisanju fajla:", unlinkErr);
        } else {
          console.log("Fajl obrisan:", filename);
        }
      });
    }
  });
});

module.exports = router;

