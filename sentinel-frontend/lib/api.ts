import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sentinel_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("sentinel_token");
      localStorage.removeItem("sentinel_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (email: string, password: string, name: string) =>
    API.post("/auth/register", { email, password, name }),
  login: (email: string, password: string) =>
    API.post("/auth/login", { email, password }),
  me: () => API.get("/auth/me"),
};

export const assets = {
  list: () => API.get("/assets"),
  get: (id: string) => API.get(`/assets/${id}`),
  upload: (form: FormData) =>
    API.post("/assets/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => API.delete(`/assets/${id}`),
};

export const violations = {
  list: () => API.get("/violations"),
  resolve: (id: string) => API.post(`/violations/${id}/resolve`),
};

export const dashboard = {
  stats: () => API.get("/stats"),
  scan: () => API.post("/scan"),
  seed: () => API.post("/seed"),
};

export default API;