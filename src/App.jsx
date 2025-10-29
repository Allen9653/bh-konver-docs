import React from "react";
import useAuth from "./hooks/useAuth";
import LoginForm from "./components/LoginForm";
import Admin from "./pages/Admin"; // ako želiš prikazati admin panel
import Pay from "./components/Pay"; // ako koristiš PayPal komponentu
import Converter from "./components/Converter"; // tvoja konverzijska komponenta

function App() {
  const { user, login, logout, isAdmin, error } = useAuth();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!user ? (
        <>
          <LoginForm onLogin={login} />
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      ) : (
        <>
          <p>👤 Prijavljen kao: <strong>{user.email}</strong></p>
          {isAdmin && <p>✅ Besplatan pristup aktiviran</p>}
          <button onClick={logout} style={{ marginBottom: "1rem" }}>Odjava</button>

          {/* 🔁 Konverzija dostupna svima */}
          <Converter />

          {/* 💳 PayPal samo za goste */}
          {!isAdmin && <Pay />}

          {/* 🛠️ Admin panel samo za tebe */}
          {isAdmin && <Admin />}
        </>
      )}
    </div>
  );
}

export default App;
