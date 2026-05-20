// components/employees/primitives/Field.tsx
"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";

interface FieldProps {
    label: string;
    children: React.ReactNode;
    hint?: string;
    htmlFor?: string;
    error?: string;
}

export function Field({ label, children, hint, htmlFor, error }: FieldProps) {
    return (
        <div className="space-y-1.5">
            <Label
                htmlFor={htmlFor}
                className="text-[11px] font-semibold uppercase tracking-widest text-[#1E2938]/50 font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]"
            >
                {label}
            </Label>
            {children}
            {hint && (
                <p className="text-[11px] text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)]">
                    {hint}
                </p>
            )}
            {error && (
                <p className="text-[11px] text-[#FF2157] font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)]">
                    {error}
                </p>
            )}
        </div>
    );
}