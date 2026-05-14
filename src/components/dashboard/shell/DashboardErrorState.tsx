'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DashboardErrorStateProps = {
    message: string;
    onRetry: () => void;
};

export function DashboardErrorState({ message, onRetry }: DashboardErrorStateProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-rose-200/60 bg-gradient-to-br from-white via-rose-50/40 to-red-50/30 px-6 py-16 text-center shadow-lg shadow-rose-100/50 dark:border-rose-900/30 dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 dark:shadow-rose-900/20">
            {/* Glossy sheen */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/5"
                aria-hidden
            />
            {/* Subtle bg orb */}
            <div
                className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl dark:bg-rose-900/20"
                aria-hidden
            />

            <div className="relative flex flex-col items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 shadow-inner shadow-rose-100 dark:border-rose-800/50 dark:bg-rose-950/50">
                    <AlertTriangle className="h-8 w-8 text-rose-500 dark:text-rose-400" aria-hidden />
                </div>

                <div className="max-w-md space-y-2">
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                        Something went wrong
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{message}</p>
                </div>

                <Button
                    size="lg"
                    onClick={onRetry}
                    className="rounded-full bg-slate-900 px-8 shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try again
                </Button>
            </div>
        </div>
    );
}