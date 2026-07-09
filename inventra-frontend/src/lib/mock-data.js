export const currentUser = {
  name: "Aarav Sharma",
  role: "admin",
  email: "aarav@nimbus-erp.com",
  avatar: "https://i.pravatar.cc/120?img=68",
};

export const stats = [
  { label: "Profit", value: "$9,458,798", delta: "+35%", trend: "up", icon: "trending" },
  { label: "Invoice Due", value: "$48,988", delta: "+12%", trend: "up", icon: "file" },
  { label: "Total Expenses", value: "$8,980,097", delta: "+8%", trend: "up", icon: "wallet" },
  { label: "Payment Returns", value: "$78,458,798", delta: "-20%", trend: "down", icon: "refresh" },
];

export const salesData = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  sales: Math.round(40 + Math.random() * 60),
  purchase: Math.round(30 + Math.random() * 50),
}));

export const hourlyData = [
  "2 am","4 am","6 am","8 am","10 am","12 pm",
  "14 pm","16 pm","18 pm","20 pm","22 pm","24 pm"
].map((h) => ({
  hour: h,
  sales: Math.round(20 + Math.random() * 70),
  purchase: Math.round(15 + Math.random() * 60),
}));

export const topCategories = [
  { name: "Electronics", sales: 698, color: "var(--color-chart-1)" },
  { name: "Sports", sales: 545, color: "var(--color-chart-2)" },
  { name: "Lifestyle", sales: 455, color: "var(--color-chart-3)" },
  { name: "Fashion", sales: 312, color: "var(--color-chart-4)" },
];

export const products = [
  { id: "SKU-1001", name: "Wireless Earbuds Pro", category: "Electronics", stock: 142, price: 129.0, status: "In Stock" },
  { id: "SKU-1002", name: "Smart Watch X3", category: "Electronics", stock: 28, price: 249.0, status: "Low Stock" },
  { id: "SKU-1003", name: "Yoga Mat Premium", category: "Sports", stock: 0, price: 39.0, status: "Out of Stock" },
  { id: "SKU-1004", name: "Leather Wallet", category: "Lifestyle", stock: 220, price: 59.0, status: "In Stock" },
  { id: "SKU-1005", name: "Running Shoes Air", category: "Sports", stock: 76, price: 119.0, status: "In Stock" },
  { id: "SKU-1006", name: "Cotton T-Shirt Pack", category: "Fashion", stock: 14, price: 24.0, status: "Low Stock" },
  { id: "SKU-1007", name: "Mechanical Keyboard", category: "Electronics", stock: 53, price: 159.0, status: "In Stock" },
  { id: "SKU-1008", name: "Ceramic Mug Set", category: "Lifestyle", stock: 312, price: 19.0, status: "In Stock" },
];

export const transactions = [
  { id: "TXN-9001", customer: "Andrea Willer", date: "2025-05-10", status: "Paid", total: 1240.0, type: "Sale" },
  { id: "TXN-9002", customer: "Marcus Lin", date: "2025-05-11", status: "Pending", total: 540.5, type: "Sale" },
  { id: "TXN-9003", customer: "Sophia Patel", date: "2025-05-12", status: "Paid", total: 2890.0, type: "Sale" },
  { id: "TXN-9004", customer: "Hiroshi Tanaka", date: "2025-05-13", status: "Refunded", total: 320.0, type: "Sale" },
  { id: "TXN-9005", customer: "Elena Garcia", date: "2025-05-14", status: "Paid", total: 1875.0, type: "Sale" },
];

export const invoices = [
  { id: "INV-2025-001", client: "Acme Corp", issued: "2025-05-01", due: "2025-05-15", amount: 4250.0, status: "Paid" },
  { id: "INV-2025-002", client: "Globex Ltd", issued: "2025-05-03", due: "2025-05-17", amount: 1899.5, status: "Pending" },
  { id: "INV-2025-003", client: "Initech", issued: "2025-05-05", due: "2025-05-19", amount: 7320.0, status: "Overdue" },
  { id: "INV-2025-004", client: "Umbrella Inc", issued: "2025-05-07", due: "2025-05-21", amount: 540.0, status: "Paid" },
  { id: "INV-2025-005", client: "Stark Industries", issued: "2025-05-09", due: "2025-05-23", amount: 12500.0, status: "Pending" },
];

export const ledgerEntries = [
  { id: "LG-001", date: "2025-05-01", account: "Sales Revenue", description: "Q2 Sales batch", debit: 0, credit: 12500 },
  { id: "LG-002", date: "2025-05-02", account: "Inventory", description: "Stock purchase - Electronics", debit: 8400, credit: 0 },
  { id: "LG-003", date: "2025-05-03", account: "Accounts Receivable", description: "Invoice INV-2025-001", debit: 4250, credit: 0 },
  { id: "LG-004", date: "2025-05-04", account: "Office Expense", description: "Utilities", debit: 320, credit: 0 },
  { id: "LG-005", date: "2025-05-05", account: "Cash", description: "Payment received - Acme", debit: 0, credit: 4250 },
];

export const staff = [
  { id: 1, name: "Aarav Sharma", role: "Admin", email: "aarav@nimbus.com", status: "Active", avatar: "https://i.pravatar.cc/100?img=68" },
  { id: 2, name: "Priya Kapoor", role: "Manager", email: "priya@nimbus.com", status: "Active", avatar: "https://i.pravatar.cc/100?img=47" },
  { id: 3, name: "James O'Connor", role: "Sales", email: "james@nimbus.com", status: "Active", avatar: "https://i.pravatar.cc/100?img=33" },
  { id: 4, name: "Mei Lin", role: "Accountant", email: "mei@nimbus.com", status: "Invited", avatar: "https://i.pravatar.cc/100?img=49" },
];