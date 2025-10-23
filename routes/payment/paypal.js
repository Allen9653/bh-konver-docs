require("dotenv").config(); // ⬅️ učitaj .env varijable
const express = require("express");
const router = express.Router();

// 🔐 PayPal Client ID iz .env fajla
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;

router.get("/config", (req, res) => {
  res.json({ clientId: PAYPAL_CLIENT_ID });
});

module.exports = router;
