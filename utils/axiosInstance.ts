import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://stockly-inventory.vercel.app/api" // Production URL
      : "http://localhost:3000/api", // Localhost for development
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("session_id");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
