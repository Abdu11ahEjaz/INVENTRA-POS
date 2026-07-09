import { createFileRoute } from "@tanstack/react-router";
import LedgerPage from "@/pages/ledger/LedgerPage";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [{ title: "Ledger — Nimbus ERP" }],
  }),
  component: LedgerPage,
});