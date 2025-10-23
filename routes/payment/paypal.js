const express = require("express");
const router = express.Router();

// 🔐 Tvoj PayPal Client ID (sandbox ili live)
const PAYPAL_CLIENT_ID = "alenjusufovic@yahoo.com";

router.get("/config", (req, res) => {
  res.json({ clientId: PAYPAL_CLIENT_ID });
});

module.exports = router;
