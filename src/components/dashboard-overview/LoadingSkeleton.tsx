import React from 'react'
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from '../ui/card';

const LoadingSkeleton = () => {
    return (
        <div className="container mx-auto max-w-7xl p-6 lg:p-10">
            <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-28" />
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="w-14 h-14 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-16" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-8 w-48" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-32 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <aside className="space-y-6">
                        {[1, 2].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-24 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default LoadingSkeleton