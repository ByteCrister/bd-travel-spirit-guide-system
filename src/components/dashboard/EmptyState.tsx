// components/dashboard/EmptyState.tsx
"use client";

import React from "react";

export default function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div role="status" className="rounded-lg border p-6 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
    </div>
  );
}
