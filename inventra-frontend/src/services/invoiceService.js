import apiClient from "@/api/axios";
import store from "@/store/dataStore";

const ONLINE = () => !!import.meta.env.VITE_API_URL && navigator.onLine;

export const invoiceService = {
  list: async () => {
    if (ONLINE()) {
      try {
        return (await apiClient.get("/invoices")).data;
      } catch (err) {
        if (!err.response) return store.getInvoices(); // network error only
        throw err;
      }
    }
    return store.getInvoices();
  },

  create: async (payload) => {
    if (ONLINE()) {
      // Map frontend fields → backend Invoice model fields
      // Frontend sends: { client, items[{productId, name, qty, unitPrice}], due, notes, amount, status }
      // Backend expects: { client, items[{product, name, qty, unitPrice}], due, notes, status }
      const backendPayload = {
        client: payload.client,
        due:    payload.due,
        notes:  payload.notes,
        status: payload.status || "Pending",
        items:  payload.items.map((item) => ({
          product:   item.productId || undefined, // ObjectId ref (optional)
          name:      item.name,
          qty:       Number(item.qty),
          unitPrice: Number(item.unitPrice),
        })),
      };
      // Do NOT catch — let errors propagate to the UI
      return (await apiClient.post("/invoices", backendPayload)).data;
    }
    return store.addInvoice(payload);
  },

  updateStatus: async (id, status) => {
    if (ONLINE()) {
      try {
        return (await apiClient.patch(`/invoices/${id}/status`, { status })).data;
      } catch (err) {
        if (!err.response) return store.updateInvoice(id, { status });
        throw err;
      }
    }
    return store.updateInvoice(id, { status });
  },

  update: async (id, payload) => {
    if (ONLINE()) {
      return (await apiClient.put(`/invoices/${id}`, payload)).data;
    }
    return store.updateInvoice(id, payload);
  },

  remove: async (id) => {
    if (ONLINE()) {
      await apiClient.delete(`/invoices/${id}`);
      return { success: true };
    }
    store.deleteInvoice(id);
    return { success: true };
  },
};
