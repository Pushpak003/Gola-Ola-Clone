import axios from "axios";

// Instance directly window/module scope me create karo
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Yahan check karo ki API define ho chuka hai ya nahi
if (API && API.interceptors) {
  API.interceptors.request.use(
    (config) => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("captainToken");

      console.log("AXIOS TOKEN =>", token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log("AUTH HEADER =>", config.headers.Authorization);
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
}

export default API;
