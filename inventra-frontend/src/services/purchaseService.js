import apiClient from "@/api/axios";
import store from "@/store/dataStore";

const ONLINE = () => !!import.meta.env.VITE_API_URL && navigator.onLine;

export const purchaseService = {
  list: async () => {
    if (ONLINE()) {
      try {
        return (await apiClient.get("/purchases")).data;
      } catch (err) {
        // Only fall to offline store on network errors, not API errors
        if (!err.response) return store.getPurchases();
        throw err;
      }
    }
    return store.getPurchases();
  },

  create: async (payload) => {
    if (ONLINE()) {
      // The payload already has the correct structure from PurchasesPage
      // Just pass it through as-is
      const backendPayload = {
        supplier:     payload.supplier,      // Already the correct field name
        supplierName: payload.supplierName,
        date:         payload.date,
        status:       payload.status,
        notes:        payload.notes,
        items: payload.items.map((item) => ({
          product:     item.product,         // Already the correct field name
          productName: item.productName,
          variantId:   item.variantId,
          variantName: item.variantName,
          qty:         item.qty,
          unitCost:    item.unitCost,
          expiryDate:  item.expiryDate,
        })),
        total: payload.total,
      };

      // Do NOT catch here — let errors propagate so the UI shows them
      const res = await apiClient.post("/purchases", backendPayload);
      return res.data;
    }
    return store.addPurchase(payload);
  },

  updateStatus: async (id, status) => {
    if (ONLINE()) {
      try {
        return (await apiClient.patch(`/purchases/${id}/status`, { status })).data;
      } catch (err) {
        if (!err.response) return store.updatePurchaseStatus(id, status);
        throw err;
      }
    }
    return store.updatePurchaseStatus(id, status);
  },

  remove: async (id) => {
    if (ONLINE()) {
      await apiClient.delete(`/purchases/${id}`);
      return { success: true };
    }
    return { success: true };
  },

  delete: async (id) => {
    if (ONLINE()) {
      await apiClient.delete(`/purchases/${id}`);
      return { success: true };
    }
    return store.removePurchase(id);
  },
};
