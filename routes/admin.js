const express = require("express");
const router = express.Router();
const { getPayments } = require("../backend/db");

router.get("/payments", (req, res) => {
  const data = getPayments();
  res.json(data);
});

module.exports = router;
