import { createFileRoute } from "@tanstack/react-router";
import SalesPage from "@/pages/sales/SalesPage";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [{ title: "Sales — Nimbus ERP" }],
  }),
  component: SalesPage,
});