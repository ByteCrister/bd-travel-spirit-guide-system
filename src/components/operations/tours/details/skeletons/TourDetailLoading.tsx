"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface TourDetailLoadingProps {
    showFullLayout?: boolean;
}

export default function TourDetailLoading({ showFullLayout = true }: TourDetailLoadingProps) {
    // Primary and accent colors for better contrast
    const primaryBg = "bg-blue-400/20";
    const accentBg = "bg-purple-400/20";
    const secondaryBg = "bg-green-400/15";
    const highlightBg = "bg-amber-400/20";
    const neutralBg = "bg-gray-300/30";

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
            >
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                    <div className="flex items-center gap-4">
                        <Skeleton className={`h-10 w-10 rounded-lg ${primaryBg}`} />
                        <div>
                            <Skeleton className={`h-8 w-64 rounded-lg mb-2 ${accentBg}`} />
                            <Skeleton className={`h-4 w-32 rounded-lg ${secondaryBg}`} />
                        </div>
                    </div>
                    <Skeleton className={`h-10 w-24 rounded-lg ${highlightBg}`} />
                </div>

                {/* TourBasicInfo skeleton */}
                <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-900/50 dark:to-gray-800/50">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <Skeleton className={`h-7 w-3/4 rounded-lg ${primaryBg}`} />
                                    <Skeleton className={`h-5 w-16 rounded-full ${highlightBg}`} />
                                </div>
                                <Skeleton className={`h-4 w-full rounded-lg ${neutralBg}`} />
                                <Skeleton className={`h-4 w-2/3 rounded-lg ${neutralBg}`} />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className={`h-6 w-20 rounded-full ${accentBg}`} />
                                <Skeleton className={`h-6 w-24 rounded-full ${secondaryBg}`} />
                                <Skeleton className={`h-6 w-16 rounded-full ${primaryBg}`} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Hero image skeleton */}
                        <div className="space-y-2 mb-6">
                            <Skeleton className={`h-4 w-24 rounded-lg ${neutralBg}`} />
                            <Skeleton className={`w-full h-64 rounded-xl ${primaryBg}`} />
                        </div>

                        {/* Gallery skeleton */}
                        <div className="space-y-2 mb-8">
                            <div className="flex items-center justify-between">
                                <Skeleton className={`h-4 w-40 rounded-lg ${accentBg}`} />
                                <Skeleton className={`h-5 w-12 rounded-full ${secondaryBg}`} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className={`aspect-square rounded-lg ${
                                        i % 2 === 0 ? accentBg : primaryBg
                                    }`} />
                                ))}
                            </div>
                        </div>

                        {/* Info grid skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-blue-50/30 to-purple-50/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Skeleton className={`h-4 w-4 rounded-full ${highlightBg}`} />
                                    <Skeleton className={`h-4 w-32 rounded-lg ${accentBg}`} />
                                </div>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Skeleton className={`h-4 w-4 rounded-full ${
                                            i === 1 ? primaryBg : i === 2 ? secondaryBg : highlightBg
                                        }`} />
                                        <Skeleton className={`h-4 w-16 rounded-lg ${neutralBg}`} />
                                        <Skeleton className={`h-4 w-24 rounded-lg ml-auto ${
                                            i === 1 ? accentBg : i === 2 ? primaryBg : secondaryBg
                                        }`} />
                                    </div>
                                ))}
                                <div className="flex gap-1 flex-wrap pt-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className={`h-5 w-12 rounded-full ${
                                            i === 1 ? primaryBg : i === 2 ? accentBg : secondaryBg
                                        }`} />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-green-50/30 to-cyan-50/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Skeleton className={`h-4 w-4 rounded-full ${highlightBg}`} />
                                    <Skeleton className={`h-4 w-32 rounded-lg ${secondaryBg}`} />
                                </div>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Skeleton className={`h-4 w-4 rounded-full ${
                                            i === 1 ? secondaryBg : i === 2 ? primaryBg : accentBg
                                        }`} />
                                        <Skeleton className={`h-4 w-16 rounded-lg ${neutralBg}`} />
                                        <Skeleton className={`h-4 w-24 rounded-lg ml-auto ${
                                            i === 1 ? secondaryBg : i === 2 ? primaryBg : highlightBg
                                        }`} />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-amber-50/30 to-orange-50/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Skeleton className={`h-4 w-4 rounded-full ${highlightBg}`} />
                                    <Skeleton className={`h-4 w-32 rounded-lg ${accentBg}`} />
                                </div>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Skeleton className={`h-4 w-4 rounded-full ${
                                            i === 1 ? highlightBg : i === 2 ? accentBg : i === 3 ? primaryBg : secondaryBg
                                        }`} />
                                        <Skeleton className={`h-4 w-16 rounded-lg ${neutralBg}`} />
                                        <Skeleton className={`h-4 w-12 rounded-lg ml-auto ${
                                            i === 1 ? highlightBg : i === 2 ? accentBg : i === 3 ? secondaryBg : primaryBg
                                        }`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {showFullLayout && (
                    <>
                        {/* Tabs skeleton */}
                        <div className="w-full space-y-6">
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 p-1 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton key={i} className={`h-10 rounded-lg ${
                                        i % 2 === 0 ? primaryBg : i % 3 === 0 ? secondaryBg : accentBg
                                    }`} />
                                ))}
                            </div>

                            {/* Tab content skeleton - Overview tab (first tab) */}
                            <div className="space-y-6">
                                {/* BangladeshInfo skeleton */}
                                <Card className="border-2">
                                    <CardHeader className="bg-gradient-to-r from-blue-100/30 to-purple-100/30">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className={`h-10 w-10 rounded-lg ${primaryBg}`} />
                                            <Skeleton className={`h-6 w-64 rounded-lg ${accentBg}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                                                    <Skeleton className={`h-5 w-32 rounded-lg ${primaryBg}`} />
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <Skeleton className={`h-4 w-20 rounded-lg ${neutralBg}`} />
                                                            <Skeleton className={`h-4 w-32 rounded-lg ${accentBg}`} />
                                                        </div>
                                                        <div className="flex justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <Skeleton className={`h-4 w-20 rounded-lg ${neutralBg}`} />
                                                            <Skeleton className={`h-4 w-32 rounded-lg ${secondaryBg}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-green-50/50 to-cyan-50/50">
                                                    <Skeleton className={`h-5 w-48 rounded-lg ${secondaryBg}`} />
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <Skeleton className={`h-4 w-24 rounded-lg ${neutralBg}`} />
                                                            <Skeleton className={`h-5 w-24 rounded-full ${highlightBg}`} />
                                                        </div>
                                                        <div className="p-3 space-y-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <Skeleton className={`h-4 w-20 rounded-lg ${neutralBg}`} />
                                                            <div className="flex gap-2">
                                                                {[1, 2, 3].map((i) => (
                                                                    <Skeleton key={i} className={`h-5 w-16 rounded-full ${
                                                                        i === 1 ? primaryBg : i === 2 ? secondaryBg : accentBg
                                                                    }`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-orange-50/50">
                                                    <Skeleton className={`h-5 w-32 rounded-lg ${highlightBg}`} />
                                                    <div className="space-y-3">
                                                        {[1, 2].map((i) => (
                                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                                <Skeleton className={`h-5 w-5 rounded-full ${
                                                                    i === 1 ? primaryBg : secondaryBg
                                                                }`} />
                                                                <Skeleton className={`h-4 w-32 rounded-lg ${neutralBg}`} />
                                                            </div>
                                                        ))}
                                                        <div className="space-y-2">
                                                            <Skeleton className={`h-4 w-40 rounded-lg ${neutralBg}`} />
                                                            <div className="flex gap-2">
                                                                {[1, 2].map((i) => (
                                                                    <Skeleton key={i} className={`h-5 w-16 rounded-full ${
                                                                        i === 1 ? accentBg : primaryBg
                                                                    }`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                                                    <Skeleton className={`h-5 w-48 rounded-lg ${accentBg}`} />
                                                    <div className="space-y-3">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className="flex justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                                <Skeleton className={`h-4 w-24 rounded-lg ${neutralBg}`} />
                                                                <Skeleton className={`h-4 w-20 rounded-lg ${
                                                                    i === 1 ? highlightBg : i === 2 ? secondaryBg : primaryBg
                                                                }`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* InclusionsExclusions skeleton */}
                                <Card className="border-2">
                                    <CardHeader className="bg-gradient-to-r from-green-100/30 to-cyan-100/30">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className={`h-10 w-10 rounded-lg ${secondaryBg}`} />
                                            <Skeleton className={`h-6 w-72 rounded-lg ${accentBg}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className={`h-5 w-5 rounded-full ${primaryBg}`} />
                                                    <Skeleton className={`h-5 w-24 rounded-lg ${secondaryBg}`} />
                                                </div>
                                                <div className="space-y-3">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <Skeleton className={`h-5 w-5 rounded-full mt-0.5 ${
                                                                i % 2 === 0 ? secondaryBg : primaryBg
                                                            }`} />
                                                            <div className="flex-1 space-y-2">
                                                                <Skeleton className={`h-4 w-3/4 rounded-lg ${neutralBg}`} />
                                                                <Skeleton className={`h-3 w-full rounded-lg ${neutralBg}`} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-rose-50/50 to-red-50/50">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className={`h-5 w-5 rounded-full ${accentBg}`} />
                                                    <Skeleton className={`h-5 w-24 rounded-lg ${highlightBg}`} />
                                                </div>
                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <Skeleton className={`h-5 w-5 rounded-full mt-0.5 ${
                                                                i === 1 ? accentBg : i === 2 ? highlightBg : primaryBg
                                                            }`} />
                                                            <div className="flex-1 space-y-2">
                                                                <Skeleton className={`h-4 w-3/4 rounded-lg ${neutralBg}`} />
                                                                <Skeleton className={`h-3 w-full rounded-lg ${neutralBg}`} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* PricingInfo skeleton */}
                                <Card className="border-2">
                                    <CardHeader className="bg-gradient-to-r from-amber-100/30 to-orange-100/30">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className={`h-10 w-10 rounded-lg ${highlightBg}`} />
                                            <Skeleton className={`h-6 w-48 rounded-lg ${accentBg}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
                                                <div className="space-y-2">
                                                    <Skeleton className={`h-5 w-32 rounded-lg ${highlightBg}`} />
                                                    <Skeleton className={`h-8 w-40 rounded-lg ${primaryBg}`} />
                                                </div>
                                                <div className="pt-4 space-y-2">
                                                    <Skeleton className={`h-4 w-24 rounded-lg ${neutralBg}`} />
                                                    <div className="flex gap-2">
                                                        <Skeleton className={`h-6 w-16 rounded-full ${secondaryBg}`} />
                                                        <Skeleton className={`h-6 w-16 rounded-full ${accentBg}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                                                <Skeleton className={`h-5 w-32 rounded-lg ${secondaryBg}`} />
                                                <div className="space-y-3">
                                                    {[1, 2].map((i) => (
                                                        <div key={i} className="flex justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <div className="space-y-1 flex-1">
                                                                <Skeleton className={`h-4 w-24 rounded-lg ${neutralBg}`} />
                                                                <Skeleton className={`h-3 w-20 rounded-lg ${neutralBg}`} />
                                                            </div>
                                                            <Skeleton className={`h-5 w-12 rounded-full ${
                                                                i === 1 ? highlightBg : primaryBg
                                                            }`} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
                                                <div className="space-y-2">
                                                    <Skeleton className={`h-5 w-40 rounded-lg ${primaryBg}`} />
                                                    <div className="flex flex-wrap gap-2">
                                                        {[1, 2, 3].map((i) => (
                                                            <Skeleton key={i} className={`h-5 w-16 rounded-full ${
                                                                i === 1 ? accentBg : i === 2 ? secondaryBg : highlightBg
                                                            }`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="pt-4 space-y-2">
                                                    <Skeleton className={`h-4 w-32 rounded-lg ${neutralBg}`} />
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <Skeleton className={`h-3 w-20 rounded-lg ${neutralBg}`} />
                                                            <Skeleton className={`h-5 w-12 rounded-full ${accentBg}`} />
                                                        </div>
                                                        <div className="flex justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <Skeleton className={`h-3 w-28 rounded-lg ${neutralBg}`} />
                                                            <Skeleton className={`h-4 w-24 rounded-lg ${secondaryBg}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* LogisticsInfo skeleton */}
                                <Card className="border-2">
                                    <CardHeader className="bg-gradient-to-r from-cyan-100/30 to-blue-100/30">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className={`h-10 w-10 rounded-lg ${primaryBg}`} />
                                            <Skeleton className={`h-6 w-32 rounded-lg ${accentBg}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                                                <Skeleton className={`h-5 w-36 rounded-lg ${primaryBg}`} />
                                                <div className="space-y-3">
                                                    <div className="p-3 space-y-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                        <Skeleton className={`h-4 w-16 rounded-lg ${neutralBg}`} />
                                                        <Skeleton className={`h-3 w-full rounded-lg ${neutralBg}`} />
                                                        <Skeleton className={`h-3 w-3/4 rounded-lg ${neutralBg}`} />
                                                    </div>
                                                    <div className="p-3 space-y-1 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                        <Skeleton className={`h-4 w-28 rounded-lg ${neutralBg}`} />
                                                        <Skeleton className={`h-3 w-40 rounded-lg ${neutralBg}`} />
                                                    </div>
                                                </div>
                                                <div className="pt-4 space-y-2">
                                                    <Skeleton className={`h-4 w-28 rounded-lg ${neutralBg}`} />
                                                    <Skeleton className={`h-3 w-full rounded-lg ${neutralBg}`} />
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                                                <div className="space-y-2">
                                                    <Skeleton className={`h-5 w-36 rounded-lg ${accentBg}`} />
                                                    <div className="flex flex-wrap gap-2">
                                                        {[1, 2, 3, 4].map((i) => (
                                                            <Skeleton key={i} className={`h-5 w-16 rounded-full ${
                                                                i === 1 ? primaryBg : i === 2 ? accentBg : i === 3 ? secondaryBg : highlightBg
                                                            }`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="pt-4 space-y-2">
                                                    <Skeleton className={`h-4 w-32 rounded-lg ${neutralBg}`} />
                                                    <div className="space-y-2">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className="p-3 space-y-1 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                                <Skeleton className={`h-4 w-16 rounded-lg ${neutralBg}`} />
                                                                <Skeleton className={`h-3 w-12 rounded-lg ${
                                                                    i === 1 ? secondaryBg : i === 2 ? highlightBg : accentBg
                                                                }`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className={`h-5 w-5 rounded-full ${secondaryBg}`} />
                                                    <Skeleton className={`h-5 w-28 rounded-lg ${primaryBg}`} />
                                                </div>
                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <Skeleton className={`h-4 w-4 rounded-full ${
                                                                    i % 2 === 0 ? primaryBg : secondaryBg
                                                                }`} />
                                                                <Skeleton className={`h-4 w-32 rounded-lg ${neutralBg}`} />
                                                            </div>
                                                            <Skeleton className={`h-4 w-8 rounded-full ${
                                                                i % 3 === 0 ? highlightBg : i % 2 === 0 ? accentBg : primaryBg
                                                            }`} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* ComplianceInfo skeleton */}
                                <Card className="border-2">
                                    <CardHeader className="bg-gradient-to-r from-emerald-100/30 to-teal-100/30">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className={`h-10 w-10 rounded-lg ${secondaryBg}`} />
                                            <Skeleton className={`h-6 w-64 rounded-lg ${accentBg}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-cyan-50/50 to-blue-50/50">
                                                <div className="space-y-2">
                                                    <Skeleton className={`h-5 w-40 rounded-lg ${primaryBg}`} />
                                                    <div className="space-y-3">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className="flex justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                                <Skeleton className={`h-4 w-28 rounded-lg ${neutralBg}`} />
                                                                <Skeleton className={`h-5 w-16 rounded-full ${
                                                                    i === 1 ? secondaryBg : i === 2 ? highlightBg : accentBg
                                                                }`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="pt-4 space-y-2">
                                                    <Skeleton className={`h-4 w-28 rounded-lg ${neutralBg}`} />
                                                    <div className="flex flex-wrap gap-2">
                                                        {[1, 2, 3].map((i) => (
                                                            <Skeleton key={i} className={`h-5 w-16 rounded-full ${
                                                                i === 1 ? primaryBg : i === 2 ? accentBg : secondaryBg
                                                            }`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-orange-50/50">
                                                <Skeleton className={`h-5 w-36 rounded-lg ${highlightBg}`} />
                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <Skeleton className={`h-5 w-5 rounded-full ${
                                                                i === 1 ? primaryBg : i === 2 ? secondaryBg : accentBg
                                                            }`} />
                                                            <Skeleton className={`h-4 w-32 rounded-lg ${neutralBg}`} />
                                                        </div>
                                                    ))}
                                                    <div className="p-3 space-y-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <Skeleton className={`h-4 w-4 rounded-full ${primaryBg}`} />
                                                            <Skeleton className={`h-4 w-16 rounded-lg ${neutralBg}`} />
                                                        </div>
                                                        <Skeleton className={`h-3 w-full rounded-lg ${neutralBg}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-fuchsia-50/50">
                                                <Skeleton className={`h-5 w-24 rounded-lg ${accentBg}`} />
                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="p-4 space-y-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <Skeleton className={`h-4 w-4 rounded-full ${
                                                                    i === 1 ? accentBg : i === 2 ? highlightBg : primaryBg
                                                                }`} />
                                                                <Skeleton className={`h-4 w-32 rounded-lg ${neutralBg}`} />
                                                            </div>
                                                            <Skeleton className={`h-4 w-20 rounded-full ml-6 ${
                                                                i === 1 ? secondaryBg : i === 2 ? accentBg : highlightBg
                                                            }`} />
                                                            <Skeleton className={`h-3 w-40 rounded-lg ml-6 ${neutralBg}`} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* ComputedInfo skeleton */}
                                <Card className="border-2">
                                    <CardHeader className="bg-gradient-to-r from-indigo-100/30 to-purple-100/30">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className={`h-10 w-10 rounded-lg ${accentBg}`} />
                                            <Skeleton className={`h-6 w-56 rounded-lg ${primaryBg}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 space-y-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className={`h-10 w-10 rounded-lg ${primaryBg}`} />
                                                    <Skeleton className={`h-5 w-36 rounded-lg ${accentBg}`} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="p-4 space-y-1 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                        <Skeleton className={`h-4 w-24 rounded-lg ${neutralBg}`} />
                                                        <Skeleton className={`h-7 w-48 rounded-lg ${highlightBg}`} />
                                                    </div>
                                                    <div className="p-4 space-y-1 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <Skeleton className={`h-4 w-4 rounded-full ${primaryBg}`} />
                                                            <Skeleton className={`h-4 w-32 rounded-lg ${neutralBg}`} />
                                                        </div>
                                                        <Skeleton className={`h-6 w-40 rounded-lg ml-6 ${secondaryBg}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 space-y-4 rounded-xl bg-gradient-to-br from-green-50/50 to-teal-50/50">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className={`h-10 w-10 rounded-lg ${secondaryBg}`} />
                                                    <Skeleton className={`h-5 w-36 rounded-lg ${accentBg}`} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className="p-3 space-y-1 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                                <Skeleton className={`h-3 w-16 rounded-lg ${neutralBg}`} />
                                                                <Skeleton className={`h-5 w-12 rounded-lg ${
                                                                    i === 1 ? primaryBg : i === 2 ? secondaryBg : highlightBg
                                                                }`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Skeleton className={`h-4 w-20 rounded-lg ${neutralBg}`} />
                                                            <Skeleton className={`h-4 w-12 rounded-lg ${neutralBg}`} />
                                                        </div>
                                                        <Skeleton className={`h-2 w-full rounded-full ${primaryBg}`} />
                                                    </div>
                                                    <div className="flex justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                        <Skeleton className={`h-4 w-16 rounded-lg ${neutralBg}`} />
                                                        <Skeleton className={`h-5 w-16 rounded-full ${accentBg}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="p-5 space-y-2 rounded-xl bg-gradient-to-br ${
                                                        i === 1 ? 'from-purple-50/50 to-pink-50/50' : 
                                                        i === 2 ? 'from-amber-50/50 to-orange-50/50' : 
                                                        'from-cyan-50/50 to-blue-50/50'
                                                    }">
                                                        <div className="flex items-center gap-3">
                                                            <Skeleton className={`h-5 w-5 rounded-full ${
                                                                i === 1 ? accentBg : i === 2 ? highlightBg : primaryBg
                                                            }`} />
                                                            <Skeleton className={`h-4 w-24 rounded-lg ${neutralBg}`} />
                                                        </div>
                                                        <Skeleton className={`h-7 w-12 rounded-lg ${
                                                            i === 1 ? secondaryBg : i === 2 ? primaryBg : accentBg
                                                        }`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Moderation & System Info skeleton */}
                            <Card className="border-2">
                                <CardHeader className="bg-gradient-to-r from-gray-100/30 to-slate-100/30">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className={`h-5 w-5 rounded-full ${primaryBg}`} />
                                        <Skeleton className={`h-6 w-64 rounded-lg ${accentBg}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Skeleton className={`h-5 w-40 rounded-lg ${primaryBg}`} />
                                            <div className="space-y-3">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="flex justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                        <Skeleton className={`h-4 w-24 rounded-lg ${neutralBg}`} />
                                                        <Skeleton className={`h-5 w-20 rounded-full ${
                                                            i === 1 ? highlightBg : i === 2 ? secondaryBg : i === 3 ? accentBg : primaryBg
                                                        }`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Skeleton className={`h-5 w-40 rounded-lg ${secondaryBg}`} />
                                            <div className="space-y-3">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="flex justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                        <Skeleton className={`h-4 w-24 rounded-lg ${neutralBg}`} />
                                                        <Skeleton className={`h-4 w-32 rounded-lg ${
                                                            i === 1 ? neutralBg : i === 2 ? neutralBg : neutralBg
                                                        }`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}