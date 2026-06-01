import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
});

const PUBLIC_ROUTES = [
  "/auth/send-otp",
  "/auth/verify-otp",
  "/captain/send-otp",
  "/captain/verify-otp",
];

if (API && API.interceptors) {
  API.interceptors.request.use(
    (config) => {
      const isPublic = PUBLIC_ROUTES.some((route) =>
        config.url?.includes(route)
      );

      if (!isPublic && !config.headers.Authorization) {
        const role = localStorage.getItem("role");
        const token = role === "captain"
          ? localStorage.getItem("captainToken")
          : localStorage.getItem("token");

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
}

export default API;