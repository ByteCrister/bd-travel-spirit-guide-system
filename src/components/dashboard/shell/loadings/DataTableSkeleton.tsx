import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type DataTableSkeletonProps = {
    columns: number;
    rows?: number;
    className?: string;
};

export function DataTableSkeleton({ columns, rows = 8, className }: DataTableSkeletonProps) {
    return (
        <div className={cn('w-full space-y-3 overflow-hidden rounded-xl border bg-card/40 p-4', className)}>
            <div className="flex gap-2 border-b pb-3">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            <div className="space-y-2">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="flex gap-2">
                        {Array.from({ length: columns }).map((_, c) => (
                            <Skeleton key={c} className="h-8 flex-1" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
