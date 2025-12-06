import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← new
  
   useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false); // ← done reading
  }, []);

  // Auto login from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

const login = async (email, password) => {
  console.log("📤 Sending login:", { email, password });
  const res = await API.post("/auth/login", { email, password });
  console.log("📥 Got response:", res.data);
 // localStorage.setItem("token", res.data.token);
  //localStorage.setItem("user", JSON.stringify(res.data.user));
  localStorage.setItem("user", JSON.stringify(res.data)); // ← store token + user
  setUser(res.data);
  console.log("✅ AuthProvider setUser:", res.data); // ← add this
};

  const register = async (name, email, password) => {
    await API.post("/auth/register", { name, email, password });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout,loading }}>
      {children}
    </AuthContext.Provider>
  );
};
