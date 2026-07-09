import { createFileRoute } from "@tanstack/react-router";
import PurchasesPage from "@/pages/purchases/PurchasesPage";

export const Route = createFileRoute("/purchases")({
  head: () => ({
    meta: [{ title: "Purchases — Nimbus ERP" }],
  }),
  component: PurchasesPage,
});