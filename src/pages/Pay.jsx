import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

const Pay = () => {
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    // Dohvati PayPal Client ID sa backend-a
    axios.get("/payment/config").then((res) => {
      setClientId(res.data.clientId);
    });
  }, []);

  if (!clientId) return <p>Učitavanje PayPal konfiguracije...</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>💳 BH KONVER – Uplata</h2>
      <p>Uplati 5.00 USD za aktivaciju konverzije.</p>

      <PayPalScriptProvider options={{ "client-id": clientId }}>
        <PayPalButtons
          style={{ layout: "vertical", color: "blue", shape: "pill", label: "pay" }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: { value: "5.00" },
                  description: "BH KONVER aktivacija",
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              // Pošalji potvrdu na backend
              axios.post("/webhook/paypal", {
                orderID: data.orderID,
                payerID: data.payerID,
                amount: "5.00",
                email: details.payer.email_address,
              });

              alert("✅ Uplata uspješna! Možete nastaviti s konverzijom.");
            });
          }}
          onError={(err) => {
            console.error("Greška pri PayPal uplati:", err);
            alert("Greška pri uplati. Pokušajte ponovo.");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default Pay;
