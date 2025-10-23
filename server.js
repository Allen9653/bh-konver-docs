const downloadRoute = require("./routes/download");
app.use("/download", downloadRoute);
const paypalRoute = require("./routes/payment/paypal");
const paypalWebhook = require("./routes/webhook/paypal-confirmation");

app.use("/payment", paypalRoute);
app.use("/webhook", paypalWebhook);
