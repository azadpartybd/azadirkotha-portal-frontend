import axios from "axios";

export const api = axios.create({ baseURL: process.env.VUE_APP_BASE_API_URL });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// expired / missing login -> back to the login page (but not for the login request itself)
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e?.response?.status === 401 && !String(e.config?.url || "").includes("/auth/login")) {
      localStorage.removeItem("token");
      if (!location.pathname.startsWith("/journalist/login")) {
        location.assign(`/journalist/login?next=${encodeURIComponent(location.pathname)}`);
      }
    }
    return Promise.reject(e);
  }
);

export const errorMessage = (e, fallback = "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।") => {
  const d = e?.response?.data;
  if (!d?.error) return fallback;
  // "detail" is only sent by debug builds of the server
  return d.detail ? `${d.error} [${d.detail}]` : d.error;
};

export const isLoggedIn = () => !!localStorage.getItem("token");
export const logout = () => localStorage.removeItem("token");

export const bnDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
};

export const bnNum = (n) => Number(n ?? 0).toLocaleString("bn-BD");