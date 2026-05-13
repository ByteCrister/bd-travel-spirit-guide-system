import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ProfileCardsSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('grid gap-6 md:grid-cols-2', className)}>
            {[0, 1].map((k) => (
                <div
                    key={k}
                    className="rounded-2xl border bg-card/60 p-6 shadow-sm backdrop-blur-sm"
                >
                    <Skeleton className="h-5 w-40" />
                    <div className="mt-6 flex gap-4">
                        <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-full max-w-[280px]" />
                            <Skeleton className="h-3 w-[160px]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
