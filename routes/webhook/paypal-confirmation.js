const express = require("express");
const router = express.Router();
const { addPayment } = require("../../backend/db"); // ⬅️ Dodano

// 📩 Potvrda PayPal uplate
router.post("/paypal", (req, res) => {
  const { orderID, payerID, amount, email } = req.body;

  if (!orderID || !payerID || !amount || !email) {
    return res.status(400).json({ error: "Nedostaju podaci za uplatu." });
  }

  // 🎯 Snimi uplatu u bazu
  const saved = addPayment({ orderID, payerID, amount, email });

  console.log("✅ Uplata potvrđena i snimljena:", saved);

  res.status(200).json({ message: "Uplata primljena i snimljena.", data: saved });
});

module.exports = router;
