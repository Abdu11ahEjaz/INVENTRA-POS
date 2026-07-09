import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventoryService";

export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn:  inventoryService.list,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnMount: true,
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => inventoryService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
