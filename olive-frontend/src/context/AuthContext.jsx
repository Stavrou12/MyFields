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
  setLoading(false);
}, []);

const login = async (email, password) => {
  console.log("📤 Sending login:", { email, password });
  const res = await API.post("/auth/login", { email, password });
  console.log("📥 Got response:", res.data);
   const { token, user } = res.data;
    const userData = { ...user, token }; // attach token to user obj
  localStorage.setItem("token", token);  
 // localStorage.setItem("user", JSON.stringify(res.data)); // ← store token + user
localStorage.setItem("user", JSON.stringify(userData));
  setUser(userData);
  console.log("✅ AuthProvider setUser:", res.data); // ← add this
  console.log("Login success:", user);
 
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
