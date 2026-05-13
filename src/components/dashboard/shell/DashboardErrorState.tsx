'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DashboardErrorStateProps = {
    message: string;
    onRetry: () => void;
};

export function DashboardErrorState({ message, onRetry }: DashboardErrorStateProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-3xl border border-destructive/20 bg-destructive/5 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-9 w-9" aria-hidden />
            </div>
            <div className="max-w-md space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <Button size="lg" onClick={onRetry} className="rounded-full px-8">
                Try again
            </Button>
        </div>
    );
}
