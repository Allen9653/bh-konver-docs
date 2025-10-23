const express = require("express");
const router = express.Router();

// 🔐 Tvoj PayPal Client ID (sandbox ili live)
const PAYPAL_CLIENT_ID = "YOUR_REAL_PAYPAL_CLIENT_ID"; // zamijeni stvarnim ID-om

// 📦 Konfiguracija za frontend
router.get("/config", (req, res) => {
  res.json({ clientId: PAYPAL_CLIENT_ID });
});

module.exports = router;
