import apiClient from "@/api/axios";

const ONLINE = () => !!import.meta.env.VITE_API_URL && navigator.onLine;

export const productService = {
  list: async (params = {}) => {
    if (ONLINE()) {
      try {
        // Try to get from both /products and /inventory endpoints
        const [productsRes, inventoryRes] = await Promise.all([
          apiClient.get("/products", { params }).catch(() => ({ data: [] })),
          apiClient.get("/inventory", { params }).catch(() => ({ data: [] })),
        ]);
        
        // Combine products and inventory items
        const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.data || [];
        const inventory = Array.isArray(inventoryRes.data) ? inventoryRes.data : inventoryRes.data.data || [];
        
        // Merge and deduplicate by _id
        const combined = [...products];
        const productIds = new Set(products.map(p => String(p._id || p.id)));
        
        inventory.forEach(item => {
          if (!productIds.has(String(item._id || item.id))) {
            combined.push(item);
          }
        });
        
        return combined;
      } catch (err) {
        console.error("Error fetching products/inventory:", err);
        return [];
      }
    }
    return [];
  },

  get: async (id) => {
    if (ONLINE()) {
      try {
        return (await apiClient.get(`/products/${id}`)).data;
      } catch {
        // Try inventory endpoint if product not found
        try {
          return (await apiClient.get(`/inventory/${id}`)).data;
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  create: async (formData) => {
    // formData is a FormData object (multipart for image)
    return (await apiClient.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })).data;
  },

  update: async (id, formData) => {
    try {
      return (await apiClient.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })).data;
    } catch {
      // Try inventory endpoint if product not found
      return (await apiClient.put(`/inventory/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })).data;
    }
  },

  remove: async (id) => {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch {
      // Try inventory endpoint if product not found
      await apiClient.delete(`/inventory/${id}`);
    }
    return { success: true };
  },

  getBatches: async (id) => {
    if (ONLINE()) return (await apiClient.get(`/products/${id}/batches`)).data;
    return [];
  },
};
