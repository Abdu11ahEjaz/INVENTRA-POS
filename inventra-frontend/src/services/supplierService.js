import apiClient from "@/api/axios";
import store from "@/store/dataStore";

const ONLINE = () => !!import.meta.env.VITE_API_URL && navigator.onLine;

export const supplierService = {
  list: async () => {
    if (ONLINE()) {
      try {
        return (await apiClient.get("/suppliers")).data;
      } catch (err) {
        if (!err.response) return store.getSuppliers();
        throw err;
      }
    }
    return store.getSuppliers();
  },

  get: async (id) => {
    if (ONLINE()) {
      return (await apiClient.get(`/suppliers/${id}`)).data;
    }
    return store.getSuppliers().find((s) => (s._id || s.id) === id) ?? null;
  },

  create: async (payload) => {
    if (ONLINE()) {
      return (await apiClient.post("/suppliers", payload)).data;
    }
    return store.addSupplier(payload);
  },

  update: async (id, payload) => {
    if (ONLINE()) {
      return (await apiClient.put(`/suppliers/${id}`, payload)).data;
    }
    return store.updateSupplier(id, payload);
  },

  remove: async (id) => {
    if (ONLINE()) {
      await apiClient.delete(`/suppliers/${id}`);
      return { success: true };
    }
    store.deleteSupplier(id);
    return { success: true };
  },
};
