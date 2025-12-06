import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // your backend URL
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.request.use((config) => {
  console.log("📡 Sending request:", config.url, "token:", localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
