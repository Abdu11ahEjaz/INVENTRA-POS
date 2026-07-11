import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * Reusable Metric Card component for displaying KPIs
 * Replaces: StatCard.jsx and inline card implementations
 * 
 * @param {string} label - Card label/title
 * @param {string|number} value - Main metric value
 * @param {string} delta - Change indicator (e.g., "+20%", "-5%")
 * @param {boolean} trend - true for up, false for down
 * @param {React.Component} Icon - Icon component
 * @param {string} tint - Color variant: "blue", "green", "amber", "rose"
 * @param {string} description - Optional sub-text
 * @param {function} onClick - Optional click handler
 */
export default function MetricCard({
  label,
  value,
  delta = "",
  trend = "up",
  Icon = null,
  tint = "blue",
  description = "",
  onClick = null,
}) {
  const tintMap = {
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    green: "bg-green-100 text-green-600 border-green-200",
    amber: "bg-amber-100 text-amber-600 border-amber-200",
    rose: "bg-rose-100 text-rose-600 border-rose-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  const trendClass = trend === "up" ? "text-success" : "text-destructive";

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg border border-border/60 bg-card p-5 shadow-soft transition-all hover:shadow-lg ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Icon */}
      {Icon && (
        <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border ${tintMap[tint]}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}

      {/* Label and delta */}
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        {delta && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendClass}`}>
            {delta}
            <TrendIcon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>

      {/* Description */}
      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
