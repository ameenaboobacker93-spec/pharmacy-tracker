import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${BASE}/api` });

export const getPurchases = (params) => api.get('/purchases', { params });
export const getMonths = () => api.get('/purchases/months');
export const getSummary = (month) => api.get(`/purchases/summary/${month}`);
export const createPurchase = (data) => api.post('/purchases', data);
export const updatePurchase = (id, data) => api.put(`/purchases/${id}`, data);
export const updateReturn = (id, data) => api.patch(`/purchases/${id}/return`, data);
export const deletePurchase = (id) => api.delete(`/purchases/${id}`);
