const downloadRoute = require("./routes/download");
const paypalRoute = require("./routes/payment/paypal");
const paypalWebhook = require("./routes/webhook/paypal-confirmation");

app.use("/download", downloadRoute);
app.use("/payment", paypalRoute);
app.use("/webhook", paypalWebhook);
