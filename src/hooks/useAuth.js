import { useState, useEffect } from "react";
import axios from "axios";

export default function useAuth() {
  const [user, setUser] = useState(null); // { email, access, role }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", { email, password });
      setUser({ email, access: res.data.access, role: res.data.role });
      setError(null);
    } catch (err) {
      setError("Neispravni podaci.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = user?.access === "full" && user?.email === "alenjusufovic@yahoo.com";

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
  };
}
