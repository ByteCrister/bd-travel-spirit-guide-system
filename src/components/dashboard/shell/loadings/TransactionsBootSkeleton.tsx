'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TransactionsBootSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/15 p-8 text-muted-foreground',
                className,
            )}
        >
            <Loader2 className="h-8 w-8 animate-spin opacity-60" aria-hidden />
            <p className="text-sm">Loading transactions…</p>
        </div>
    );
}
