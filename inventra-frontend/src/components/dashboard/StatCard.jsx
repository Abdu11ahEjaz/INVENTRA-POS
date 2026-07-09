import {
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";

const tintMap = {
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-green-100 text-green-600",
  rose: "bg-rose-100 text-rose-600",
};

const StatCard = ({
  label,
  value,
  delta,
  trend,
  Icon,
  tint = "blue",
}) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg">
      
      <div className="flex items-start justify-between">
        
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${tintMap[tint]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <button className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-semibold tracking-tight">
          {value}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {label}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        
        {trend === "up" ? (
          <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
        )}

        <span
          className={`font-semibold ${
            trend === "up"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {delta}
        </span>

        <span className="text-gray-400">
          vs Last Month
        </span>
      </div>
    </div>
  );
};

export default StatCard;