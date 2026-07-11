import { Badge } from "@/components/ui/badge";

/**
 * Reusable Status Badge component
 * Replaces: Duplicated status color logic across 15+ instances
 * 
 * Supports status types:
 * - Invoice: "Paid", "Pending", "Overdue"
 * - Stock: "In Stock", "Low Stock", "Out of Stock"
 * - User: "Active", "Inactive", "Suspended"
 * - General: "Active", "Inactive", "Draft"
 * 
 * @param {string} status - Status value
 * @param {string} type - Status type (invoice, stock, user, general)
 * @param {boolean} outline - Use outline variant
 */
export default function StatusBadge({
  status,
  type = "general",
  outline = true,
}) {
  const statusStyles = {
    // Invoice statuses
    invoice: {
      Paid: "bg-success/15 text-success border-success/20",
      Pending: "bg-warning/15 text-warning border-warning/20",
      Overdue: "bg-destructive/15 text-destructive border-destructive/20",
    },
    // Stock statuses
    stock: {
      "In Stock": "bg-success/15 text-success border-success/20",
      "Low Stock": "bg-warning/15 text-warning border-warning/20",
      "Out of Stock": "bg-destructive/15 text-destructive border-destructive/20",
    },
    // User statuses
    user: {
      Active: "bg-success/15 text-success border-success/20",
      Inactive: "bg-muted text-muted-foreground border-muted/20",
      Suspended: "bg-destructive/15 text-destructive border-destructive/20",
    },
    // General purpose
    general: {
      Active: "bg-success/15 text-success border-success/20",
      Inactive: "bg-muted text-muted-foreground border-muted/20",
      Draft: "bg-slate-500/15 text-slate-600 border-slate-500/20",
      Pending: "bg-warning/15 text-warning border-warning/20",
    },
  };

  const typeStyles = statusStyles[type] || statusStyles.general;
  const statusClass = typeStyles[status] || "bg-muted text-muted-foreground border-muted/20";

  return (
    <Badge
      variant={outline ? "outline" : "default"}
      className={`rounded-full ${statusClass}`}
    >
      {status}
    </Badge>
  );
}
