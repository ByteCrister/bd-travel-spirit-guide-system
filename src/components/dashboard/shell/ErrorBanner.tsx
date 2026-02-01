// components/dashboard/ErrorBanner.tsx
"use client";

import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div role="alert" className="rounded-md border bg-red-50 text-red-800 p-3 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <FiAlertTriangle aria-hidden className="text-red-600" />
                <p className="text-sm">{message}</p>
            </div>
            {onRetry && (
                <button onClick={onRetry} className="px-3 py-1 rounded-md border bg-background text-sm">
                    Retry
                </button>
            )}
        </div>
    );
}
