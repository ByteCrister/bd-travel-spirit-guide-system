"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ShieldCheck, Mail, ArrowRight, X } from "lucide-react";

interface EmployeeVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerify: (token: string) => Promise<void>;
  onCancel: () => void;
  verifying: boolean;
  error: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Neumorphism Design Tokens (local implementation)                          */
/* -------------------------------------------------------------------------- */
const SURFACE = "#E7E5E4";
const SURFACE_DARK = "#D2CFCE";
const SURFACE_LIGHT = "#FCFBFA";
const TEXT = "#1E2938";
const PRIMARY = "#006666";
const PRIMARY_DARK = "#004f4f";
const PRIMARY_LIGHT = "#007d7d";
const DANGER = "#FF2157";
const DANGER_SOFT_BG = "#FFF5F5"; // light red background for error banner

const RAISED_SHADOW = `6px 6px 12px ${SURFACE_DARK}, -6px -6px 12px ${SURFACE_LIGHT}`;
const INSET_SHADOW = `inset 2px 2px 4px ${SURFACE_DARK}, inset -2px -2px 4px ${SURFACE_LIGHT}`;
const RAISED_PRIMARY_SHADOW = `4px 4px 8px ${PRIMARY_DARK}, -4px -4px 8px ${PRIMARY_LIGHT}`;

const FOCUS_RING = `0 0 0 2px ${SURFACE}, 0 0 0 4px ${PRIMARY}`;

export default function EmployeeVerificationDialog({
  open,
  onOpenChange,
  email,
  onVerify,
  onCancel,
  verifying,
  error,
}: EmployeeVerificationDialogProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const tokenInput = digits.join("");

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  // Clear inputs when a new error arrives so user can re-enter
  useEffect(() => {
    if (error) {
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [error]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && tokenInput.length === 6 && !verifying) {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newDigits = [...digits];
      pasted.split("").forEach((char, i) => {
        newDigits[i] = char;
      });
      setDigits(newDigits);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async () => await onVerify(tokenInput);

  const handleCancel = () => {
    setDigits(["", "", "", "", "", ""]);
    onCancel();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) handleCancel();
    onOpenChange(newOpen);
  };

  const isComplete = tokenInput.length === 6;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[420px] p-0 border-none rounded-2xl overflow-hidden"
        style={{ background: "transparent" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: SURFACE,
            borderRadius: "1rem",
            boxShadow: RAISED_SHADOW,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <div className="px-5 py-5">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.35, type: "spring", stiffness: 220 }}
              className="mb-4 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: SURFACE,
                boxShadow: RAISED_SHADOW,
              }}
            >
              <ShieldCheck className="w-5 h-5" style={{ color: PRIMARY }} />
            </motion.div>

            {/* Header */}
            <DialogHeader className="mb-4 text-left space-y-1">
              <DialogTitle
                className="text-[17px] font-semibold tracking-tight"
                style={{ color: TEXT, fontFamily: "'Space Mono', monospace" }}
              >
                Verify employee&apos;s identity
              </DialogTitle>
              <DialogDescription
                className="text-sm leading-relaxed"
                style={{ color: TEXT, opacity: 0.8, fontFamily: "'Space Mono', monospace" }}
              >
                We sent a 6-digit code to{" "}
                <span
                  className="inline-flex items-center gap-1 font-medium rounded-md px-1.5 py-0.5 text-xs"
                  style={{
                    background: SURFACE,
                    boxShadow: INSET_SHADOW,
                    color: TEXT,
                  }}
                >
                  <Mail className="w-3 h-3" />
                  {email}
                </span>
              </DialogDescription>
            </DialogHeader>

            {/* OTP inputs */}
            <div className="mb-4">
              <p
                className="text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: TEXT, opacity: 0.6 }}
              >
                Verification code
              </p>
              <div className="flex gap-1.5" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.04 }}
                  >
                    <input
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      disabled={verifying}
                      style={{
                        width: "44px",
                        height: "52px",
                        textAlign: "center",
                        fontSize: "22px",
                        fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                        borderRadius: "10px",
                        outline: "none",
                        border: "none",
                        background: digit ? SURFACE : SURFACE,
                        boxShadow: digit
                          ? `inset 1px 1px 3px ${SURFACE_DARK}, inset -1px -1px 3px ${SURFACE_LIGHT}, 0 0 0 2px ${PRIMARY}40`
                          : INSET_SHADOW,
                        color: digit ? PRIMARY : TEXT,
                        caretColor: PRIMARY,
                        opacity: verifying ? 0.5 : 1,
                        transition: "all 0.15s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = digit
                          ? `inset 1px 1px 3px ${SURFACE_DARK}, inset -1px -1px 3px ${SURFACE_LIGHT}, ${FOCUS_RING}`
                          : `inset 1px 1px 3px ${SURFACE_DARK}, inset -1px -1px 3px ${SURFACE_LIGHT}, 0 0 0 2px ${PRIMARY}60`;
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = digit
                          ? `inset 1px 1px 3px ${SURFACE_DARK}, inset -1px -1px 3px ${SURFACE_LIGHT}, 0 0 0 2px ${PRIMARY}40`
                          : INSET_SHADOW;
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-sm"
                    style={{
                      background: DANGER_SOFT_BG,
                      boxShadow: RAISED_SHADOW,
                      border: `1px solid ${DANGER}30`,
                    }}
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: DANGER }} />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-xs uppercase tracking-wide" style={{ color: DANGER }}>
                        Error
                      </span>
                      <span
                        className="text-xs break-words"
                        style={{ color: DANGER, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}
                      >
                        {error}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <DialogFooter className="flex flex-row gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={verifying}
                className="flex-1 h-9 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: SURFACE,
                  color: TEXT,
                  boxShadow: RAISED_SHADOW,
                  border: "none",
                  fontFamily: "'Space Mono', monospace",
                  opacity: verifying ? 0.5 : 1,
                }}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleVerify}
                disabled={verifying || !isComplete}
                className="flex-[2] h-9 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: PRIMARY,
                  color: "#ffffff",
                  boxShadow: RAISED_PRIMARY_SHADOW,
                  border: "none",
                  fontFamily: "'Space Mono', monospace",
                  opacity: verifying || !isComplete ? 0.5 : 1,
                }}
              >
                <AnimatePresence mode="wait">
                  {verifying ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Verify & Continue
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </DialogFooter>

            {/* Resend */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-center text-xs mt-3"
              style={{ color: TEXT, opacity: 0.6, fontFamily: "'Space Mono', monospace" }}
            >
              Didn&apos;t receive a code?{" "}
              <button
                className="font-medium transition-colors"
                style={{ color: PRIMARY }}
                onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY_LIGHT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = PRIMARY)}
              >
                Resend email
              </button>
            </motion.p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}