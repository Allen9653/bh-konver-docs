const express = require("express");
const router = express.Router();

// 🔐 Hardcoded admin kredencijali
const ADMIN_EMAIL = "alenjusufovic@yahoo.com";
const ADMIN_PASSWORD = "1808UmmaIsak";

// 🔑 Login ruta
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.json({ access: "full", role: "admin", message: "Dobrodošao, Allen!" });
  } else {
    res.status(401).json({ access: "limited", role: "guest", message: "Neispravni podaci." });
  }
});

module.exports = router;
