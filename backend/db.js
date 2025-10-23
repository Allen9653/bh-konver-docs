const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "payments.json");

// 📄 Inicijalizacija baze ako ne postoji
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

// 🔽 Dohvati sve uplate
function getPayments() {
  const data = fs.readFileSync(DB_PATH);
  return JSON.parse(data);
}

// ➕ Dodaj novu uplatu
function addPayment({ orderID, payerID, amount, email }) {
  const payments = getPayments();
  const newEntry = {
    orderID,
    payerID,
    amount,
    email,
    timestamp: new Date().toISOString(),
  };
  payments.push(newEntry);
  fs.writeFileSync(DB_PATH, JSON.stringify(payments, null, 2));
  return newEntry;
}

// 🔍 Filtriraj po emailu
function getPaymentsByEmail(email) {
  return getPayments().filter((p) => p.email === email);
}

module.exports = {
  getPayments,
  addPayment,
  getPaymentsByEmail,
};
