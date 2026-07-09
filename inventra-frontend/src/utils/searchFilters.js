/**
 * Search filter utilities for different pages
 * Context-aware filtering based on current page
 */

export const searchFilters = {
  // Dashboard search
  dashboard: (query, data) => {
    const q = query.toLowerCase();
    // Search for dates, metrics, months
    if (q.includes("revenue") || q.includes("sales")) return true;
    if (q.includes("expense") || q.includes("cost")) return true;
    if (/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i.test(q)) return true;
    if (/\d{4}/.test(q)) return true; // Year search
    return false;
  },

  // Inventory search
  inventory: (query, item) => {
    const q = query.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  },

  // Suppliers search
  suppliers: (query, supplier) => {
    const q = query.toLowerCase();
    return (
      supplier.name?.toLowerCase().includes(q) ||
      supplier.company?.toLowerCase().includes(q) ||
      supplier.phone?.includes(q) ||
      supplier.email?.toLowerCase().includes(q) ||
      supplier.city?.toLowerCase().includes(q) ||
      supplier.country?.toLowerCase().includes(q)
    );
  },

  // Purchases search
  purchases: (query, purchase) => {
    const q = query.toLowerCase();
    const poNumber = purchase.poNumber || purchase._id?.slice(-8) || "";
    const supplierName = purchase.supplierName || "";
    const date = purchase.date ? new Date(purchase.date).toLocaleDateString() : "";
    
    return (
      poNumber.toLowerCase().includes(q) ||
      supplierName.toLowerCase().includes(q) ||
      date.includes(q) ||
      purchase.status?.toLowerCase().includes(q) ||
      purchase.notes?.toLowerCase().includes(q)
    );
  },

  // Invoices search
  invoices: (query, invoice) => {
    const q = query.toLowerCase();
    const invNumber = invoice.invoiceNumber || invoice._id?.slice(-8) || "";
    
    return (
      invNumber.toLowerCase().includes(q) ||
      invoice.client?.toLowerCase().includes(q) ||
      invoice.status?.toLowerCase().includes(q) ||
      (invoice.date && new Date(invoice.date).toLocaleDateString().includes(q)) ||
      invoice.notes?.toLowerCase().includes(q)
    );
  },

  // Ledger search
  ledger: (query, entry) => {
    const q = query.toLowerCase();
    const txnId = entry._id?.slice(-8) || "";
    const date = entry.date ? new Date(entry.date).toLocaleDateString() : "";
    
    return (
      entry.account?.toLowerCase().includes(q) ||
      entry.description?.toLowerCase().includes(q) ||
      txnId.toLowerCase().includes(q) ||
      date.includes(q) ||
      entry.refType?.toLowerCase().includes(q)
    );
  },

  // Reports search
  reports: (query) => {
    const q = query.toLowerCase();
    return (
      q.includes("sales") ||
      q.includes("profit") ||
      q.includes("loss") ||
      q.includes("stock") ||
      q.includes("valuation") ||
      /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i.test(q) ||
      /\d{4}/.test(q)
    );
  },

  // Settings search
  settings: (query) => {
    const q = query.toLowerCase();
    const settingsKeywords = [
      "tax", "currency", "general", "business", "notification",
      "email", "printer", "user", "permission", "role", "account",
      "password", "profile", "api", "webhook", "backup"
    ];
    return settingsKeywords.some(keyword => q.includes(keyword));
  },

  // Staff search
  staff: (query, user) => {
    const q = query.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.role?.toLowerCase().includes(q) ||
      user.phone?.includes(q)
    );
  },
};

/**
 * Get placeholder text based on current page
 */
export const getSearchPlaceholder = (pathname) => {
  if (pathname === "/") return "Search revenue, expenses, dates…";
  if (pathname.includes("inventory")) return "Search product name, SKU, category, brand…";
  if (pathname.includes("suppliers")) return "Search supplier name, company, phone, contact…";
  if (pathname.includes("purchases")) return "Search PO#, supplier name, date…";
  if (pathname.includes("invoices")) return "Search invoice number, customer, status…";
  if (pathname.includes("ledger")) return "Search account, transaction ID, date…";
  if (pathname.includes("reports")) return "Search report type, date range…";
  if (pathname.includes("settings")) return "Search settings, users, permissions…";
  if (pathname.includes("staff")) return "Search user name, email, role…";
  return "Search…";
};

/**
 * Get context name for current page
 */
export const getPageContext = (pathname) => {
  if (pathname === "/") return "dashboard";
  if (pathname.includes("inventory")) return "inventory";
  if (pathname.includes("suppliers")) return "suppliers";
  if (pathname.includes("purchases")) return "purchases";
  if (pathname.includes("invoices")) return "invoices";
  if (pathname.includes("ledger")) return "ledger";
  if (pathname.includes("reports")) return "reports";
  if (pathname.includes("settings")) return "settings";
  if (pathname.includes("staff")) return "staff";
  return "general";
};
