import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function StatsGridSkeleton({ className, count = 6 }: { className?: string; count?: number }) {
    return (
        <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="relative overflow-hidden rounded-2xl border bg-card/60 p-6 shadow-sm backdrop-blur-sm"
                >
                    <div className="flex items-start justify-between gap-3">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                    </div>
                    <Skeleton className="mt-6 h-9 w-32" />
                    <Skeleton className="mt-2 h-3 w-20" />
                </div>
            ))}
        </div>
    );
}
