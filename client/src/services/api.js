// src/services/api.js
import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 10000 });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authAPI = {
  login: (d) => api.post("/auth/login", d),
  register: (d) => api.post("/auth/register", d),
  me: () => api.get("/auth/me"),
  changePassword: (d) => api.put("/auth/change-password", d),
  updateProfile: (d) => api.put("/auth/profile", d),
};
export const dashAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getCharts: () => api.get("/dashboard/charts"),
  getRecentActivity: () => api.get("/dashboard/recent-activity"),
  // aliases
  stats: () => api.get("/dashboard/stats"),
  charts: () => api.get("/dashboard/charts"),
  recentActivity: () => api.get("/dashboard/recent-activity"),
};
export const childrenAPI = {
  getAll: (p) => api.get("/children", { params: p }),
  getOne: (id) => api.get(`/children/${id}`),
  create: (d) => api.post("/children", d),
  update: (id, d) => api.put(`/children/${id}`, d),
  delete: (id) => api.delete(`/children/${id}`),
};
export const staffAPI = {
  getAll: (p) => api.get("/staff", { params: p }),
  getOne: (id) => api.get(`/staff/${id}`),
  create: (d) => api.post("/staff", d),
  update: (id, d) => api.put(`/staff/${id}`, d),
  delete: (id) => api.delete(`/staff/${id}`),
};
export const donationsAPI = {
  getAll: (p) => api.get("/donations", { params: p }),
  getOne: (id) => api.get(`/donations/${id}`),
  create: (d) => api.post("/donations", d),
  update: (id, d) => api.put(`/donations/${id}`, d),
  delete: (id) => api.delete(`/donations/${id}`),
};
export const medicalAPI = {
  getAll: (p) => api.get("/medical", { params: p }),
  withNames: () => api.get("/medical/with-names"),
  getOne: (id) => api.get(`/medical/${id}`),
  create: (d) => api.post("/medical", d),
  update: (id, d) => api.put(`/medical/${id}`, d),
  delete: (id) => api.delete(`/medical/${id}`),
};
export const educationAPI = {
  getAll: (p) => api.get("/education", { params: p }),
  withNames: () => api.get("/education/with-names"),
  create: (d) => api.post("/education", d),
  update: (id, d) => api.put(`/education/${id}`, d),
  delete: (id) => api.delete(`/education/${id}`),
};
export const adoptionsAPI = {
  getAll: (p) => api.get("/adoptions", { params: p }),
  withNames: () => api.get("/adoptions/with-names"),
  create: (d) => api.post("/adoptions", d),
  update: (id, d) => api.put(`/adoptions/${id}`, d),
  delete: (id) => api.delete(`/adoptions/${id}`),
};
export const expensesAPI = {
  getAll: (p) => api.get("/expenses", { params: p }),
  create: (d) => api.post("/expenses", d),
  update: (id, d) => api.put(`/expenses/${id}`, d),
  delete: (id) => api.delete(`/expenses/${id}`),
};
export const inventoryAPI = {
  getAll: (p) => api.get("/inventory", { params: p }),
  create: (d) => api.post("/inventory", d),
  update: (id, d) => api.put(`/inventory/${id}`, d),
  delete: (id) => api.delete(`/inventory/${id}`),
};
export const eventsAPI = {
  getAll: (p) => api.get("/events", { params: p }),
  create: (d) => api.post("/events", d),
  update: (id, d) => api.put(`/events/${id}`, d),
  delete: (id) => api.delete(`/events/${id}`),
};
export const logsAPI = {
  getAll: (p) => api.get("/logs", { params: p }),
};
export const usersAPI = {
  getAll: () => api.get("/users"),
  create: (d) => api.post("/users", d),
  update: (id, d) => api.put(`/users/${id}`, d),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
