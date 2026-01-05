const express = require("express");
const crypto = require("crypto");
const router = express.Router();

/**
 * Verifikuje PayPal webhook potpis
 * @see https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/
 */
const verifyWebhookSignature = async (req) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  
  if (!webhookId) {
    console.error("[PAYPAL] PAYPAL_WEBHOOK_ID nije konfigurisan");
    return false;
  }

  const transmissionId = req.headers["paypal-transmission-id"];
  const transmissionTime = req.headers["paypal-transmission-time"];
  const transmissionSig = req.headers["paypal-transmission-sig"];
  const certUrl = req.headers["paypal-cert-url"];
  const authAlgo = req.headers["paypal-auth-algo"];

  // Provjeri da li su svi potrebni headeri prisutni
  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    console.error("[PAYPAL] Nedostaju potrebni webhook headeri");
    return false;
  }

  // Validiraj cert URL (mora biti PayPal domena)
  try {
    const url = new URL(certUrl);
    if (!url.hostname.endsWith(".paypal.com")) {
      console.error("[PAYPAL] Nevažeći cert URL:", certUrl);
      return false;
    }
  } catch (e) {
    console.error("[PAYPAL] Greška pri parsiranju cert URL:", e.message);
    return false;
  }

  try {
    // Dohvati PayPal certifikat
    const certResponse = await fetch(certUrl);
    if (!certResponse.ok) {
      console.error("[PAYPAL] Greška pri dohvatanju certifikata");
      return false;
    }
    const cert = await certResponse.text();

    // Kreiraj string za verifikaciju prema PayPal specifikaciji
    const payload = JSON.stringify(req.body);
    const crc32Value = crc32(payload);
    const expectedSignatureString = `${transmissionId}|${transmissionTime}|${webhookId}|${crc32Value}`;

    // Verifikuj potpis
    const verifier = crypto.createVerify("SHA256");
    verifier.update(expectedSignatureString);
    
    const signatureBuffer = Buffer.from(transmissionSig, "base64");
    const isValid = verifier.verify(cert, signatureBuffer);

    if (!isValid) {
      console.error("[PAYPAL] Webhook potpis nije validan");
    }

    return isValid;
  } catch (error) {
    console.error("[PAYPAL] Greška pri verifikaciji potpisa:", error.message);
    return false;
  }
};

/**
 * CRC32 implementacija za PayPal webhook verifikaciju
 */
const crc32 = (str) => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < str.length; i++) {
    crc = table[(crc ^ str.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

// Set za praćenje obrađenih webhook-ova (replay protection)
const processedWebhooks = new Set();
const WEBHOOK_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 sata

// Čisti stare webhook ID-eve periodično
setInterval(() => {
  processedWebhooks.clear();
}, WEBHOOK_EXPIRY_MS);

// Lista podržanih PayPal event tipova
const SUPPORTED_EVENTS = [
  "PAYMENT.SALE.COMPLETED",
  "PAYMENT.CAPTURE.COMPLETED",
  "CHECKOUT.ORDER.APPROVED",
  "CHECKOUT.ORDER.COMPLETED"
];

// 📩 Potvrda PayPal uplate sa verifikacijom potpisa
router.post("/paypal", async (req, res) => {
  try {
    const transmissionId = req.headers["paypal-transmission-id"];
    const eventType = req.body?.event_type;

    console.log(`[PAYPAL] Primljen webhook: ${eventType || "UNKNOWN"}, ID: ${transmissionId || "N/A"}`);

    // Replay protection - provjeri da li je webhook već obrađen
    if (transmissionId && processedWebhooks.has(transmissionId)) {
      console.warn("[PAYPAL] ⚠️ Replay pokušaj detektovan:", transmissionId);
      return res.status(200).json({ message: "Webhook već obrađen." });
    }

    // Verifikuj webhook potpis
    const isValid = await verifyWebhookSignature(req);
    if (!isValid) {
      console.error("[PAYPAL] ❌ Nevažeći webhook potpis - ODBIJENO");
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Dodaj u set obrađenih webhook-ova
    if (transmissionId) {
      processedWebhooks.add(transmissionId);
    }

    // Provjeri da li je event podržan
    if (!eventType || !SUPPORTED_EVENTS.includes(eventType)) {
      console.log(`[PAYPAL] ℹ️ Nepodržani event ignorisan: ${eventType}`);
      return res.status(200).json({ message: "Event ignorisan - nije relevantan." });
    }

    // Izvuci podatke iz webhook payload-a
    const resource = req.body?.resource || {};
    const orderID = resource.id || resource.supplementary_data?.related_ids?.order_id;
    const payerID = resource.payer?.payer_id;
    const amount = resource.amount?.total || resource.amount?.value;
    const currency = resource.amount?.currency || resource.amount?.currency_code;
    const email = resource.payer?.email_address || resource.payer?.payer_info?.email;

    // Logiraj potvrđenu uplatu
    console.log("✅ [PAYPAL] Uplata potvrđena (verificirana):", { 
      eventType,
      orderID, 
      payerID, 
      amount,
      currency,
      email,
      transmissionId 
    });

    // TODO: Ovdje dodaj poslovnu logiku za obradu uplate
    // npr. ažuriraj bazu, kreiraj korisnika, pošalji email...

    res.status(200).json({ 
      message: "Uplata primljena i verificirana.",
      eventType,
      orderID
    });
  } catch (error) {
    console.error("[PAYPAL] ❌ Greška pri obradi webhook-a:", error.message);
    res.status(500).json({ error: "Greška pri obradi webhook-a" });
  }
});

module.exports = router;
