import apiClient from "@/api/axios";
import store from "@/store/dataStore";

const ONLINE = () => !!import.meta.env.VITE_API_URL && navigator.onLine;

export const inventoryService = {
  list: async () => {
    if (ONLINE()) {
      try {
        return (await apiClient.get("/inventory")).data;
      } catch (err) {
        if (!err.response) return store.getProducts(); // network error only
        throw err;
      }
    }
    return store.getProducts();
  },

  get: async (id) => {
    if (ONLINE()) {
      return (await apiClient.get(`/inventory/${id}`)).data;
    }
    return store.getProducts().find((p) => (p._id || p.id) === id) ?? null;
  },

  // NOTE: create is handled directly via apiClient in InventoryPage (multipart/form-data)
  // This is kept for offline fallback only
  create: async (payload) => {
    return store.addProduct(payload);
  },

  update: async (id, payload) => {
    if (ONLINE()) {
      return (await apiClient.put(`/inventory/${id}`, payload)).data;
    }
    return store.updateProduct(id, payload);
  },

  remove: async (id) => {
    if (ONLINE()) {
      await apiClient.delete(`/inventory/${id}`);
      return { success: true };
    }
    store.deleteProduct(id);
    return { success: true };
  },

  adjustStock: async (id, delta) => {
    if (ONLINE()) {
      return (await apiClient.patch(`/inventory/${id}/stock`, { delta })).data;
    }
    store.adjustStock(id, delta);
    return store.getProducts().find((p) => (p._id || p.id) === id);
  },
};
