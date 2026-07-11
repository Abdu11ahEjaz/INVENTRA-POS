import React from "react";

export const CURRENCIES = [
  { code: "USD", symbol: "$",  name: "US Dollar",         locale: "en-US" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee",    locale: "ur-PK" },
  { code: "EUR", symbol: "€",  name: "Euro",               locale: "de-DE" },
  { code: "GBP", symbol: "£",  name: "British Pound",      locale: "en-GB" },
  { code: "AED", symbol: "د.إ",name: "UAE Dirham",         locale: "ar-AE" },
  { code: "SAR", symbol: "﷼",  name: "Saudi Riyal",        locale: "ar-SA" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee",       locale: "en-IN" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar",    locale: "en-CA" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar",  locale: "en-AU" },
  { code: "JPY", symbol: "¥",  name: "Japanese Yen",       locale: "ja-JP" },
  { code: "CNY", symbol: "¥",  name: "Chinese Yuan",       locale: "zh-CN" },
  { code: "TRY", symbol: "₺",  name: "Turkish Lira",       locale: "tr-TR" },
];

export const CurrencyContext = React.createContext(null);

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = React.useState(() => {
    return localStorage.getItem("inventra_currency") || "PKR";  // Changed from USD to PKR
  });

  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  const setCurrency = (code) => {
    localStorage.setItem("inventra_currency", code);
    setCurrencyCode(code);
  };

  /**
   * Format a number as currency using the selected currency.
   * @param {number} amount
   * @param {object} opts  — Intl.NumberFormat options override
   */
  const formatCurrency = (amount, opts = {}) => {
    const num = Number(amount) || 0;
    try {
      return new Intl.NumberFormat(currency.locale, {
        style:    "currency",
        currency: currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...opts,
      }).format(num);
    } catch {
      // Fallback for unsupported locales
      return `${currency.symbol}${num.toLocaleString()}`;
    }
  };

  /** Just the symbol, e.g. "₨" */
  const symbol = currency.symbol;

  return (
    <CurrencyContext.Provider value={{ currency, currencyCode, setCurrency, formatCurrency, symbol, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}
