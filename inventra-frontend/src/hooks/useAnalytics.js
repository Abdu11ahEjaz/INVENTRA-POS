import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/axios";

const ONLINE = () => !!import.meta.env.VITE_API_URL && navigator.onLine;

const fetch = (url, params) => async () => {
  if (ONLINE()) return (await apiClient.get(url, { params })).data;
  return null;
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn:  fetch("/analytics/dashboard"),
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useSalesTrend(year) {
  return useQuery({
    queryKey: ["analytics", "sales-trend", year],
    queryFn:  fetch("/analytics/sales-trend", { year }),
    staleTime: 60_000,
  });
}

export function useTopProducts(limit = 5) {
  return useQuery({
    queryKey: ["analytics", "top-products", limit],
    queryFn:  fetch("/analytics/top-products", { limit }),
    staleTime: 60_000,
  });
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: ["analytics", "inventory-valuation"],
    queryFn:  fetch("/analytics/inventory-valuation"),
    staleTime: 0,
    refetchInterval: 60_000,
  });
}

export function useProfitLoss(from, to) {
  return useQuery({
    queryKey: ["analytics", "profit-loss", from, to],
    queryFn:  fetch("/analytics/profit-loss", { from, to }),
    staleTime: 60_000,
  });
}
