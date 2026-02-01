// components/dashboard-overview/SubscriptionsPanel.tsx
'use client';

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    RefreshCw, 
    Calendar, 
    CreditCard, 
    Loader2, 
    Receipt, 
    Repeat, 
    Sparkles, 
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    ChevronRight,
    Zap
} from "lucide-react";
import { useGuideOverviewStore } from "@/store/guide-overview.store";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_STATUS } from "@/constants/guide.const";

// Format date helper
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
    });
};

const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
        case SUBSCRIPTION_STATUS.ACTIVE:
            return {
                variant: 'default' as const,
                icon: CheckCircle2,
                gradient: 'from-green-500/20 to-emerald-500/20',
                border: 'border-green-500/30',
                glow: 'shadow-green-500/20',
                iconColor: 'text-green-600',
                bgColor: 'bg-green-50',
                dotColor: 'bg-green-500'
            };
        case SUBSCRIPTION_STATUS.CANCELLED:
            return {
                variant: 'destructive' as const,
                icon: XCircle,
                gradient: 'from-red-500/20 to-rose-500/20',
                border: 'border-red-500/30',
                glow: 'shadow-red-500/20',
                iconColor: 'text-red-600',
                bgColor: 'bg-red-50',
                dotColor: 'bg-red-500'
            };
        case SUBSCRIPTION_STATUS.FAILED:
        case SUBSCRIPTION_STATUS.EXPIRED:
            return {
                variant: 'destructive' as const,
                icon: AlertTriangle,
                gradient: 'from-orange-500/20 to-amber-500/20',
                border: 'border-orange-500/30',
                glow: 'shadow-orange-500/20',
                iconColor: 'text-orange-600',
                bgColor: 'bg-orange-50',
                dotColor: 'bg-orange-500'
            };
        case SUBSCRIPTION_STATUS.PAST_DUE:
            return {
                variant: 'secondary' as const,
                icon: Clock,
                gradient: 'from-yellow-500/20 to-amber-500/20',
                border: 'border-yellow-500/30',
                glow: 'shadow-yellow-500/20',
                iconColor: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                dotColor: 'bg-yellow-500'
            };
        default:
            return {
                variant: 'outline' as const,
                icon: Receipt,
                gradient: 'from-gray-500/20 to-slate-500/20',
                border: 'border-gray-500/30',
                glow: 'shadow-gray-500/20',
                iconColor: 'text-gray-600',
                bgColor: 'bg-gray-50',
                dotColor: 'bg-gray-500'
            };
    }
};

export default function SubscriptionsPanel() {
    const {
        original,
        refreshSubscriptionHistory,
        loadMoreSubscriptions,
        subscriptionsLoadingMore,
        subscriptionsHasMore
    } = useGuideOverviewStore();

    const items = original?.subscriptionHistory ?? [];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-muted/40"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                            <Receipt className="w-5 h-5 text-primary-foreground" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">
                            {items.length} {items.length === 1 ? 'Record' : 'Records'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Subscription history
                        </p>
                    </div>
                </div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refreshSubscriptionHistory()}
                        className="gap-2 hover:bg-primary/10 border border-transparent hover:border-primary/20 shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                </motion.div>
            </motion.div>

            {/* Content Section */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative text-center py-16 border-2 border-dashed rounded-2xl bg-gradient-to-br from-muted/30 via-muted/20 to-muted/10 overflow-hidden"
                        >
                            {/* Animated background elements */}
                            <div className="absolute inset-0 opacity-40">
                                <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                                <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="relative inline-block mb-6">
                                    <motion.div
                                        animate={{ 
                                            y: [0, -10, 0],
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{ 
                                            duration: 4, 
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <CreditCard className="w-20 h-20 mx-auto text-muted-foreground/20" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute -top-2 -right-2"
                                    >
                                        <Sparkles className="w-8 h-8 text-primary/40" />
                                    </motion.div>
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">
                                    No subscription history yet
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Your subscription records and payment history will appear here
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((it, index) => {
                                const config = getStatusConfig(it.status);
                                const StatusIcon = config.icon;

                                return (
                                    <motion.div
                                        key={it.id ?? it.createdAt}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                        transition={{ 
                                            duration: 0.4, 
                                            delay: index * 0.05,
                                            type: "spring",
                                            stiffness: 100
                                        }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        layout
                                    >
                                        <div className={cn(
                                            "relative group cursor-pointer overflow-hidden",
                                            "rounded-2xl border-2 transition-all duration-300",
                                            "hover:shadow-xl",
                                            config.border,
                                            config.glow
                                        )}>
                                            {/* Animated gradient background */}
                                            <motion.div 
                                                className={cn(
                                                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                                    config.gradient
                                                )}
                                                initial={false}
                                            />
                                            
                                            {/* Shine effect on hover */}
                                            <motion.div
                                                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                                initial={false}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                                    animate={{ x: ['-100%', '200%'] }}
                                                    transition={{ 
                                                        duration: 2, 
                                                        repeat: Infinity,
                                                        repeatDelay: 3,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                            </motion.div>

                                            <div className="relative z-10 flex justify-between items-start gap-6 p-5">
                                                {/* Left Content */}
                                                <div className="flex-1 space-y-4">
                                                    {/* Status Row */}
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <motion.div
                                                            whileHover={{ scale: 1.05 }}
                                                            className="relative"
                                                        >
                                                            <Badge 
                                                                variant={config.variant} 
                                                                className="capitalize flex items-center gap-2 px-3 py-1.5 text-xs font-bold shadow-sm"
                                                            >
                                                                <StatusIcon className="w-3.5 h-3.5" />
                                                                {it.status.replace('_', ' ')}
                                                            </Badge>
                                                        </motion.div>
                                                        
                                                        {it.autoRenew && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: 0.2 }}
                                                            >
                                                                <Badge 
                                                                    variant="secondary" 
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20"
                                                                >
                                                                    <Repeat className="w-3 h-3" />
                                                                    Auto-renew
                                                                    <Zap className="w-3 h-3 ml-0.5" />
                                                                </Badge>
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    {/* Date Range */}
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted/40">
                                                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                        <div className="space-y-1 min-w-0">
                                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                                Subscription Period
                                                            </p>
                                                            <p className="text-sm font-medium text-foreground">
                                                                {formatDate(it.startDate)}
                                                                <span className="text-muted-foreground mx-2">→</span>
                                                                {formatDate(it.endDate)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Payment Provider */}
                                                    {it.paymentProvider && (
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40">
                                                                <CreditCard className="w-3 h-3" />
                                                                <span className="font-medium">{it.paymentProvider}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right Content - Price */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-right">
                                                        <div className="flex items-baseline gap-1">
                                                            <motion.span 
                                                                className="text-3xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                                                                initial={{ scale: 0.5, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                                                            >
                                                                {(it.amount / 100).toFixed(2)}
                                                            </motion.span>
                                                        </div>
                                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                            {it.currency}
                                                        </div>
                                                    </div>
                                                    
                                                    <motion.div
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                        whileHover={{ x: 3 }}
                                                    >
                                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Status indicator dot */}
                                            <div className="absolute top-4 left-4 flex items-center gap-1.5">
                                                <motion.div
                                                    animate={{ 
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.7, 1, 0.7]
                                                    }}
                                                    transition={{ 
                                                        duration: 2, 
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className={cn("w-2 h-2 rounded-full", config.dotColor)}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Load More Button */}
            {subscriptionsHasMore && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center pt-4"
                >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            disabled={subscriptionsLoadingMore}
                            onClick={() => loadMoreSubscriptions()}
                            className="w-full sm:w-auto gap-2 px-6 py-5 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            {subscriptionsLoadingMore ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="font-semibold">Loading more...</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="font-semibold">Load More Records</span>
                                </>
                            )}
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}