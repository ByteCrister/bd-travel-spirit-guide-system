// src/components/dashboard-overview/CurrentSubscriptionCard.tsx
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    Calendar,
    RefreshCw,
    Receipt,
    Settings,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Clock,
    Sparkles,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CurrentSubscription } from "@/types/overview.types";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// Mock constants for demo
const SUBSCRIPTION_STATUS = {
    ACTIVE: "active",
    PAST_DUE: "past_due",
    CANCELLED: "cancelled",
    EXPIRED: "expired"
};

// Mock store hook
const useGuideOverviewStore = () => ({
    draft: {
        currentSubscription: {
            value: {
                status: "active",
                currentPeriodStart: "2024-11-01",
                currentPeriodEnd: "2024-12-01",
                amount: 29.99,
                currency: "USD",
                autoRenew: true,
                lastPaymentId: "pi_3QK1234567890"
            }
        }
    }
});

/** Safe date formatting */
function fmtDate(d?: string | null): string {
    if (!d) return "—";
    try {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "—";
        return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return "—";
    }
}

/** Format amount with currency */
function fmtAmount(amount?: number | null, currency?: string | null): string {
    if (amount == null) return "—";
    try {
        if (currency) {
            return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
        }
        return amount.toString();
    } catch {
        return `${amount} ${currency ?? ""}`.trim();
    }
}

export default function CurrentSubscriptionCard({ subscription }: { subscription?: CurrentSubscription | null }) {
    const storeSubscription = useGuideOverviewStore()?.draft?.currentSubscription?.value ?? null;
    const current = subscription ?? storeSubscription;

    const badge = useMemo(() => {
        const status = current?.status ?? "none";
        switch (status) {
            case SUBSCRIPTION_STATUS.ACTIVE:
                return {
                    label: "Active",
                    tone: "success" as const,
                    icon: CheckCircle2,
                    gradient: "from-emerald-500 to-green-600"
                };
            case SUBSCRIPTION_STATUS.PAST_DUE:
                return {
                    label: "Past due",
                    tone: "warning" as const,
                    icon: AlertCircle,
                    gradient: "from-amber-500 to-orange-600"
                };
            case SUBSCRIPTION_STATUS.CANCELLED:
                return {
                    label: "Cancelled",
                    tone: "destructive" as const,
                    icon: XCircle,
                    gradient: "from-red-500 to-rose-600"
                };
            case SUBSCRIPTION_STATUS.EXPIRED:
                return {
                    label: "Expired",
                    tone: "muted" as const,
                    icon: Clock,
                    gradient: "from-slate-500 to-slate-600"
                };
            default:
                return {
                    label: String(status),
                    tone: "muted" as const,
                    icon: Clock,
                    gradient: "from-slate-500 to-slate-600"
                };
        }
    }, [current]);

    const StatusIcon = badge.icon;

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <CardHeader className={cn(
                "relative text-white border-0 pb-8 bg-gradient-to-r",
                badge.gradient
            )}>
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <CreditCard className="size-6 text-white" />
                            </motion.div>
                            <div>
                                <div className="text-xl font-bold flex items-center gap-2">
                                    Current Subscription
                                    <Sparkles className="size-4 text-yellow-300" />
                                </div>
                                <p className="text-sm text-white/80 font-normal mt-0.5">Your billing details at a glance</p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        >
                            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5 shadow-lg">
                                <StatusIcon className="size-4" />
                                {badge.label}
                            </Badge>
                        </motion.div>
                    </CardTitle>
                </motion.div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </CardHeader>

            <CardContent className="pt-8 px-6 pb-6">
                {current ? (
                    <div className="space-y-6">
                        {/* Main Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Period Start */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="group"
                            >
                                <div className="space-y-2.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Period Start
                                    </label>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                                        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            {fmtDate(current.currentPeriodStart ?? null)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Period End */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="group"
                            >
                                <div className="space-y-2.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Period End
                                    </label>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors">
                                        <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            {fmtDate(current.currentPeriodEnd ?? null)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Amount */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="group"
                            >
                                <div className="space-y-2.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Amount
                                    </label>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-100 dark:border-emerald-800 group-hover:border-emerald-300 dark:group-hover:border-emerald-700 transition-colors">
                                        <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                            <FaBangladeshiTakaSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                            {fmtAmount(current.amount ?? null, current.currency ?? null)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Auto Renew */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="group"
                            >
                                <div className="space-y-2.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        Auto Renew
                                    </label>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors">
                                        <div className={cn(
                                            "w-9 h-9 rounded-lg flex items-center justify-center",
                                            current.autoRenew
                                                ? "bg-indigo-100 dark:bg-indigo-900/30"
                                                : "bg-slate-100 dark:bg-slate-800"
                                        )}>
                                            <RefreshCw className={cn(
                                                "size-4",
                                                current.autoRenew
                                                    ? "text-indigo-600 dark:text-indigo-400"
                                                    : "text-slate-400"
                                            )} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            {current.autoRenew ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Payment ID */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-2.5"
                        >
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Last Payment ID
                            </label>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Receipt className="size-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <code className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                                    {current.lastPaymentId ?? "—"}
                                </code>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-1 gap-3 pt-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <Button
                                size="lg"
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold group"
                                onClick={() => window.open("/billing", "_self")}
                            >
                                <span className="inline-flex items-center justify-center gap-2 w-full">
                                    <Settings className="size-4 mr-0 sm:mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                    <span className="truncate">Manage Subscription</span>
                                    <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full h-11 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold group"
                                onClick={() => window.open("/billing/invoices", "_self")}
                            >
                                <span className="inline-flex items-center justify-center gap-2 w-full">
                                    <Receipt className="size-4 mr-0 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="truncate">View Invoices</span>
                                </span>
                            </Button>
                        </motion.div>

                    </div>
                ) : (
                    <motion.div
                        className="py-12 text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <CreditCard className="size-8 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                            No active subscription snapshot
                        </p>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}