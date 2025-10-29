const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const DB_PATH = path.join(__dirname, "../backend/payments.json");

const {
  getPayments,
  getPaymentsByEmail,
} = require("../backend/db");

// 📊 Dohvati sve uplate
router.get("/payments", (req, res) => {
  const data = getPayments();
  res.json(data);
});

// 🔍 Dohvati uplate po emailu
router.get("/payments/:email", (req, res) => {
  const email = req.params.email;
  const filtered = getPaymentsByEmail(email);
  res.json(filtered);
});

// 🗑️ Obriši uplatu po orderID
router.delete("/payments/:orderID", (req, res) => {
  const orderID = req.params.orderID;
  const payments = getPayments();
  const updated = payments.filter((p) => p.orderID !== orderID);
  fs.writeFileSync(DB_PATH, JSON.stringify(updated, null, 2));
  res.json({ message: `Uplata ${orderID} obrisana.` });
});

module.exports = router;
