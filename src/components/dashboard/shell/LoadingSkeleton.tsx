// components/dashboard/LoadingSkeleton.tsx
"use client";

import React from "react";

export default function LoadingSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <div className="h-8 w-1/3 bg-muted-foreground/10 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-40 bg-muted-foreground/10 rounded animate-pulse" />
        <div className="h-40 bg-muted-foreground/10 rounded animate-pulse" />
      </div>
    </div>
  );
}
