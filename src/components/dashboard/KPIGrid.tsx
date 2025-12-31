// components/dashboard/KPIGrid.tsx
"use client";

import React from "react";
import KPICard from "./KPICard";
import useDashboardStore from "@/store/dashboard.store";

export default function KPIGrid() {
  const { kpis } = useDashboardStore();

  if (!kpis || kpis.length === 0) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="col-span-1"><p className="text-sm text-muted-foreground">No KPIs</p></div></div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.key} kpi={kpi} />
      ))}
    </div>
  );
}
