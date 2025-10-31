'use client';

import React from "react";
import { motion } from "framer-motion";
import { useGuideOverviewStore } from "@/store/useGuideOverviewStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Phone, User, Shield, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OwnerCard() {
    const { draft, patchField, markDirty } = useGuideOverviewStore();

    if (!draft) return null;

    const inputVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <CardHeader className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 pb-8">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <User className="size-6 text-white" />
                        </motion.div>
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                Owner Information
                                <Sparkles className="size-4 text-yellow-300" />
                            </CardTitle>
                            <p className="text-sm text-white/80 mt-0.5">Manage your account details</p>
                        </div>
                    </div>
                </motion.div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl" />
            </CardHeader>

            <CardContent className="space-y-6 pt-8 px-6 pb-6">
                {/* Name Field */}
                <motion.div
                    className="space-y-2.5"
                    variants={inputVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.1 }}
                >
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Full Name
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                            <div className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300",
                                draft.owner.name.dirty
                                    ? "bg-amber-100 dark:bg-amber-900/30"
                                    : "bg-slate-100 dark:bg-slate-800 group-focus-within:bg-blue-100 dark:group-focus-within:bg-blue-900/30"
                            )}>
                                <User className={cn(
                                    "size-4 transition-colors duration-300",
                                    draft.owner.name.dirty
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-slate-500 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
                                )} />
                            </div>
                        </div>
                        <Input
                            className={cn(
                                "pl-14 pr-12 h-12 text-base border-2 rounded-xl transition-all duration-300 bg-white dark:bg-slate-900",
                                "focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500",
                                draft.owner.name.dirty && "border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 ring-4 ring-amber-500/20"
                            )}
                            value={draft.owner.name.value}
                            onChange={(e) =>
                                patchField("owner", {
                                    name: { ...draft.owner.name, value: e.target.value, dirty: true },
                                })
                            }
                            onBlur={() => markDirty("owner.name")}
                            placeholder="Enter your full name"
                        />
                        {draft.owner.name.dirty && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                                    <CheckCircle className="size-5 text-white" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Email Field (Read-only) */}
                <motion.div
                    className="space-y-2.5"
                    variants={inputVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2 }}
                >
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Email Address
                        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                            <Shield className="size-3" />
                            Protected
                        </div>
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Mail className="size-4 text-slate-400" />
                            </div>
                        </div>
                        <Input
                            className="pl-14 h-12 text-base border-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            value={draft.owner.email}
                            disabled
                            readOnly
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <Shield className="size-4 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </div>
                    <motion.div
                        className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pl-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="w-1 h-1 rounded-full bg-slate-400 inline-block" />
                        <span>This field is locked for security purposes</span>
                    </motion.div>

                </motion.div>

                {/* Phone Field */}
                <motion.div
                    className="space-y-2.5"
                    variants={inputVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.3 }}
                >
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Phone Number
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                            <div className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300",
                                draft.owner.phone.dirty
                                    ? "bg-amber-100 dark:bg-amber-900/30"
                                    : "bg-slate-100 dark:bg-slate-800 group-focus-within:bg-blue-100 dark:group-focus-within:bg-blue-900/30"
                            )}>
                                <Phone className={cn(
                                    "size-4 transition-colors duration-300",
                                    draft.owner.phone.dirty
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-slate-500 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
                                )} />
                            </div>
                        </div>
                        <Input
                            className={cn(
                                "pl-14 pr-12 h-12 text-base border-2 rounded-xl transition-all duration-300 bg-white dark:bg-slate-900",
                                "focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500",
                                draft.owner.phone.dirty && "border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 ring-4 ring-amber-500/20"
                            )}
                            value={draft.owner.phone.value ?? ""}
                            onChange={(e) =>
                                patchField("owner", {
                                    phone: { ...draft.owner.phone, value: e.target.value, dirty: true },
                                })
                            }
                            onBlur={() => markDirty("owner.phone")}
                            placeholder="Enter your phone number"
                            type="tel"
                        />
                        {draft.owner.phone.dirty && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                                    <CheckCircle className="size-5 text-white" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </CardContent>
        </Card>
    );
}