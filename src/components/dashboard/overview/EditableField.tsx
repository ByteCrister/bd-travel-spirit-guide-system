// components/dashboard-overview/EditableField.tsx
'use client';

import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Edit2, PencilLine, CheckCircle } from "lucide-react";

type Props = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    onBlur?: () => void;
    dirty?: boolean;
    multiline?: boolean;
    placeholder?: string;
};

export default function EditableField({ label, value, onChange, onBlur, dirty, multiline, placeholder }: Props) {
    return (
        <motion.div 
            className="space-y-2"
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <PencilLine className="size-3.5 text-primary/60" />
                    {label}
                </label>
                {dirty && (
                    <motion.span 
                        className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Edit2 className="size-3 animate-pulse" />
                        Unsaved
                    </motion.span>
                )}
            </div>
            <div className="relative group">
                {multiline ? (
                    <Textarea
                        className={cn(
                            "min-h-[120px] resize-y transition-all duration-200",
                            dirty && "ring-2 ring-amber-500/20 border-amber-500/50 focus:ring-amber-500/30 pr-8"
                        )}
                        value={value}
                        placeholder={placeholder}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                    />
                ) : (
                    <Input
                        className={cn(
                            "transition-all duration-200",
                            dirty && "ring-2 ring-amber-500/20 border-amber-500/50 focus:ring-amber-500/30 pr-8"
                        )}
                        value={value}
                        placeholder={placeholder}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                    />
                )}
                {dirty && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        <CheckCircle className="size-4 text-amber-600" />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
