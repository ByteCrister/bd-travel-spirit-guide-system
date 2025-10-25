// components/dashboard/ChartLazy.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { DashboardChart } from "@/types/dashboard.types";

const ChartRenderer = dynamic(() => import("./_ChartRenderer"), {
  ssr: false,
});

export default function ChartLazy({ chart }: { chart: DashboardChart }) {
  return <ChartRenderer chart={chart} />;
}
