import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// ✅ Read token from new shape { token, user }
API.interceptors.request.use((req) => {
  const raw = localStorage.getItem("user");
  if (raw) {
    try {
      const data = JSON.parse(raw); // { token, user }
      if (data.token) req.headers.Authorization = data.token;
    } catch {}
  }
  return req;
});

export default API;