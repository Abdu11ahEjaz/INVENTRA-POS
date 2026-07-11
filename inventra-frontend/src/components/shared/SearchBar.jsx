import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Reusable SearchBar component
 * Replaces: Duplicated search input across 6+ pages (Inventory, Suppliers, Staff, Audit, etc.)
 * 
 * @param {string} value - Current search value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Input placeholder text
 * @param {boolean} showIcon - Show search icon
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  showIcon = true,
}) {
  return (
    <div className="relative w-full max-w-xs">
      {showIcon && (
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-full ${showIcon ? "pl-9" : ""} bg-secondary`}
      />
    </div>
  );
}
