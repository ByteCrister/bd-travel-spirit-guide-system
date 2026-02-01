"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout/DashboardLayout";
// import { useCurrentUserStore } from "@/store/current-user.store";
// import LoadingDashboard from "../global/LoadingDashboard";

// Define the admin routes that should use the dashboard layout
const ADMIN_ROUTES = [
  "/dashboard",
  "/dashboard/overview",
  "/dashboard/profile",

  "/operations/tours",
  "/operations/reports",
  "/operations/reviews",
  
  "/users/employees",
  
  "/support/faqs",
  "/support/travelers",
  "/support/reset-password-requests", // for "assistant" employees

  "/social/advertising",
  "/social/notifications",
];

interface DashboardProviderProps {
  children: React.ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const pathname = usePathname();
  // const { baseMeta } = useCurrentUserStore()

  // Check if the current route should use the dashboard layout
  const shouldUseDashboardLayout =
    ADMIN_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    ) || /^\/companies\/[^/]+$/.test(pathname); // matches /companies/[companyId]

  // if (baseMeta.loading) return <LoadingDashboard />

  if (shouldUseDashboardLayout) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <>{children}</>;
}
