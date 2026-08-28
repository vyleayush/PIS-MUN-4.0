import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

// Attach admin token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pmun_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getCommittees = () => api.get("/committees").then((r) => r.data);
export const getCommittee = (slug) => api.get(`/committees/${slug}`).then((r) => r.data);
export const validateReferral = (code) => api.post("/referral/validate", { code }).then((r) => r.data);
export const submitRegistration = (payload) => api.post("/registrations", payload).then((r) => r.data);

export const uploadRegistrationScreenshot = (referenceId, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post(`/registrations/${referenceId}/screenshot`, fd).then((r) => r.data);
};

// admin
export const adminLogin = (email, password) => api.post("/admin/login", { email, password }).then((r) => r.data);
export const adminStats = () => api.get("/admin/stats").then((r) => r.data);
export const adminRegistrations = () => api.get("/admin/registrations").then((r) => r.data);
export const adminUpdateRegistration = (id, body) => api.patch(`/admin/registrations/${id}`, body).then((r) => r.data);
export const adminDeleteRegistration = (id) => api.delete(`/admin/registrations/${id}`).then((r) => r.data);
export const adminAllotRegistration = (id, body) => api.post(`/admin/registrations/${id}/allot`, body).then((r) => r.data);
export const adminCommittees = () => api.get("/admin/committees").then((r) => r.data);
export const adminUpdateCommittee = (slug, body) => api.patch(`/admin/committees/${slug}`, body).then((r) => r.data);
export const adminUpdatePortfolio = (slug, body) => api.patch(`/admin/committees/${slug}/portfolios`, body).then((r) => r.data);
export const adminReferralCodes = () => api.get("/admin/referral-codes").then((r) => r.data);
export const adminCreateCode = (body) => api.post("/admin/referral-codes", body).then((r) => r.data);
export const adminUpdateCode = (code, body) => api.patch(`/admin/referral-codes/${code}`, body).then((r) => r.data);
export const adminDeleteCode = (code) => api.delete(`/admin/referral-codes/${code}`).then((r) => r.data);
