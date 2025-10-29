import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    axios.get("/admin/payments").then((res) => {
      setPayments(res.data);
    });
  }, []);

  const filtered = payments.filter((p) =>
    p.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>📊 Admin panel – Evidencija uplata</h2>

      <input
        type="text"
        placeholder="Filtriraj po emailu..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Email</th>
            <th>Iznos</th>
            <th>Vrijeme</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={i}>
              <td>{p.orderID}</td>
              <td>{p.email}</td>
              <td>{p.amount} USD</td>
              <td>{new Date(p.timestamp).toLocaleString("bs-BA")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && <p>Nema rezultata za traženi email.</p>}
    </div>
  );
};

export default Admin;
