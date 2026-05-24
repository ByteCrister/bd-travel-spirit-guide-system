"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, XCircle, Loader2, ShieldAlert } from "lucide-react";

/* ─── Neumorphic style tokens ────────────────────────────────────────────── */
const N = {
  surface: "bg-[#E7E5E4] dark:bg-[#2A2A2A]",
  text: "text-[#1E2938] dark:text-white",
  textMuted: "text-[#1E2938]/70 dark:text-white/60",
  raised:
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
  raisedSm:
    "shadow-[4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#3a3a3a]",
  raisedXs:
    "shadow-[2px_2px_4px_#cac8c7,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#1a1a1a,-2px_-2px_4px_#3a3a3a]",
  pressedMd:
    "[box-shadow:inset_4px_4px_8px_#cac8c7,inset_-4px_-4px_8px_#ffffff] dark:[box-shadow:inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#3a3a3a]",
  pressedLg:
    "[box-shadow:inset_6px_6px_12px_#cac8c7,inset_-6px_-6px_12px_#ffffff] dark:[box-shadow:inset_6px_6px_12px_#1a1a1a,inset_-6px_-6px_12px_#3a3a3a]",
  font: "font-['Space_Mono']",
} as const;

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface DenyDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function DenyDialog({
  open,
  onOpenChange,
  onConfirm,
}: DenyDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_CHARS = 500;

  const submit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for denial.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason);
      setReason("");
    } catch {
      setError("Failed to deny request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setReason("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      {/* Transparent wrapper so we control the card styling entirely */}
      <DialogContent className="sm:max-w-lg w-full p-0 bg-transparent border-none shadow-none">
        <div
          className={`
            relative w-full rounded-2xl p-6 sm:p-8
            ${N.surface} ${N.raised} ${N.font}
          `}
        >
          {/* ── Header ── */}
          <DialogHeader className="mb-6">
            <div className="flex items-start gap-4">
              {/* Icon bubble */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`
                  shrink-0 h-14 w-14 rounded-full
                  ${N.surface} ${N.raisedSm}
                  flex items-center justify-center
                `}
              >
                <XCircle className="w-7 h-7 text-[#FF2157]" aria-hidden />
              </motion.div>

              <div className="flex-1 min-w-0 space-y-1 pt-1">
                <DialogTitle className="text-2xl font-bold leading-tight text-[#FF2157]">
                  Deny Request
                </DialogTitle>
                <DialogDescription className={`text-sm ${N.textMuted}`}>
                  The requester will be notified via email with your reason.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* ── Body ── */}
          <AnimatePresence mode="wait">
            {submitting ? (
              /* Loading state */
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-center justify-center py-16 gap-5"
              >
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-[#FF2157]" />
                  <div className="absolute inset-0 blur-2xl bg-[#FF2157]/20 animate-pulse rounded-full" />
                </div>
                <div className="text-center space-y-1">
                  <p className={`font-semibold ${N.text}`}>Processing denial…</p>
                  <p className={`text-sm ${N.textMuted}`}>Notifying the requester</p>
                </div>
              </motion.div>
            ) : (
              /* Form state */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                {/* Warning banner */}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 }}
                  className={`
                    flex items-start gap-3 p-4 rounded-xl border-l-4 border-[#FE9900]
                    ${N.surface} ${N.raisedSm}
                  `}
                >
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-[#FE9900]" />
                  <div className="space-y-0.5">
                    <p className={`text-sm font-semibold ${N.text}`}>Important Notice</p>
                    <p className={`text-xs leading-relaxed ${N.textMuted}`}>
                      Be clear and professional — this message goes directly to the requester.
                    </p>
                  </div>
                </motion.div>

                {/* Textarea */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="space-y-2.5"
                >
                  <Label
                    htmlFor="deny-reason"
                    className={`text-sm font-semibold flex items-center gap-2 ${N.text}`}
                  >
                    Reason for denial
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white bg-[#FF2157]">
                      *
                    </span>
                  </Label>

                  <div className="relative">
                    <Textarea
                      id="deny-reason"
                      placeholder="E.g., Request does not meet security verification requirements…"
                      value={reason}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_CHARS) {
                          setReason(e.target.value);
                          setError(null);
                        }
                      }}
                      rows={5}
                      maxLength={MAX_CHARS}
                      aria-required
                      aria-describedby="deny-hint deny-count"
                      className={`
                        resize-none w-full rounded-xl border-none
                        ${N.surface} ${N.pressedMd}
                        focus:outline-none focus:${N.pressedLg}
                        px-4 py-3 pr-16 text-sm ${N.text}
                        placeholder:text-[#1E2938]/40 dark:placeholder:text-white/30
                        transition-shadow duration-200
                      `}
                    />
                    {/* Char counter */}
                    <span
                      id="deny-count"
                      aria-live="polite"
                      className={`
                        absolute bottom-3 right-4 text-xs font-mono select-none
                        ${reason.length >= MAX_CHARS ? "text-[#FF2157]" : N.textMuted}
                      `}
                    >
                      {reason.length}/{MAX_CHARS}
                    </span>
                  </div>

                  <p id="deny-hint" className={`flex items-center gap-1.5 text-xs ${N.textMuted}`}>
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    This message will be sent directly to the requester.
                  </p>
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
                        className={`
                          flex items-center gap-3 p-4 rounded-xl border-l-4 border-[#FF2157]
                          ${N.surface} ${N.raisedSm}
                        `}
                        role="alert"
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
                    variant="outline"
                    onClick={handleCancel}
                    disabled={submitting}
                    className={`
                      h-11 rounded-xl border-none font-medium
                      ${N.surface} ${N.text} ${N.raisedSm}
                      hover:${N.raisedXs} active:${N.pressedMd}
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2
                    `}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={submit}
                    disabled={!reason.trim() || submitting}
                    className={`
                      h-11 rounded-xl border-none font-semibold gap-2
                      bg-[#FF2157] text-white
                      shadow-[4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff]
                      hover:shadow-[2px_2px_4px_#cac8c7,-2px_-2px_4px_#ffffff]
                      active:[box-shadow:inset_4px_4px_8px_rgba(0,0,0,0.2)]
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/60 focus-visible:ring-offset-2
                      disabled:opacity-60 disabled:pointer-events-none
                    `}
                  >
                    <XCircle className="w-4 h-4" />
                    Deny Request
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