"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Key,
    Loader2,
    AlertCircle,
    Mail,
    CheckCircle2,
    Shield,
    RefreshCw,
} from "lucide-react";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";

const PASSWORD_LENGTH = 10;

interface UpdatePasswordDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onConfirm: (newPassword: string, notify: boolean) => Promise<void>;
}

export default function UpdatePasswordDialog({
    open,
    onOpenChange,
    onConfirm,
}: UpdatePasswordDialogProps) {
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [notifyRequester, setNotifyRequester] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
        }
    }, [open]);

    const handleGenerateNew = () => {
        setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
        setError(null);
    };

    const hasMinLength = generatedPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(generatedPassword);
    const hasLowerCase = /[a-z]/.test(generatedPassword);
    const hasNumber = /[0-9]/.test(generatedPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(generatedPassword);

    const submit = async () => {
        if (!generatedPassword) {
            setError("Please generate a password first");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await onConfirm(generatedPassword, notifyRequester);
            setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
            setNotifyRequester(true);
        } catch{
            setError("Failed to update password. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!submitting) {
            setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
            setNotifyRequester(true);
            setError(null);
            onOpenChange(false);
        }
    };

    // Neumorphic shadow classes (light/dark)
    const neumorphicContainer =
        "bg-[#E7E5E4] dark:bg-gray-800 border-0 " +
        "shadow-[6px_6px_12px_#b8b6b5,-6px_-6px_12px_#ffffff] " +
        "dark:shadow-[6px_6px_12px_#1a1a1a,-6px_-6px_12px_#2a2a2a]";
    const neumorphicInput =
        "bg-[#E7E5E4] dark:bg-gray-700 border-0 " +
        "shadow-[inset_4px_4px_8px_#b8b6b5,inset_-4px_-4px_8px_#ffffff] " +
        "dark:shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#2a2a2a] " +
        "focus:shadow-[inset_2px_2px_4px_#b8b6b5,inset_-2px_-2px_4px_#ffffff] " +
        "dark:focus:shadow-[inset_2px_2px_4px_#1a1a1a,inset_-2px_-2px_4px_#2a2a2a]";
    const neumorphicBtn =
        "bg-[#E7E5E4] dark:bg-gray-800 border-0 " +
        "shadow-[4px_4px_8px_#b8b6b5,-4px_-4px_8px_#ffffff] " +
        "dark:shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#2a2a2a] " +
        "active:shadow-[inset_2px_2px_4px_#b8b6b5,inset_-2px_-2px_4px_#ffffff] " +
        "dark:active:shadow-[inset_2px_2px_4px_#1a1a1a,inset_-2px_-2px_4px_#2a2a2a] " +
        "disabled:opacity-60 disabled:shadow-none";
    const neumorphicBadge =
        "bg-[#E7E5E4] dark:bg-gray-700 " +
        "shadow-[inset_1px_1px_3px_#b8b6b5,inset_-1px_-1px_3px_#ffffff] " +
        "dark:shadow-[inset_1px_1px_3px_#1a1a1a,inset_-1px_-1px_3px_#2a2a2a]";

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent
                className={`sm:max-w-lg w-full max-h-[90vh] overflow-auto p-6 ${neumorphicContainer} rounded-2xl`}
            >
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="relative"
                        >
                            <div
                                className={`p-3 rounded-2xl ${neumorphicBadge} text-primary`}
                            >
                                <Key className="w-7 h-7" />
                            </div>
                        </motion.div>
                        <div className="flex-1 space-y-1">
                            <DialogTitle className="text-2xl font-bold text-[#1E2938] dark:text-gray-100 font-heading">
                                Update Password
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[#1E2938]/70 dark:text-gray-400">
                                A secure password has been generated for you
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {submitting ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-16 gap-6"
                        >
                            <div className="relative">
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-semibold text-[#1E2938] dark:text-gray-200">
                                    Updating password...
                                </p>
                                <p className="text-sm text-[#1E2938]/60 dark:text-gray-400">
                                    {notifyRequester
                                        ? "Sending notification to requester"
                                        : "Completing update"}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6 py-4"
                        >
                            {/* Generated Password Display */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-3"
                            >
                                <Label className="text-sm font-semibold text-[#1E2938] dark:text-gray-200 flex items-center gap-2">
                                    Generated Password
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
                                        *
                                    </span>
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        type="password"
                                        value={generatedPassword}
                                        className={`h-12 font-mono ${neumorphicInput} text-[#1E2938] dark:text-gray-100 placeholder:text-[#1E2938]/40`}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleGenerateNew}
                                        variant="ghost"
                                        className={`h-12 px-4 ${neumorphicBtn} text-primary hover:text-primary`}
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Password Strength Indicators */}
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className={`p-4 rounded-xl ${neumorphicBadge} space-y-3`}
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <Shield className="w-3.5 h-3.5 text-primary" />
                                        <span className="font-semibold text-[#1E2938] dark:text-gray-200">
                                            Password Strength
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            {
                                                condition: hasMinLength,
                                                label: "8+ characters",
                                            },
                                            {
                                                condition: hasUpperCase,
                                                label: "Uppercase",
                                            },
                                            {
                                                condition: hasLowerCase,
                                                label: "Lowercase",
                                            },
                                            {
                                                condition: hasNumber,
                                                label: "Number",
                                            },
                                            {
                                                condition: hasSpecial,
                                                label: "Special char",
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className={`flex items-center gap-1.5 text-xs ${item.condition
                                                        ? "text-success"
                                                        : "text-[#1E2938]/40 dark:text-gray-500"
                                                    }`}
                                            >
                                                {item.condition ? (
                                                    <CheckCircle2 className="w-3 h-3" />
                                                ) : (
                                                    <div className="w-3 h-3 rounded-full border-2 border-current" />
                                                )}
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Notification Toggle */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div
                                    className={`flex items-start gap-3 p-4 rounded-xl ${neumorphicBadge}`}
                                >
                                    <Checkbox
                                        id="notify"
                                        checked={notifyRequester}
                                        onCheckedChange={(checked) =>
                                            setNotifyRequester(checked as boolean)
                                        }
                                        className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-[#1E2938]/20 dark:border-gray-500"
                                    />
                                    <div className="flex-1">
                                        <label
                                            htmlFor="notify"
                                            className="text-sm font-semibold cursor-pointer flex items-center gap-2 text-[#1E2938] dark:text-gray-200"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Notify requester via email
                                        </label>
                                        <p className="text-xs text-[#1E2938]/60 dark:text-gray-400 mt-1 leading-relaxed">
                                            Send the new password securely to the requester&apos;s
                                            registered email address
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div
                                        className={`flex items-center gap-3 p-4 rounded-xl ${neumorphicBadge} border-2 border-danger`}
                                    >
                                        <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                                        <p className="text-sm font-medium text-danger">
                                            {error}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={handleCancel}
                                    disabled={submitting}
                                    className={`${neumorphicBtn} text-[#1E2938] dark:text-gray-200`}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submit}
                                    disabled={!generatedPassword || submitting}
                                    className={`gap-2 ${neumorphicBtn} bg-primary text-white hover:bg-primary active:bg-primary disabled:opacity-60`}
                                >
                                    <Key className="w-4 h-4" />
                                    Update Password
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}