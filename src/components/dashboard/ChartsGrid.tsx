// components/dashboard/ChartsGrid.tsx
"use client";

import React, { useCallback } from "react";
import ChartCard from "./ChartCard";
import useDashboardStore from "@/store/dashboard.store";
import type { DashboardChart } from "@/types/dashboard.types";

export default function ChartsGrid() {
  const {charts: chartsMap} = useDashboardStore();
  const charts = Object.values(chartsMap);

  const handleChartClick = useCallback((chart: DashboardChart) => {
    // You can add analytics tracking or other logic here
    console.log('Chart expanded:', chart.id);
  }, []);

  if (charts.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="col-span-1">
          <p className="text-sm text-muted-foreground">No charts available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {charts.map((c) => (
        <ChartCard key={c.id} chart={c} onChartClick={handleChartClick} />
      ))}
    </div>
  );
}
