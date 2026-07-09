import { createFileRoute } from "@tanstack/react-router";
import StaffPage from "@/pages/staff/StaffPage";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [{ title: "Staff — Nimbus ERP" }],
  }),
  component: StaffPage,
});