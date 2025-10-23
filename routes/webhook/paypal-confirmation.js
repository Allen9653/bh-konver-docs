const express = require("express");
const router = express.Router();

// 📩 Potvrda PayPal uplate
router.post("/paypal", (req, res) => {
  const { orderID, payerID, amount, email } = req.body;

  // Ovdje možeš dodati snimanje u bazu, aktivaciju korisnika, itd.
  console.log("✅ Uplata potvrđena:", { orderID, payerID, amount, email });

  res.status(200).json({ message: "Uplata primljena." });
});

module.exports = router;
