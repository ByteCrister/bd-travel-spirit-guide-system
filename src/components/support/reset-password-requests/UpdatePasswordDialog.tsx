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

/* ─── Constants ──────────────────────────────────────────────────────────── */
const PASSWORD_LENGTH = 10;

/* ─── Neumorphic style tokens ────────────────────────────────────────────── */
const N = {
  surface: "bg-[#E7E5E4] dark:bg-[#2A2A2A]",
  text: "text-[#1E2938] dark:text-white",
  textMuted: "text-[#1E2938]/70 dark:text-white/60",
  raisedLg:
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
  raisedSm:
    "shadow-[0_4px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_8px_rgba(0,0,0,0.2)]",
  raisedXs:
    "shadow-[0_4px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_4px_rgba(0,0,0,0.2)]",
  pressedMd:
    "[box-shadow:inset_4px_4px_8px_#cac8c7,inset_-4px_-4px_8px_#ffffff] dark:[box-shadow:inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#3a3a3a]",
  pressedSm:
    "[box-shadow:inset_2px_2px_4px_#cac8c7,inset_-2px_-2px_4px_#ffffff] dark:[box-shadow:inset_2px_2px_4px_#1a1a1a,inset_-2px_-2px_4px_#3a3a3a]",
  font: "font-['Space_Mono']",
} as const;

/* ─── Password strength checks ───────────────────────────────────────────── */
const getStrengthChecks = (password: string) => [
  { label: "8+ characters", pass: password.length >= 8 },
  { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
  { label: "Lowercase letter", pass: /[a-z]/.test(password) },
  { label: "Number", pass: /[0-9]/.test(password) },
  { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
];

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface UpdatePasswordDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (newPassword: string, notify: boolean) => Promise<void>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
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
      setNotifyRequester(true);
      setError(null);
    }
  }, [open]);

  const handleGenerateNew = () => {
    setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
    setError(null);
  };

  const submit = async () => {
    if (!generatedPassword) {
      setError("Please generate a password first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(generatedPassword, notifyRequester);
      setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
      setNotifyRequester(true);
    } catch {
      setError("Failed to update password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setGeneratedPassword(generateStrongPassword(PASSWORD_LENGTH));
    setNotifyRequester(true);
    setError(null);
    onOpenChange(false);
  };

  const strengthChecks = getStrengthChecks(generatedPassword);
  const passedCount = strengthChecks.filter((c) => c.pass).length;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-lg w-full p-0 bg-transparent border-none shadow-none">
        <div
          className={`
            relative w-full rounded-2xl p-6 sm:p-8 overflow-auto max-h-[90vh]
            ${N.surface} ${N.raisedLg} ${N.font}
          `}
        >
          {/* ── Header ── */}
          <DialogHeader className="mb-6">
            <div className="flex items-start gap-4">
              {/* Icon bubble */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`
                  shrink-0 h-14 w-14 rounded-2xl
                  ${N.surface} ${N.pressedSm}
                  flex items-center justify-center
                `}
              >
                <Key className="w-7 h-7 text-[#006666]" aria-hidden />
              </motion.div>

              <div className="flex-1 min-w-0 space-y-1 pt-1">
                <DialogTitle className={`text-2xl font-bold leading-tight ${N.text}`}>
                  Update Password
                </DialogTitle>
                <DialogDescription className={`text-sm ${N.textMuted}`}>
                  A secure password has been generated for the requester.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* ── Body ── */}
          <AnimatePresence mode="wait">
            {submitting ? (
              /* Loading */
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-center justify-center py-16 gap-5"
              >
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-[#006666]" />
                  <div className="absolute inset-0 blur-2xl bg-[#006666]/20 animate-pulse rounded-full" />
                </div>
                <div className="text-center space-y-1">
                  <p className={`font-semibold ${N.text}`}>Updating password…</p>
                  <p className={`text-sm ${N.textMuted}`}>
                    {notifyRequester ? "Sending notification email" : "Please wait"}
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Form */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                {/* Password field */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="space-y-2.5"
                >
                  <Label className={`text-sm font-semibold flex items-center gap-2 ${N.text}`}>
                    Generated Password
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white bg-[#006666]">
                      *
                    </span>
                  </Label>

                  <div className="flex gap-2">
                    <Input
                      readOnly
                      type="password"
                      value={generatedPassword}
                      aria-label="Generated password"
                      className={`
                        h-12 flex-1 font-mono border-none rounded-xl
                        ${N.surface} ${N.pressedMd}
                        ${N.text} placeholder:text-[#1E2938]/40 dark:placeholder:text-white/30
                        focus-visible:outline-none transition-shadow duration-200
                      `}
                    />
                    <Button
                      type="button"
                      onClick={handleGenerateNew}
                      variant="ghost"
                      aria-label="Generate new password"
                      className={`
                        h-12 w-12 shrink-0 rounded-xl border-none
                        ${N.surface} ${N.raisedSm}
                        hover:${N.raisedXs} active:${N.pressedSm}
                        text-[#006666] transition-all duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]
                      `}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>

                {/* Strength indicators */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.14 }}
                  className={`p-4 rounded-xl ${N.surface} ${N.pressedSm} space-y-3`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="w-3.5 h-3.5 text-[#006666]" />
                      <span className={`font-semibold ${N.text}`}>Password Strength</span>
                    </div>
                    {/* Visual bar */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${
                            i <= passedCount
                              ? passedCount <= 2
                                ? "bg-[#FF2157]"
                                : passedCount <= 4
                                ? "bg-[#FE9900]"
                                : "bg-[#00A63D]"
                              : "bg-[#1E2938]/10 dark:bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Check items */}
                  <div className="grid grid-cols-2 gap-2">
                    {strengthChecks.map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          item.pass
                            ? "text-[#00A63D]"
                            : N.textMuted
                        }`}
                      >
                        {item.pass ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-current shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Notification toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`flex items-start gap-3 p-4 rounded-xl ${N.surface} ${N.pressedSm}`}
                >
                  <Checkbox
                    id="notify"
                    checked={notifyRequester}
                    onCheckedChange={(checked) => setNotifyRequester(checked as boolean)}
                    className="mt-1 border-2 border-[#1E2938]/20 dark:border-white/30 data-[state=checked]:bg-[#006666] data-[state=checked]:border-[#006666]"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor="notify"
                      className={`text-sm font-semibold flex items-center gap-2 cursor-pointer ${N.text}`}
                    >
                      <Mail className="w-4 h-4 text-[#006666]" />
                      Notify requester via email
                    </label>
                    <p className={`text-xs leading-relaxed ${N.textMuted}`}>
                      Send the new password to the requester&apos;s registered email address.
                    </p>
                  </div>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        role="alert"
                        className={`
                          flex items-center gap-3 p-4 rounded-xl border-l-4 border-[#FF2157]
                          ${N.surface} ${N.raisedSm}
                        `}
                      >
                        <AlertCircle className="w-5 h-5 shrink-0 text-[#FF2157]" />
                        <p className={`text-sm font-medium ${N.text}`}>{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={submitting}
                    className={`
                      h-11 rounded-xl border-none font-medium
                      ${N.surface} ${N.text} ${N.raisedSm}
                      hover:${N.raisedXs} active:${N.pressedSm}
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2
                    `}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={submit}
                    disabled={!generatedPassword || submitting}
                    className={`
                      h-11 rounded-xl border-none font-semibold gap-2
                      bg-[#006666] text-white
                      shadow-[4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff]
                      hover:shadow-[2px_2px_4px_#cac8c7,-2px_-2px_4px_#ffffff]
                      active:[box-shadow:inset_4px_4px_8px_rgba(0,0,0,0.2)]
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/60 focus-visible:ring-offset-2
                      disabled:opacity-60 disabled:pointer-events-none
                    `}
                  >
                    <Key className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}