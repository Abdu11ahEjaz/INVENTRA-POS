/**
 * DataStore — localStorage-backed in-memory store.
 * Acts as the offline database until MongoDB backend is connected.
 * All service layers read/write through this store.
 *
 * When backend is ready, services will call the API first and
 * fall back to this store when offline.
 */

import {
  products as seedProducts,
  invoices as seedInvoices,
  transactions as seedTransactions,
  ledgerEntries as seedLedger,
  staff as seedStaff,
} from "@/lib/mock-data";

const seedSuppliers = [
  { id: "SUP-001", name: "Global Tech Distributors", contact: "John Smith", email: "john@globaltech.com", phone: "+1-555-0101", address: "123 Tech Ave, NY", categories: ["Electronics"], status: "Active" },
  { id: "SUP-002", name: "Athletica Wholesale", contact: "Maria Garcia", email: "maria@athletica.com", phone: "+1-555-0102", address: "456 Sport Blvd, CA", categories: ["Sports"], status: "Active" },
  { id: "SUP-003", name: "Modern Lifestyle Co.", contact: "David Lee", email: "david@modernlife.com", phone: "+1-555-0103", address: "789 Life St, TX", categories: ["Lifestyle"], status: "Active" },
  { id: "SUP-004", name: "FashionHub Imports", contact: "Sara Kim", email: "sara@fashionhub.com", phone: "+1-555-0104", address: "321 Fashion Rd, FL", categories: ["Fashion"], status: "Active" },
];

const seedPurchases = [
  { id: "PO-5001", supplierId: "SUP-001", supplierName: "Global Tech Distributors", date: "2025-05-08", items: [{ productId: "SKU-1001", productName: "Wireless Earbuds Pro", qty: 20, unitCost: 80 }, { productId: "SKU-1007", productName: "Mechanical Keyboard", qty: 4, unitCost: 100 }], total: 2000, status: "Received" },
  { id: "PO-5002", supplierId: "SUP-002", supplierName: "Athletica Wholesale", date: "2025-05-09", items: [{ productId: "SKU-1005", productName: "Running Shoes Air", qty: 12, unitCost: 70 }], total: 840, status: "In Transit" },
  { id: "PO-5003", supplierId: "SUP-003", supplierName: "Modern Lifestyle Co.", date: "2025-05-10", items: [{ productId: "SKU-1004", productName: "Leather Wallet", qty: 60, unitCost: 30 }], total: 1800, status: "Pending" },
];

// ── Helpers
function load(key, seed) {
  try {
    const raw = localStorage.getItem(`inventra_${key}`);
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
}

function save(key, data) {
  localStorage.setItem(`inventra_${key}`, JSON.stringify(data));
}

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const store = {
  getProducts: () => load("products", seedProducts),

  saveProducts: (data) => save("products", data),

  addProduct: (product) => {
    const products = store.getProducts();
    const newProduct = {
      ...product,
      id: product.id || genId("SKU"),
      status: product.stock > 20 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock",
      createdAt: new Date().toISOString(),
    };
    const updated = [...products, newProduct];
    save("products", updated);
    return newProduct;
  },

  updateProduct: (id, patch) => {
    const products = store.getProducts().map((p) => {
      if (p.id !== id) return p;
      const updated = { ...p, ...patch };
      updated.status = updated.stock > 20 ? "In Stock" : updated.stock > 0 ? "Low Stock" : "Out of Stock";
      return updated;
    });
    save("products", products);
    return products.find((p) => p.id === id);
  },

  deleteProduct: (id) => {
    const products = store.getProducts().filter((p) => p.id !== id);
    save("products", products);
  },

  adjustStock: (productId, delta) => {
    const products = store.getProducts().map((p) => {
      if (p.id !== productId) return p;
      const newStock = Math.max(0, (p.stock || 0) + delta);
      return { ...p, stock: newStock, status: newStock > 20 ? "In Stock" : newStock > 0 ? "Low Stock" : "Out of Stock" };
    });
    save("products", products);
  },

  // ── Suppliers ─────────────────────────────────────────────
  getSuppliers: () => load("suppliers", seedSuppliers),

  addSupplier: (supplier) => {
    const suppliers = store.getSuppliers();
    const newSupplier = { ...supplier, id: supplier.id || genId("SUP"), createdAt: new Date().toISOString() };
    save("suppliers", [...suppliers, newSupplier]);
    return newSupplier;
  },

  updateSupplier: (id, patch) => {
    const suppliers = store.getSuppliers().map((s) => s.id === id ? { ...s, ...patch } : s);
    save("suppliers", suppliers);
    return suppliers.find((s) => s.id === id);
  },

  deleteSupplier: (id) => {
    save("suppliers", store.getSuppliers().filter((s) => s.id !== id));
  },

  // ── Purchases ─────────────────────────────────────────────
  getPurchases: () => load("purchases", seedPurchases),

  addPurchase: (purchase) => {
    const purchases = store.getPurchases();
    const newPurchase = { ...purchase, id: purchase.id || genId("PO"), createdAt: new Date().toISOString() };
    save("purchases", [...purchases, newPurchase]);
    // Auto-update stock for received purchases
    if (newPurchase.status === "Received") {
      newPurchase.items?.forEach(({ productId, qty }) => {
        store.adjustStock(productId, +qty);
      });
    }
    // Add ledger entry
    store.addLedgerEntry({
      account: "Inventory",
      description: `Purchase ${newPurchase.id} from ${newPurchase.supplierName}`,
      debit: newPurchase.total,
      credit: 0,
      refId: newPurchase.id,
      refType: "purchase",
    });
    return newPurchase;
  },

  updatePurchaseStatus: (id, status) => {
    const purchases = store.getPurchases();
    const purchase = purchases.find((p) => p.id === id);
    if (!purchase) return;
    const wasReceived = purchase.status === "Received";
    const nowReceived = status === "Received";
    const updated = purchases.map((p) => p.id === id ? { ...p, status } : p);
    save("purchases", updated);
    // If just marked received, increase stock
    if (!wasReceived && nowReceived) {
      purchase.items?.forEach(({ productId, qty }) => store.adjustStock(productId, +qty));
    }
    return updated.find((p) => p.id === id);
  },

  // ── Invoices ──────────────────────────────────────────────
  getInvoices: () => load("invoices", seedInvoices),

  addInvoice: (invoice) => {
    const invoices = store.getInvoices();
    const newInvoice = {
      ...invoice,
      id: invoice.id || genId("INV"),
      issued: invoice.issued || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };
    save("invoices", [...invoices, newInvoice]);
    // Decrease stock for each line item
    newInvoice.items?.forEach(({ productId, qty }) => {
      store.adjustStock(productId, -qty);
    });
    // Add ledger entry
    store.addLedgerEntry({
      account: "Accounts Receivable",
      description: `Invoice ${newInvoice.id} — ${newInvoice.client}`,
      debit: newInvoice.amount,
      credit: 0,
      refId: newInvoice.id,
      refType: "invoice",
    });
    return newInvoice;
  },

  updateInvoice: (id, patch) => {
    const invoices = store.getInvoices().map((i) => i.id === id ? { ...i, ...patch } : i);
    save("invoices", invoices);
    return invoices.find((i) => i.id === id);
  },

  deleteInvoice: (id) => {
    save("invoices", store.getInvoices().filter((i) => i.id !== id));
  },

  // ── Ledger ────────────────────────────────────────────────
  getLedger: () => load("ledger", seedLedger),

  addLedgerEntry: (entry) => {
    const ledger = store.getLedger();
    const newEntry = {
      ...entry,
      id: entry.id || genId("LG"),
      date: entry.date || new Date().toISOString().split("T")[0],
    };
    save("ledger", [...ledger, newEntry]);
    return newEntry;
  },

  // ── Transactions / Sales ──────────────────────────────────
  getTransactions: () => load("transactions", seedTransactions),

  addTransaction: (txn) => {
    const transactions = store.getTransactions();
    const newTxn = { ...txn, id: txn.id || genId("TXN"), createdAt: new Date().toISOString() };
    save("transactions", [...transactions, newTxn]);
    return newTxn;
  },

  // ── Staff ─────────────────────────────────────────────────
  getStaff: () => load("staff", seedStaff),

  // ── Offline Queue ─────────────────────────────────────────
  getQueue: () => load("offline_queue", []),

  enqueue: (action) => {
    const queue = store.getQueue();
    save("offline_queue", [...queue, { ...action, queuedAt: new Date().toISOString() }]);
  },

  dequeue: (id) => {
    save("offline_queue", store.getQueue().filter((a) => a.id !== id));
  },

  clearQueue: () => save("offline_queue", []),
};

export default store;
