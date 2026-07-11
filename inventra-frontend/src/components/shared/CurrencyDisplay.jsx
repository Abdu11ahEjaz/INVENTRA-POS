import { useCurrency } from "@/hooks/useCurrency";

/**
 * Reusable CurrencyDisplay component
 * Replaces: Scattered formatCurrency calls throughout application
 * 
 * Ensures all monetary values use the same formatting
 * Respects user's selected currency preference
 * 
 * @param {number} value - Amount to display
 * @param {number} decimals - Decimal places (default: 2)
 * @param {string} className - CSS classes
 * @param {boolean} showCurrency - Show currency code (e.g., USD) after symbol
 */
export default function CurrencyDisplay({
  value = 0,
  decimals = 2,
  className = "",
  showCurrency = false,
}) {
  const { formatCurrency, currencyCode } = useCurrency();

  const formatted = formatCurrency(value);

  return (
    <span className={className}>
      {formatted}
      {showCurrency && <span className="ml-1 text-xs text-muted-foreground">{currencyCode}</span>}
    </span>
  );
}
