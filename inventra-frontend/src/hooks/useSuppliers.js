import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierService } from "@/services/supplierService";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: supplierService.list,
    staleTime: 60_000,
  });
}

export function useAddSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => supplierService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: supplierService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}
