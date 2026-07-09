import { createFileRoute } from "@tanstack/react-router";
import ReportsPage from "@/pages/reports/ReportsPage";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [{ title: "Reports — Nimbus ERP" }],
  }),
  component: ReportsPage,
});