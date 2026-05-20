// components/reports/ReportsPage.tsx
// Neumorphism design system — Space Mono + JetBrains Mono
// primary=#006666 | surface=#E7E5E4 | text=#1E2938

"use client";

import { useEffect, type FC } from "react";
import ReportsCounters from "./ReportsCounters";
import { ReportsToolbar } from "./ReportsToolbar";
import { ReportsTable } from "./ReportsTable";
import { useReportsStore } from "@/store/report.store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { HiDocumentReport } from "react-icons/hi";
import { spaceMono, jetbrainsMono } from "@/styles/fonts";

export const ReportsPage: FC = () => {
    const { fetchListPage, params, loading } = useReportsStore();

    useEffect(() => {
        void fetchListPage(params.page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className={cn("min-h-screen", spaceMono.variable, jetbrainsMono.variable)}
            style={{ backgroundColor: "#E7E5E4", fontFamily: "var(--font-space-mono)" }}
        >
            {/* Page Header */}
            <motion.header
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                    backgroundColor: "#E7E5E4",
                    borderBottom: "1px solid #cccac8",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
                }}
                className="px-6 py-6"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between">
                        {/* Title group */}
                        <div className="flex items-center gap-4">
                            {/* Neumorphic icon box */}
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    backgroundColor: "#E7E5E4",
                                    borderRadius: 12,
                                    boxShadow: "5px 5px 10px #c4c2c0, -5px -5px 10px #ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <HiDocumentReport size={24} style={{ color: "#006666" }} />
                            </div>

                            <div>
                                <h1
                                    className="text-2xl font-bold tracking-tight"
                                    style={{ color: "#1E2938", fontFamily: "var(--font-space-mono)" }}
                                >
                                    Report Management
                                </h1>
                                <p
                                    className="text-xs mt-0.5 font-medium"
                                    style={{ color: "#5a6475", fontFamily: "var(--font-jetbrains-mono)" }}
                                >
                                    Operations Dashboard · Real-time monitoring
                                </p>
                            </div>
                        </div>

                        {/* System status pill — neumorphic inset */}
                        <div
                            style={{
                                backgroundColor: "#E7E5E4",
                                borderRadius: 999,
                                padding: "6px 16px",
                                boxShadow: "inset 3px 3px 6px #c4c2c0, inset -3px -3px 6px #ffffff",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: loading.type === "loading" ? "#FE9900" : "#00A63D",
                                    display: "inline-block",
                                    boxShadow: loading.type === "loading"
                                        ? "0 0 6px #FE9900"
                                        : "0 0 6px #00A63D",
                                }}
                            />
                            <span
                                className="text-xs font-semibold"
                                style={{ color: "#1E2938", fontFamily: "var(--font-space-mono)" }}
                            >
                                {loading.type === "loading" ? "Syncing…" : "System active"}
                            </span>
                        </div>
                    </div>

                    <p
                        className="mt-3 text-xs leading-relaxed max-w-2xl"
                        style={{ color: "#5a6475", fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                        Streamline your workflow with intelligent caching, real-time updates, and advanced filtering.
                        Review, triage, and resolve incoming reports efficiently.
                    </p>
                </div>
            </motion.header>

            {/* Main content */}
            <main className="mx-auto max-w-7xl px-6 py-6 space-y-5">
                <ReportsCounters />

                {/* Toolbar card */}
                <section
                    style={{
                        backgroundColor: "#E7E5E4",
                        borderRadius: 16,
                        padding: "20px 24px",
                        boxShadow: "6px 6px 14px #c4c2c0, -6px -6px 14px #ffffff",
                    }}
                >
                    <h2
                        className="text-sm font-bold mb-4 uppercase tracking-widest"
                        style={{ color: "#006666", fontFamily: "var(--font-space-mono)" }}
                    >
                        Filters &amp; Search
                    </h2>
                    <ReportsToolbar />
                </section>

                {/* Table card */}
                <section
                    style={{
                        backgroundColor: "#E7E5E4",
                        borderRadius: 16,
                        boxShadow: "6px 6px 14px #c4c2c0, -6px -6px 14px #ffffff",
                        overflow: "hidden",
                    }}
                >
                    <ReportsTable />
                </section>
            </main>
        </div>
    );
};