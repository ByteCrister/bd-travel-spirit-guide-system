import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ChartRowSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
            {[0, 1].map((k) => (
                <div
                    key={k}
                    className="flex h-[340px] flex-col rounded-2xl border bg-card/60 p-6 shadow-sm backdrop-blur-sm"
                >
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="mt-2 h-3 w-64" />
                    <Skeleton className="mt-8 flex-1 w-full rounded-lg" />
                </div>
            ))}
        </div>
    );
}
