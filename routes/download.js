const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// 📤 Ruta za preuzimanje fajla
router.get("/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../converted", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fajl nije pronađen." });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Greška pri preuzimanju:", err);
    } else {
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

