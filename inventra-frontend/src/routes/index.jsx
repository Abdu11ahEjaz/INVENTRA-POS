import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/dashboard/DashboardPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Dashboard — Nimbus ERP" }],
  }),
  component: Dashboard,
});