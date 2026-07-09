import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Package, Truck, ShoppingCart, FileText, BookOpen, BarChart3, Users, X, ArrowRight } from "lucide-react";
import { searchFilters, getPageContext, getSearchPlaceholder } from "@/utils/searchFilters";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePurchases } from "@/hooks/usePurchases";
import { useInvoices } from "@/hooks/useInvoices";
import { useLedger } from "@/hooks/useLedger";

const ICON_MAP = {
  inventory: Package,
  suppliers: Truck,
  purchases: ShoppingCart,
  invoices: FileText,
  ledger: BookOpen,
  reports: BarChart3,
  staff: Users,
};

export default function GlobalSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch data hooks
  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const { data: purchases = [] } = usePurchases();
  const { data: invoices = [] } = useInvoices();
  const { data: ledger = [] } = useLedger();

  const pageContext = getPageContext(location.pathname);
  const placeholder = getSearchPlaceholder(location.pathname);

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const newResults = [];

    // Inventory search
    if (pageContext === "inventory" || !pageContext) {
      const inventoryResults = products
        .filter(item => searchFilters.inventory(query, item))
        .slice(0, 3)
        .map(item => ({
          id: item._id || item.id,
          type: "inventory",
          title: item.name,
          subtitle: `SKU: ${item.sku || "N/A"} • ${item.category || ""}`,
          path: `/inventory?search=${encodeURIComponent(query)}`,
          icon: Package,
        }));
      newResults.push(...inventoryResults);
    }

    // Suppliers search
    if (pageContext === "suppliers" || !pageContext) {
      const supplierResults = suppliers
        .filter(s => searchFilters.suppliers(query, s))
        .slice(0, 3)
        .map(supplier => ({
          id: supplier._id || supplier.id,
          type: "suppliers",
          title: supplier.name,
          subtitle: supplier.company || supplier.phone || "—",
          path: `/suppliers?search=${encodeURIComponent(query)}`,
          icon: Truck,
        }));
      newResults.push(...supplierResults);
    }

    // Purchases search
    if (pageContext === "purchases" || !pageContext) {
      const purchaseResults = purchases
        .filter(p => searchFilters.purchases(query, p))
        .slice(0, 3)
        .map(purchase => ({
          id: purchase._id || purchase.id,
          type: "purchases",
          title: purchase.poNumber || `PO #${purchase._id?.slice(-8)}`,
          subtitle: `${purchase.supplierName} • ${purchase.status}`,
          path: `/purchases?search=${encodeURIComponent(query)}`,
          icon: ShoppingCart,
        }));
      newResults.push(...purchaseResults);
    }

    // Invoices search
    if (pageContext === "invoices" || !pageContext) {
      const invoiceResults = invoices
        .filter(inv => searchFilters.invoices(query, inv))
        .slice(0, 3)
        .map(invoice => ({
          id: invoice._id || invoice.id,
          type: "invoices",
          title: invoice.invoiceNumber || `INV #${invoice._id?.slice(-8)}`,
          subtitle: `${invoice.client} • ${invoice.status}`,
          path: `/invoices?search=${encodeURIComponent(query)}`,
          icon: FileText,
        }));
      newResults.push(...invoiceResults);
    }

    // Ledger search
    if (pageContext === "ledger" || !pageContext) {
      const ledgerResults = ledger
        .filter(entry => searchFilters.ledger(query, entry))
        .slice(0, 3)
        .map(entry => ({
          id: entry._id || entry.id,
          type: "ledger",
          title: entry.account,
          subtitle: entry.description,
          path: `/ledger?search=${encodeURIComponent(query)}`,
          icon: BookOpen,
        }));
      newResults.push(...ledgerResults);
    }

    setResults(newResults);
  }, [query, pageContext, products, suppliers, purchases, invoices, ledger]);

  // Handle result click
  const handleResultClick = (result) => {
    navigate(result.path);
    setQuery("");
    setShowResults(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showResults]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowResults(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="h-9 w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setShowResults(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div
          ref={modalRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
        >
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => {
              const Icon = result.icon;
              return (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-indigo-50 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                      <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 flex-shrink-0 ml-2" />
                </button>
              );
            })}
          </div>

          {results.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2 text-center">
              <p className="text-xs text-gray-500">Showing {results.length} results</p>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {showResults && query && results.length === 0 && (
        <div
          ref={modalRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg z-50 p-4 text-center"
        >
          <p className="text-sm text-gray-500">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
