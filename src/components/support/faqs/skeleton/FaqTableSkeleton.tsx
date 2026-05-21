// components/faqs/FaqTableSkeleton.tsx
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface FaqTableSkeletonProps {
    rows?: number;
}

export function FaqTableSkeleton({ rows = 10 }: FaqTableSkeletonProps) {
    return (
        <div className="neumorph-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-text/10 bg-surface/50">
                        <tr>
                            {['Order', 'Question', 'Tour', 'Status', 'Active', 'Likes/Dislikes', 'Actions'].map(
                                (header) => (
                                    <th key={header} className="p-3 text-left">
                                        <Skeleton className="h-4 w-20" />
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, index) => (
                            <tr key={index} className="border-b border-text/5">
                                <td className="p-3"><Skeleton className="h-8 w-16" /></td>
                                <td className="p-3"><Skeleton className="h-10 w-48" /></td>
                                <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                                <td className="p-3"><Skeleton className="h-6 w-20" /></td>
                                <td className="p-3"><Skeleton className="h-5 w-10" /></td>
                                <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                                <td className="p-3"><Skeleton className="h-8 w-8 rounded-full" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}