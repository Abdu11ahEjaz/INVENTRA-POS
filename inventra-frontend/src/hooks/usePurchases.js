import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseService } from "@/services/purchaseService";

export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: purchaseService.list,
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useAddPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ 
        queryKey: ["products"],
        type: "all"
      });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdatePurchaseStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => purchaseService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ 
        queryKey: ["products"],
        type: "all"
      });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeletePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => purchaseService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ 
        queryKey: ["products"],
        type: "all"
      });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventorybatches"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
