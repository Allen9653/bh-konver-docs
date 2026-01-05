require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const path = require("path");

// 🔒 Sigurnosna zaglavlja (XSS, clickjacking, MIME sniffing protection)
app.use(helmet());

// 🔒 CORS konfiguracija
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["https://bhkonver.ba"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"]
};

// 📦 Middleware
app.use(cors(corsOptions));
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
