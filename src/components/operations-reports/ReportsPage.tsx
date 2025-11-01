// components/reports/ReportsPage.tsx
// Top-level page composition: header + counters + toolbar + table
// Modern, professional UI design with enhanced visual hierarchy

"use client";

import { useEffect, type FC } from "react";
import  ReportsCounters  from "./ReportsCounters";
import { ReportsToolbar } from "./ReportsToolbar";
import { ReportsTable } from "./ReportsTable";
import { useReportsStore } from "@/store/useReportStore";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { motion, Variants } from "framer-motion";
import { HiDocumentReport, HiTrendingUp, HiSparkles } from "react-icons/hi";
import { plusJakartaSans } from "@/app/fonts";

export const ReportsPage: FC = () => {
    const { params, fetchListPage, loading } = useReportsStore();

    // Initial load: hydrate current params then fetch first page
    useEffect(() => {
        void fetchListPage(params.page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50", plusJakartaSans.className)}>
            {/* Animated background elements */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
                <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
                <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
            </div>

            {/* Header with modern gradient background */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative border-b border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-sm"
            >
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex items-center gap-4"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 opacity-20 blur-xl" />
                                    <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-3 shadow-lg">
                                        <HiDocumentReport className="h-7 w-7 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                                        Report Management
                                    </h1>
                                    <div className="mt-1 flex items-center gap-2.5 text-sm font-medium text-slate-600">
                                        <span>Operations Dashboard</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1.5 text-blue-600">
                                            <HiTrendingUp className="h-4 w-4" />
                                            Real-time monitoring
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        
                        {/* Status indicator */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="flex items-center gap-3"
                        >
                            <span className={cn(
                                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all",
                                loading.type === "loading" 
                                    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200/50" 
                                    : "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200/50"
                            )}>
                                <span className="relative flex h-2 w-2">
                                    {loading.type === "loading" ? (
                                        <>
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                                        </>
                                    ) : (
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                    )}
                                </span>
                                {loading.type === "loading" ? "Syncing data..." : "System active"}
                            </span>
                        </motion.div>
                    </div>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600"
                    >
                        Streamline your workflow with intelligent caching, real-time updates, and advanced filtering. 
                        Review, triage, and resolve incoming reports efficiently with our centralized management system.
                    </motion.p>
                </div>
            </motion.div>

            {/* Main content */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative mx-auto px-1 py-2"
            >
                <div className="space-y-6">
                    {/* Counters section with enhanced styling */}
                    <motion.div variants={itemVariants}>
                        <ReportsCounters />
                    </motion.div>

                    {/* Toolbar in modern card */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-sm transition-shadow hover:shadow-md">
                            <div className="p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <HiSparkles className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">Filters & Search</h2>
                                </div>
                                <ReportsToolbar />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Table section */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-sm transition-shadow hover:shadow-md">
                            <ReportsTable loading={loading} />
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};