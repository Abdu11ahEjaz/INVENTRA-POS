import apiClient from "@/api/axios";
import store from "@/store/dataStore";

const ONLINE = () => !!import.meta.env.VITE_API_URL && navigator.onLine;

export const ledgerService = {
  list: async () => {
    if (ONLINE()) {
      try {
        const data = (await apiClient.get("/ledger")).data;
        // Backend returns plain array (fixed in ledgerController)
        return Array.isArray(data) ? data : (Array.isArray(data?.entries) ? data.entries : []);
      } catch (err) {
        if (!err.response) return store.getLedger();
        throw err;
      }
    }
    return store.getLedger();
  },

  create: async (payload) => {
    if (ONLINE()) {
      return (await apiClient.post("/ledger", payload)).data;
    }
    return store.addLedgerEntry(payload);
  },

  remove: async (id) => {
    if (ONLINE()) {
      await apiClient.delete(`/ledger/${id}`);
      return { success: true };
    }
    return { success: true };
  },
};
