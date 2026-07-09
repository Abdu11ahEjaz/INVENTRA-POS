import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceService } from "@/services/invoiceService";

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceService.list,
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useAddInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      // Invalidate all products queries with partial matching
      qc.invalidateQueries({ 
        queryKey: ["products"],
        type: "all"  // Matches ["products"] and ["products", params]
      });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => invoiceService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}
