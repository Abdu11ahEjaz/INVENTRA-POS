import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";

export function useProducts(params) {
  return useQuery({
    queryKey: ["products", params],
    queryFn:  () => productService.list(params),
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["products", id],
    queryFn:  () => productService.get(id),
    enabled:  !!id,
  });
}

export function useProductBatches(id) {
  return useQuery({
    queryKey: ["product-batches", id],
    queryFn:  () => productService.getBatches(id),
    enabled:  !!id,
    staleTime: 0,
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => productService.update(id, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
