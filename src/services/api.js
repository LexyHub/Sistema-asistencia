import axios from "axios";

console.log("🔧 API_URL:", process.env.REACT_APP_API_URL);

// Create an axios instance with default configuration
const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://api.v3.lexy.cl/sistema-asistencia",
  // "https://api.v2.lexy.cl/",
  timeout: 1000000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Simple response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Success:", response.status);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.message);
    return Promise.reject(error);
  }
);

export default api;
