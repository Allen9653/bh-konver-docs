const express = require("express");
const app = express();
const path = require("path");

// 📦 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 Rute
const uploadRoute = require("./routes/upload");
const convertRoute = require("./routes/convert");
const downloadRoute = require("./routes/download");
const paypalRoute = require("./routes/payment/paypal");
const paypalWebhook = require("./routes/webhook/paypal-confirmation");
const adminRoute = require("./routes/admin"); // ⬅️ Pomjereno gore

app.use("/upload", uploadRoute);
app.use("/convert", convertRoute);
app.use("/download", downloadRoute);
app.use("/payment", paypalRoute);
app.use("/webhook", paypalWebhook);
app.use("/admin", adminRoute); // ⬅️ Pomjereno gore

// 🚀 Pokretanje servera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ BH KONVER backend pokrenut na http://localhost:${PORT}`);
});
