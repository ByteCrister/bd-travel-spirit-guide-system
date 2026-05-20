"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    Key,
    AlertCircle,
} from "lucide-react";
import { useResetRequestsStore } from "@/store/reset-requests.store";
import DenyDialog from "./DenyDialog";
import UpdatePasswordDialog from "./UpdatePasswordDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { REQUEST_STATUS } from "@/constants/employee/reset-password-request.const";

interface RequestDetailsDrawerProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    requestId: string;
}

/* -------------------------------------------------------------------------- */
/*  Neumorphic design tokens & helpers                                        */
/* -------------------------------------------------------------------------- */

// Surface colors
const surfaceLight = "#E7E5E4";
const surfaceDark = "#2A2A2A";
const shadowDarkLight = "#B8B5B4";
const shadowLightLight = "#FFFFFF";
const shadowDarkDark = "#1A1A1A";
const shadowLightDark = "#3E3E3E";

/** Reusable neumorphic card with pressed/raised effect */
function NeumorphicCard({
    children,
    className = "",
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`rounded-2xl border-0 bg-[${surfaceLight}] p-4
        shadow-[6px_6px_12px_${shadowDarkLight},-6px_-6px_12px_${shadowLightLight}]
        dark:bg-[${surfaceDark}] dark:shadow-[6px_6px_12px_${shadowDarkDark},-6px_-6px_12px_${shadowLightDark}]
        transition-all duration-200 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

/** InfoCard using neumorphic card wrapper */
function InfoCard({
    icon,
    label,
    children,
    className = "",
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <NeumorphicCard className={`flex items-start gap-4 ${className}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7E5E4] shadow-[inset_2px_2px_4px_rgba(184,181,180,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:bg-[#2A2A2A] dark:shadow-[inset_3px_3px_6px_#1A1A1A,inset_-3px_-3px_6px_#3E3E3E]">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1E2938]/70 dark:text-white/60">
                    {label}
                </p>
                <div className="mt-1 font-medium text-[#1E2938] dark:text-white">
                    {children}
                </div>
            </div>
        </NeumorphicCard>
    );
}

/** Section title with neumorphic accent */
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006666]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1E2938]/80 dark:text-white/70">
                {children}
            </h3>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function RequestDetailsDrawer({
    open,
    onOpenChange,
    requestId,
}: RequestDetailsDrawerProps) {
    const { fetchById, denyRequest, updatePassword, entities, isFetchingById, error } =
        useResetRequestsStore();

    const [denyOpen, setDenyOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);

    useEffect(() => {
        if (open) fetchById(requestId).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, requestId]);

    const dto = entities[requestId]?.attributes;

    /* ---------- status config ---------- */
    const statusConfig = (() => {
        if (!dto) return null;
        switch (dto.status) {
            case REQUEST_STATUS.PENDING:
                return {
                    icon: Clock,
                    badge: (
                        <Badge className="gap-1.5 border-0 bg-[#FE9900]/15 text-[#FE9900] dark:bg-[#FE9900]/30 dark:text-[#FE9900]">
                            <Clock className="h-3.5 w-3.5" />
                            Pending Review
                        </Badge>
                    ),
                };
            case REQUEST_STATUS.DENIED:
                return {
                    icon: XCircle,
                    badge: (
                        <Badge className="gap-1.5 border-0 bg-[#FF2157]/15 text-[#FF2157] dark:bg-[#FF2157]/30 dark:text-[#FF2157]">
                            <XCircle className="h-3.5 w-3.5" />
                            Denied
                        </Badge>
                    ),
                };
            default:
                return {
                    icon: CheckCircle2,
                    badge: (
                        <Badge className="gap-1.5 border-0 bg-[#00A63D]/15 text-[#00A63D] dark:bg-[#00A63D]/30 dark:text-[#00A63D]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Fulfilled
                        </Badge>
                    ),
                };
        }
    })();

    /* ---------- loading ---------- */
    if (isFetchingById && !dto) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="font-[Space_Mono] sm:max-w-2xl bg-[#E7E5E4] dark:bg-[#1E1E1E] border-0 shadow-[8px_8px_16px_rgba(184,181,180,0.5),-8px_-8px_16px_rgba(255,255,255,0.7)] dark:shadow-[12px_12px_24px_#0D0D0D,-12px_-12px_24px_#3A3A3A]">
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-10 w-10 animate-spin text-[#006666]" />
                        <p className="mt-6 text-sm font-medium text-[#1E2938]/70 dark:text-white/70">
                            Loading request details…
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    /* ---------- error ---------- */
    if (error && !dto) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="font-[Space_Mono] sm:max-w-2xl bg-[#E7E5E4] dark:bg-[#1E1E1E] border-0 shadow-[12px_12px_24px_#B8B5B4,-12px_-12px_24px_#FFFFFF] dark:shadow-[12px_12px_24px_#0D0D0D,-12px_-12px_24px_#3A3A3A]">
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF2157]/10 dark:bg-[#FF2157]/20">
                            <AlertCircle className="h-8 w-8 text-[#FF2157]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1E2938] dark:text-white">
                            Failed to fetch request
                        </h3>
                        <p className="mt-2 text-sm text-[#1E2938]/70 dark:text-white/70">
                            {error.message}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!dto) return null;

    /* ---------- data ---------- */
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="font-[Space_Mono] max-h-[90vh] overflow-y-auto border-0 bg-[#E7E5E4] dark:bg-[#1E1E1E] sm:max-w-2xl shadow-[4px_4px_8px_rgba(184,181,180,0.35),-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.25),-6px_-6px_12px_rgba(60,60,60,0.35)]">
                {/* Header */}
                <DialogHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-[#1E2938] dark:text-white">
                                Request Details
                            </DialogTitle>
                            <p className="text-sm text-[#1E2938]/60 dark:text-white/50">
                                Review and manage this password reset request
                            </p>
                        </div>
                        {statusConfig?.badge}
                    </div>
                </DialogHeader>

                {/* Body */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6 space-y-8 pb-2"
                >
                    {/* Requester Information */}
                    <section className="space-y-4">
                        <SectionTitle>Requester Information</SectionTitle>
                        <div className="grid gap-3">
                            <InfoCard
                                icon={<Mail className="h-5 w-5 text-[#006666] dark:text-[#006666]" />}
                                label="Email Address"
                            >
                                <span className="truncate">{dto.requesterEmail}</span>
                            </InfoCard>
                            <InfoCard
                                icon={<User className="h-5 w-5 text-[#006666] dark:text-[#006666]" />}
                                label="Full Name"
                            >
                                {dto.requesterName || (
                                    <span className="italic text-[#1E2938]/40 dark:text-white/40">
                                        Not provided
                                    </span>
                                )}
                            </InfoCard>
                            <InfoCard
                                icon={<Phone className="h-5 w-5 text-[#006666] dark:text-[#006666]" />}
                                label="Mobile Number"
                            >
                                {dto.requesterMobile || (
                                    <span className="italic text-[#1E2938]/40 dark:text-white/40">
                                        Not provided
                                    </span>
                                )}
                            </InfoCard>
                        </div>
                    </section>

                    <Separator className="bg-transparent h-px shadow-[inset_0_1px_1px_rgba(184,181,180,0.3)] dark:shadow-[inset_0_1px_2px_#3E3E3E]" />

                    {/* Request Details */}
                    <section className="space-y-4">
                        <SectionTitle>Request Details</SectionTitle>
                        <div className="grid gap-3">
                            <InfoCard
                                icon={<Calendar className="h-5 w-5 text-[#006666] dark:text-[#006666]" />}
                                label="Requested At"
                            >
                                {new Date(dto.requestedAt).toLocaleString()}
                            </InfoCard>

                            {dto.description && (
                                <InfoCard
                                    icon={<FileText className="h-5 w-5 text-[#006666] dark:text-[#006666]" />}
                                    label="Description"
                                >
                                    <span className="text-sm font-normal leading-relaxed">
                                        {dto.description}
                                    </span>
                                </InfoCard>
                            )}

                            {dto.reason && (
                                <NeumorphicCard className="!bg-[#FF2157]/5 dark:!bg-[#FF2157]/10 border-0 shadow-[inset_2px_2px_4px_rgba(184,181,180,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] dark:shadow-[inset_3px_3px_6px_#1A1A1A,inset_-3px_-3px_6px_#3E3E3E]">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF2157]/10 dark:bg-[#FF2157]/20">
                                            <AlertCircle className="h-5 w-5 text-[#FF2157]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#FF2157]">
                                                Denial Reason
                                            </p>
                                            <p className="mt-1 text-sm font-medium leading-relaxed text-[#1E2938] dark:text-white/90">
                                                {dto.reason}
                                            </p>
                                        </div>
                                    </div>
                                </NeumorphicCard>
                            )}
                        </div>
                    </section>

                    <Separator className="bg-transparent h-px shadow-[inset_0_1px_2px_#B8B5B4] dark:shadow-[inset_0_1px_2px_#3E3E3E]" />

                    {/* Actions */}
                    <section className="space-y-4">
                        <SectionTitle>Actions</SectionTitle>
                        <AnimatePresence mode="wait">
                            {dto.status === "pending" ? (
                                <motion.div
                                    key="pending"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-wrap gap-3"
                                >
                                    <Button
                                        variant="destructive"
                                        onClick={() => setDenyOpen(true)}
                                        className="gap-2 bg-[#E7E5E4] text-[#FF2157] border-0 shadow-[2px_2px_4px_rgba(184,181,180,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)] hover:shadow-[inset_4px_4px_8px_#B8B5B4,inset_-4px_-4px_8px_#FFFFFF] dark:bg-[#2A2A2A] dark:text-[#FF2157] dark:shadow-[4px_4px_8px_#1A1A1A,-4px_-4px_8px_#3E3E3E] dark:hover:shadow-[inset_4px_4px_8px_#1A1A1A,inset_-4px_-4px_8px_#3E3E3E] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Deny Request
                                    </Button>
                                    <Button
                                        onClick={() => setUpdateOpen(true)}
                                        className="gap-2 bg-[#E7E5E4] text-[#006666] border-0 shadow-[2px_2px_4px_rgba(184,181,180,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)] hover:shadow-[inset_4px_4px_8px_#B8B5B4,inset_-4px_-4px_8px_#FFFFFF] dark:bg-[#2A2A2A] dark:text-[#006666] dark:shadow-[4px_4px_8px_#1A1A1A,-4px_-4px_8px_#3E3E3E] dark:hover:shadow-[inset_4px_4px_8px_#1A1A1A,inset_-4px_-4px_8px_#3E3E3E] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50"
                                    >
                                        <Key className="h-4 w-4" />
                                        Update Password
                                    </Button>
                                </motion.div>
                            ) : dto.status === "denied" ? (
                                <motion.div
                                    key="denied"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <Button
                                        onClick={() => setUpdateOpen(true)}
                                        className="gap-2 bg-[#E7E5E4] text-[#006666] border-0 shadow-[2px_2px_4px_rgba(184,181,180,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)] hover:shadow-[inset_4px_4px_8px_#B8B5B4,inset_-4px_-4px_8px_#FFFFFF] dark:bg-[#2A2A2A] dark:text-[#006666] dark:shadow-[4px_4px_8px_#1A1A1A,-4px_-4px_8px_#3E3E3E] dark:hover:shadow-[inset_4px_4px_8px_#1A1A1A,inset_-4px_-4px_8px_#3E3E3E] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50"
                                    >
                                        <Key className="h-4 w-4" />
                                        Update Password
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="fulfilled"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 rounded-2xl bg-[#00A63D]/10 p-4 shadow-[inset_2px_2px_4px_rgba(184,181,180,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:bg-[#00A63D]/20 dark:shadow-[inset_3px_3px_6px_#1A1A1A,inset_-3px_-3px_6px_#3E3E3E]"
                                >
                                    <CheckCircle2 className="h-5 w-5 text-[#00A63D]" />
                                    <p className="text-sm font-medium text-[#1E2938] dark:text-white/90">
                                        This request has been fulfilled.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </motion.div>

                {/* Dialogs */}
                <DenyDialog
                    open={denyOpen}
                    onOpenChange={setDenyOpen}
                    onConfirm={(reason) =>
                        denyRequest({ requestId: dto._id, reason }).then(() => {
                            setDenyOpen(false);
                            onOpenChange(false);
                        })
                    }
                />
                <UpdatePasswordDialog
                    open={updateOpen}
                    onOpenChange={setUpdateOpen}
                    onConfirm={(newPassword, notify) =>
                        updatePassword({
                            requestId: dto._id,
                            newPassword,
                            notifyRequester: notify,
                        }).then(() => {
                            setUpdateOpen(false);
                            onOpenChange(false);
                        })
                    }
                />
            </DialogContent>
        </Dialog>
    );
}