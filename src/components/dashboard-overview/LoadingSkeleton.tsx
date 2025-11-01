import React from "react";
import { motion, easeInOut } from "framer-motion";
import { FiCopy, FiFileText, FiUser, FiDatabase, FiUpload, FiChevronRight } from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "../ui/card";

const pulse = {
    animate: { opacity: [0.6, 1, 0.6], y: [0, -4, 0] },
    transition: { duration: 2.2, repeat: Infinity, ease: easeInOut },
  };

const LoadingSkeleton: React.FC = () => {
    return (
        <div className="container mx-auto max-w-7xl p-6 lg:p-10 space-y-8">
            {/* Header */}
            <motion.div className="flex flex-col gap-6 pb-4 border-b border-border/60" {...pulse}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/40 to-primary/60 flex items-center justify-center shadow-md">
                                <FiUser className="text-white w-6 h-6" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-64 rounded-md bg-gray-200/90" />
                                    <div className="hidden sm:flex gap-2">
                                        <Skeleton className="h-6 w-20 rounded-md bg-gray-200/85" />
                                        <Skeleton className="h-6 w-24 rounded-md bg-gray-200/85" />
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                    <motion.div className="px-3 py-1 rounded-lg bg-gray-100 border border-gray-200 shadow-sm" {...pulse}>
                                        <FiCopy className="inline-block mr-2 align-middle" /> <span className="text-xs font-medium">Badge</span>
                                    </motion.div>
                                    <Skeleton className="h-6 w-20 rounded-md bg-gray-200/85" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.div className="px-3 py-2 rounded-md border border-gray-200 bg-white/6 shadow-sm" {...pulse}>
                            <Skeleton className="h-6 w-36 rounded-md bg-gray-200/90" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Save bar */}
            <motion.div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 p-3 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div className="w-3 h-3 rounded-full bg-amber-400" {...pulse} />
                        <Skeleton className="h-5 w-40 rounded-md bg-gray-200/90" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-20 rounded-md bg-gray-200/85" />
                        <Skeleton className="h-8 w-24 rounded-md bg-gray-200/85" />
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-14 h-14 rounded-lg bg-gray-200/90" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-28 rounded-md bg-gray-200/85" />
                                    <Skeleton className="h-8 w-20 rounded-md bg-gray-200/85" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Information */}
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                                    <Skeleton className="h-8 w-48 rounded-md bg-gray-200/90" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <FiUser className="text-primary/60" /> Company name
                                        </label>
                                        <Skeleton className="h-10 w-full mt-2 rounded-md bg-gray-200/90" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <FiFileText className="text-primary/60" /> Bio
                                        </label>
                                        <Skeleton className="h-24 w-full mt-2 rounded-md bg-gray-200/90" />
                                    </div>
                                </div>

                                {/* Social links skeleton */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                                <FiDatabase className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <Skeleton className="h-4 w-32 rounded-md bg-gray-200/85" />
                                                <Skeleton className="h-3 w-48 mt-1 rounded-md bg-gray-200/75" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-8 w-28 rounded-md bg-gray-200/85" />
                                    </div>

                                    <div className="space-y-2">
                                        {[0, 1].map((n) => (
                                            <div key={n} className="p-4 rounded-xl border bg-gray-50/70 flex items-center gap-3">
                                                <Skeleton className="w-10 h-10 rounded-md bg-gray-200/90" />
                                                <div className="flex-1 space-y-1">
                                                    <Skeleton className="h-4 w-48 rounded-md bg-gray-200/85" />
                                                    <Skeleton className="h-3 w-64 rounded-md bg-gray-200/80" />
                                                </div>
                                                <Skeleton className="h-8 w-10 rounded-md bg-gray-200/85" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Documents */}
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                                    <Skeleton className="h-8 w-40 rounded-md bg-gray-200/90" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Skeleton className="h-9 w-28 rounded-md bg-gray-200/85" />
                                        <Skeleton className="h-9 w-28 rounded-md bg-gray-200/85" />
                                    </div>

                                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gradient-to-br from-muted/30 to-muted/10">
                                        <div className="inline-block mb-4 relative">
                                            <div className="w-20 h-20 rounded-lg bg-gray-200/85 mx-auto flex items-center justify-center">
                                                <FiUpload className="w-8 h-8 text-primary/70" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-5 w-56 mx-auto" />
                                        <Skeleton className="h-4 w-72 mt-2 mx-auto" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Subscriptions */}
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                                    <Skeleton className="h-8 w-44 rounded-md bg-gray-200/90" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[0, 1].map((n) => (
                                        <div key={n} className="rounded-2xl border p-4 bg-white/5">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-5 w-32" />
                                                    <Skeleton className="h-4 w-48" />
                                                </div>
                                                <div className="text-right">
                                                    <Skeleton className="h-8 w-16" />
                                                    <Skeleton className="h-4 w-24 mt-2" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Aside */}
                <aside className="space-y-6">
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-32 rounded-md bg-gray-200/90" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-200/90" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-28 mt-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-36 rounded-md bg-gray-200/90" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20 mt-1" />
                                        </div>
                                        <div className="text-right">
                                            <Skeleton className="h-6 w-20" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-10 w-full" />
                                        <motion.div {...pulse} className="p-2 rounded-md bg-gray-100">
                                            <FiChevronRight />
                                        </motion.div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </aside>
            </div>
        </div>
    );
};

export default LoadingSkeleton;
