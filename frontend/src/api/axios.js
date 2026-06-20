import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ── User axios instance ─────────────────────────────────────────────────────
// Uses "token" key only. Never touches captainToken.
export const userAPI = axios.create({ baseURL: BASE_URL, timeout: 10000 });

const USER_PUBLIC = ["/auth/send-otp", "/auth/verify-otp"];

userAPI.interceptors.request.use((config) => {
  const isPublic = USER_PUBLIC.some((r) => config.url?.includes(r));
  if (!isPublic && !config.headers.Authorization) {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Captain axios instance ──────────────────────────────────────────────────
// Uses "captainToken" key only. Never touches token.
export const captainAPI = axios.create({ baseURL: BASE_URL, timeout: 10000 });

const CAPTAIN_PUBLIC = ["/captain/send-otp", "/captain/verify-otp", "/captain/complete-profile"];

captainAPI.interceptors.request.use((config) => {
  const isPublic = CAPTAIN_PUBLIC.some((r) => config.url?.includes(r));
  if (!isPublic && !config.headers.Authorization) {
    const token = localStorage.getItem("captainToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Default export = userAPI (backward-compat for any user pages using `api`)
export default userAPI;