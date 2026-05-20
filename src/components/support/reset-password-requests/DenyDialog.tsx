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

interface DenyDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function DenyDialog({
  open,
  onOpenChange,
  onConfirm,
}: DenyDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for denial");
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
    if (!submitting) {
      setReason("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-lg p-0 bg-transparent border-none shadow-none">
        {/* Neumorphic card */}
        <div className="relative w-full bg-[#E7E5E4] rounded-2xl p-6 [box-shadow:12px_12px_24px_#cac8c7,-12px_-12px_24px_#ffffff]">
          <DialogHeader className="mb-6">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative shrink-0"
              >
                {/* Neumorphic raised circle for icon */}
                <div className="w-14 h-14 rounded-full bg-[#E7E5E4] [box-shadow:6px_6px_12px_#cac8c7,-6px_-6px_12px_#ffffff] flex items-center justify-center">
                  <XCircle
                    className="w-7 h-7"
                    style={{ color: "#FF2157" }}
                    aria-hidden="true"
                  />
                </div>
              </motion.div>
              <div className="flex-1 space-y-1">
                <DialogTitle
                  className="text-2xl font-bold"
                  style={{ color: "#FF2157" }}
                >
                  Deny Request
                </DialogTitle>
                <DialogDescription className="text-sm text-[#1E2938]/70">
                  This action will notify the requester via email with your
                  reason.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {submitting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div className="relative">
                  <Loader2
                    className="w-12 h-12 animate-spin"
                    style={{ color: "#FF2157" }}
                  />
                  <div
                    className="absolute inset-0 blur-xl opacity-30 animate-pulse"
                    style={{ backgroundColor: "#FF2157" }}
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-[#1E2938]">
                    Processing denial...
                  </p>
                  <p className="text-sm text-[#1E2938]/60">
                    Notifying the requester
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Warning Banner – neumorphic raised with amber accent */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#E7E5E4] [box-shadow:4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] border-l-4"
                  style={{ borderLeftColor: "#FE9900" }}
                >
                  <ShieldAlert
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: "#FE9900" }}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-[#1E2938]">
                      Important Notice
                    </p>
                    <p className="text-xs text-[#1E2938]/70 leading-relaxed">
                      The requester will receive an email notification with your
                      denial reason. Please be clear and professional.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <Label
                    htmlFor="reason"
                    className="text-sm font-semibold text-[#1E2938] flex items-center gap-2"
                  >
                    Reason for denial
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white bg-[#FF2157]">
                      *
                    </span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="reason"
                      placeholder="E.g., Request does not meet security verification requirements..."
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        setError(null);
                      }}
                      rows={5}
                      className="resize-none block w-full rounded-xl border-none bg-[#E7E5E4] px-4 py-3 text-sm text-[#1E2938] placeholder:text-[#1E2938]/40
                        [box-shadow:inset_4px_4px_8px_#cac8c7,inset_-4px_-4px_8px_#ffffff]
                        focus:outline-none focus:[box-shadow:inset_6px_6px_12px_#cac8c7,inset_-6px_-6px_12px_#ffffff]
                        transition-shadow duration-200"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-[#1E2938]/40">
                      {reason.length} / 500
                    </div>
                  </div>
                  <p className="text-xs text-[#1E2938]/50 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    This message will be sent directly to the requester
                  </p>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#E7E5E4] [box-shadow:4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] border-l-4 border-[#FF2157]">
                      <AlertCircle
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: "#FF2157" }}
                      />
                      <p className="text-sm font-medium text-[#1E2938]">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="h-11 rounded-xl bg-[#F1F2F5] border-none [box-shadow:4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] hover:[box-shadow:2px_2px_4px_#cac8c7,-2px_-2px_4px_#ffffff] active:[box-shadow:inset_4px_4px_8px_#cac8c7,inset_-4px_-4px_8px_#ffffff] text-[#1E2938] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submit}
                    disabled={!reason.trim() || submitting}
                    className="h-11 rounded-xl bg-[#FF2157] border-none text-white font-semibold [box-shadow:4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff,0_0_0_1px_rgba(255,33,87,0.2)] hover:[box-shadow:2px_2px_4px_#cac8c7,-2px_-2px_4px_#ffffff,0_0_0_1px_rgba(255,33,87,0.4)] active:[box-shadow:inset_4px_4px_8px_#cac8c7,inset_-4px_-4px_8px_#ffffff] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
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