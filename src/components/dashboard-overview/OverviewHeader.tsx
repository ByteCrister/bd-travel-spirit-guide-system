// components/dashboard-overview/OverviewHeader.tsx
'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Editable } from "@/types/overview.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Building2, Crown, AlertTriangle } from "lucide-react";
import { GUIDE_STATUS, GuideStatus } from "@/constants/guide.const";
import { useGuideOverviewStore } from "@/store/useGuideOverviewStore";
import { toast } from "sonner";

type Props = {
    companyName: Editable<string>;
    status: Editable<GuideStatus>;
    isActive?: boolean;
    isSuspended?: boolean;
    hasActiveSubscription?: boolean;
};

export default function OverviewHeader({ companyName, status, isActive, isSuspended, hasActiveSubscription }: Props) {
    const [copied, setCopied] = useState(false);
    const draft = useGuideOverviewStore((state) => state.draft);

    const copyId = () => {
        const companyId = draft?.companyId || "";
        if (!companyId) {
            toast.error("Company ID not available");
            return;
        }
        navigator.clipboard.writeText(companyId);
        setCopied(true);
        toast.success("Company ID copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusVariant = (statusValue: GuideStatus) => {
        switch (statusValue) {
            case GUIDE_STATUS.APPROVED:
                return "default";
            case GUIDE_STATUS.PENDING:
                return "secondary";
            case GUIDE_STATUS.REJECTED:
                return "destructive";
            default:
                return "outline";
        }
    };

    return (
        <motion.div
            className="flex flex-col gap-6 pb-4 border-b border-border/40"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                            <Building2 className="size-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                            <motion.h1
                                className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                {companyName.value || "Untitled Guide"}
                            </motion.h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Badge variant={isActive ? "default" : "outline"} className="px-3 py-1 gap-1.5">
                                {isActive ? "✓ Active" : "Inactive"}
                            </Badge>
                        </motion.div>
                        {isSuspended && (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Badge variant="destructive" className="px-3 py-1 gap-1.5">
                                    <AlertTriangle className="size-3" />
                                    Suspended
                                </Badge>
                            </motion.div>
                        )}
                        {hasActiveSubscription && (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Badge variant="secondary" className="px-3 py-1 gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-foreground border-yellow-500/30">
                                    <Crown className="size-3 text-yellow-600" />
                                    Premium
                                </Badge>
                            </motion.div>
                        )}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Badge variant={getStatusVariant(status.value)} className="px-3 py-1 capitalize">
                                {status.value}
                            </Badge>
                        </motion.div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            onClick={copyId}
                            className="gap-2 shadow-sm hover:shadow-md transition-shadow"
                            aria-label="Copy tour id"
                        >
                            {copied ? (
                                <>
                                    <Check className="size-4 text-green-500" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="size-4" />
                                    Copy Company ID
                                </>
                            )}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
