import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ledgerService } from "@/services/ledgerService";

export function useLedger() {
  return useQuery({
    queryKey: ["ledger"],
    queryFn: ledgerService.list,
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useAddLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ledgerService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ledgerService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
